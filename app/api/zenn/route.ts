import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
export type ZennArticle = {
    slug: string;
    title: string;
    emoji: string;
    type: "tech" | "idea";
    topics: string[];
    published: boolean;
    publishedAt: string | null;
    updatedAt: string;
    sha: string;
    bodyPreview: string;
    aiGenerated: boolean;
};

/* ──────────────────────────────────────────
   GitHub API helpers
   ────────────────────────────────────────── */
const GH_OWNER = process.env.GITHUB_OWNER!;
const GH_REPO = process.env.GITHUB_REPO!;
const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_BASE = "https://api.github.com";

function ghHeaders() {
    return {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };
}

/* ──────────────────────────────────────────
   frontmatter parser（依存ゼロの最小実装）
   ────────────────────────────────────────── */
function parseFrontmatter(raw: string): {
    meta: Record<string, string | boolean | string[]>;
    body: string;
} {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };

    const [, fmStr, body] = match;
    const meta: Record<string, string | boolean | string[]> = {};

    for (const line of fmStr.split(/\r?\n/)) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;

        const key = line.slice(0, colonIdx).trim();
        const rawVal = line.slice(colonIdx + 1).trim();

        if (rawVal === "true") {
            meta[key] = true;
        } else if (rawVal === "false") {
            meta[key] = false;
        } else if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
            // topics: [next.js, typescript]
            meta[key] = rawVal
                .slice(1, -1)
                .split(",")
                .map((s) => s.trim().replace(/['"]/g, ""))
                .filter(Boolean);
        } else {
            meta[key] = rawVal.replace(/^['"]|['"]$/g, "");
        }
    }

    return { meta, body: body.trim() };
}

/* ──────────────────────────────────────────
   GET /api/zenn
   GitHub の articles/*.md を取得して返す
   ────────────────────────────────────────── */
export async function GET(_req: NextRequest) {
    try {
        if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
            throw new Error(
                "GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN が設定されていません"
            );
        }

        // 1. articles/ 配下のファイル一覧を取得
        const listRes = await fetch(
            `${GH_BASE}/repos/${GH_OWNER}/${GH_REPO}/contents/articles`,
            { headers: ghHeaders(), cache: "no-store" }
        );

        if (!listRes.ok) {
            const err = await listRes.json().catch(() => ({}));
            throw new Error(
                `GitHub API error ${listRes.status}: ${err.message ?? "unknown"}`
            );
        }

        const files: { name: string; sha: string; download_url: string }[] =
            await listRes.json();

        const mdFiles = files.filter((f) => f.name.endsWith(".md"));

        // 2. 各ファイルの内容を並列取得
        const articles = await Promise.all(
            mdFiles.map(async (f) => {
                try {
                    const contentRes = await fetch(f.download_url, {
                        headers: { Authorization: `Bearer ${GH_TOKEN}` },
                        cache: "no-store",
                    });

                    const raw = await contentRes.text();
                    const { meta, body } = parseFrontmatter(raw);

                    const slug = f.name.replace(/\.md$/, "");

                    // bodyPreview: 最初の200文字（見出し・コードブロック除く）
                    const cleanBody = body
                        .replace(/^#+\s.*/gm, "")
                        .replace(/```[\s\S]*?```/g, "")
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                        .replace(/[*_`]/g, "")
                        .trim();
                    const bodyPreview = cleanBody.slice(0, 160) + (cleanBody.length > 160 ? "…" : "");

                    // AI生成フラグ: frontmatterに ai_generated: true があるか
                    const aiGenerated = meta["ai_generated"] === true;

                    return {
                        slug,
                        title: String(meta["title"] ?? slug),
                        emoji: String(meta["emoji"] ?? "📝"),
                        type: (meta["type"] as "tech" | "idea") ?? "tech",
                        topics: Array.isArray(meta["topics"])
                            ? (meta["topics"] as string[])
                            : [],
                        published: meta["published"] === true,
                        publishedAt: meta["published_at"]
                            ? String(meta["published_at"])
                            : null,
                        updatedAt: new Date().toISOString(), // GitHub commit日時は別途取得が重いので省略
                        sha: f.sha,
                        bodyPreview,
                        aiGenerated,
                    } satisfies ZennArticle;
                } catch {
                    // 個別ファイルのパースエラーはスキップ
                    return null;
                }
            })
        );

        const validArticles = articles.filter(
            (a): a is ZennArticle => a !== null
        );

        // 公開済みを先に、次に下書きを表示。各グループ内はslice逆順（新しい順）
        validArticles.sort((a, b) => {
            if (a.published !== b.published) return a.published ? -1 : 1;
            return b.slug.localeCompare(a.slug);
        });

        return Response.json(
            { success: true, count: validArticles.length, articles: validArticles },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    Pragma: "no-cache",
                },
            }
        );
    } catch (err) {
        console.error("[Zenn API] GET error:", err);
        return Response.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
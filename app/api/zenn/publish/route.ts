import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

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
        "Content-Type": "application/json",
    };
}

/* ──────────────────────────────────────────
   POST /api/zenn/publish
   body: { slug: string; sha: string }
   
   1. 現在のファイル内容を取得
   2. frontmatter の published: false → true に書き換え
   3. GitHub Contents API で PUT（更新）
   ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const { slug, sha } = await req.json();

        if (!slug || !sha) {
            return Response.json(
                { error: "slug と sha が必要です" },
                { status: 400 }
            );
        }

        if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
            throw new Error(
                "GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN が設定されていません"
            );
        }

        const filePath = `articles/${slug}.md`;
        const apiUrl = `${GH_BASE}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;

        // 1. 現在のファイル内容を取得（Base64エンコードされている）
        const getRes = await fetch(apiUrl, {
            headers: ghHeaders(),
            cache: "no-store",
        });

        if (!getRes.ok) {
            const err = await getRes.json().catch(() => ({}));
            throw new Error(`ファイル取得エラー: ${err.message ?? getRes.status}`);
        }

        const fileData = await getRes.json();
        const currentContent = Buffer.from(fileData.content, "base64").toString(
            "utf-8"
        );
        const currentSha = fileData.sha;

        // 2. published: false → published: true に書き換え
        //    既に published: true の場合はエラー
        if (!currentContent.includes("published: false")) {
            if (currentContent.includes("published: true")) {
                return Response.json(
                    { error: "この記事は既に公開済みです" },
                    { status: 400 }
                );
            }
            throw new Error(
                "frontmatter に published フィールドが見つかりません"
            );
        }

        // 最初にマッチした published: false のみ置換（frontmatter内の1行だけ変える）
        const updatedContent = currentContent.replace(
            /^published:\s*false$/m,
            "published: true"
        );

        // 3. GitHub Contents API で PUT（ファイル更新）
        const newContentBase64 = Buffer.from(updatedContent, "utf-8").toString(
            "base64"
        );

        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: ghHeaders(),
            body: JSON.stringify({
                message: `feat: publish article ${slug}`,
                content: newContentBase64,
                sha: currentSha,
            }),
        });

        if (!putRes.ok) {
            const err = await putRes.json().catch(() => ({}));
            throw new Error(`GitHub push エラー: ${err.message ?? putRes.status}`);
        }

        const result = await putRes.json();

        console.log(`[Zenn Publish] ${slug} を公開しました`);

        return Response.json({
            success: true,
            slug,
            commitSha: result.commit?.sha ?? null,
            zennUrl: `https://zenn.dev/${GH_OWNER}/articles/${slug}`,
        });
    } catch (err) {
        console.error("[Zenn Publish API] error:", err);
        return Response.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
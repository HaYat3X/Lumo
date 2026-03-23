import { Client } from "@notionhq/client";
import { NextRequest } from "next/server";

/* ──────────────────────────────────────────
   Cache Control
   ────────────────────────────────────────── */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ──────────────────────────────────────────
   Notion Client
   ────────────────────────────────────────── */
const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const TASK_DS_ID = process.env.NOTION_TASK_DS_ID!;

/* ──────────────────────────────────────────
   Property Extractors
   ────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTitle(prop: any): string {
    if (!prop || prop.type !== "title") return "";
    return prop.title
        ?.map((t: { plain_text: string }) => t.plain_text)
        .join("") ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStatus(prop: any): string | null {
    if (!prop || prop.type !== "status") return null;
    return prop.status?.name ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSelect(prop: any): string | null {
    if (!prop || prop.type !== "select") return null;
    return prop.select?.name ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRichText(prop: any): string {
    if (!prop || prop.type !== "rich_text") return "";
    return prop.rich_text
        ?.map((t: { plain_text: string }) => t.plain_text)
        .join("") ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNumber(prop: any): number | null {
    if (!prop || prop.type !== "number") return null;
    return prop.number;
}

/* ──────────────────────────────────────────
   GET /api/tasks
   ────────────────────────────────────────── */
export async function GET(req: NextRequest) {
    try {
        console.log("[Tasks API] Fetching tasks from Notion DS:", TASK_DS_ID);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
            data_source_id: TASK_DS_ID,
            page_size: 100,
            sorts: [
                {
                    property: "優先度",
                    direction: "ascending",
                },
            ],
        };

        const res = await notion.dataSources.query(params);

        console.log("[Tasks API] Raw results count:", res.results?.length ?? 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasks = (res.results ?? []).map((page: any) => {
            const props = page.properties ?? {};

            const title = extractTitle(props["タスク"]);
            const status = extractStatus(props["ステータス"]) ?? "未着手";
            const priority = extractSelect(props["優先度"]);
            const category = extractSelect(props["種類"]);
            const summary = extractRichText(props["概要"]);
            const estimatedHours = extractNumber(props["見積時間(h)"]);

            return {
                id: page.id,
                title,
                status,
                priority: priority ?? undefined,
                category: category ?? undefined,
                summary: summary || undefined,
                estimated_hours: estimatedHours ?? undefined,
                url: page.url ?? undefined,
            };
        });

        console.log("[Tasks API] Parsed tasks:", tasks.length);

        return Response.json(
            {
                success: true,
                count: tasks.length,
                tasks,
            },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    Pragma: "no-cache",
                },
            }
        );
    } catch (err) {
        console.error("[Tasks API] Error:", err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return Response.json(
            {
                success: false,
                error: message,
            },
            { status: 500 }
        );
    }
}
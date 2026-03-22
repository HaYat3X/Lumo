import { Client } from "@notionhq/client";

/* ──────────────────────────────────────────
   Notion Client
   ────────────────────────────────────────── */
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DAILY_DS_ID = process.env.NOTION_DAILY_DS_ID!;

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
type DailyPlanItem = {
  title: string;
  start_time: string;
  end_time: string;
  memo?: string;
  target_progress?: number;
  related_task_id?: string;
};

type CreateDailyPlanInput = {
  items: DailyPlanItem[];
  date?: string;
};

/* ──────────────────────────────────────────
   Helper
   ────────────────────────────────────────── */
function getTodayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split("T")[0];
}

/* ──────────────────────────────────────────
   Create Daily Plan
   ────────────────────────────────────────── */
export async function createDailyPlan(input: CreateDailyPlanInput) {
  const dateStr = input.date ?? getTodayJST();
  const results: Array<{
    title: string;
    start: string;
    end: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const item of input.items) {
    try {
      const startISO = `${dateStr}T${item.start_time}:00+09:00`;
      const endISO = `${dateStr}T${item.end_time}:00+09:00`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const properties: Record<string, any> = {
        作業: {
          title: [{ text: { content: item.title } }],
        },
        ステータス: {
          status: { name: "未着手" },
        },
        作業時間: {
          date: {
            start: startISO,
            end: endISO,
          },
        },
      };

      if (item.memo) {
        properties["メモ"] = {
          rich_text: [{ text: { content: item.memo } }],
        };
      }

      if (item.target_progress !== undefined) {
        properties["目標進捗率"] = {
          number: item.target_progress,
        };
      }

      if (item.related_task_id) {
        properties["TGP - タスク"] = {
          relation: [{ id: item.related_task_id }],
        };
      }

      // @notionhq/client の pages.create
      // parent に data_source_id を使用（TS型が未対応の場合 as any）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (notion.pages as any).create({
        parent: { data_source_id: DAILY_DS_ID },
        properties,
      });

      results.push({
        title: item.title,
        start: item.start_time,
        end: item.end_time,
        success: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[DailyPlan] Error creating "${item.title}":`, msg);
      results.push({
        title: item.title,
        start: item.start_time,
        end: item.end_time,
        success: false,
        error: msg,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return {
    success: successCount > 0,
    date: dateStr,
    total: results.length,
    created: successCount,
    failed: results.length - successCount,
    items: results,
  };
}
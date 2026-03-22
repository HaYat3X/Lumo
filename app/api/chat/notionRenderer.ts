import { Client } from "@notionhq/client";

/* ──────────────────────────────────────────
   Notion Client
   ────────────────────────────────────────── */
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/* ──────────────────────────────────────────
   Data Source Registry
   新しいNotion APIでは database_id ではなく
   data_source_id (collection ID) を使う
   ────────────────────────────────────────── */
const DS_REGISTRY: Record<string, string> = {
  タスク: process.env.NOTION_TASK_DS_ID!,
  デイリープラン: process.env.NOTION_DAILY_DS_ID!,
  スクラップ: process.env.NOTION_SCRAP_DS_ID!,
  スプリント: process.env.NOTION_SPRINT_DS_ID!,
  ナレッジ: process.env.NOTION_KNOWLEDGE_DS_ID!,
  レビュー: process.env.NOTION_REVIEW_DS_ID!,
  OKR: process.env.NOTION_OKR_DS_ID!,
  KeyResults: process.env.NOTION_KR_DS_ID!,
};

export function getAvailableDBs(): string[] {
  return Object.entries(DS_REGISTRY)
    .filter(([, id]) => !!id)
    .map(([name]) => name);
}

/* ──────────────────────────────────────────
   Extract property value (汎用)
   ────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractProp(prop: any): string | number | boolean | null {
  if (!prop) return null;
  switch (prop.type) {
    case "title":
      return (
        prop.title
          ?.map((t: { plain_text: string }) => t.plain_text)
          .join("") ?? ""
      );
    case "rich_text":
      return (
        prop.rich_text
          ?.map((t: { plain_text: string }) => t.plain_text)
          .join("") ?? ""
      );
    case "number":
      return prop.number;
    case "select":
      return prop.select?.name ?? null;
    case "multi_select":
      return (
        prop.multi_select
          ?.map((s: { name: string }) => s.name)
          .join(", ") ?? ""
      );
    case "status":
      return prop.status?.name ?? null;
    case "checkbox":
      return prop.checkbox;
    case "date":
      if (!prop.date) return null;
      return prop.date.end
        ? `${prop.date.start} ~ ${prop.date.end}`
        : prop.date.start;
    case "url":
      return prop.url;
    case "created_time":
      return prop.created_time;
    case "last_edited_time":
      return prop.last_edited_time;
    case "formula":
      return prop.formula?.string ?? prop.formula?.number ?? null;
    case "rollup":
      return prop.rollup?.number ?? null;
    case "relation":
      return prop.relation?.length > 0
        ? `${prop.relation.length}件`
        : null;
    default:
      return null;
  }
}

/* ──────────────────────────────────────────
   Query Data Source
   ────────────────────────────────────────── */
type QueryInput = {
  database_name: string;
  status_filter?: string;
  sprint_status_filter?: string;
  limit?: number;
};

export async function queryNotionDatabase(input: QueryInput) {
  const dsId = DS_REGISTRY[input.database_name];
  if (!dsId) {
    return {
      success: false,
      error: `「${input.database_name}」は見つかりません。利用可能: ${getAvailableDBs().join(", ")}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    data_source_id: dsId,
    page_size: input.limit ?? 20,
  };

  // フィルター構築
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = [];

  if (input.status_filter) {
    filters.push({
      property: "ステータス",
      status: { equals: input.status_filter },
    });
  }

  if (input.sprint_status_filter) {
    // 「取得用：スプリントステータス」はformula型
    filters.push({
      property: "取得用：スプリントステータス",
      formula: {
        string: { equals: input.sprint_status_filter },
      },
    });
  }

  if (filters.length === 1) {
    params.filter = filters[0];
  } else if (filters.length > 1) {
    params.filter = { and: filters };
  }

  const res = await notion.dataSources.query(params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (res.results ?? []).map((page: any) => {
    const props: Record<string, unknown> = {};
    if (page.properties) {
      for (const [key, value] of Object.entries(page.properties)) {
        const extracted = extractProp(value);
        if (extracted !== null && extracted !== "") {
          props[key] = extracted;
        }
      }
    }
    return {
      id: page.id,
      url: page.url ?? null,
      ...props,
    };
  });

  return {
    success: true,
    database: input.database_name,
    count: items.length,
    items,
  };
}

/* ──────────────────────────────────────────
   Search Workspace
   ────────────────────────────────────────── */
type SearchInput = {
  query: string;
  limit?: number;
};

export async function searchNotion(input: SearchInput) {
  const res = await notion.search({
    query: input.query,
    page_size: input.limit ?? 10,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (res.results ?? []).map((item: any) => {
    if (item.object === "page" && item.properties) {
      let title = "";
      for (const value of Object.values(item.properties)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((value as any).type === "title") {
          title = extractProp(value) as string;
          break;
        }
      }
      return { type: "page", id: item.id, title, url: item.url ?? null };
    }
    if (item.object === "database") {
      const dbTitle =
        item.title
          ?.map((t: { plain_text: string }) => t.plain_text)
          .join("") ?? "";
      return { type: "database", id: item.id, title: dbTitle };
    }
    return { type: item.object, id: item.id };
  });

  return {
    success: true,
    query: input.query,
    count: results.length,
    results,
  };
}
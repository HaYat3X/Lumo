import Anthropic from "@anthropic-ai/sdk";

/* ──────────────────────────────────────────
   Tool Definitions for Claude API
   ────────────────────────────────────────── */

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "create_task",
    description: `Notionのタスク管理データベースに新しいタスクを登録する。
ユーザーが「タスクを登録して」「○○をやらないと」などタスク追加の意図を示した場合に使用する。
タスク名は必須。それ以外は省略可能で、省略された場合はデフォルト値が使われる。`,
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "タスクのタイトル（必須）",
        },
        summary: {
          type: "string",
          description: "タスクの概要・詳細説明（任意）",
        },
        priority: {
          type: "string",
          enum: ["Highest", "High", "Medium", "Low", "Lowest"],
          description:
            "優先度。ユーザーが明示しない場合はMediumをデフォルトとする。",
        },
        category: {
          type: "string",
          enum: ["目標関連", "実務・定常", "プロジェクト", "突発・その他"],
          description:
            "タスクの種類。ユーザーが明示しない場合は「突発・その他」をデフォルトとする。",
        },
        estimated_hours: {
          type: "number",
          description: "見積時間（時間単位、任意）",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "get_events",
    description: `Googleカレンダーから予定を取得する。
「今日の予定は？」「明日の予定を教えて」「今週の予定」などスケジュール確認の意図を示した場合に使用する。
日付を省略した場合は今日の予定を取得する。`,
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description:
            "取得したい日付（YYYY-MM-DD形式）。省略時は今日。",
        },
        days: {
          type: "number",
          description:
            "何日分取得するか。デフォルト1。「今週」なら7。",
        },
      },
      required: [],
    },
  },
  {
    name: "create_event",
    description: `Googleカレンダーに新しい予定を登録する。
「明日14時に会議を入れて」「予定を追加して」など予定登録の意図を示した場合に使用する。
タイトル・日付・開始時刻・終了時刻が必須。ユーザーが終了時刻を言わなかった場合は開始時刻の1時間後をデフォルトにする。`,
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "予定のタイトル（必須）",
        },
        date: {
          type: "string",
          description: "日付（YYYY-MM-DD形式、必須）。「明日」「来週月曜」などは適切な日付に変換する。",
        },
        start_time: {
          type: "string",
          description: "開始時刻（HH:mm形式、必須）",
        },
        end_time: {
          type: "string",
          description:
            "終了時刻（HH:mm形式、必須）。ユーザーが指定しない場合は開始の1時間後。",
        },
        description: {
          type: "string",
          description: "予定の説明（任意）",
        },
      },
      required: ["title", "date", "start_time", "end_time"],
    },
  },
  {
    name: "query_notion_database",
    description: `Notionのデータベースからレコードを取得する。
「今のタスク一覧」「進行中のタスクは？」「スクラップ見せて」「デイリープランは？」などデータ参照の意図を示した場合に使用する。
利用可能なデータベース: タスク, デイリープラン, スクラップ, スプリント, ナレッジ, レビュー, OKR, KeyResults
ステータスでフィルターしたい場合は status_filter に値を指定する（例: "進行中", "未着手", "完了"）。`,
    input_schema: {
      type: "object" as const,
      properties: {
        database_name: {
          type: "string",
          enum: [
            "タスク",
            "デイリープラン",
            "スクラップ",
            "スプリント",
            "ナレッジ",
            "レビュー",
            "OKR",
            "KeyResults",
          ],
          description: "取得したいデータベース名",
        },
        status_filter: {
          type: "string",
          description:
            "ステータスでフィルター（任意）。例: '未着手', '進行中', '完了', '保留'",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト20）",
        },
      },
      required: ["database_name"],
    },
  },
  {
    name: "search_notion",
    description: `Notionワークスペース全体をキーワード検索する。
特定のDBではなく横断的に情報を探したい場合に使用する。
「〇〇について書いたメモある？」「△△に関するページ探して」など。`,
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "検索キーワード",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト10）",
        },
      },
      required: ["query"],
    },
  },
];
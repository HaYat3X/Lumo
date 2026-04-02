/* ──────────────────────────────────────────
   インポート
   ────────────────────────────────────────── */
import { createTaskSkill } from "./create-task";
import { createTask } from "./create-task/script";
import { getEventsSkill } from "./get-events";
import { getEvents } from "./get-events/script";
import { createEventSkill } from "./create-event";
import { createEvent } from "./create-event/script";
import type Anthropic from "@anthropic-ai/sdk";
import type { CreateTaskInput } from "./create-task/script";

/* ──────────────────────────────────────────
   SKILLSリスト
   ────────────────────────────────────────── */
export const SKILLS: Anthropic.Tool[] = [
  createTaskSkill,
  getEventsSkill,
  createEventSkill,
];

/* ──────────────────────────────────────────
   executeToolルーター
   ここで、スキルとスクリプトを連携させる
   null を返したら既存の executeTool にフォールバックする設計
   NOTE: 設計として、スキルを複数組み合わせてワークフローみたいにすることがあるので、ここで紐づけるようにする
   ────────────────────────────────────────── */
export async function executeSkill(
  toolName: string,
  toolInput: Record<string, unknown>,
): Promise<string | null> {
  switch (toolName) {
    case "create-task": {
      const result = await createTask(toolInput as CreateTaskInput);
      return JSON.stringify(result);
    }
    case "get-events": {
      const result = await getEvents(
        toolInput as { date?: string; days?: number },
      );
      return JSON.stringify(result);
    }
    case "create-event": {
      const result = await createEvent(
        toolInput as {
          title: string;
          date: string;
          start_time: string;
          end_time: string;
          description?: string;
        },
      );
      return JSON.stringify(result);
    }
    default:
      return null;
  }
}

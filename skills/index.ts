/* ──────────────────────────────────────────
   インポート
   ────────────────────────────────────────── */
import type Anthropic from "@anthropic-ai/sdk";
import { getEventsSkill } from "./get-events";
import { getEvents } from "./get-events/script";

/* ──────────────────────────────────────────
   SKILLSリスト
   ────────────────────────────────────────── */
export const SKILLS: Anthropic.Tool[] = [getEventsSkill];

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
    case "get-events": {
      const result = await getEvents(
        toolInput as { date?: string; days?: number },
      );
      return JSON.stringify(result);
    }
    default:
      return null;
  }
}

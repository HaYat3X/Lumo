"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
type TaskStatus = "未着手" | "進行中" | "完了" | "保留";
type TaskPriority = "Highest" | "High" | "Medium" | "Low" | "Lowest";
type TaskCategory = "目標関連" | "実務・定常" | "プロジェクト" | "突発・その他";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  summary?: string;
  estimated_hours?: number;
  url?: string;
};

/* ──────────────────────────────────────────
   Constants
   ────────────────────────────────────────── */
const STATUS_ORDER: TaskStatus[] = ["未着手", "進行中", "完了", "保留"];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  未着手: {
    label: "未着手",
    color: "var(--color-text-muted)",
    bgColor: "rgba(255, 255, 255, 0.04)",
  },
  進行中: {
    label: "進行中",
    color: "var(--color-accent-bright)",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  完了: {
    label: "完了",
    color: "var(--color-green)",
    bgColor: "rgba(52, 211, 153, 0.1)",
  },
  保留: {
    label: "保留",
    color: "var(--color-purple)",
    bgColor: "rgba(167, 139, 250, 0.1)",
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  Highest: { label: "Highest", color: "#f87171" },
  High: { label: "High", color: "#fb923c" },
  Medium: { label: "Medium", color: "#fbbf24" },
  Low: { label: "Low", color: "#34d399" },
  Lowest: { label: "Lowest", color: "#60a5fa" },
};

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string }> =
  {
    "目標関連": { label: "目標関連", color: "#3b82f6" },
    "実務・定常": { label: "実務・定常", color: "#fbbf24" },
    プロジェクト: { label: "プロジェクト", color: "#f87171" },
    "突発・その他": { label: "突発・その他", color: "#a78bfa" },
  };

/* ──────────────────────────────────────────
   TaskCard Component
   ────────────────────────────────────────── */
function TaskCard({ task }: { task: Task }) {
  const priorityConfig = task.priority ? PRIORITY_CONFIG[task.priority] : null;
  const categoryConfig = task.category ? CATEGORY_CONFIG[task.category] : null;

  return (
    <a
      href={task.url || "#"}
      target={task.url ? "_blank" : undefined}
      rel={task.url ? "noopener noreferrer" : undefined}
      className="group block rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-lg active:scale-95"
      style={{
        cursor: task.url ? "pointer" : "default",
      }}
    >
      {/* Header: Title + Priority Badge */}
      <div className="mb-3 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white break-words line-clamp-2 group-hover:text-blue-300 transition-colors">
            {task.title}
          </h3>
        </div>
        {priorityConfig && (
          <div
            className="shrink-0 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: `${priorityConfig.color}20`,
              color: priorityConfig.color,
            }}
          >
            {priorityConfig.label}
          </div>
        )}
      </div>

      {/* Summary */}
      {task.summary && (
        <p className="mb-3 text-xs text-gray-400 line-clamp-2">
          {task.summary}
        </p>
      )}

      {/* Meta: Category + Estimated Hours */}
      <div className="flex flex-wrap gap-2">
        {categoryConfig && (
          <div
            className="px-2 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${categoryConfig.color}15`,
              color: categoryConfig.color,
            }}
          >
            {categoryConfig.label}
          </div>
        )}
        {task.estimated_hours !== undefined && (
          <div className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-400">
            {task.estimated_hours}h
          </div>
        )}
      </div>
    </a>
  );
}

/* ──────────────────────────────────────────
   TaskBoard Component
   ────────────────────────────────────────── */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        cache: "no-store",
      });

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ error: "API error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("[Tasks] fetch error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Group tasks by status
  const tasksByStatus = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus["完了"].length;
  const inProgressTasks = tasksByStatus["進行中"].length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-400" />
          <p className="text-sm text-gray-400">タスクを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 stagger">
        <div className="animate-fade-up rounded-lg border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-300 mb-1">
              タスクの読み込みに失敗しました
            </h3>
            <p className="text-sm text-red-300/70 mb-3">{error}</p>
            <button
              onClick={fetchTasks}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger">
      {/* ── Header Stats ── */}
      {totalTasks > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
          {/* Total */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">全タスク</p>
            <div className="flex items-baseline gap-2">
              <span className="font-[var(--font-mono)] text-2xl font-bold text-white">
                {totalTasks}
              </span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">進行中</p>
            <div className="flex items-baseline gap-2">
              <span className="font-[var(--font-mono)] text-2xl font-bold text-blue-300">
                {inProgressTasks}
              </span>
            </div>
          </div>

          {/* Completion */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">完了率</p>
            <div className="flex items-baseline gap-2">
              <span className="font-[var(--font-mono)] text-2xl font-bold text-green-300">
                {completionRate}%
              </span>
              <span className="text-xs text-gray-400">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Board ── */}
      <div className="animate-fade-up">
        {totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              タスクがまだありません
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              AIアシスタントに「タスク登録して」と話しかけると、
              <br />
              タスクを作成できます。
            </p>
            <a
              href="/chat"
              className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium transition-colors"
            >
              AIアシスタントに相談
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATUS_ORDER.map((status) => {
              const statusConfig = STATUS_CONFIG[status];
              const statusTasks = tasksByStatus[status];

              return (
                <div
                  key={status}
                  className="flex flex-col bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: statusConfig.color }}
                      />
                      <h2 className="text-sm font-semibold text-white">
                        {statusConfig.label}
                      </h2>
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-gray-300">
                        {statusTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {statusTasks.length === 0 ? (
                      <p className="text-center text-xs text-gray-500 py-8">
                        タスクなし
                      </p>
                    ) : (
                      statusTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Refresh Button (Sticky) ── */}
      {totalTasks > 0 && (
        <div className="flex justify-end">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={14} />
            更新
          </button>
        </div>
      )}
    </div>
  );
}
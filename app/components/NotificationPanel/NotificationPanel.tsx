"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  CalendarCheck,
  Clock,
  AlarmClock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import "./NotificationPanel.css";

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
export type NotificationType =
  | "schedule" // 週始めサマリ
  | "reminder" // 期限切れ・今日期限
  | "daily_plan" // デイリープラン未作成
  | "action"; // AI操作完了（将来拡張）

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string; // ISO 8601
  link?: string; // クリックで遷移するURL（任意）
};

/* ──────────────────────────────────────────
   Mock data（後でNotion APIに差し替え）
   ────────────────────────────────────────── */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "reminder",
    title: "期限切れのタスクがあります",
    body: "「APIリファクタリング」など2件のタスクが期限を過ぎています。",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    link: "/tasks",
  },
  {
    id: "n2",
    type: "daily_plan",
    title: "今日のデイリープランが未作成です",
    body: "Lumoに「デイリープランを作って」と話しかけると、自動で今日の予定を組み立てます。",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    link: "/chat",
  },
  {
    id: "n3",
    type: "schedule",
    title: "今週のサマリ",
    body: "今週は5件のタスクが完了しました。進行中3件、未着手4件。来週に向けて振り返りをしましょう。",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
    link: "/tasks",
  },
  {
    id: "n4",
    type: "reminder",
    title: "今日期限のタスクがあります",
    body: "「デザインレビュー」が今日期限です。",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26時間前
    link: "/tasks",
  },
  {
    id: "n5",
    type: "schedule",
    title: "今週のキックオフ",
    body: "今週のタスクは8件、予定は6件です。優先度Highestのタスクが1件あります。",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2日前
  },
];

/* ──────────────────────────────────────────
   Helpers
   ────────────────────────────────────────── */
function formatRelativeTime(isoStr: string): string {
  const now = Date.now();
  const diff = now - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "今";
  if (mins < 60) return `${mins}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; colorClass: string; label: string }
> = {
  schedule: {
    icon: CalendarCheck,
    colorClass: "notif-type-schedule",
    label: "スケジュール",
  },
  reminder: {
    icon: AlarmClock,
    colorClass: "notif-type-reminder",
    label: "リマインダー",
  },
  daily_plan: {
    icon: Clock,
    colorClass: "notif-type-daily",
    label: "デイリープラン",
  },
  action: {
    icon: Sparkles,
    colorClass: "notif-type-action",
    label: "アクション完了",
  },
};

/* ──────────────────────────────────────────
   Notification Item
   ────────────────────────────────────────── */
function NotificationItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!notif.isRead) onRead(notif.id);
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  return (
    <div
      className={`notif-item${notif.isRead ? " is-read" : " is-unread"}${notif.link ? " has-link" : ""}`}
      onClick={handleClick}
    >
      {/* 未読インジケーター */}
      {!notif.isRead && <div className="notif-unread-dot" />}

      {/* アイコン */}
      <div className={`notif-icon ${cfg.colorClass}`}>
        <Icon size={14} />
      </div>

      {/* コンテンツ */}
      <div className="notif-content">
        <div className="notif-header-row">
          <span className="notif-title">{notif.title}</span>
          <span className="notif-time">
            {formatRelativeTime(notif.createdAt)}
          </span>
        </div>
        <p className="notif-body">{notif.body}</p>
        {notif.link && (
          <span className="notif-link-hint">
            確認する <ChevronRight size={11} />
          </span>
        )}
      </div>

      {/* アクション（ホバーで表示） */}
      <div className="notif-actions" onClick={(e) => e.stopPropagation()}>
        {!notif.isRead && (
          <button
            className="notif-action-btn"
            title="既読にする"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notif.id);
            }}
          >
            <Check size={13} />
          </button>
        )}
        <button
          className="notif-action-btn notif-action-delete"
          title="削除"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif.id);
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Bell Button（PageHeaderに埋め込む用）
   ────────────────────────────────────────── */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleReadAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleDeleteAll = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
  }, []);

  const displayed =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="notif-bell-wrapper" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        className={`notif-bell-btn${isOpen ? " is-active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="通知"
        aria-label={`通知 ${unreadCount}件未読`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <>
          {/* Backdrop (モバイル用) */}
          <div className="notif-backdrop" onClick={() => setIsOpen(false)} />

          <div className="notif-panel animate-notif-in">
            {/* Panel Header */}
            <div className="notif-panel-header">
              <div className="notif-panel-title-row">
                <h2 className="notif-panel-title">通知</h2>
                {unreadCount > 0 && (
                  <span className="notif-panel-count">{unreadCount}件未読</span>
                )}
              </div>
              <div className="notif-panel-header-actions">
                {unreadCount > 0 && (
                  <button
                    className="notif-header-btn"
                    onClick={handleReadAll}
                    title="すべて既読"
                  >
                    <CheckCheck size={13} />
                    すべて既読
                  </button>
                )}
                <button
                  className="notif-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="閉じる"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="notif-tabs">
              <button
                className={`notif-tab${activeTab === "all" ? " active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                すべて
                <span className="notif-tab-count">{notifications.length}</span>
              </button>
              <button
                className={`notif-tab${activeTab === "unread" ? " active" : ""}`}
                onClick={() => setActiveTab("unread")}
              >
                未読
                {unreadCount > 0 && (
                  <span className="notif-tab-count notif-tab-count-unread">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* List */}
            <div className="notif-list">
              {displayed.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon">
                    <Bell size={22} />
                  </div>
                  <p className="notif-empty-title">
                    {activeTab === "unread"
                      ? "未読通知はありません"
                      : "通知はありません"}
                  </p>
                  <p className="notif-empty-desc">
                    期限アラートや週次サマリがここに届きます
                  </p>
                </div>
              ) : (
                displayed.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onRead={handleRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* Panel Footer */}
            {notifications.filter((n) => n.isRead).length > 0 && (
              <div className="notif-panel-footer">
                <button className="notif-footer-btn" onClick={handleDeleteAll}>
                  <Trash2 size={12} />
                  既読をすべて削除
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

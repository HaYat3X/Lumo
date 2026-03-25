"use client";

import { X, CheckCircle2, AlertCircle, Info, CheckSquare } from "lucide-react";
import "./NotificationPanel.css";

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
};

type NotificationPanelProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
};

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString("ja-JP");
}

function getIconForType(type: Notification["type"]) {
  switch (type) {
    case "success":
      return <CheckCircle2 size={16} />;
    case "warning":
      return <AlertCircle size={16} />;
    case "error":
      return <AlertCircle size={16} />;
    case "info":
    default:
      return <Info size={16} />;
  }
}

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const isEmpty = notifications.length === 0;

  return (
    <div className="notification-panel">
      {/* Header */}
      <div className="notification-panel-header">
        <h3 className="notification-panel-title">通知</h3>
        {!isEmpty && (
          <button
            className="notification-mark-all-btn"
            onClick={onMarkAllAsRead}
            title="全て確認"
          >
            <CheckSquare size={14} />
            <span>全て確認</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="notification-panel-content">
        {isEmpty ? (
          <div className="notification-empty-state">
            <div className="notification-empty-icon">
              <CheckCircle2 size={24} />
            </div>
            <p className="notification-empty-text">全ての通知を確認済みです</p>
          </div>
        ) : (
          <ul className="notification-list">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`notification-item notification-item--${notif.type}`}
              >
                <div className="notification-item-icon">
                  {getIconForType(notif.type)}
                </div>

                <div className="notification-item-content">
                  <h4 className="notification-item-title">{notif.title}</h4>
                  <p className="notification-item-message">{notif.message}</p>
                  <span className="notification-item-time">
                    {formatTime(notif.timestamp)}
                  </span>
                </div>

                <button
                  className="notification-item-close"
                  onClick={() => onMarkAsRead(notif.id)}
                  title="確認済みにする"
                  aria-label={`${notif.title}を確認済みにする`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

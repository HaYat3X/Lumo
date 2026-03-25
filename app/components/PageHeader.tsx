// "use client";

// import { usePathname } from "next/navigation";
// import "./PageHedar.css";
// import {
//   MessageSquare,
//   Calendar,
//   CheckSquare,
//   Clock,
//   BookOpen,
//   Settings,
//   Blocks,
//   Bot,
//   Bell,
// } from "lucide-react";

// type PageMeta = {
//   title: string;
//   subtitle: string;
//   icon: React.ElementType;
// };

// const PAGE_META: Record<string, PageMeta> = {
//   "/chat": { title: "AI Assistant", subtitle: "AIアシスタントとチャット", icon: Bot },
//   "/schedule": { title: "Schedule", subtitle: "週間スケジュール", icon: Calendar },
//   "/tasks": { title: "Tasks", subtitle: "タスク管理", icon: CheckSquare },
//   "/daily": { title: "Daily Plan", subtitle: "今日のプラン", icon: Clock },
//   "/scraps": { title: "Scraps", subtitle: "アイデアメモ", icon: BookOpen },
//   "/settings": { title: "Settings", subtitle: "設定", icon: Settings },
//   "/integrations": { title: "Integrations", subtitle: "外部サービス連携", icon: Blocks },
// };

// function getToday() {
//   const d = new Date();
//   const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];
//   return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
// }

// // 通知件数 (実際の実装では API から取得)
// const NOTIFICATION_COUNT = 3;

// export default function PageHeader() {
//   const pathname = usePathname();
//   const page = PAGE_META[pathname ?? ""] ?? {
//     title: "Aether",
//     subtitle: "",
//     icon: MessageSquare,
//   };
//   const Icon = page.icon;

//   return (
//     <header className="page-header">
//       {/* Left — icon + titles */}
//       <div className="page-header-left">
//         <div className="page-header-icon">
//           <Icon size={18} />
//         </div>
//         <div>
//           <h1 className="page-header-title">{page.title}</h1>
//           {page.subtitle && (
//             <p className="page-header-subtitle">{page.subtitle}</p>
//           )}
//         </div>
//       </div>

//       {/* Right — date + notification bell */}
//       <div className="page-header-right">
//         <span className="page-header-date">{getToday()}</span>

//         <button className="page-header-bell" title="通知">
//           <Bell size={16} />
//           {NOTIFICATION_COUNT > 0 && (
//             <span className="bell-dot" />
//           )}
//         </button>
//       </div>
//     </header>
//   );
// }

"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./PageHedar.css";
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  Clock,
  BookOpen,
  Settings,
  Blocks,
  Bot,
  Bell,
  X,
  CheckCircle2,
} from "lucide-react";
import NotificationPanel from "../components/feature/NotificationPanel";

type PageMeta = {
  title: string;
  subtitle: string;
  icon: React.ElementType;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
};

const PAGE_META: Record<string, PageMeta> = {
  "/chat": {
    title: "AI Assistant",
    subtitle: "AIアシスタントとチャット",
    icon: Bot,
  },
  "/schedule": {
    title: "Schedule",
    subtitle: "週間スケジュール",
    icon: Calendar,
  },
  "/tasks": { title: "Tasks", subtitle: "タスク管理", icon: CheckSquare },
  "/daily": { title: "Daily Plan", subtitle: "今日のプラン", icon: Clock },
  "/scraps": { title: "Scraps", subtitle: "アイデアメモ", icon: BookOpen },
  "/settings": { title: "Settings", subtitle: "設定", icon: Settings },
  "/integrations": {
    title: "Integrations",
    subtitle: "外部サービス連携",
    icon: Blocks,
  },
};

// ダミー通知データ
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "タスク完了",
    message: "週間レビューが完了しました",
    timestamp: new Date(Date.now() - 5 * 60000),
    isRead: false,
    type: "success",
  },
  {
    id: "notif-2",
    title: "予定のリマインダー",
    message: "明日の朝9時にミーティングがあります",
    timestamp: new Date(Date.now() - 30 * 60000),
    isRead: false,
    type: "info",
  },
  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },

  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },
  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },
  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },
  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },
  {
    id: "notif-3",
    title: "新しいメッセージ",
    message: "AIアシスタントからのコメント",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: false,
    type: "info",
  },
];

function getToday() {
  const d = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function PageHeader() {
  const pathname = usePathname();
  const page = PAGE_META[pathname ?? ""] ?? {
    title: "Aether",
    subtitle: "",
    icon: MessageSquare,
  };
  const Icon = page.icon;

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  // 未読通知の数
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 通知をマークして削除
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 全て確認処理
  const handleMarkAllAsRead = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <>
      <header className="page-header">
        {/* Left — icon + titles */}
        <div className="page-header-left">
          <div className="page-header-icon">
            <Icon size={18} />
          </div>
          <div>
            <h1 className="page-header-title">{page.title}</h1>
            {page.subtitle && (
              <p className="page-header-subtitle">{page.subtitle}</p>
            )}
          </div>
        </div>

        {/* Right — date + notification bell */}
        <div className="page-header-right">
          <span className="page-header-date">{getToday()}</span>

          <div className="page-header-notification-wrapper">
            <button
              className="page-header-bell"
              title="通知"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              aria-label="通知パネルを開く"
            >
              <Bell size={16} />
              {unreadCount > 0 && <span className="bell-dot" />}
            </button>

            {/* 通知パネル */}
            {isNotificationOpen && (
              <div ref={panelRef}>
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import "./PageHedar.css";
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  Clock,
  BookOpen,
  Settings,
  Bell,
  Blocks,
} from "lucide-react";

type PageMeta = {
  title: string;
  subtitle: string;
  icon: React.ElementType;
};

const PAGE_META: Record<string, PageMeta> = {
  "/chat": { title: "AI Chat", subtitle: "AIアシスタントとチャット", icon: MessageSquare },
  "/schedule": { title: "Schedule", subtitle: "週間スケジュール", icon: Calendar },
  "/tasks": { title: "Tasks", subtitle: "タスク管理", icon: CheckSquare },
  "/daily": { title: "Daily Plan", subtitle: "今日のプラン", icon: Clock },
  "/scraps": { title: "Scraps", subtitle: "アイデアメモ", icon: BookOpen },
  "/settings": { title: "Settings", subtitle: "設定", icon: Settings },
  "/integrations": { title: "Integrations", subtitle: "外部サービス連携", icon: Blocks },
};

function getToday() {
  const d = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

  return (
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

      {/* Right — date + notification */}
      <div className="page-header-right">
        <span className="page-header-date">{getToday()}</span>
        <button className="page-header-bell" title="通知">
          <Bell size={18} />
          <span className="bell-dot" />
        </button>
      </div>
    </header>
  );
}
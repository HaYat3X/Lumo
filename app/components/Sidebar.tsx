"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  Clock,
  BookOpen,
  Settings,
  ChevronRight,
  Blocks,
  Bot,
} from "lucide-react";
import clsx from "clsx";

/* ──────────────────────────────────────────
   Nav definitions
   ────────────────────────────────────────── */
type NavChild = { href: string; label: string };
type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  children?: NavChild[];
};

const MAIN_NAV: NavItem[] = [
  {
    href: "/chat",
    icon: Bot,
    label: "AI Assistant",
  },
  {
    href: "/schedule",
    icon: Calendar,
    label: "Schedule",
    children: [
      { href: "/schedule", label: "Weekly" },
      { href: "/schedule/daily", label: "Daily" },
    ],
  },
  {
    href: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
  },
  { href: "/daily", icon: Clock, label: "Daily Plan" },
  { href: "/scraps", icon: BookOpen, label: "Scraps" },
];

const SYSTEM_NAV: NavItem[] = [
  { href: "/integrations", icon: Blocks, label: "Integrations" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */
export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>("/schedule");

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const toggleExpand = (href: string) =>
    setExpanded((prev) => (prev === href ? null : href));

  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <Link href="/chat" className="brand-icon">
          <Image
            src="/img/aether_icon_512.png"
            alt="Aether"
            width={36}
            height={36}
            className="rounded-[10px]"
          />
        </Link>
        <Link href="/chat" className="brand-name">
          Aether
        </Link>
      </div>

      {/* ── Main Nav ── */}
      <NavSection
        label="Menu"
        items={MAIN_NAV}
        isActive={isActive}
        expanded={expanded}
        onToggle={toggleExpand}
      />

      {/* ── System Nav ── */}
      <NavSection
        label="System"
        items={SYSTEM_NAV}
        isActive={isActive}
        expanded={expanded}
        onToggle={toggleExpand}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── User ── */}
      <div className="sidebar-user">
        <div className="user-avatar">H</div>
        <div className="user-info">
          <div className="user-name">Hayate Takeda</div>
        </div>
        <div className="user-status" />
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────
   NavSection sub-component
   ────────────────────────────────────────── */
function NavSection({
  label,
  items,
  isActive,
  expanded,
  onToggle,
}: {
  label: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
  expanded: string | null;
  onToggle: (href: string) => void;
}) {
  return (
    <div className="nav-section">
      <div className="nav-section-label">{label}</div>

      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const hasChildren = !!item.children;
        const isExpanded = expanded === item.href;

        return (
          <div key={item.href}>
            {/* Parent item */}
            {hasChildren ? (
              <button
                onClick={() => onToggle(item.href)}
                className={clsx(
                  "nav-item nav-parent",
                  active && "active",
                  isExpanded && "expanded"
                )}
              >
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                <span className="nav-chevron">
                  <ChevronRight size={14} />
                </span>
              </button>
            ) : (
              <Link
                href={item.href}
                className={clsx("nav-item", active && "active")}
              >
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            )}

            {/* Sub-menu */}
            {hasChildren && (
              <div className={clsx("nav-sub", isExpanded && "open")}>
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={clsx(
                      "nav-item",
                      isActive(child.href) && "active"
                    )}
                  >
                    <span className="sub-dot" />
                    <span className="nav-label">{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
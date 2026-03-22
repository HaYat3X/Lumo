"use client";

import { useState, useRef, useEffect } from "react";
import "./main.css";
import {
  Send,
  Bot,
  User,
  Paperclip,
  Sparkles,
  CalendarPlus,
  ListChecks,
  ArrowRight,
} from "lucide-react";

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

/* ──────────────────────────────────────────
   Initial dummy messages
   ────────────────────────────────────────── */
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "こんにちは！Aetherです。\nスケジュール管理、タスク登録、メモ作成など、なんでもお手伝いします。何をしましょうか？",
    timestamp: "09:00",
  },
  {
    id: "2",
    role: "user",
    content: "今日の予定を教えて",
    timestamp: "09:01",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "今日の予定はこちらです：\n\n• 09:00 — 朝会（30分）\n• 10:00 — チームMTG（1時間）\n• 13:00 — ランチ\n• 14:00 — 1on1 with 田中さん（30分）\n• 16:00 — コードレビュー（1時間）\n\n午前中にMTGが集中していますね。午後は比較的空いているので、集中作業におすすめです。",
    timestamp: "09:01",
  },
];

/* ──────────────────────────────────────────
   Quick actions
   ────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: CalendarPlus, label: "予定を追加", prompt: "明日の14時に会議を追加して" },
  { icon: ListChecks, label: "タスク登録", prompt: "タスクを新しく登録して" },
  { icon: Sparkles, label: "今日の要約", prompt: "今日の予定とタスクをまとめて" },
];

/* ──────────────────────────────────────────
   Right sidebar data
   ────────────────────────────────────────── */
const NEXT_UP = [
  { time: "10:00", title: "チームMTG", color: "var(--color-accent-bright)" },
  { time: "14:00", title: "1on1 田中さん", color: "var(--color-amber)" },
  { time: "16:00", title: "コードレビュー", color: "var(--color-purple)" },
];

const TODAY_TASKS = [
  { title: "レポート提出", done: false, priority: "high" },
  { title: "企画書レビュー", done: false, priority: "medium" },
  { title: "MTGアジェンダ作成", done: true, priority: "high" },
  { title: "デザインFB返信", done: false, priority: "low" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "var(--color-red)",
  medium: "var(--color-amber)",
  low: "var(--color-text-muted)",
};

/* ──────────────────────────────────────────
   ChatPage Component
   ────────────────────────────────────────── */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message handler (UI only — API integration later)
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (replace with real API call later)
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "承知しました。対応中です…（※ここにClaude APIのレスポンスが入ります）",
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-layout">
      {/* ════════ Chat Main ════════ */}
      <div className="chat-main">
        {/* Messages */}
        <div className="chat-messages">
          <div className="chat-messages-inner">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-row ${msg.role === "user" ? "chat-row-user" : "chat-row-ai"}`}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="chat-avatar chat-avatar-ai">
                    <Bot size={16} />
                  </div>
                )}

                {/* Bubble */}
                <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                  <div className="chat-bubble-content">
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <span className="chat-time">{msg.timestamp}</span>
                </div>

                {msg.role === "user" && (
                  <div className="chat-avatar chat-avatar-user">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-row chat-row-ai">
                <div className="chat-avatar chat-avatar-ai">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble chat-bubble-ai">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chat-quick-actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.prompt)}
              >
                <Icon size={14} />
                <span>{action.label}</span>
                <ArrowRight size={12} className="quick-action-arrow" />
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <button className="chat-input-action" title="ファイルを添付">
              <Paperclip size={16} />
            </button>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="メッセージを入力... (Enter で送信)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`chat-send-btn ${input.trim() ? "active" : ""}`}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════ Right Sidebar ════════ */}
      <aside className="chat-sidebar">
        {/* Next Up */}
        <div className="chat-sidebar-card">
          <h3 className="chat-sidebar-title">Next Up</h3>
          <div className="chat-sidebar-list">
            {NEXT_UP.map((item) => (
              <div key={item.time} className="sidebar-schedule-item">
                <span
                  className="sidebar-schedule-dot"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}40` }}
                />
                <span className="sidebar-schedule-time">{item.time}</span>
                <span className="sidebar-schedule-title">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="chat-sidebar-card">
          <h3 className="chat-sidebar-title">Today&apos;s Tasks</h3>
          <div className="chat-sidebar-list">
            {TODAY_TASKS.map((task) => (
              <div key={task.title} className="sidebar-task-item">
                <span
                  className={`sidebar-task-check ${task.done ? "done" : ""}`}
                >
                  {task.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={`sidebar-task-title ${task.done ? "done" : ""}`}>
                  {task.title}
                </span>
                <span
                  className="sidebar-task-dot"
                  style={{ background: PRIORITY_COLORS[task.priority] }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="chat-sidebar-card">
          <h3 className="chat-sidebar-title">Connections</h3>
          <div className="chat-sidebar-list">
            <div className="sidebar-connection">
              <span className="connection-dot connected" />
              <span className="connection-label">Google Calendar</span>
            </div>
            <div className="sidebar-connection">
              <span className="connection-dot connected" />
              <span className="connection-label">Notion</span>
            </div>
            <div className="sidebar-connection">
              <span className="connection-dot disconnected" />
              <span className="connection-label">LINE Bot</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
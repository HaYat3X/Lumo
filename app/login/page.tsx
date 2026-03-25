"use client"  // ← クライアントコンポーネントにする

import { signIn } from "next-auth/react"  // ← インポート元を変える

export default function LoginPage() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100dvh",
      background: "var(--color-bg-base)",
    }}>
      <div style={{
        background: "var(--color-glass)",
        border: "1px solid var(--color-glass-border)",
        borderRadius: "16px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        alignItems: "center",
        minWidth: "320px",
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "24px",
          fontWeight: "800",
          color: "var(--color-text-primary)",
        }}>
          Lumo
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
          続けるにはログインしてください
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/chat" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid var(--color-border-hover)",
            background: "transparent",
            color: "var(--color-text-primary)",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
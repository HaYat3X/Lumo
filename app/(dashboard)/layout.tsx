import { auth } from "@/auth";
import "../globals.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-base)",
        overflow: "hidden",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          margin: "40px"
        }}
      >
        {children}
      </main>
    </div>
  );
}

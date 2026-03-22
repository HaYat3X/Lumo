import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh">
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <main
        className="ml-[260px] flex-1 overflow-y-auto"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.03) 0%, transparent 60%)",
        }}
      >
        <div className="px-9 pt-7 pb-9">
          <PageHeader />
          {children}
        </div>
      </main>
    </div>
  );
}
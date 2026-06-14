import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 min-h-screen flex flex-col">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

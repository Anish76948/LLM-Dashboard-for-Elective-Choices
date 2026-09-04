import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#eceef1] text-zinc-900 antialiased font-sans">
      {/* Left Minimalist Sidebar */}
      <Sidebar />

      {/* Floating White Main Application Window */}
      <div className="flex-1 flex flex-col my-3 mr-3 min-w-0">
        <div className="flex-1 bg-white rounded-[26px] border border-zinc-200/80 shadow-xs p-7 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

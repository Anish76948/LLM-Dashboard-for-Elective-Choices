import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#eceef1] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 antialiased font-sans transition-colors duration-200">
      {/* Left Minimalist Sidebar */}
      <Sidebar />

      {/* Floating Application Window Container */}
      <div className="flex-1 flex flex-col my-3 mr-3 min-w-0">
        <div className="flex-1 bg-white dark:bg-[#111113] rounded-[26px] border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-7 flex flex-col overflow-y-auto transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
}

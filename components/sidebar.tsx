"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, CheckSquare, Sparkles, ShieldCheck, GraduationCap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("student");

  useEffect(() => {
    // Read role from cookie or localStorage
    const match = document.cookie.match(/user_role=([^;]+)/);
    if (match) {
      setRole(match[1]);
    }
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse Electives", href: "/browse", icon: BookOpen },
    { label: "My Picks", href: "/picks", icon: CheckSquare },
    { label: "AI Advisor", href: "/advisor", icon: Sparkles, badge: "MiniMax M3" },
    ...(role === "admin" ? [{ label: "Admin Analytics", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "electiveos_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="p-2 bg-violet-600 text-white rounded-xl">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">ElectiveOS</span>
          <span className="text-[10px] block font-medium text-violet-600 uppercase tracking-widest">Portal</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-violet-600" : "text-slate-400")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

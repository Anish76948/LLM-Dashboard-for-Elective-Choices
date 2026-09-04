"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, LayoutGrid, Sparkles } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function Topbar() {
  const pathname = usePathname();

  // Compute breadcrumb title
  let section = "ACADEMICS";
  let pageName = "Electives";
  if (pathname === "/dashboard") pageName = "Overview";
  if (pathname === "/browse") pageName = "Electives Catalog";
  if (pathname === "/picks") pageName = "Ranked Picks";
  if (pathname === "/advisor") {
    section = "INTELLIGENCE";
    pageName = "Academic Advisor";
  }
  if (pathname === "/admin") {
    section = "GOVERNANCE";
    pageName = "Allocations Ledger";
  }

  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
        <LayoutGrid className="w-4 h-4 text-zinc-400" />
        <span className="tracking-wider uppercase font-semibold text-zinc-400">{section}</span>
        <span className="text-zinc-300">›</span>
        <span className="text-zinc-800 font-semibold">{pageName}</span>
      </div>

      {/* Right: Search + Notification Bell + Quick Link */}
      <div className="flex items-center gap-3">
        {/* Search with ⌘K */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Go to..."
            className="w-48 sm:w-60 h-8 pl-8 pr-9 text-xs bg-zinc-50 border border-zinc-200/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none text-[10px] text-zinc-400 font-mono bg-white border border-zinc-200 px-1 py-0.2 rounded">
            ⌘K
          </div>
        </div>

        {/* Bell with counter 3 */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors text-zinc-600">
          <Bell className="w-4 h-4" />
          <span className="absolute 1 top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <ModeToggle />

        {/* Quick CTA button */}
        <Link href="/advisor">
          <button className="h-8 px-3.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Ask Advisor</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

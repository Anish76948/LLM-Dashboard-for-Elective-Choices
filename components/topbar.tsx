"use client";

import { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const [userEmail, setUserEmail] = useState("student1@demo.edu");
  const [role, setRole] = useState("student");

  useEffect(() => {
    const userMatch = document.cookie.match(/electiveos_user=([^;]+)/);
    if (userMatch) setUserEmail(decodeURIComponent(userMatch[1]));
    const roleMatch = document.cookie.match(/user_role=([^;]+)/);
    if (roleMatch) setRole(roleMatch[1]);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search electives, professors, tags..."
          className="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-violet-500 text-xs"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 uppercase font-semibold text-[11px]">
          {role} portal
        </Badge>

        <div className="h-4 w-px bg-slate-200" />

        {/* Profile Chip */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-xs border border-violet-200">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">{userEmail}</div>
            <div className="text-[10px] text-slate-400 capitalize">Spring 2026 Choice Window</div>
          </div>
        </div>
      </div>
    </header>
  );
}

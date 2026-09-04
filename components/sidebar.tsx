"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  Layers,
  FileText,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  GraduationCap,
  BookOpen,
  CheckSquare,
  BarChart3,
  LogOut,
  Users,
  Compass,
  SlidersHorizontal,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("student");
  const [currentUser, setCurrentUser] = useState<string>("student1@demo.edu");
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/user_role=([^;]+)/);
    if (match) setRole(match[1]);
    const userMatch = document.cookie.match(/electiveos_user=([^;]+)/);
    if (userMatch) setCurrentUser(decodeURIComponent(userMatch[1]));
  }, []);

  const switchDemoUser = (email: string, userRole: string, name: string) => {
    document.cookie = `user_role=${userRole}; path=/; max-age=86400`;
    document.cookie = `electiveos_user=${email}; path=/; max-age=86400`;
    setRole(userRole);
    setCurrentUser(email);
    setDemoMenuOpen(false);
    toast.success(`Switched active persona to ${name}`);
    if (userRole === "admin") {
      router.push("/admin");
    } else if (userRole === "faculty") {
      router.push("/faculty");
    } else if (pathname === "/admin" || pathname === "/faculty") {
      router.push("/dashboard");
    } else {
      router.refresh();
    }
  };

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "electiveos_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const isStudent1 = currentUser === "student1@demo.edu";
  const isStudent2 = currentUser === "student2@demo.edu";
  const isFaculty = role === "faculty" || currentUser === "faculty@demo.edu";
  const isAdmin = role === "admin" || currentUser === "admin@demo.edu";

  const studentName = isStudent1
    ? "Alex Rivera"
    : isStudent2
    ? "Maya Chen"
    : isFaculty
    ? "Prof. Marcus Vance"
    : "Academic Admin";

  const studentTitle = isStudent1
    ? "3rd Year • Has ML Prereq"
    : isStudent2
    ? "3rd Year • Missing ML"
    : isFaculty
    ? "Faculty • CS & AI"
    : "Academic Administration";

  return (
    <aside className="w-60 bg-transparent flex flex-col shrink-0 h-screen sticky top-0 py-4 pl-4 select-none">
      {/* Brand / Logo */}
      <div className="h-12 flex items-center px-4 gap-2.5 mb-2">
        <div className="flex items-center justify-center text-zinc-900 dark:text-zinc-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight text-[15px]">Elective</span>
      </div>

      {/* Navigation Sections Isolated by Role */}
      <div className="flex-1 overflow-y-auto px-2 space-y-5 text-[13px]">
        {/* STUDENT NAVIGATION */}
        {!isAdmin && !isFaculty && (
          <>
            <div className="space-y-0.5">
              <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                ACADEMICS
              </div>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                  pathname === "/dashboard"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
              >
                <Activity className="w-4 h-4 text-zinc-500" />
                <span>Overview</span>
              </Link>

              <Link
                href="/browse"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                  pathname === "/browse"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
              >
                <BookOpen className="w-4 h-4 text-zinc-500" />
                <span>Electives Catalog</span>
              </Link>

              <Link
                href="/picks"
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150",
                  pathname === "/picks"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-zinc-500" />
                  <span>My Picks</span>
                </div>
                <span className="text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold px-1.5 py-0.5 rounded-full">
                  Ranked
                </span>
              </Link>

              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                  pathname === "/profile"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
              >
                <Award className="w-4 h-4 text-zinc-500" />
                <span>Academic Transcript</span>
              </Link>
            </div>

            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                INTELLIGENCE
              </div>
              <Link
                href="/advisor"
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150",
                  pathname === "/advisor"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>AI Advisor</span>
                </div>
                <span className="text-[9px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded-md">
                  MiniMax
                </span>
              </Link>
            </div>
          </>
        )}

        {/* FACULTY NAVIGATION */}
        {isFaculty && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              FACULTY PORTAL
            </div>
            <Link
              href="/faculty"
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150",
                pathname === "/faculty"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
              )}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Course Suite</span>
              </div>
              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md">
                Waivers
              </span>
            </Link>
            <Link
              href="/browse"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                pathname === "/browse"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
              )}
            >
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span>Electives Catalog</span>
            </Link>
          </div>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              GOVERNANCE
            </div>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                pathname === "/admin"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
              )}
            >
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              <span>Allocations Ledger</span>
            </Link>
            <Link
              href="/browse"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                pathname === "/browse"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
              )}
            >
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span>Electives Catalog</span>
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-150",
                pathname === "/dashboard"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200/70 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
              )}
            >
              <Activity className="w-4 h-4 text-zinc-500" />
              <span>Overview</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Profile / Demo Switcher Card */}
      <div className="relative px-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
        <button
          onClick={() => setDemoMenuOpen(!demoMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all text-left group border border-transparent hover:border-zinc-200/70 dark:hover:border-zinc-700"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs flex items-center justify-center shrink-0">
              {isAdmin ? "AD" : isFaculty ? "MV" : isStudent1 ? "AR" : "MC"}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {studentName}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-tight mt-0.5">
                {studentTitle}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-transform" />
        </button>

        {/* Demo Switcher Dropdown */}
        {demoMenuOpen && (
          <div className="absolute bottom-16 left-2 right-2 bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 space-y-1 z-50 animate-fade-in-up">
            <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Switch Demo Persona
            </div>
            <button
              onClick={() => switchDemoUser("student1@demo.edu", "student", "Alex Rivera (Student 1)")}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                isStudent1 ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span>Alex (Full Prereqs)</span>
              {isStudent1 && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
            </button>
            <button
              onClick={() => switchDemoUser("student2@demo.edu", "student", "Maya Chen (Student 2)")}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                isStudent2 ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span>Maya (Missing ML - Waiver)</span>
              {isStudent2 && <span className="text-[10px] text-amber-600 font-bold">Active</span>}
            </button>
            <button
              onClick={() => switchDemoUser("faculty@demo.edu", "faculty", "Prof. Marcus Vance (Faculty)")}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                isFaculty ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span>Prof. Vance (Faculty)</span>
              {isFaculty && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
            </button>
            <button
              onClick={() => switchDemoUser("admin@demo.edu", "admin", "Academic Administration")}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                isAdmin ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span>Academic Administration</span>
              {isAdmin && <span className="text-[10px] text-purple-600 font-bold">Active</span>}
            </button>
            <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleLogout}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

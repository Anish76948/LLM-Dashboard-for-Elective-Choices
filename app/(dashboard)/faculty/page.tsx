"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getWaivers, updateWaiverStatus, getElectives } from "@/lib/api";
import { WaiverRequest, Elective } from "@/lib/types";
import { toast } from "sonner";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ArrowUpRight
} from "lucide-react";

export default function FacultyPage() {
  const [waivers, setWaivers] = useState<WaiverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("Deep Learning & Neural Networks");

  const loadWaivers = async () => {
    try {
      const data = await getWaivers();
      setWaivers(data);
    } catch (e) {
      console.warn("Failed to load waivers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaivers();
  }, []);

  const handleAction = async (waiverId: string, studentName: string, status: "approved" | "rejected") => {
    try {
      await updateWaiverStatus(waiverId, status);
      toast.success(
        status === "approved"
          ? `Waiver Approved for ${studentName}! Prerequisite lock released.`
          : `Waiver request declined for ${studentName}.`
      );
      await loadWaivers();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  const pendingWaivers = waivers.filter((w) => w.status === "pending");

  // Simulated enrolled student cohort for this professor's course
  const cohort = [
    { id: "STU-1021", name: "Alex Rivera", major: "Computer Science", cgpa: "3.84", status: "Prereqs Satisfied", date: "Sep 02, 2026" },
    { id: "STU-1044", name: "Sarah Lin", major: "Computer Science", cgpa: "3.91", status: "Prereqs Satisfied", date: "Sep 02, 2026" },
    { id: "STU-1088", name: "David Kim", major: "Data Science", cgpa: "3.65", status: "Prereqs Satisfied", date: "Sep 03, 2026" },
    { id: "STU-1102", name: "Priya Patel", major: "Electronics", cgpa: "3.78", status: "Prereqs Satisfied", date: "Sep 03, 2026" },
    { id: "STU-1135", name: "Liam Vance", major: "Computer Science", cgpa: "3.52", status: "Refresher Suggested", date: "Sep 04, 2026" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            FACULTY PORTAL
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Instructor Course Suite
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Prof. Marcus Vance • Department of Computer Science & AI. Review cohort readiness and evaluate student prerequisite waiver requests.
          </p>
        </div>

        {/* Course Switcher Filter */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
          {["Deep Learning & Neural Networks", "Cloud Native Architecture"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCourse(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCourse === c
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {c.split("&")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>ENROLLED ROSTER</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">Section 1</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              47 / 50 Students
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              94% room capacity utilized (3 seats open)
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>COHORT READINESS</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">High Synergy</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              91% Qualified
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Passed Machine Learning & Linear Algebra prerequisites
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>WAIVER REQUESTS</span>
            </div>
            <span className="text-xs font-bold text-amber-600">{pendingWaivers.length} Action Needed</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {pendingWaivers.length} Pending
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Students seeking instructor consent for enrollment
            </div>
          </div>
        </div>
      </div>

      {/* AI Roster Insight */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-xs mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            Instructor Intelligence: Cohort Distribution
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Your section has <strong>65% CS</strong>, <strong>25% Data Science</strong>, and <strong>10% Electronics</strong> students. Average CGPA is <strong>3.74</strong>. 
            Two students without the formal prerequisite course have applied for waivers with relevant internship and project credentials.
          </p>
        </div>
      </div>

      {/* Prerequisite Waiver Requests Inbox */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs mb-6 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Prerequisite Waiver Requests ({pendingWaivers.length})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              One-click instructor approval overrides prerequisite blocks for qualified applicants.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Auto-synced</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {waivers.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400">
              No pending prerequisite waiver requests.
            </div>
          ) : (
            waivers.map((w) => (
              <div
                key={w.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {w.studentName}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">({w.studentEmail})</span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      Missing: {w.missingPrereq}
                    </span>
                    {w.status === "approved" && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        ✓ Approved
                      </span>
                    )}
                    {w.status === "rejected" && (
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 italic">
                    "{w.reason}"
                  </p>
                  <div className="text-[10px] text-zinc-400">
                    Applied for: <strong>{w.electiveTitle}</strong> • {w.createdAt}
                  </div>
                </div>

                {/* Approve / Deny Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {w.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAction(w.id, w.studentName, "rejected")}
                        className="h-8 px-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(w.id, w.studentName, "approved")}
                        className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Waiver</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium capitalize">
                      Processed ({w.status})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enrolled Students Roster Table */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Enrolled Student Roster ({cohort.length} samples)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified registrations for {selectedCourse}
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Fall 2026 Cohort</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Student ID</th>
                <th className="py-3 px-4 font-medium">Student Name</th>
                <th className="py-3 px-4 font-medium">Degree Major</th>
                <th className="py-3 px-4 font-medium">Cumulative GPA</th>
                <th className="py-3 px-4 font-medium">Prerequisite Status</th>
                <th className="py-3 px-5 text-right font-medium">Allocation Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800">
              {cohort.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-5 font-mono text-[11px] text-zinc-500">
                    {s.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {s.major}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {s.cgpa}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right text-zinc-400 font-mono text-[11px]">
                    {s.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getWaivers } from "@/lib/api";
import { WaiverRequest } from "@/lib/types";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState("student1@demo.edu");
  const [waivers, setWaivers] = useState<WaiverRequest[]>([]);

  useEffect(() => {
    const userMatch = document.cookie.match(/electiveos_user=([^;]+)/);
    if (userMatch) setCurrentUser(decodeURIComponent(userMatch[1]));

    async function load() {
      const data = await getWaivers();
      setWaivers(data);
    }
    load();
  }, []);

  const isStudent1 = currentUser === "student1@demo.edu";
  const isStudent2 = currentUser === "student2@demo.edu";

  const studentName = isStudent1 ? "Alex Rivera" : isStudent2 ? "Maya Chen" : "Demo Student";
  const studentId = isStudent1 ? "STU-2026-0419" : "STU-2026-0882";
  const cgpa = isStudent1 ? "3.84" : "3.72";
  const hasML = isStudent1;

  // Transcript coursework
  const transcriptCourses = [
    { code: "CS-101", title: "Programming Fundamentals (Python & C++)", credits: 4, grade: "A", term: "Fall 2024", status: "Completed" },
    { code: "CS-201", title: "Data Structures & Advanced Algorithms", credits: 4, grade: "A-", term: "Spring 2025", status: "Completed" },
    { code: "MATH-202", title: "Linear Algebra & Multivariate Calculus", credits: 4, grade: "B+", term: "Spring 2025", status: "Completed" },
    { code: "CS-301", title: "Database Management Systems & SQL", credits: 3, grade: "A", term: "Fall 2025", status: "Completed" },
    { code: "CS-204", title: "Computer Organization & Architecture", credits: 3, grade: "B", term: "Fall 2025", status: "Completed" },
    {
      code: "CS-305",
      title: "Machine Learning Fundamentals",
      credits: 4,
      grade: hasML ? "A" : "—",
      term: hasML ? "Spring 2026" : "Not Enrolled",
      status: hasML ? "Completed" : "Missing Prerequisite",
    },
  ];

  const myWaivers = waivers.filter((w) => w.studentEmail === currentUser);

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xl shadow-xs">
            {isStudent1 ? "AR" : isStudent2 ? "MC" : "ST"}
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
              ACADEMIC TRANSCRIPT
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {studentName}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{studentId}</span> • B.Tech Computer Science & Engineering (3rd Year, Sem 5)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/browse">
            <button className="h-9 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all">
              <span>Browse Eligible Electives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <Award className="w-4 h-4 text-zinc-400" />
              <span>CUMULATIVE GPA</span>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">Good Standing</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {cgpa} / 4.00
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Top 15% of Computer Science cohort
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>EARNED CREDITS</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">60% Degree Progress</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              72 / 120 Credits
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Requires 2 Electives (7 credits) this semester
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>PREREQUISITE STATUS</span>
            </div>
            <span className={`text-xs font-bold ${hasML ? "text-emerald-600" : "text-amber-600"}`}>
              {hasML ? "Full Eligibility" : "Missing Prereq"}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {hasML ? "All Satisfied" : "1 Blocker"}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {hasML
                ? "Eligible for Deep Learning & Computer Vision"
                : "Requires Faculty Waiver for Deep Learning"}
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisite Alert Banner if Maya Chen */}
      {!hasML && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              Prerequisite Deficiency Detected: Machine Learning Fundamentals (CS-305)
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Your transcript does not contain <strong>Machine Learning Fundamentals</strong>. Advanced electives such as <em>Deep Learning & Neural Networks</em> will be blocked during allocation unless you request an <strong>Instructor Waiver</strong> from Prof. Marcus Vance with external certifications or portfolio evidence.
            </p>
          </div>
        </div>
      )}

      {/* Active Waivers Section (if any submitted) */}
      {myWaivers.length > 0 && (
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs mb-6 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40 text-xs">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              Active Instructor Waiver Applications ({myWaivers.length})
            </span>
            <span className="text-zinc-400 font-mono">Live Sync</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {myWaivers.map((w) => (
              <div key={w.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {w.electiveTitle}
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    Missing: <strong>{w.missingPrereq}</strong> • Note: "{w.reason}"
                  </div>
                </div>
                <div>
                  {w.status === "approved" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3 h-3" /> Waiver Approved by Faculty
                    </span>
                  ) : w.status === "rejected" ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400">
                      Declined
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                      Pending Faculty Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Verified Coursework Ledger */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Verified Coursework & Completed Credits
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Institutional transcript records checked automatically by the allocation engine.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Registrar Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Course Code</th>
                <th className="py-3 px-4 font-medium">Course Title</th>
                <th className="py-3 px-4 font-medium">Credits</th>
                <th className="py-3 px-4 font-medium">Term Taken</th>
                <th className="py-3 px-4 font-medium">Grade</th>
                <th className="py-3 px-5 text-right font-medium">Prerequisite Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800">
              {transcriptCourses.map((c) => (
                <tr key={c.code} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-5 font-mono text-[11px] text-zinc-500">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                    {c.credits} cr
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {c.term}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {c.grade}
                  </td>
                  <td className="py-3 px-5 text-right">
                    {c.status === "Completed" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-blocked">
                        Not Completed
                      </span>
                    )}
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

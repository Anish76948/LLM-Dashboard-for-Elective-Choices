"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { getElectives, getChoices } from "@/lib/api";
import { Elective, Choice } from "@/lib/types";
import { Calendar, CheckCircle2, FileText, ArrowRight, MoreHorizontal, Sparkles, Clock, Check, AlertTriangle, Layers } from "lucide-react";

export default function DashboardPage() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eData, cData] = await Promise.all([getElectives(), getChoices()]);
        setElectives(eData);
        setChoices(cData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCapacity = electives.reduce((acc, cur) => acc + cur.capacity, 0);
  const totalEnrolled = electives.reduce((acc, cur) => acc + cur.enrolled, 0);
  const seatsLeft = Math.max(0, totalCapacity - totalEnrolled);
  const confirmedPicks = choices.filter((c) => c.status === "confirmed");

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            PORTAL OVERVIEW
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Student Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Live allocations ledger, course capacity metrics, and active student preference rankings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/browse">
            <button className="h-9 px-3.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold rounded-xl shadow-xs transition-all">
              Browse All
            </button>
          </Link>
          <Link href="/advisor">
            <button className="h-9 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Ask Advisor</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 3 Summary Stat Cards (Exact match to screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>REMAINING SEATS</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {loading ? "..." : `${seatsLeft} Seats`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {totalEnrolled} students allocated across courses
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CONFIRMED PICKS</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {loading ? "..." : `${confirmedPicks.length} Allocated`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              88% admission confidence on preference #1
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>DEADLINE</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              Friday 23:59
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Round 1 automated allocation lock
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Choices Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">My Ranked Choices</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Automated clash-checked preference order</p>
          </div>
          <Link href="/picks">
            <button className="text-xs font-semibold text-zinc-700 hover:text-black flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-xs transition-all">
              <span>Reorder Picks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Rank</th>
                <th className="py-3 px-4 font-medium">Course Title</th>
                <th className="py-3 px-4 font-medium">Department</th>
                <th className="py-3 px-4 font-medium">Schedule</th>
                <th className="py-3 px-4 font-medium">Credits</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Validation Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">Loading your choices...</td>
                </tr>
              ) : choices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No choices submitted yet. <Link href="/browse" className="text-zinc-800 underline font-semibold">Browse electives catalog</Link>
                  </td>
                </tr>
              ) : (
                choices.map((c) => {
                  let statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                      Confirmed
                    </span>
                  );
                  if (c.status === "waitlist") {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                        Waitlisted
                      </span>
                    );
                  } else if (c.status === "blocked") {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-blocked">
                        Blocked
                      </span>
                    );
                  }

                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center border border-zinc-200">
                          #{c.preference}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900">
                        {c.elective.title}
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {c.elective.dept}
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {c.elective.day} {c.elective.start}–{c.elective.end}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-700">
                        {c.elective.credits} cr
                      </td>
                      <td className="py-3 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-3 px-5 text-right text-zinc-500 font-medium text-[11px]">
                        {c.reason ? (
                          <span className="text-red-600 font-semibold">{c.reason}</span>
                        ) : (
                          <span className="text-emerald-600">Prerequisites satisfied</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

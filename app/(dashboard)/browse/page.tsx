"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getElectives, addChoice, getChoices } from "@/lib/api";
import { Elective, Choice } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Lock,
  Clock,
  Check,
  Filter,
  ArrowUpDown
} from "lucide-react";

export default function BrowsePage() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState("student1@demo.edu");

  useEffect(() => {
    const userMatch = document.cookie.match(/electiveos_user=([^;]+)/);
    if (userMatch) setCurrentUser(decodeURIComponent(userMatch[1]));

    async function load() {
      try {
        const [eData, cData] = await Promise.all([getElectives(), getChoices()]);
        setElectives(eData);
        setChoices(cData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCapacity = electives.reduce((acc, c) => acc + c.capacity, 0);
  const totalEnrolled = electives.reduce((acc, c) => acc + c.enrolled, 0);
  const fillPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const waitlistCount = choices.filter((c) => c.status === "waitlist").length;

  const filteredElectives = electives.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All" || e.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddPick = async (elective: Elective) => {
    setAddingId(elective.id);
    try {
      const nextPref = choices.length + 1;
      const res = await addChoice(elective.id, nextPref);

      if (!res.ok) {
        toast.error(res.error || "Allocation blocked", {
          description: res.error?.includes("Missing prereq")
            ? "Your student transcript does not fulfill this prerequisite."
            : res.error?.includes("Clash")
            ? "Overlapping time slot detected with an already selected course."
            : undefined,
        });
        return;
      }

      if (res.choice?.status === "waitlist") {
        toast.warning(`Added to Waitlist: ${elective.title}`, {
          description: "Capacity reached; placed on automated priority queue.",
        });
      } else {
        toast.success(`Allocated Preference #${nextPref}: ${elective.title}`);
      }

      const updated = await getChoices();
      setChoices(updated);
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    } finally {
      setAddingId(null);
    }
  };

  const isAlreadyChosen = (id: string) => choices.some((c) => c.elective.id === id);

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            ACADEMICS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Electives</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Real-time enrollment quotas, server-side prerequisite verification, and clash-preventing allocation.
          </p>
        </div>

        <Link href="/advisor">
          <button className="h-9 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Consult AI Advisor</span>
          </button>
        </Link>
      </div>

      {/* 3 Top Summary Stat Cards (Exact match to screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>TOTAL CAPACITY</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {loading ? "..." : `${totalCapacity} Seats`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Across {electives.length} university elective courses
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ENROLLED & ALLOCATED</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {loading ? "..." : `${totalEnrolled} Students`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {fillPercent}% of total capacity filled
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>WAITLIST & QUEUE</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {loading ? "..." : `${waitlistCount} In Queue`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Auto-promotes when seats release
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container (Exact match to screenshot table) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex-1 flex flex-col overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            {["All", "Computer Science", "Data Science", "Management", "Electronics & Comm"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDept === dept
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/70"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter courses..."
              className="h-7 pl-7 pr-3 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 w-44"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Course ID</th>
                <th className="py-3 px-4 font-medium">Course Name</th>
                <th className="py-3 px-4 font-medium">Department</th>
                <th className="py-3 px-4 font-medium">Schedule & Credits</th>
                <th className="py-3 px-4 font-medium">Seat Fill</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    Loading elective offerings...
                  </td>
                </tr>
              ) : filteredElectives.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No matching courses found.
                  </td>
                </tr>
              ) : (
                filteredElectives.map((e, index) => {
                  const chosen = isAlreadyChosen(e.id);
                  const isFull = e.enrolled >= e.capacity;
                  const isNearlyFull = e.enrolled / e.capacity >= 0.9;
                  const lacksPrereq =
                    currentUser === "student2@demo.edu" &&
                    e.prereqs.includes("Machine Learning Fundamentals");

                  // Generate code like INV-2026-E1231 in screenshot
                  const courseCode = `ELC-2026-${String(index + 101).padStart(4, "0")}`;

                  // Status badge matching screenshot
                  let statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                      Available
                    </span>
                  );
                  if (chosen) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-open">
                        Allocated
                      </span>
                    );
                  } else if (lacksPrereq) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-blocked">
                        Prereq Missing
                      </span>
                    );
                  } else if (isFull) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                        Waitlist Only
                      </span>
                    );
                  } else if (isNearlyFull) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                        90%+ Filled
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-zinc-50/70 transition-colors group"
                    >
                      {/* Course ID */}
                      <td className="py-3 px-5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {courseCode}
                      </td>

                      {/* Course Name with Avatar/Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-200">
                            {e.title.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 group-hover:text-black leading-snug">
                              {e.title}
                            </div>
                            {e.prereqs.length > 0 && (
                              <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                {lacksPrereq ? (
                                  <span className="text-red-500 font-medium flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Lacks: {e.prereqs.join(", ")}
                                  </span>
                                ) : (
                                  <span>Prereq: {e.prereqs.join(", ")}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                        {e.dept}
                      </td>

                      {/* Schedule & Credits */}
                      <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{e.day}, {e.start}–{e.end}</span>
                          <span className="text-zinc-300">•</span>
                          <span>{e.credits} cr</span>
                        </div>
                      </td>

                      {/* Fill Rate */}
                      <td className="py-3 px-4 font-mono text-zinc-700 whitespace-nowrap">
                        {e.enrolled} / {e.capacity}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {statusBadge}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        {chosen ? (
                          <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Picks
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddPick(e)}
                            disabled={addingId === e.id}
                            className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition-all ${
                              lacksPrereq
                                ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                : "bg-zinc-900 hover:bg-black text-white shadow-xs"
                            }`}
                          >
                            {addingId === e.id ? "Adding..." : lacksPrereq ? "Add (Block)" : "Add to Picks"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 bg-zinc-50/40">
          <span>
            1 to {filteredElectives.length} of {electives.length}
          </span>
          <div className="flex items-center gap-3">
            <button className="text-zinc-400 hover:text-zinc-600 disabled:opacity-40">Prev</button>
            <span className="text-zinc-300">•</span>
            <button className="text-zinc-600 font-medium hover:text-zinc-900">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

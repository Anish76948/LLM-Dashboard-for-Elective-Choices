"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getElectives, addChoice, getChoices, submitWaiverRequest, getWaivers } from "@/lib/api";
import { Elective, Choice, WaiverRequest } from "@/lib/types";
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
  ArrowUpDown,
  FileQuestion,
  X
} from "lucide-react";

export default function BrowsePage() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [waivers, setWaivers] = useState<WaiverRequest[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState("student1@demo.edu");

  // Waiver Modal
  const [waiverModalCourse, setWaiverModalCourse] = useState<Elective | null>(null);
  const [waiverReason, setWaiverReason] = useState("");
  const [submittingWaiver, setSubmittingWaiver] = useState(false);

  useEffect(() => {
    const userMatch = document.cookie.match(/electiveos_user=([^;]+)/);
    if (userMatch) setCurrentUser(decodeURIComponent(userMatch[1]));

    async function load() {
      try {
        const [eData, cData, wData] = await Promise.all([
          getElectives(),
          getChoices(),
          getWaivers(),
        ]);
        setElectives(eData);
        setChoices(cData);
        setWaivers(wData);
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

  const handleSendWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverModalCourse || !waiverReason.trim()) return;

    setSubmittingWaiver(true);
    try {
      const studentName =
        currentUser === "student2@demo.edu" ? "Maya Chen" : "Alex Rivera";
      const missingPrereq = waiverModalCourse.prereqs[0] || "Foundational Requirement";

      await submitWaiverRequest({
        studentName,
        studentEmail: currentUser,
        electiveId: waiverModalCourse.id,
        electiveTitle: waiverModalCourse.title,
        missingPrereq,
        reason: waiverReason.trim(),
      });

      toast.success(`Waiver request sent for ${waiverModalCourse.title}!`, {
        description: "Prof. Marcus Vance will review this in the Instructor Portal.",
      });

      const updated = await getWaivers();
      setWaivers(updated);
      setWaiverModalCourse(null);
      setWaiverReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit waiver");
    } finally {
      setSubmittingWaiver(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Electives Catalog
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Real-time enrollment quotas, server-side prerequisite verification, and clash-preventing allocation.
          </p>
        </div>

        <Link href="/advisor">
          <button className="h-9 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 dark:text-purple-600" />
            <span>Consult AI Advisor</span>
          </button>
        </Link>
      </div>

      {/* 3 Top Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>TOTAL CAPACITY</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {loading ? "..." : `${totalCapacity} Seats`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Across {electives.length} university elective courses
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ENROLLED & ALLOCATED</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {loading ? "..." : `${totalEnrolled} Students`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {fillPercent}% of total capacity filled
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>WAITLIST & QUEUE</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {loading ? "..." : `${waitlistCount} In Queue`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Auto-promotes when seats release
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex-1 flex flex-col overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 overflow-x-auto">
            {["All", "Computer Science", "Data Science", "Management", "Electronics & Comm"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedDept === dept
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter courses..."
              className="h-7 pl-7 pr-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 w-44"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Course ID</th>
                <th className="py-3 px-4 font-medium">Course Name</th>
                <th className="py-3 px-4 font-medium">Department</th>
                <th className="py-3 px-4 font-medium">Schedule & Credits</th>
                <th className="py-3 px-4 font-medium">Seat Fill</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800">
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

                  // Waiver status check
                  const myWaiver = waivers.find(
                    (w) => w.electiveId === e.id && w.studentEmail === currentUser
                  );
                  const isWaiverApproved = myWaiver?.status === "approved";
                  const isWaiverPending = myWaiver?.status === "pending";

                  const lacksPrereq =
                    !isWaiverApproved &&
                    currentUser === "student2@demo.edu" &&
                    e.prereqs.includes("Machine Learning Fundamentals");

                  const courseCode = `ELC-2026-${String(index + 101).padStart(4, "0")}`;

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
                  } else if (isWaiverApproved) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                        Waiver Approved
                      </span>
                    );
                  } else if (isWaiverPending) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                        Waiver Pending
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
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors group"
                    >
                      {/* Course ID */}
                      <td className="py-3 px-5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {courseCode}
                      </td>

                      {/* Course Name with Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {e.title.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white leading-snug">
                              {e.title}
                            </div>
                            {e.prereqs.length > 0 && (
                              <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                {isWaiverApproved ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Waiver granted by Prof. Vance
                                  </span>
                                ) : lacksPrereq ? (
                                  <span className="text-red-500 dark:text-red-400 font-medium flex items-center gap-0.5">
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
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {e.dept}
                      </td>

                      {/* Schedule & Credits */}
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{e.day}, {e.start}–{e.end}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span>{e.credits} cr</span>
                        </div>
                      </td>

                      {/* Fill Rate */}
                      <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {e.enrolled} / {e.capacity}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {statusBadge}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        {chosen ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Picks
                          </span>
                        ) : isWaiverPending ? (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            Awaiting Faculty
                          </span>
                        ) : lacksPrereq ? (
                          <button
                            onClick={() => {
                              setWaiverModalCourse(e);
                              setWaiverReason("");
                            }}
                            className="h-7 px-2.5 text-[11px] font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1 ml-auto"
                          >
                            <FileQuestion className="w-3 h-3" />
                            <span>Request Waiver</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddPick(e)}
                            disabled={addingId === e.id}
                            className="h-7 px-3 text-[11px] font-semibold rounded-lg bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white shadow-xs transition-all"
                          >
                            {addingId === e.id ? "Adding..." : "Add to Picks"}
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
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50/40 dark:bg-zinc-900/40">
          <span>
            1 to {filteredElectives.length} of {electives.length}
          </span>
          <div className="flex items-center gap-3">
            <button className="hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-40">Prev</button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <button className="text-zinc-700 dark:text-zinc-300 font-medium hover:text-black dark:hover:text-white">Next</button>
          </div>
        </div>
      </div>

      {/* Prerequisite Waiver Modal for Students */}
      {waiverModalCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#121215] rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Request Prerequisite Waiver
              </h3>
              <button
                onClick={() => setWaiverModalCourse(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <p>
                You are requesting permission from the course instructor to enroll in{" "}
                <strong>{waiverModalCourse.title}</strong> without having completed{" "}
                <strong>{waiverModalCourse.prereqs.join(", ")}</strong>.
              </p>
            </div>

            <form onSubmit={handleSendWaiver} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Your Background & Rationale
                </label>
                <textarea
                  rows={3}
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  placeholder="e.g. Completed Stanford CS229 online certificate; built PyTorch computer vision project on GitHub; 3-month research internship."
                  className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaiverModalCourse(null)}
                  className="h-8 px-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWaiver || !waiverReason.trim()}
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <span>{submittingWaiver ? "Submitting..." : "Send to Instructor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

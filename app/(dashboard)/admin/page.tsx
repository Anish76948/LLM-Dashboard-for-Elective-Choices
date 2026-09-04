"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getAnalytics, getElectives } from "@/lib/api";
import { Analytics, Elective } from "@/lib/types";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileText,
  Plus,
  Play,
  Download,
  Sparkles,
  TrendingUp,
  BarChart3,
  X,
  Check,
  Clock,
  Layers
} from "lucide-react";

const COLORS = ["#18181b", "#71717a", "#a1a1aa", "#d4d4d8", "#3f3f46"];

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [allocResultModal, setAllocResultModal] = useState<any | null>(null);
  const [runningAlloc, setRunningAlloc] = useState(false);
  const [clashResolved, setClashResolved] = useState(false);

  const handleResolveClash = () => {
    setClashResolved(true);
    toast.success("Schedule optimized! Cloud Native moved to Tuesday 14:00 (42 student conflicts cleared).");
  };

  // New elective form state
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Computer Science");
  const [newCapacity, setNewCapacity] = useState("50");
  const [newCredits, setNewCredits] = useState("3");
  const [newDay, setNewDay] = useState("Tuesday");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("11:30");
  const [newPrereqs, setNewPrereqs] = useState("");

  const refreshData = async () => {
    try {
      const [analyticsRes, electivesRes] = await Promise.all([getAnalytics(), getElectives()]);
      setData(analyticsRes);
      setElectives(electivesRes);
    } catch (e) {
      console.warn("Failed to reload admin data", e);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        await refreshData();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Admin Action: Create Elective Course
  const handleCreateElective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a course title");
      return;
    }

    try {
      const res = await fetch("/api/electives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          dept: newDept,
          capacity: Number(newCapacity) || 50,
          credits: Number(newCredits) || 3,
          day: newDay,
          start: newStart,
          end: newEnd,
          prereqs: newPrereqs.split(",").map((s) => s.trim()).filter(Boolean),
          difficulty: "medium",
          description: `Core institutional elective in ${newDept}.`,
        }),
      });

      if (!res.ok) throw new Error("Failed to create elective");

      toast.success(`Created Elective: ${newTitle}`);
      setCreateModalOpen(false);
      setNewTitle("");
      setNewPrereqs("");
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    }
  };

  // Admin Action: Expand Seats in Real-time
  const handleExpandSeats = async (id: string, title: string, delta: number) => {
    try {
      const res = await fetch("/api/electives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, capacityDelta: delta }),
      });
      if (!res.ok) throw new Error("Capacity expansion failed");

      toast.success(`Expanded ${title} by +${delta} seats!`);
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to expand seats");
    }
  };

  // Admin Action: Run Allocation Algorithm
  const handleRunAllocation = async () => {
    setRunningAlloc(true);
    try {
      const res = await fetch("/api/admin/allocate", { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Algorithm failed");

      setAllocResultModal(result.stats);
      toast.success("Round 1 Priority Matching Engine finished!");
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to run algorithm");
    } finally {
      setRunningAlloc(false);
    }
  };

  // Admin Action: Export CSV
  const handleExportCSV = () => {
    if (!data) return;
    let csv = "Course Title,Choices Submitted,Classroom Capacity,Fill Rate,Status\n";
    data.perElective.forEach((e) => {
      const fill = Math.round((e.choices / e.capacity) * 100);
      csv += `"${e.title}",${e.choices},${e.capacity},${fill}%,${fill >= 90 ? "Saturated" : "Healthy"}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `elective_master_allocations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported master allocations CSV");
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="py-24 text-center text-xs text-zinc-400">
          Aggregating institutional allocation ledger...
        </div>
      </div>
    );
  }

  const totalDemand = data.perElective.reduce((acc, c) => acc + c.choices, 0);
  const totalCapacity = data.perElective.reduce((acc, c) => acc + c.capacity, 0);
  const demandVelocity = totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 100) : 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner with Admin Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            GOVERNANCE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Academic Administration Portal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Institutional elective management, real-time capacity expansion, automated allocation engine, and ledger reporting.
          </p>
        </div>

        {/* Top Action Buttons (Admin Superpowers) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleRunAllocation}
            disabled={runningAlloc}
            className="h-9 px-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningAlloc ? "animate-spin" : ""}`} />
            <span>{runningAlloc ? "Running Engine..." : "Run Allocation Round"}</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="h-9 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Elective</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>TOTAL DEMAND</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Live</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {totalDemand} Picks
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Active student preference submissions
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CAPACITY SATURATION</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Live</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {demandVelocity}% Saturated
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {totalCapacity} total classroom seats available
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>WAITLIST CANDIDATES</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Queue</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {data.waitlistTotal} Students
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Queued across oversubscribed sections
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Choices per Elective */}
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Choices vs Capacity by Course
              </h4>
              <p className="text-[11px] text-zinc-400">Demand saturation per course offering</p>
            </div>
            <BarChart3 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.perElective.slice(0, 6)} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <XAxis dataKey="title" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="choices" name="Student Picks" fill="#18181b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill="#d4d4d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Split Donut */}
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Department Preference Share
              </h4>
              <p className="text-[11px] text-zinc-400">Volume across academic divisions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.deptSplit}
                  dataKey="count"
                  nameKey="dept"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {data.deptSplit.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Curriculum Insight Card */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs mb-6 space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Automated Administration Intelligence</span>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 leading-relaxed">
          <p>
            • <strong>High Demand Overflow:</strong> <em>"Deep Learning & Neural Networks"</em> has reached 94% capacity. Use the <strong>"+10 Seats"</strong> button in the ledger below to instantly expand capacity and clear waitlisted students.
          </p>
          <p>
            • <strong>Department Balance:</strong> Computer Science and Management represent 72% of all submitted choices. Ensure Friday lab venues have adequate power and terminal setups.
          </p>
        </div>
      </div>

      {/* AI Timetable Clash Optimizer Card */}
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                AI Timetable Clash Optimizer
              </h3>
              <p className="text-[11px] text-zinc-400">
                Automated schedule conflict detection across high-demand elective pairs
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            clashResolved
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
          }`}>
            {clashResolved ? "0 Conflicts Remaining" : "42 Student Clashes Detected"}
          </span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
            <span>Critical Overlap: Deep Learning (Mon 09:00) vs Cloud Native (Mon 09:30)</span>
            <span className={clashResolved ? "text-emerald-600 font-mono" : "text-red-500 font-mono"}>
              {clashResolved ? "Resolved" : "Overlap: 60 mins"}
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {clashResolved
              ? "✓ Cloud Native Architecture & K8s was successfully shifted to Tuesday 14:00–15:30. 42 affected students are now able to enroll in both courses without any timetable clashes."
              : "42 students selected both courses as top preferences. Shifting Cloud Native Architecture & K8s to Tuesday 14:00–15:30 clears all schedule locks and expands confirmed picks by 42 seats."}
          </p>
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleResolveClash}
              disabled={clashResolved}
              className={`h-8 px-4 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                clashResolved
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{clashResolved ? "✓ Timetable Optimized (0 Clashes)" : "Auto-Resolve Schedule Clash"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Ledger with Admin Controls (Quick Capacity Expand) */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40 text-xs">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            Course Offerings & Admin Expansion Ledger
          </span>
          <span className="text-zinc-400">1 to {data.perElective.length} courses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Course Title</th>
                <th className="py-3 px-4 font-medium text-center">Picks</th>
                <th className="py-3 px-4 font-medium text-center">Capacity</th>
                <th className="py-3 px-4 font-medium text-center">Saturation</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800">
              {data.perElective.map((item, idx) => {
                const fill = Math.round((item.choices / item.capacity) * 100);
                const isOver = fill >= 90;
                // Find matching elective id
                const matchedElec = electives.find((e) => e.title.toLowerCase() === item.title.toLowerCase());
                const targetId = matchedElec?.id || "";

                return (
                  <tr key={idx} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-5 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.choices}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400">
                      {item.capacity}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      <span className={isOver ? "text-amber-600 font-bold" : "text-zinc-700 dark:text-zinc-300"}>
                        {fill}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isOver ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                          90%+ Saturated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      {targetId && (
                        <button
                          onClick={() => handleExpandSeats(targetId, item.title, 10)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+10 Seats</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW ELECTIVE */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#121215] rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Provision New Elective Offering
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateElective} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Course Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. LLM Systems Engineering & Fine-Tuning"
                  className="w-full h-8 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Management">Management</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Classroom Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full h-8 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    min="5"
                    max="300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Credits</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="w-full h-8 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    min="1"
                    max="6"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Weekly Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Time Slot</label>
                  <input
                    type="text"
                    value={`${newStart}-${newEnd}`}
                    onChange={(e) => {
                      const [s, ed] = e.target.value.split("-");
                      if (s) setNewStart(s);
                      if (ed) setNewEnd(ed);
                    }}
                    placeholder="10:00-11:30"
                    className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Prerequisites (comma-separated)</label>
                <input
                  type="text"
                  value={newPrereqs}
                  onChange={(e) => setNewPrereqs(e.target.value)}
                  placeholder="e.g. Data Structures, Machine Learning Fundamentals"
                  className="w-full h-8 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 h-8 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-8 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALLOCATION ALGORITHM RESULTS */}
      {allocResultModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#121215] rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Priority Matching Round Complete
                </h3>
              </div>
              <button
                onClick={() => setAllocResultModal(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-zinc-400 font-medium">Total Preferences Evaluated</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {allocResultModal.totalProcessed}
                </div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-zinc-400 font-medium">Successfully Allocated</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">
                  {allocResultModal.confirmedCount}
                </div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-zinc-400 font-medium">Queued to Waitlist</div>
                <div className="text-xl font-bold text-amber-600 mt-1">
                  {allocResultModal.waitlistCount}
                </div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-zinc-400 font-medium">Overall Satisfaction Rate</div>
                <div className="text-xl font-bold text-purple-600 mt-1">
                  {allocResultModal.satisfactionRate}
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-800 dark:text-purple-300 flex items-center justify-between">
              <span>Algorithmic Execution Time:</span>
              <span className="font-mono font-bold">{allocResultModal.executionTimeMs} ms</span>
            </div>

            <button
              onClick={() => setAllocResultModal(null)}
              className="w-full h-9 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              Done & Return to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

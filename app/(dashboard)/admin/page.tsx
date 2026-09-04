"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getAnalytics } from "@/lib/api";
import { Analytics } from "@/lib/types";
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
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  AlertCircle,
  BarChart3
} from "lucide-react";

const COLORS = ["#18181b", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalytics();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="py-24 text-center text-xs text-zinc-400">
          Aggregating university allocation ledger...
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            GOVERNANCE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Allocation Ledger & Analytics</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Live institutional demand figures, department preference share, and automated AI curriculum insights.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-800 rounded-xl text-xs font-semibold border border-zinc-200">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
          <span>Dean Administrator Access</span>
        </div>
      </div>

      {/* 3 Summary Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>TOTAL DEMAND</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {totalDemand} Picks
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Active student preferences across all courses
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CAPACITY FILL RATIO</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">
              {demandVelocity}% Velocity
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {totalCapacity} total classroom seats provisioned
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>WAITLIST PRESSURE</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {data.waitlistTotal} Students
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Candidates queued on saturated sections
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Choices per Elective */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Choices vs Capacity
              </h4>
              <p className="text-[11px] text-zinc-400">Demand volume per elective offering</p>
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
                <Bar dataKey="capacity" name="Capacity" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Split Donut */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Department Preference Share
              </h4>
              <p className="text-[11px] text-zinc-400">Distribution across disciplines</p>
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
      <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-5 shadow-xs mb-6 space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Automated Dean's Intelligence Report</span>
        </div>
        <div className="text-xs text-zinc-600 space-y-1.5 leading-relaxed">
          <p>
            • <strong>Section Expansion Recommended:</strong> <em>"Deep Learning & Neural Networks"</em> is at 94% capacity with an active waitlist of 8 students. Opening a 20-seat secondary section on Friday afternoon will resolve 100% of overflow.
          </p>
          <p>
            • <strong>Prerequisite Friction:</strong> 18 third-year students were blocked from <em>"Applied Computer Vision"</em> due to lacking <em>"Machine Learning Fundamentals"</em>. Consider an accelerated prerequisite bridge module.
          </p>
        </div>
      </div>

      {/* Course Ledger Table matching screenshot */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 text-xs">
          <span className="font-semibold text-zinc-800">Approved Course Offerings Ledger</span>
          <span className="text-zinc-400">1 to {data.perElective.length} of {data.perElective.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-semibold text-[11px]">
                <th className="py-3 px-5 font-medium">Course Title</th>
                <th className="py-3 px-4 font-medium text-center">Allocated Picks</th>
                <th className="py-3 px-4 font-medium text-center">Classroom Capacity</th>
                <th className="py-3 px-4 font-medium text-center">Saturation</th>
                <th className="py-3 px-5 text-right font-medium">Allocation Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80">
              {data.perElective.map((item, idx) => {
                const fill = Math.round((item.choices / item.capacity) * 100);
                const isOver = fill >= 90;
                return (
                  <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-5 font-semibold text-zinc-900">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.choices}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-600">
                      {item.capacity}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      <span className={isOver ? "text-amber-600 font-bold" : "text-zinc-700"}>
                        {fill}%
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

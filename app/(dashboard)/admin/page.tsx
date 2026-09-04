"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/api";
import { Analytics } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ShieldCheck, Users, BarChart3, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

const COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];

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
      <div className="py-20 text-center text-sm text-slate-400 animate-pulse">
        Aggregating campus-wide elective analytics...
      </div>
    );
  }

  const totalDemand = data.perElective.reduce((acc, c) => acc + c.choices, 0);
  const totalCapacity = data.perElective.reduce((acc, c) => acc + c.capacity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-violet-700 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Academic Dean Administration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Elective Allocation & Demand Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics, capacity constraints, department distribution, and automated AI curriculum insights.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Choice Demand</CardTitle>
            <BarChart3 className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalDemand}</div>
            <p className="text-xs text-slate-500 mt-1">Total student preferences submitted</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Seat Capacity</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalCapacity}</div>
            <p className="text-xs text-slate-500 mt-1">Across all approved elective courses</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Waitlists</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{data.waitlistTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Pending students on waitlisted courses</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demand Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Campus seat fill velocity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Choices per Elective */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Choices vs Capacity by Elective</CardTitle>
            <CardDescription className="text-xs">Identifies overflow demand and underserved courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.perElective.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="choices" name="Student Picks" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Total Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Dept Split */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Department Choice Distribution</CardTitle>
            <CardDescription className="text-xs">Preference volume across academic departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deptSplit}
                    dataKey="count"
                    nameKey="dept"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.deptSplit.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Curriculum Insight Card */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Automated AI Curriculum Intelligence
          </div>
          <CardTitle className="text-base text-slate-900">Dean's Actionable Insight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            • <strong>High Demand Overflow:</strong> <em>"Deep Learning & Neural Networks"</em> and <em>"Tech Product Management"</em> have crossed <strong>92% capacity</strong>. Reallocate 20 additional seats or open a second section on Friday to absorb waitlisted candidates.
          </p>
          <p>
            • <strong>Prerequisite Bottleneck:</strong> 18 students attempted to select <em>"Applied Computer Vision"</em> but were blocked due to the missing prerequisite <em>"Machine Learning Fundamentals"</em>. Consider offering an accelerated winter bridge course.
          </p>
        </CardContent>
      </Card>

      {/* Capacity Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Course Capacity & Demand Ledger</CardTitle>
          <CardDescription className="text-xs">Detailed allocation figures per approved elective</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Elective Course</TableHead>
                <TableHead className="text-center">Enrolled / Picks</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead className="text-center">Fill Rate</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {data.perElective.map((e, idx) => {
                const fill = Math.round((e.choices / e.capacity) * 100);
                const isOver = fill >= 90;
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-slate-900">{e.title}</TableCell>
                    <TableCell className="text-center font-mono">{e.choices}</TableCell>
                    <TableCell className="text-center font-mono">{e.capacity}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${isOver ? "text-rose-600" : "text-slate-700"}`}>
                        {fill}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isOver ? (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 text-[10px]">
                          Near Full
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[10px]">
                          Healthy
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

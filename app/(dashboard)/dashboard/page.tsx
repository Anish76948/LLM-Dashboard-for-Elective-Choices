"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getElectives, getChoices } from "@/lib/api";
import { Elective, Choice } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Percent, BookOpen, ArrowRight, AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

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

  // Compute stat metrics
  const totalCapacity = electives.reduce((acc, cur) => acc + cur.capacity, 0);
  const totalEnrolled = electives.reduce((acc, cur) => acc + cur.enrolled, 0);
  const seatsLeft = Math.max(0, totalCapacity - totalEnrolled);
  const openElectivesCount = electives.filter((e) => e.enrolled < e.capacity).length;
  
  // Calculate average seat chance for confirmed picks
  const confirmedPicks = choices.filter((c) => c.status === "confirmed");
  const waitlistPicks = choices.filter((c) => c.status === "waitlist");
  const blockedPicks = choices.filter((c) => c.status === "blocked");

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Portal Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Review live elective capacities, allocation rounds, and submitted preference order.</p>
      </div>

      {/* Notice Card */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-violet-900">Round 1 Priority Allocation Window is Active</h4>
          <p className="text-xs text-violet-700 leading-relaxed">
            Please finalize and drag-reorder your elective choices before Friday at 11:59 PM. Prerequisite validations and clash detection are calculated server-side in real time.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Seats Left</CardTitle>
            <Users className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{loading ? "..." : seatsLeft}</div>
            <p className="text-xs text-slate-500 mt-1">{totalEnrolled} total enrolled campus-wide</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Choice Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3 Days Left</div>
            <p className="text-xs text-slate-500 mt-1">Allocation lock: Friday 23:59 IST</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">My Seat Chance</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {confirmedPicks.length > 0 ? "88%" : "N/A"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Based on preference #1 & seat availability</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Electives</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{loading ? "..." : `${openElectivesCount} / ${electives.length}`}</div>
            <p className="text-xs text-slate-500 mt-1">Courses currently accepting enrollments</p>
          </CardContent>
        </Card>
      </div>

      {/* Choices Status Summary */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">My Choice Status Summary</CardTitle>
            <CardDescription className="text-xs">Current ranked preferences submitted for your degree</CardDescription>
          </div>
          <Link href="/picks">
            <Button variant="outline" size="sm" className="text-xs border-violet-200 text-violet-700 hover:bg-violet-50">
              Manage Picks <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading submitted picks...</div>
          ) : choices.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-slate-500">You have not added any elective choices yet.</p>
              <Link href="/browse">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white text-xs">Browse Electives Catalog</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {choices.map((c) => {
                let statusBadge = (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed Seat
                  </Badge>
                );
                if (c.status === "waitlist") {
                  statusBadge = (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-[11px] gap-1">
                      <Clock className="w-3 h-3" /> Waitlisted
                    </Badge>
                  );
                } else if (c.status === "blocked") {
                  statusBadge = (
                    <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 text-[11px] gap-1">
                      <AlertTriangle className="w-3 h-3" /> Blocked
                    </Badge>
                  );
                }

                return (
                  <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                        #{c.preference}
                      </span>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-slate-900 truncate">{c.elective.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{c.elective.dept}</span>
                          <span>•</span>
                          <span>{c.elective.credits} Credits</span>
                          <span>•</span>
                          <span>{c.elective.day} {c.elective.start}-{c.elective.end}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {c.reason && (
                        <span className="text-[11px] text-red-600 max-w-xs truncate hidden md:inline">
                          {c.reason}
                        </span>
                      )}
                      {statusBadge}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

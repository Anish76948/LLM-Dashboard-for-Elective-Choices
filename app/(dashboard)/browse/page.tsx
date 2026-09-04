"use client";

import { useEffect, useState } from "react";
import { getElectives, addChoice, getChoices } from "@/lib/api";
import { Elective, Choice } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Clock, BookOpen, Search, Check, Plus, AlertTriangle } from "lucide-react";

export default function BrowsePage() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Student 2 demo lack of ML check
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

  const departments = ["All", ...Array.from(new Set(electives.map((e) => e.dept)))];

  const filteredElectives = electives.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === "All" || e.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddPick = async (elective: Elective) => {
    setAddingId(elective.id);
    try {
      const nextPref = choices.length + 1;
      const res = await addChoice(elective.id, nextPref);

      if (!res.ok) {
        toast.error(res.error || "Could not add choice", {
          description: res.error?.includes("Missing prereq")
            ? "Prerequisite not satisfied in your completed transcript"
            : res.error?.includes("Clash")
            ? "Time slot conflicts with another selected elective"
            : undefined,
        });
        return;
      }

      if (res.choice?.status === "waitlist") {
        toast.warning(`Added to Waitlist: ${elective.title}`, {
          description: "Capacity is currently full; you are placed on the queue.",
        });
      } else {
        toast.success(`Confirmed: ${elective.title}`, {
          description: `Allocated preference #${nextPref}`,
        });
      }

      // Refresh choices
      const updatedChoices = await getChoices();
      setChoices(updatedChoices);
    } catch (e: any) {
      toast.error(e.message || "Failed to add choice");
    } finally {
      setAddingId(null);
    }
  };

  const isAlreadyChosen = (id: string) => choices.some((c) => c.elective.id === id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse Electives</h1>
          <p className="text-sm text-slate-500 mt-1">Explore available courses, prerequisites, and capacity limits.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter by keyword or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white border-slate-200 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDept === dept
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Electives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredElectives.map((e) => {
            const chosen = isAlreadyChosen(e.id);
            const fillPercentage = Math.min(100, Math.round((e.enrolled / e.capacity) * 100));
            const isNearlyFull = fillPercentage >= 90;
            const hasMissingPrereq =
              currentUser === "student2@demo.edu" &&
              e.prereqs.includes("Machine Learning Fundamentals");

            let diffColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (e.difficulty === "medium") diffColor = "bg-amber-50 text-amber-700 border-amber-200";
            if (e.difficulty === "hard") diffColor = "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <Card key={e.id} className="bg-white border-slate-200 shadow-sm flex flex-col justify-between hover:border-violet-300 transition-colors">
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md border border-violet-100">
                      {e.dept}
                    </span>
                    <Badge variant="outline" className={`text-[10px] capitalize font-semibold ${diffColor}`}>
                      {e.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {e.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-xs text-slate-600">
                  <p className="line-clamp-2 leading-relaxed text-slate-500">{e.description}</p>

                  {/* Day, Time, Credits */}
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {e.day}, {e.start} – {e.end}
                      </span>
                      <span>{e.credits} Credits</span>
                    </div>

                    {/* Prereqs */}
                    {e.prereqs.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] pt-1 border-t border-slate-200/60">
                        {hasMissingPrereq ? (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <Lock className="w-3 h-3 text-red-500" /> Missing: {e.prereqs.join(", ")}
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400" /> Prereqs: {e.prereqs.join(", ")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-600">Capacity fill</span>
                      <span className={`font-semibold ${isNearlyFull ? "text-rose-600" : "text-slate-700"}`}>
                        {e.enrolled}/{e.capacity} seats ({fillPercentage}%)
                      </span>
                    </div>
                    <Progress
                      value={fillPercentage}
                      className={`h-2 ${isNearlyFull ? "[&>div]:bg-rose-500" : "[&>div]:bg-violet-600"}`}
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => handleAddPick(e)}
                    disabled={chosen || addingId === e.id}
                    className={`w-full text-xs font-semibold h-9 ${
                      chosen
                        ? "bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200"
                        : hasMissingPrereq
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-violet-600 hover:bg-violet-700 text-white"
                    }`}
                  >
                    {chosen ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Added to Picks
                      </span>
                    ) : hasMissingPrereq ? (
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Prereq Blocked (Try Add)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add to Picks
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

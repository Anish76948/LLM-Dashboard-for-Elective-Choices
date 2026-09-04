"use client";

import { useState } from "react";
import { askAdvisor, getElectives, addChoice } from "@/lib/api";
import { AdvisorResponse, Elective } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Send, CheckCircle, AlertOctagon, Plus, Layers, Bot } from "lucide-react";

export default function AdvisorPage() {
  const [goal, setGoal] = useState("I want to become an AI & Machine Learning Research Engineer");
  const [interestsText, setInterestsText] = useState("Neural Networks, Large Language Models, Distributed Systems");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [addedCourses, setAddedCourses] = useState<Set<string>>(new Set());

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please specify your career goal");
      return;
    }

    setLoading(true);
    try {
      const interests = interestsText.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await askAdvisor(goal, interests);
      setResponse(res);
      toast.success("AI Advisor generated recommendations!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reach AI advisor");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingle = async (courseTitle: string) => {
    try {
      const electives = await getElectives();
      const match = electives.find((e) => e.title.toLowerCase() === courseTitle.toLowerCase());
      if (!match) {
        toast.error(`Could not locate course "${courseTitle}" in database`);
        return;
      }
      const res = await addChoice(match.id, 99);
      if (!res.ok) {
        toast.error(res.error || "Could not add choice");
        return;
      }
      setAddedCourses((prev) => new Set([...prev, courseTitle]));
      toast.success(`Added ${courseTitle} to picks!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add pick");
    }
  };

  const handleAddAll = async () => {
    if (!response) return;
    for (const rec of response.recommendations) {
      await handleAddSingle(rec.elective);
    }
    toast.success("All recommended electives added to your picks!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-violet-600 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Powered by MiniMax M3
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">AI Academic Advisor</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell the advisor your career ambitions and interests. The model matches electives, checks prerequisites, and projects seat probability.
        </p>
      </div>

      {/* Input Card */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-violet-600" /> Career & Academic Focus
          </CardTitle>
          <CardDescription className="text-xs">
            Inputs are treated strictly as untrusted data under our prompt-injection defense pipeline.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleConsult}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Career Goal / Target Role</label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Lead Data Scientist in Quantitative Finance"
                className="bg-slate-50 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Technical Interests (comma separated)</label>
              <Input
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="e.g., Deep Learning, Distributed Cloud, Blockchain"
                className="bg-slate-50 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-10 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Evaluating Course Catalog & Prerequisites...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Consult Advisor Engine
                </span>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Recommendations Output */}
      {response && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Recommended Electives ({response.recommendations.length})
            </h3>
            {response.recommendations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAll}
                className="text-xs border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" /> Add All to Picks
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {response.recommendations.map((rec, i) => {
              const added = addedCourses.has(rec.elective);
              return (
                <Card
                  key={i}
                  className="bg-white border-slate-200 shadow-sm hover:border-violet-300 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-violet-50 text-violet-700 border-violet-200 font-bold text-xs">
                        {rec.match_score}% Match
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Seat Chance: {rec.seat_chance}%
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                      {rec.elective}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <p className="text-slate-500 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{rec.reason}"
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Admission Likelihood</span>
                        <span className="font-semibold text-violet-700">{rec.seat_chance}%</span>
                      </div>
                      <Progress value={rec.seat_chance} className="h-1.5 [&>div]:bg-violet-600" />
                    </div>
                  </CardContent>

                  <div className="p-3 pt-0 border-t border-slate-100 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddSingle(rec.elective)}
                      disabled={added}
                      className={`w-full text-xs font-semibold h-8 ${
                        added
                          ? "bg-slate-100 text-slate-500 border border-slate-200"
                          : "bg-violet-600 hover:bg-violet-700 text-white"
                      }`}
                    >
                      {added ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Added to Picks
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Add to My Picks
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Rejected Items (Prerequisite Blockers) */}
          {response.rejected && response.rejected.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Ineligible / Prerequisite Blocked
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.rejected.map((rej, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs"
                  >
                    <div className="font-bold text-rose-900">{rej.elective}</div>
                    <div className="text-rose-700 text-[11px]">{rej.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { askAdvisor, getElectives, addChoice } from "@/lib/api";
import { AdvisorResponse } from "@/lib/types";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertOctagon,
  Plus,
  Layers,
  Bot,
  BrainCircuit,
  Lock,
  ArrowRight,
  Compass,
  Check
} from "lucide-react";

export default function AdvisorPage() {
  const [goal, setGoal] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [addedCourses, setAddedCourses] = useState<Set<string>>(new Set());

  // Demo presets (separate buttons so inputs are NOT prefilled by default)
  const loadScenario = (targetGoal: string, targetInterests: string) => {
    setGoal(targetGoal);
    setInterestsText(targetInterests);
    toast.info("Loaded demo scenario into fields");
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please enter your career goal or target industry");
      return;
    }

    setLoading(true);
    try {
      const interests = interestsText.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await askAdvisor(goal, interests);
      setResponse(res);
      toast.success("MiniMax M3 evaluated catalog & prerequisites!");
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
        toast.error(`Course "${courseTitle}" not found in database`);
        return;
      }
      const res = await addChoice(match.id, 99);
      if (!res.ok) {
        toast.error(res.error || "Could not add choice");
        return;
      }
      setAddedCourses((prev) => new Set([...prev, courseTitle]));
      toast.success(`Added ${courseTitle} to your ranked picks!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add pick");
    }
  };

  const handleAddAll = async () => {
    if (!response) return;
    for (const rec of response.recommendations) {
      await handleAddSingle(rec.elective);
    }
    toast.success("All recommended electives added to picks!");
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            INTELLIGENCE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AI Academic Advisor</h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Powered by <strong>MiniMax M3</strong> via OpenRouter. Real-time prerequisite mapping, transcript alignment, and admission likelihood scoring.
          </p>
        </div>

        {response && response.recommendations.length > 0 && (
          <button
            onClick={handleAddAll}
            className="h-9 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Add All Recommendations</span>
          </button>
        )}
      </div>

      {/* Input Consultation Card (Clean, un-prefilled by default) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs mb-6 space-y-4">
        {/* Separate Demo Scenario Chips */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <span>Demo Scenarios (Optional 1-Click Fill)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadScenario("AI Research Engineer focusing on LLMs and Neural Architectures", "Deep Learning, PyTorch, Natural Language Processing")}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 rounded-lg transition-colors"
            >
              AI Engineer
            </button>
            <button
              type="button"
              onClick={() => loadScenario("Cloud Systems Architect and DevOps Engineer", "Kubernetes, Distributed Systems, Microservices")}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 rounded-lg transition-colors"
            >
              Cloud Architect
            </button>
            <button
              type="button"
              onClick={() => loadScenario("Tech Product Manager at high-growth SaaS startup", "Product Strategy, Growth, Behavioral Economics")}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 rounded-lg transition-colors"
            >
              Product Lead
            </button>
          </div>
        </div>

        <form onSubmit={handleConsult} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                Career Goal or Target Role
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Lead Machine Learning Engineer or Quantitative Analyst"
                className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                Key Technical Interests (comma separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="e.g. Deep Learning, Distributed Cloud, Systems"
                className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-400">
              Prompt-injection guard enabled • Strict JSON schema output
            </span>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-300" />
                  <span>Evaluating Courses via MiniMax M3...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Consult AI Advisor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Advisor Recommendations Output */}
      {response && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600" />
              <span>Recommended Course Allocations ({response.recommendations.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Ranked by career syllabus synergy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {response.recommendations.map((rec, i) => {
              const added = addedCourses.has(rec.elective);
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold badge-confirmed">
                        {rec.match_score}% Synergy
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Seat Likelihood: {rec.seat_chance}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 group-hover:text-black leading-snug">
                      {rec.elective}
                    </h4>

                    <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      "{rec.reason}"
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Seat probability</span>
                        <span className="font-semibold text-zinc-700">{rec.seat_chance}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                          style={{ width: `${rec.seat_chance}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 mt-4">
                    <button
                      onClick={() => handleAddSingle(rec.elective)}
                      disabled={added}
                      className={`w-full h-8 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        added
                          ? "bg-zinc-100 text-zinc-400 cursor-default"
                          : "bg-zinc-900 hover:bg-black text-white shadow-xs"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Added to Picks</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to My Picks</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejected Prerequisite Blockers */}
          {response.rejected && response.rejected.length > 0 && (
            <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-5 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Prerequisite Blocked Electives</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.rejected.map((rej, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-red-200 shadow-xs space-y-1"
                  >
                    <div className="text-xs font-bold text-zinc-900">{rej.elective}</div>
                    <div className="text-[11px] text-red-600 font-medium">
                      ⚠️ {rej.reason}
                    </div>
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

"use client";

import { useState, useRef, useEffect } from "react";
import { Topbar } from "@/components/topbar";
import { askAdvisor, chatWithAdvisor, getElectives, addChoice } from "@/lib/api";
import { AdvisorResponse, Elective } from "@/lib/types";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertOctagon,
  Plus,
  Layers,
  Bot,
  User,
  Compass,
  Check,
  MessageSquare,
  FileCheck2,
  CornerDownLeft
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedElectives?: Elective[];
}

export default function AdvisorPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "form">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m_welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Academic Advisor. Ask me anything about elective courses, career trajectories, prerequisite conflicts, or schedule balance.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form State
  const [goal, setGoal] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);

  const [addedCourses, setAddedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Quick Demo Questions for Chat
  const triggerSampleQuery = (query: string) => {
    setChatInput(query);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = [...messages, newMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await chatWithAdvisor(history);

      const botMsg: ChatMessage = {
        id: "a_" + Date.now(),
        role: "assistant",
        content: res.reply,
        suggestedElectives: res.suggestedElectives,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast.error(err.message || "Failed to get AI response");
    } finally {
      setChatLoading(false);
    }
  };

  const handleFormConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please enter your career goal");
      return;
    }

    setFormLoading(true);
    try {
      const interests = interestsText.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await askAdvisor(goal, interests);
      setResponse(res);
      toast.success("Evaluated electives catalog via MiniMax M3!");
    } catch (err: any) {
      toast.error(err.message || "Advisor request failed");
    } finally {
      setFormLoading(false);
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
      toast.success(`Added ${courseTitle} to your picks!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add pick");
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Academic Advisor
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Live interactive consultation powered by <strong>MiniMax M3</strong>. Chat conversationally or generate batch syllabus recommendations.
          </p>
        </div>

        {/* View Switcher: Interactive Chat vs Structured Evaluation */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "chat"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interactive Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "form"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Batch Analysis</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CHAT ADVISOR */}
      {activeTab === "chat" && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex-1 flex flex-col overflow-hidden min-h-[500px]">
          {/* Quick Question Starters */}
          <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/30">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
              Try asking:
            </span>
            {[
              "Recommend electives for AI/ML engineering",
              "Which course has the lightest math workload?",
              "What happens if I take Deep Learning and Cloud Native?",
              "Explain prerequisites for Applied Computer Vision",
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => triggerSampleQuery(q)}
                className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-300 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-2xl ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.role === "user"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-xs"
                        : "bg-zinc-50 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>

                  {/* Interactive Course Buttons inside Assistant Message */}
                  {m.suggestedElectives && m.suggestedElectives.length > 0 && (
                    <div className="space-y-2 pt-1 animate-fade-in-up">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Suggested Courses:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.suggestedElectives.map((sec) => {
                          const added = addedCourses.has(sec.title);
                          return (
                            <div
                              key={sec.id}
                              className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3"
                            >
                              <div className="truncate">
                                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                  {sec.title}
                                </div>
                                <div className="text-[10px] text-zinc-400">
                                  {sec.dept} • {sec.credits} cr
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddSingle(sec.title)}
                                disabled={added}
                                className={`h-7 px-2.5 text-[11px] font-semibold rounded-lg shrink-0 transition-all ${
                                  added
                                    ? "bg-zinc-100 text-zinc-400 cursor-default"
                                    : "bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white"
                                }`}
                              >
                                {added ? "Added" : "+ Add"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-xl mr-auto">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500 rounded-tl-xs flex items-center gap-1.5">
                  <span>MiniMax M3 is analyzing course dependencies...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about electives, career goals, or prerequisites..."
              className="flex-1 h-10 px-3.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="h-10 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Send</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: BATCH SYLLABUS ANALYSIS */}
      {activeTab === "form" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <form onSubmit={handleFormConsult} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Career Goal or Focus Area
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Lead Machine Learning Engineer or Cloud Systems Lead"
                    className="w-full h-9 px-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Technical Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    value={interestsText}
                    onChange={(e) => setInterestsText(e.target.value)}
                    placeholder="e.g. PyTorch, Distributed Systems, Containers"
                    className="w-full h-9 px-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">
                  Calculates seat probability & prerequisite eligibility
                </span>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="h-9 px-5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {formLoading ? "Evaluating via MiniMax M3..." : "Generate Analysis"}
                </button>
              </div>
            </form>
          </div>

          {response && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Course Recommendations ({response.recommendations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {response.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold badge-confirmed">
                          {rec.match_score}% Synergy
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          Chance: {rec.seat_chance}%
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {rec.elective}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        "{rec.reason}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddSingle(rec.elective)}
                      className="mt-4 w-full h-8 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                    >
                      {addedCourses.has(rec.elective) ? "Added" : "+ Add to Picks"}
                    </button>
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

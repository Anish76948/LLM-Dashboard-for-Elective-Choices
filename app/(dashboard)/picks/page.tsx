"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { getChoices, removeChoice } from "@/lib/api";
import { Choice } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Lock,
  Sparkles,
  Check,
  Plus
} from "lucide-react";

export default function MyPicksPage() {
  const [items, setItems] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getChoices();
        setItems(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    setItems((current) => {
      const newArr = [...current];
      const temp = newArr[idx - 1];
      newArr[idx - 1] = newArr[idx];
      newArr[idx] = temp;
      return newArr.map((item, i) => ({ ...item, preference: i + 1 }));
    });
    toast.info("Priority rank updated");
  };

  const moveDown = (idx: number) => {
    if (idx >= items.length - 1) return;
    setItems((current) => {
      const newArr = [...current];
      const temp = newArr[idx + 1];
      newArr[idx + 1] = newArr[idx];
      newArr[idx] = temp;
      return newArr.map((item, i) => ({ ...item, preference: i + 1 }));
    });
    toast.info("Priority rank updated");
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      const res = await removeChoice(id);
      if (res.ok) {
        setItems((current) =>
          current
            .filter((i) => i.id !== id)
            .map((item, idx) => ({ ...item, preference: idx + 1 }))
        );
        toast.success(`Removed ${title}`);
      } else {
        toast.error("Failed to remove elective");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove choice");
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Preferences locked and submitted!", {
        description: "Your priority queue order will be processed in the upcoming round.",
      });
    }, 500);
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
            SELECTIONS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Ranked Picks</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Arrange your preferences in descending order. The allocation algorithm fills Preference #1 first.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/browse">
            <button className="h-9 px-3.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add More</span>
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={items.length === 0 || submitting}
            className="h-9 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{submitting ? "Locking..." : "Submit Preferences"}</span>
          </button>
        </div>
      </div>

      {/* Picks Ledger Table */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40 text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Ranked Queue ({items.length} choices)</span>
          <span className="text-zinc-400 dark:text-zinc-500">Use arrow controls to rearrange preference order</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold text-[11px]">
                <th className="py-3 px-4 font-medium w-16 text-center">Priority</th>
                <th className="py-3 px-4 font-medium">Course Title</th>
                <th className="py-3 px-4 font-medium">Department</th>
                <th className="py-3 px-4 font-medium">Time Slot</th>
                <th className="py-3 px-4 font-medium">Credits</th>
                <th className="py-3 px-4 font-medium">Allocation Status</th>
                <th className="py-3 px-4 text-center font-medium w-24">Reorder</th>
                <th className="py-3 px-5 text-right font-medium">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">Loading your choices...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 space-y-2">
                    <p>No electives added yet.</p>
                    <Link href="/browse">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline">Browse courses and add choices</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  let statusPill = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-confirmed">
                      Confirmed
                    </span>
                  );
                  if (item.status === "waitlist") {
                    statusPill = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-waitlist">
                        Waitlisted
                      </span>
                    );
                  } else if (item.status === "blocked") {
                    statusPill = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium badge-blocked">
                        Blocked
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                      {/* Priority Number */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs items-center justify-center shadow-xs">
                          {item.preference}
                        </span>
                      </td>

                      {/* Course Title */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {item.elective.title}
                        </div>
                        {item.reason && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                            ⚠️ {item.reason}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {item.elective.dept}
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {item.elective.day}, {item.elective.start}–{item.elective.end}
                      </td>

                      {/* Credits */}
                      <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                        {item.elective.credits} cr
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {statusPill}
                      </td>

                      {/* Reorder Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 disabled:opacity-20 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === items.length - 1}
                            className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 disabled:opacity-20 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.elective.title)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

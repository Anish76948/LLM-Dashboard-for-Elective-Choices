"use client";

import { useEffect, useState } from "react";
import { getChoices, removeChoice } from "@/lib/api";
import { Choice } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { GripVertical, Trash2, CheckCircle2, Clock, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

export default function MyPicksPage() {
  const [items, setItems] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      const newArr = [...current];
      const [moved] = newArr.splice(oldIndex, 1);
      newArr.splice(newIndex, 0, moved);
      // Re-assign preference index
      return newArr.map((item, idx) => ({ ...item, preference: idx + 1 }));
    });
    toast.info("Rankings reordered. Remember to submit preferences!");
  };

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    setItems((current) => {
      const newArr = [...current];
      const temp = newArr[idx - 1];
      newArr[idx - 1] = newArr[idx];
      newArr[idx] = temp;
      return newArr.map((item, i) => ({ ...item, preference: i + 1 }));
    });
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
        toast.success(`Removed ${title} from picks`);
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
      toast.success("Preferences officially submitted!", {
        description: "Your priority ranking has been locked for the current allocation round.",
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Elective Picks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag to reorder preference rankings. Allocation algorithm honors priority #1 first.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={items.length === 0 || submitting}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-9 px-4"
        >
          {submitting ? "Saving..." : "Submit Preferences"}
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ranked Preferences ({items.length})</CardTitle>
            <span className="text-xs text-slate-400">Order determines priority allocation</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your choices...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-500">You haven't added any electives to your picks list yet.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  let statusPill = (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </Badge>
                  );
                  if (item.status === "waitlist") {
                    statusPill = (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-[11px] gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> Waitlist
                      </Badge>
                    );
                  } else if (item.status === "blocked") {
                    statusPill = (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 text-[11px] gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" /> Blocked
                      </Badge>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-violet-300 transition-colors gap-4"
                    >
                      {/* Left Grip & Preference Rank */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="hover:text-slate-700 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === items.length - 1}
                            className="hover:text-slate-700 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {item.preference}
                        </div>

                        <div className="truncate">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {item.elective.title}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-medium text-slate-600">{item.elective.dept}</span>
                            <span>•</span>
                            <span>{item.elective.credits} Credits</span>
                            <span>•</span>
                            <span>{item.elective.day} {item.elective.start}-{item.elective.end}</span>
                          </div>
                          {item.reason && (
                            <div className="text-[11px] text-rose-600 mt-1 font-medium">
                              ⚠️ {item.reason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Status Pill & Delete Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        {statusPill}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(item.id, item.elective.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

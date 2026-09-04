import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Elective } from "@/lib/types";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("electives")
      .select("*")
      .order("title");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped: Elective[] = (data || []).map((e) => ({
      id: e.id,
      title: e.title,
      dept: e.dept,
      credits: e.credits,
      capacity: e.capacity,
      enrolled: e.enrolled,
      difficulty: e.difficulty,
      prereqs: e.prereqs || [],
      description: e.description,
      tags: e.tags || [],
      day: e.day,
      start: e.start_time,
      end: e.end_time,
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

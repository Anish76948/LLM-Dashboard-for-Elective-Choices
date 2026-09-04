import { NextRequest, NextResponse } from "next/server";
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

/**
 * Admin: Add New Elective Offering
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, dept, credits, capacity, difficulty, prereqs, description, tags, day, start, end } = body;

    if (!title || !dept || !capacity) {
      return NextResponse.json({ error: "Missing required elective fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("electives")
      .insert({
        title,
        dept,
        credits: Number(credits) || 3,
        capacity: Number(capacity) || 50,
        enrolled: 0,
        difficulty: difficulty || "medium",
        prereqs: Array.isArray(prereqs) ? prereqs : [],
        description: description || "",
        tags: Array.isArray(tags) ? tags : [],
        day: day || "Monday",
        start_time: start || "09:00",
        end_time: end || "10:30",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, elective: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * Admin: Update Capacity or Expand Seats
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, capacityDelta, capacity } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing elective ID" }, { status: 400 });
    }

    if (capacity !== undefined) {
      const { data, error } = await supabaseAdmin
        .from("electives")
        .update({ capacity: Number(capacity) })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, elective: data });
    }

    if (capacityDelta !== undefined) {
      const { data: current } = await supabaseAdmin.from("electives").select("capacity").eq("id", id).single();
      const newCapacity = Math.max(10, (current?.capacity || 50) + Number(capacityDelta));
      const { data, error } = await supabaseAdmin
        .from("electives")
        .update({ capacity: newCapacity })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, elective: data, newCapacity });
    }

    return NextResponse.json({ error: "No update parameters provided" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

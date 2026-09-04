import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { choiceCreateSchema } from "@/lib/schemas";
import { Choice, Elective } from "@/lib/types";

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasTimeClash(day1: string, start1: string, end1: string, day2: string, start2: string, end2: string): boolean {
  if (day1.toLowerCase() !== day2.toLowerCase()) return false;
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  return s1 < e2 && s2 < e1;
}

async function getStudent(request: NextRequest) {
  // 1. Try Bearer token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: student } = await supabaseAdmin.from("students").select("*").eq("id", user.id).single();
      if (student) return student;
    }
  }

  // 2. Try cookie or custom header
  const customId = request.headers.get("x-user-id") || request.cookies.get("user_id")?.value;
  if (customId) {
    const { data: student } = await supabaseAdmin.from("students").select("*").eq("id", customId).single();
    if (student) return student;
  }

  // 3. Fallback to demo student1 for seamless hackathon testing
  const { data: fallback } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("email", "student1@demo.edu")
    .single();

  return fallback;
}

function mapElective(e: any): Elective {
  return {
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
  };
}

export async function GET(request: NextRequest) {
  try {
    const student = await getStudent(request);
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("choices")
      .select("id, preference, status, reason, electives (*)")
      .eq("student_id", student.id)
      .order("preference", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const choices: Choice[] = (data || []).map((c: any) => ({
      id: c.id,
      elective: mapElective(c.electives),
      preference: c.preference,
      status: c.status,
      reason: c.reason || undefined,
    }));

    return NextResponse.json(choices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Zod validation
    const body = await request.json();
    const parsed = choiceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, status: "blocked", error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { electiveId, preference } = parsed.data;

    // Student identity
    const student = await getStudent(request);
    if (!student) {
      return NextResponse.json({ ok: false, status: "blocked", error: "Unauthorized student" }, { status: 401 });
    }

    // 2. Elective exists check
    const { data: targetElective, error: eErr } = await supabaseAdmin
      .from("electives")
      .select("*")
      .eq("id", electiveId)
      .single();

    if (eErr || !targetElective) {
      return NextResponse.json({ ok: false, status: "blocked", error: "Elective course not found" }, { status: 404 });
    }

    // 3. Prereq check vs student's completed_courses
    const completed: string[] = student.completed_courses || [];
    const requiredPrereqs: string[] = targetElective.prereqs || [];
    for (const prereq of requiredPrereqs) {
      if (!completed.includes(prereq)) {
        return NextResponse.json({
          ok: false,
          status: "blocked",
          error: `Missing prereq: ${prereq}`,
        });
      }
    }

    // 4. Time-clash check vs already confirmed/existing choices
    const { data: existingChoices } = await supabaseAdmin
      .from("choices")
      .select("id, status, electives (*)")
      .eq("student_id", student.id);

    for (const choice of existingChoices || []) {
      const other = (choice as any).electives;
      if (!other || other.id === targetElective.id) continue;
      // check time overlap
      if (hasTimeClash(targetElective.day, targetElective.start_time, targetElective.end_time, other.day, other.start_time, other.end_time)) {
        return NextResponse.json({
          ok: false,
          status: "blocked",
          error: `Clash with ${other.title}`,
        });
      }
    }

    // 5. Capacity check (full -> waitlist, else confirmed)
    const isFull = targetElective.enrolled >= targetElective.capacity;
    const choiceStatus = isFull ? "waitlist" : "confirmed";
    const statusReason = isFull ? "Capacity reached - added to priority waitlist" : undefined;

    // Upsert choice record
    const { data: savedChoice, error: insertErr } = await supabaseAdmin
      .from("choices")
      .upsert(
        {
          student_id: student.id,
          elective_id: targetElective.id,
          preference,
          status: choiceStatus,
          reason: statusReason,
        },
        { onConflict: "student_id,elective_id" }
      )
      .select("id, preference, status, reason")
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, status: "blocked", error: insertErr.message }, { status: 500 });
    }

    // If confirmed, increment enrolled via service role
    if (choiceStatus === "confirmed") {
      await supabaseAdmin
        .from("electives")
        .update({ enrolled: targetElective.enrolled + 1 })
        .eq("id", targetElective.id);
      targetElective.enrolled += 1;
    }

    const responseChoice: Choice = {
      id: savedChoice.id,
      elective: mapElective(targetElective),
      preference: savedChoice.preference,
      status: savedChoice.status,
      reason: savedChoice.reason || undefined,
    };

    return NextResponse.json({ ok: true, choice: responseChoice });
  } catch (err: any) {
    return NextResponse.json({ ok: false, status: "blocked", error: err.message || "Server error" }, { status: 500 });
  }
}

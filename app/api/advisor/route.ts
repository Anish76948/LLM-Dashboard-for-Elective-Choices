import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { advisorRequestSchema } from "@/lib/schemas";
import { generateAdvisorRecommendations } from "@/lib/gemini";
import { Elective } from "@/lib/types";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = advisorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { goal, interests } = parsed.data;

    // Determine student context
    let completedCourses: string[] = [];
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: student } = await supabaseAdmin.from("students").select("completed_courses").eq("id", user.id).single();
        if (student?.completed_courses) completedCourses = student.completed_courses;
      }
    }

    // If still empty, check student1 fallback
    if (completedCourses.length === 0) {
      const { data: demoStudent } = await supabaseAdmin
        .from("students")
        .select("completed_courses")
        .eq("email", "student1@demo.edu")
        .single();
      if (demoStudent?.completed_courses) completedCourses = demoStudent.completed_courses;
    }

    // Fetch full catalog
    const { data: rawElectives, error: dbErr } = await supabaseAdmin
      .from("electives")
      .select("*");

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    const catalog = (rawElectives || []).map(mapElective);

    // Generate recommendations via LLM
    const advisorResponse = await generateAdvisorRecommendations(
      goal,
      interests,
      catalog,
      completedCourses
    );

    return NextResponse.json(advisorResponse);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

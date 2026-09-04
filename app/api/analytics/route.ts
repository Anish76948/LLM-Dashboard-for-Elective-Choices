import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Analytics } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // 1. Role verification (Admin only)
    let isAdmin = false;
    const authHeader = request.headers.get("authorization");
    const roleHeader = request.headers.get("x-user-role") || request.cookies.get("user_role")?.value;

    if (roleHeader === "admin") {
      isAdmin = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from("students")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") {
          isAdmin = true;
        }
      }
    }

    // Also check demo query param or admin header for demo convenience
    const { searchParams } = new URL(request.url);
    if (searchParams.get("demo_role") === "admin") {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 2. Compute Analytics
    // Fetch electives
    const { data: electives, error: eErr } = await supabaseAdmin
      .from("electives")
      .select("id, title, dept, capacity, enrolled");

    if (eErr) {
      return NextResponse.json({ error: eErr.message }, { status: 500 });
    }

    // Fetch choices to compute exact choice counts and waitlist total
    const { data: choices, error: cErr } = await supabaseAdmin
      .from("choices")
      .select("id, elective_id, status");

    if (cErr) {
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }

    const choicesCountMap = new Map<string, number>();
    let waitlistTotal = 0;

    for (const c of choices || []) {
      const count = choicesCountMap.get(c.elective_id) || 0;
      choicesCountMap.set(c.elective_id, count + 1);
      if (c.status === "waitlist") {
        waitlistTotal += 1;
      }
    }

    // perElective: { title, choices, capacity }
    const perElective = (electives || []).map((e) => ({
      title: e.title,
      choices: Math.max(e.enrolled, choicesCountMap.get(e.id) || 0),
      capacity: e.capacity,
    }));

    // deptSplit: { dept, count }
    const deptMap = new Map<string, number>();
    for (const e of electives || []) {
      const current = deptMap.get(e.dept) || 0;
      deptMap.set(e.dept, current + (choicesCountMap.get(e.id) || e.enrolled || 1));
    }

    const deptSplit = Array.from(deptMap.entries()).map(([dept, count]) => ({
      dept,
      count,
    }));

    const response: Analytics = {
      perElective,
      deptSplit,
      waitlistTotal,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

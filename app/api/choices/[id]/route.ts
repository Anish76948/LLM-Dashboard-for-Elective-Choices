import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch existing choice to inspect status and elective_id
    const { data: choice, error: fetchErr } = await supabaseAdmin
      .from("choices")
      .select("id, status, elective_id, electives(enrolled)")
      .eq("id", id)
      .single();

    if (fetchErr || !choice) {
      return NextResponse.json({ error: "Choice not found" }, { status: 404 });
    }

    // Delete choice record
    const { error: delErr } = await supabaseAdmin
      .from("choices")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // If it was confirmed, decrement enrolled count
    if (choice.status === "confirmed" && choice.elective_id) {
      const currentEnrolled = (choice as any).electives?.enrolled || 1;
      await supabaseAdmin
        .from("electives")
        .update({ enrolled: Math.max(0, currentEnrolled - 1) })
        .eq("id", choice.elective_id);
    }

    return NextResponse.json({ ok: true, message: "Choice deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

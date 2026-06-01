import { NextResponse } from "next/server";

import { createPublicSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createPublicSupabaseClient();
  const result = await supabase
    .from("worldcup_tournaments")
    .select("slug,status")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (result.error || !result.data) {
    return NextResponse.json(
      {
        ok: false,
        service: "worldcup",
        database: "unavailable",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    service: "worldcup",
    database: "available",
    tournament: result.data,
  });
}

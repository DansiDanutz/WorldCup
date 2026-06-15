import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { requireEnv } from "@/lib/env";
import { runResultsSweep } from "@/lib/run-results";

async function runResultCron(request: Request) {
  requireEnv("CRON_SECRET");
  const authorization = request.headers.get("authorization");

  if (!authorization || !isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const summary = await runResultsSweep();
    const applied = summary.processed.filter(
      (entry) => entry.action === "fetched_result_and_applied" || entry.action === "applied_existing_result",
    ).length;
    const errors = summary.processed.filter((entry) => entry.action === "error").length;
    // Logged so the unattended job is observable in Vercel runtime logs.
    console.log(
      `[cron/results] checked=${summary.processed.length} applied=${applied} errors=${errors} bracketAdvanced=${summary.bracketAdvanced}`,
    );
    return NextResponse.json({ ...summary, applied, errors, checked: summary.processed.length });
  } catch (error) {
    console.error("[cron/results] sweep failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Result sweep failed." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return runResultCron(request);
}

export async function POST(request: Request) {
  return runResultCron(request);
}

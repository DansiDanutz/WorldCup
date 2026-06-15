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
    return NextResponse.json(summary);
  } catch (error) {
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

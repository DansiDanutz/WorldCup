import { NextResponse } from "next/server";

import {
  getAuthProvider,
  getOrCreateReferralProfile,
  getUserDisplayName,
} from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Sign in with Google first." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return NextResponse.json({ error: "Only Google sign-in is allowed." }, { status: 403 });
  }

  const profile = await getOrCreateReferralProfile(supabase, user);

  return NextResponse.json({
    referralCode: profile.referral_code,
    displayName: profile.display_name ?? getUserDisplayName(user),
  });
}

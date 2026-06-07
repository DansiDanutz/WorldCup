import type { SupabaseClient } from "@supabase/supabase-js";

import { getAdminEmailAllowlist, isAllowlistedAdminEmail } from "@/lib/admin-auth";
import { attachLaunchSignoffEvidenceStatuses } from "@/lib/launch-signoff-evidence";
import { loadLaunchSignoffs } from "@/lib/launch-signoffs";
import {
  getOperatorPolicyPaidActionGate,
  loadOperatorPolicy,
  type OperatorPolicyPaidAction,
} from "@/lib/operator-policy";
import type { PaidActionGate, PaidActionGates } from "@/lib/types";

type LaunchGateOptions = {
  userEmail?: string | null;
};

type PaidActionGateName = keyof PaidActionGates;

export type PaidActionLaunchEvidenceProbe = {
  publicPaidActionsPaused: boolean;
  adminEvidenceEmailConfigured: boolean;
  adminEvidenceActionsAllowed: boolean;
  adminEmailCount: number;
  actions: Record<
    PaidActionGateName,
    {
      publicAllowed: boolean;
      adminEvidenceAllowed: boolean;
      publicMissing: string[];
      adminEvidenceMissing: string[];
    }
  >;
};

const PUBLIC_LAUNCH_SIGNOFF_MESSAGE =
  "Paid actions are paused until launch sign-offs are completed by an operator.";
const ACCOUNT_SETUP_OPEN_ACTIONS = new Set<PaidActionGateName>(["deposit", "ticket", "entry"]);
const WITHDRAWAL_DEFERRED_GATE: PaidActionGate = {
  allowed: false,
  missing: ["final payout window"],
  message: "Withdrawal requests open after the World Cup ends and prizes are settled manually.",
};

type GateEnv = Record<string, string | undefined>;

/**
 * Whether the admin paid-action launch-test bypass is enabled. This bypass lets
 * allowlisted operators exercise real paid flows (deposit/ticket/entry/
 * withdrawal) BEFORE the public launch gate and geo checks open, so it must
 * never be on silently in production. It is OFF unless
 * PAID_ACTION_LAUNCH_TEST_BYPASS is explicitly set. Enable it only for a
 * controlled pre-launch test window, then turn it off before public launch.
 */
export function isPaidActionLaunchTestBypassEnabled(env: GateEnv = process.env): boolean {
  const value = (env.PAID_ACTION_LAUNCH_TEST_BYPASS ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function isPaidActionLaunchTestAdmin(
  userEmail?: string | null,
  env: GateEnv = process.env,
): boolean {
  if (!isPaidActionLaunchTestBypassEnabled(env)) {
    return false;
  }

  return isAllowlistedAdminEmail(userEmail, env);
}

export async function getLaunchSignoffPaidActionGate(
  supabase: SupabaseClient,
  options: LaunchGateOptions = {},
): Promise<PaidActionGate> {
  if (isPaidActionLaunchTestAdmin(options.userEmail)) {
    return allowedGate();
  }

  try {
    const signoffs = await attachLaunchSignoffEvidenceStatuses(
      supabase,
      await loadLaunchSignoffs(supabase),
    );
    const missing = signoffs
      .filter((signoff) => signoff.status !== "completed" || !signoff.evidenceReady)
      .map((signoff) => signoff.label);

    if (missing.length === 0) {
      return allowedGate();
    }

    return {
      allowed: false,
      missing,
      message: PUBLIC_LAUNCH_SIGNOFF_MESSAGE,
    };
  } catch {
    return {
      allowed: false,
      missing: ["launch sign-off verification"],
      message: "Paid actions are paused until launch sign-offs can be verified.",
    };
  }
}

export async function getPublicPaidActionGates(
  supabase: SupabaseClient,
): Promise<PaidActionGates> {
  return {
    deposit: allowedGate(),
    ticket: allowedGate(),
    entry: allowedGate(),
    withdrawal: WITHDRAWAL_DEFERRED_GATE,
  };
}

export async function getPaidActionLaunchEvidenceProbe(
  supabase: SupabaseClient,
  env: Record<string, string | undefined> = process.env,
): Promise<PaidActionLaunchEvidenceProbe> {
  const adminEmails = getAdminEmailAllowlist(env);
  const adminEvidenceEmail = adminEmails[0] ?? null;
  const [publicGates, adminGates] = await Promise.all([
    getPublicPaidActionGates(supabase),
    adminEvidenceEmail
      ? getUserPaidActionGates(supabase, { userEmail: adminEvidenceEmail })
      : Promise.resolve(null),
  ]);
  const actionNames: PaidActionGateName[] = ["deposit", "ticket", "entry", "withdrawal"];
  const actions = Object.fromEntries(
    actionNames.map((action) => {
      const publicGate = publicGates[action];
      const adminGate = adminGates?.[action] ?? {
        allowed: false,
        missing: ["admin email allowlist"],
        message: null,
      };

      return [
        action,
        {
          publicAllowed: publicGate.allowed,
          adminEvidenceAllowed: adminGate.allowed,
          publicMissing: publicGate.missing,
          adminEvidenceMissing: adminGate.missing,
        },
      ];
    }),
  ) as PaidActionLaunchEvidenceProbe["actions"];

  return {
    publicPaidActionsPaused: actionNames.some((action) => !publicGates[action].allowed),
    adminEvidenceEmailConfigured: Boolean(adminEvidenceEmail),
    adminEvidenceActionsAllowed: actionNames.every((action) => actions[action].adminEvidenceAllowed),
    adminEmailCount: adminEmails.length,
    actions,
  };
}

export async function getUserPaidActionGate(
  supabase: SupabaseClient,
  action: OperatorPolicyPaidAction,
  options: LaunchGateOptions = {},
): Promise<PaidActionGate> {
  if (ACCOUNT_SETUP_OPEN_ACTIONS.has(action)) {
    return allowedGate();
  }

  if (action === "withdrawal") {
    return WITHDRAWAL_DEFERRED_GATE;
  }

  if (isPaidActionLaunchTestAdmin(options.userEmail)) {
    return allowedGate();
  }

  const [operatorPolicy, launchGate] = await Promise.all([
    loadOperatorPolicy(supabase),
    getLaunchSignoffPaidActionGate(supabase, options),
  ]);

  return combinePaidActionGates(getOperatorPolicyPaidActionGate(operatorPolicy, action), launchGate);
}

export async function getUserPaidActionGates(
  supabase: SupabaseClient,
  options: LaunchGateOptions = {},
): Promise<PaidActionGates> {
  return {
    deposit: allowedGate(),
    ticket: allowedGate(),
    entry: allowedGate(),
    withdrawal: WITHDRAWAL_DEFERRED_GATE,
  };
}

function combinePaidActionGates(...gates: PaidActionGate[]): PaidActionGate {
  const blocked = gates.filter((gate) => !gate.allowed);

  if (blocked.length === 0) {
    return allowedGate();
  }

  return {
    allowed: false,
    missing: Array.from(new Set(blocked.flatMap((gate) => gate.missing))),
    message: blocked.map((gate) => gate.message).find(Boolean) ?? "Paid actions are paused.",
  };
}

function allowedGate(): PaidActionGate {
  return {
    allowed: true,
    missing: [],
    message: null,
  };
}

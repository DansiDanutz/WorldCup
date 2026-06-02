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

export function isPaidActionLaunchTestAdmin(userEmail?: string | null): boolean {
  return isAllowlistedAdminEmail(userEmail);
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
  const [operatorPolicy, launchGate] = await Promise.all([
    loadOperatorPolicy(supabase),
    getLaunchSignoffPaidActionGate(supabase),
  ]);

  return {
    deposit: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "deposit"),
      launchGate,
    ),
    ticket: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "ticket"),
      launchGate,
    ),
    entry: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "entry"),
      launchGate,
    ),
    withdrawal: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "withdrawal"),
      launchGate,
    ),
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
  if (isPaidActionLaunchTestAdmin(options.userEmail)) {
    return {
      deposit: allowedGate(),
      ticket: allowedGate(),
      entry: allowedGate(),
      withdrawal: allowedGate(),
    };
  }

  const [operatorPolicy, launchGate] = await Promise.all([
    loadOperatorPolicy(supabase),
    getLaunchSignoffPaidActionGate(supabase, options),
  ]);

  return {
    deposit: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "deposit"),
      launchGate,
    ),
    ticket: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "ticket"),
      launchGate,
    ),
    entry: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "entry"),
      launchGate,
    ),
    withdrawal: combinePaidActionGates(
      getOperatorPolicyPaidActionGate(operatorPolicy, "withdrawal"),
      launchGate,
    ),
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

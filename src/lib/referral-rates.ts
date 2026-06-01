export const REFERRED_INVITER_PERCENT = 5;
export const STANDARD_INVITER_PERCENT = 3;

export function getInviterReferralPercent(hasJoinedThroughReferral: boolean) {
  return hasJoinedThroughReferral ? REFERRED_INVITER_PERCENT : STANDARD_INVITER_PERCENT;
}

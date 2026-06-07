export const REFERRED_INVITER_PERCENT = 5;
export const STANDARD_INVITER_PERCENT = 5;

export function getInviterReferralPercent(_hasJoinedThroughReferral: boolean) {
  return REFERRED_INVITER_PERCENT;
}

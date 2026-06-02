import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison. Always runs a `timingSafeEqual` so that a
 * length mismatch does not short-circuit with a distinguishable timing profile,
 * then returns false. Use this for any secret/token comparison so attackers
 * cannot recover the expected value byte-by-byte via response timing.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    // Compare against itself to keep the timing profile stable, then fail.
    timingSafeEqual(aBuffer, aBuffer);
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

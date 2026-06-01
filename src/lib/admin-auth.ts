import { timingSafeEqual } from "node:crypto";

import { requireEnv } from "./env.ts";

export function isValidAdminSecret(value: string | null | undefined) {
  const expected = requireEnv("ADMIN_RESULT_SECRET");

  if (!value) {
    return false;
  }

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

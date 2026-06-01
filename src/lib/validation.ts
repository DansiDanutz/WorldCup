// Minimal dependency-free input validation helpers for API route payloads.
// Each helper throws ValidationError on bad input; routes catch it and return
// a 400 with the message. This keeps untrusted client JSON from flowing into
// the database layer unchecked.

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireObject(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  return value;
}

export function requireString(
  value: unknown,
  field: string,
  options: { min?: number; max?: number } = {},
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string.`);
  }

  const trimmed = value.trim();
  const { min = 1, max = 200 } = options;

  if (trimmed.length < min) {
    throw new ValidationError(`${field} is required.`);
  }

  if (trimmed.length > max) {
    throw new ValidationError(`${field} must be at most ${max} characters.`);
  }

  return trimmed;
}

export function optionalString(value: unknown, field: string, max = 200): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireString(value, field, { min: 1, max });
}

export function requireFiniteNumber(value: unknown, field: string): number {
  const parsed = typeof value === "string" ? Number(value) : value;

  if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
    throw new ValidationError(`${field} must be a number.`);
  }

  return parsed;
}

export function requireNonNegativeAmount(value: unknown, field: string): number {
  const parsed = requireFiniteNumber(value, field);

  if (parsed < 0) {
    throw new ValidationError(`${field} must be zero or higher.`);
  }

  return parsed;
}

export function requirePositiveAmount(value: unknown, field: string): number {
  const parsed = requireFiniteNumber(value, field);

  if (parsed <= 0) {
    throw new ValidationError(`${field} must be greater than zero.`);
  }

  return parsed;
}

export function requireInteger(
  value: unknown,
  field: string,
  options: { min?: number; max?: number } = {},
): number {
  const parsed = requireFiniteNumber(value, field);

  if (!Number.isInteger(parsed)) {
    throw new ValidationError(`${field} must be a whole number.`);
  }

  if (options.min !== undefined && parsed < options.min) {
    throw new ValidationError(`${field} must be at least ${options.min}.`);
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new ValidationError(`${field} must be at most ${options.max}.`);
  }

  return parsed;
}

export function requireEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}.`);
  }

  return value as T;
}

export function requireStringArray(
  value: unknown,
  field: string,
  options: { length?: number } = {},
): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ValidationError(`${field} must be an array of strings.`);
  }

  if (options.length !== undefined && value.length !== options.length) {
    throw new ValidationError(`${field} must contain exactly ${options.length} items.`);
  }

  return value as string[];
}

export function optionalInteger(value: unknown, field: string, options: { min?: number } = {}): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireInteger(value, field, options);
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  requireEnum,
  requireInteger,
  requireNonNegativeAmount,
  requireObject,
  requirePositiveAmount,
  requireString,
  requireStringArray,
  ValidationError,
} from "../src/lib/validation.ts";

describe("validation helpers", () => {
  it("accepts and trims a valid string", () => {
    assert.equal(requireString("  Pelé  ", "Name"), "Pelé");
  });

  it("rejects empty or oversized strings", () => {
    assert.throws(() => requireString("", "Name"), ValidationError);
    assert.throws(() => requireString("x".repeat(10), "Name", { max: 5 }), ValidationError);
    assert.throws(() => requireString(42, "Name"), ValidationError);
  });

  it("validates integers with bounds", () => {
    assert.equal(requireInteger(5, "Goals", { min: 0, max: 9 }), 5);
    assert.equal(requireInteger("3", "Goals", { min: 0 }), 3);
    assert.throws(() => requireInteger(1.5, "Goals"), ValidationError);
    assert.throws(() => requireInteger(-1, "Goals", { min: 0 }), ValidationError);
    assert.throws(() => requireInteger(10, "Goals", { max: 9 }), ValidationError);
  });

  it("validates monetary amounts", () => {
    assert.equal(requireNonNegativeAmount(0, "Amount"), 0);
    assert.equal(requirePositiveAmount("12.5", "Amount"), 12.5);
    assert.throws(() => requireNonNegativeAmount(-1, "Amount"), ValidationError);
    assert.throws(() => requirePositiveAmount(0, "Amount"), ValidationError);
  });

  it("validates enums", () => {
    assert.equal(requireEnum("assign", "Action", ["assign", "set_price"] as const), "assign");
    assert.throws(() => requireEnum("delete", "Action", ["assign", "set_price"] as const), ValidationError);
  });

  it("validates string arrays with a fixed length", () => {
    assert.deepEqual(requireStringArray(["a", "b", "c"], "teamIds", { length: 3 }), ["a", "b", "c"]);
    assert.throws(() => requireStringArray(["a", "b"], "teamIds", { length: 3 }), ValidationError);
    assert.throws(() => requireStringArray(["a", 2], "teamIds"), ValidationError);
  });

  it("requires an object body", () => {
    assert.deepEqual(requireObject({ a: 1 }), { a: 1 });
    assert.throws(() => requireObject([]), ValidationError);
    assert.throws(() => requireObject(null), ValidationError);
  });
});

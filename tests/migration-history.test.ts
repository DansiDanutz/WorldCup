import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const migrationsDir = "supabase/migrations";

describe("migration history", () => {
  it("uses unique Supabase migration versions", () => {
    const versions = new Map<string, string[]>();

    for (const fileName of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql"))) {
      const version = fileName.match(/^(\d+)_/)?.[1];
      assert.ok(version, `migration ${fileName} must start with a numeric version`);
      versions.set(version, [...(versions.get(version) ?? []), fileName]);
    }

    const duplicates = [...versions.entries()].filter(([, names]) => names.length > 1);
    assert.deepEqual(duplicates, []);
  });

  it("does not grant the dropped worldcup_finalize_entry function after lockdown", () => {
    const orderedMigrations = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();
    const dropIndex = orderedMigrations.findIndex((name) => {
      const sql = readFileSync(join(migrationsDir, name), "utf8");
      return /drop function if exists public\.worldcup_finalize_entry\(uuid\);/.test(sql);
    });

    assert.notEqual(dropIndex, -1, "expected a migration to drop worldcup_finalize_entry");

    for (const fileName of orderedMigrations.slice(dropIndex + 1)) {
      const sql = readFileSync(join(migrationsDir, fileName), "utf8");
      assert.doesNotMatch(
        sql,
        /\b(grant|revoke) execute on function public\.worldcup_finalize_entry\(uuid\)/i,
        `${fileName} must not grant or revoke the dropped finalize-entry RPC`,
      );
    }
  });
});

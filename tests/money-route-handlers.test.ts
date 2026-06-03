import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createWalletTransferPostHandler } from "../src/app/api/admin/wallet-transfer/route.ts";
import { createTicketClaimPostHandler } from "../src/app/api/tickets/claim/route.ts";

type RpcCall = {
  name: string;
  params: Record<string, unknown>;
};

function jsonRequest(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request(`https://worldcup26.world${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function chain<T>(value: T) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    in() {
      return value;
    },
    single() {
      return value;
    },
  };
}

describe("admin wallet-transfer route handler", () => {
  it("requires admin authorization before touching money", async () => {
    let rpcCalled = false;
    const handler = createWalletTransferPostHandler({
      enforceRateLimit: async () => null,
      createServiceSupabaseClient: () => ({
        from() {
          throw new Error("should not query before admin auth succeeds");
        },
        rpc() {
          rpcCalled = true;
          return Promise.resolve({ data: null, error: null });
        },
      }) as never,
      requireAdmin: async () => ({ ok: false, status: 401, error: "Admin authorization required." }),
    });

    const response = await handler(jsonRequest("/api/admin/wallet-transfer", {
      fromUserId: "from-user",
      toUserId: "to-user",
      amount: "10",
    }));

    assert.equal(response.status, 401);
    assert.equal((await readJson(response)).error, "Admin authorization required.");
    assert.equal(rpcCalled, false);
  });

  it("executes a balance transfer with normalized amount and admin actor", async () => {
    const rpcCalls: RpcCall[] = [];
    const handler = createWalletTransferPostHandler({
      enforceRateLimit: async () => null,
      createServiceSupabaseClient: () => ({
        from(table: string) {
          if (table === "worldcup_tournaments") {
            return chain({ data: { id: "tournament-id" }, error: null });
          }

          if (table === "worldcup_referral_profiles") {
            return chain({ data: [{ user_id: "from-user" }, { user_id: "to-user" }], error: null });
          }

          throw new Error(`unexpected table ${table}`);
        },
        async rpc(name: string, params: Record<string, unknown>) {
          rpcCalls.push({ name, params });
          return { data: "transfer-id", error: null };
        },
      }) as never,
      requireAdmin: async () => ({ ok: true, via: "email", adminEmail: "admin@example.com" }),
    });

    const response = await handler(jsonRequest("/api/admin/wallet-transfer", {
      fromUserId: "from-user",
      toUserId: "to-user",
      amount: "10.129",
      note: "Manual correction",
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await readJson(response), { transferId: "transfer-id" });
    assert.deepEqual(rpcCalls, [
      {
        name: "worldcup_wallet_transfer",
        params: {
          p_tournament_id: "tournament-id",
          p_from_user_id: "from-user",
          p_to_user_id: "to-user",
          p_amount: 10.13,
          p_note: "Manual correction",
          p_created_by: "admin@example.com",
        },
      },
    ]);
  });

  it("maps wallet RPC business errors to safe client messages", async () => {
    const handler = createWalletTransferPostHandler({
      enforceRateLimit: async () => null,
      createServiceSupabaseClient: () => ({
        from(table: string) {
          if (table === "worldcup_tournaments") {
            return chain({ data: { id: "tournament-id" }, error: null });
          }

          return chain({ data: [{ user_id: "from-user" }, { user_id: "to-user" }], error: null });
        },
        async rpc() {
          return { data: null, error: { message: "INSUFFICIENT_FUNDS" } };
        },
      }) as never,
      requireAdmin: async () => ({ ok: true, via: "secret", adminEmail: null }),
    });

    const response = await handler(jsonRequest("/api/admin/wallet-transfer", {
      fromUserId: "from-user",
      toUserId: "to-user",
      amount: "10",
    }));

    assert.equal(response.status, 400);
    assert.equal((await readJson(response)).error, "Source account does not have enough funds.");
  });
});

describe("ticket claim route handler", () => {
  it("requires a bearer token before resolving a ticket code", async () => {
    let createdClient = false;
    const handler = createTicketClaimPostHandler({
      enforceRateLimit: async () => null,
      getBearerToken: () => null,
      createServiceSupabaseClient: () => {
        createdClient = true;
        return {} as never;
      },
    });

    const response = await handler(jsonRequest("/api/tickets/claim", { code: "ABCD1234" }));

    assert.equal(response.status, 401);
    assert.equal((await readJson(response)).error, "Sign in with Google first.");
    assert.equal(createdClient, false);
  });

  it("redeems a valid code for a Google-authenticated user", async () => {
    const rpcCalls: RpcCall[] = [];
    const handler = createTicketClaimPostHandler({
      enforceRateLimit: async () => null,
      getBearerToken: () => "token",
      createServiceSupabaseClient: () => ({
        auth: {
          async getUser(token: string) {
            assert.equal(token, "token");
            return {
              data: { user: { id: "user-id", app_metadata: { provider: "google" } } },
              error: null,
            };
          },
        },
        async rpc(name: string, params: Record<string, unknown>) {
          rpcCalls.push({ name, params });
          return { data: "ticket-id", error: null };
        },
      }) as never,
    });

    const response = await handler(jsonRequest("/api/tickets/claim", { code: "CODE-1234" }));

    assert.equal(response.status, 200);
    assert.deepEqual(await readJson(response), { ticketId: "ticket-id" });
    assert.deepEqual(rpcCalls, [
      {
        name: "worldcup_redeem_ticket_code",
        params: {
          p_code: "CODE-1234",
          p_user_id: "user-id",
        },
      },
    ]);
  });

  it("maps ticket-code business errors to safe client messages", async () => {
    const handler = createTicketClaimPostHandler({
      enforceRateLimit: async () => null,
      getBearerToken: () => "token",
      createServiceSupabaseClient: () => ({
        auth: {
          async getUser() {
            return {
              data: { user: { id: "user-id", app_metadata: { provider: "google" } } },
              error: null,
            };
          },
        },
        async rpc() {
          return { data: null, error: { message: "ALREADY_CLAIMED" } };
        },
      }) as never,
    });

    const response = await handler(jsonRequest("/api/tickets/claim", { code: "CODE-1234" }));

    assert.equal(response.status, 409);
    assert.equal((await readJson(response)).error, "That code has already been used.");
  });
});

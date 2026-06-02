"use client";

import { AlertTriangle, CircleDollarSign, Copy, Gift, Lock, Ticket, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { formatMoneyAmount } from "@/lib/economy";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type DepositAddress = {
  network: string;
  label: string;
  address: string;
  memo: string | null;
};

type AccountStatus = {
  walletBalance: string;
  ticketsAvailable: number;
  ticketsAssigned: number;
  ticketPriceAmount: string;
};

type AgentStatus = {
  isAgent: boolean;
  paidTickets: number;
  commissionTickets: number;
  availableCount: number;
  redeemedCount: number;
  progressInCycle: number;
  availableCodes: Array<{ code: string; kind: string }>;
};

export function WalletScreen() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [depositsConfigured, setDepositsConfigured] = useState<boolean | null>(null);
  const [agent, setAgent] = useState<AgentStatus | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const signedIn = session?.user.app_metadata.provider === "google";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const loadStatus = useCallback(async (token: string) => {
    const response = await fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = (await response.json()) as Partial<AccountStatus>;
    setStatus({
      walletBalance: me.walletBalance ?? "0.00",
      ticketsAvailable: me.ticketsAvailable ?? 0,
      ticketsAssigned: me.ticketsAssigned ?? 0,
      ticketPriceAmount: me.ticketPriceAmount ?? "0",
    });
  }, []);

  const loadAgent = useCallback(async (token: string) => {
    const response = await fetch("/api/agent/me", { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      setAgent(null);
      return;
    }
    const data = (await response.json()) as AgentStatus;
    setAgent(data.isAgent ? data : null);
  }, []);

  useEffect(() => {
    const token = session?.access_token;

    Promise.resolve().then(async () => {
      if (!token || !signedIn) {
        setStatus(null);
        setAddresses([]);
        setDepositsConfigured(null);
        setAgent(null);
        return;
      }

      try {
        const addressResponse = await fetch("/api/deposits/address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        await Promise.all([loadStatus(token), loadAgent(token)]);

        if (addressResponse.ok) {
          const data = (await addressResponse.json()) as {
            configured?: boolean;
            addresses?: DepositAddress[];
          };
          setDepositsConfigured(Boolean(data.configured));
          setAddresses(data.addresses ?? []);
        } else {
          setDepositsConfigured(false);
        }
      } catch {
        setError("Could not load your wallet.");
      }
    });
  }, [session?.access_token, signedIn, loadStatus, loadAgent]);

  function buyTicket() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as { error?: string; ticketId?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not buy a ticket.");
        return;
      }

      setMessage("Ticket purchased. You can lock an entry now.");
      loadStatus(token);
    });
  }

  function redeemTicket() {
    const token = session?.access_token;
    const code = redeemCode.trim();
    if (!token || !code) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/tickets/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as { error?: string; ticketId?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not redeem that code.");
        return;
      }

      setRedeemCode("");
      setMessage("Code redeemed — an entry ticket was added to your account.");
      await Promise.all([loadStatus(token), loadAgent(token)]);
    });
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setMessage(`${label} copied.`);
    window.setTimeout(() => setMessage(null), 1600);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Wallet size={20} />
          </span>
          <span>WorldCup Wallet</span>
        </div>
        <nav className="nav" aria-label="Wallet navigation">
          <Link href={{ pathname: "/" }}>
            <Trophy size={16} />
            Game
          </Link>
        </nav>
      </header>

      <div className="page">
        {!signedIn ? (
          <section className="wallet-solo">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h1 className="panel-title">Wallet</h1>
                  <p className="panel-subtitle">
                    Sign in with Google to deposit USDT and buy tickets.
                  </p>
                </div>
                <Lock size={18} color="var(--green)" />
              </div>
              <div className="panel-body">
                <Link className="button" href={{ pathname: "/login" }}>
                  Login / Register
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="wallet-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h1 className="panel-title">Balance</h1>
                    <p className="panel-subtitle">Internal USDT balance and entry tickets.</p>
                  </div>
                  <CircleDollarSign size={18} color="var(--gold)" />
                </div>
                <div className="panel-body">
                  <div className="account-status-grid">
                    <div>
                      <span>Wallet balance</span>
                      <strong>{formatMoneyAmount(status?.walletBalance ?? 0)}</strong>
                      <small>USDT</small>
                    </div>
                    <div>
                      <span>Tickets available</span>
                      <strong>{status?.ticketsAvailable ?? 0}</strong>
                      <small>{status?.ticketsAssigned ?? 0} total</small>
                    </div>
                    <div>
                      <span>Ticket price</span>
                      <strong>{formatMoneyAmount(status?.ticketPriceAmount ?? 0)}</strong>
                      <small>per entry</small>
                    </div>
                  </div>
                  <button className="button" disabled={isPending} onClick={buyTicket} type="button">
                    <Lock size={16} />
                    {isPending ? "Processing..." : "Buy entry ticket"}
                  </button>

                  <div className="redeem-row">
                    <label htmlFor="redeem-code">Have a ticket code?</label>
                    <div className="redeem-input">
                      <input
                        className="search"
                        id="redeem-code"
                        value={redeemCode}
                        onChange={(event) => setRedeemCode(event.target.value.toUpperCase())}
                        placeholder="Enter code"
                        maxLength={32}
                      />
                      <button
                        className="button secondary"
                        disabled={isPending || redeemCode.trim().length === 0}
                        onClick={redeemTicket}
                        type="button"
                      >
                        <Ticket size={16} />
                        Redeem
                      </button>
                    </div>
                  </div>

                  {message ? <div className="message">{message}</div> : null}
                  {error ? <div className="message error">{error}</div> : null}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Deposit USDT</h2>
                    <p className="panel-subtitle">
                      Send only USDT on the matching network. Deposits credit your wallet after
                      on-chain confirmation.
                    </p>
                  </div>
                  <Wallet size={18} color="var(--green)" />
                </div>
                <div className="panel-body">
                  {depositsConfigured === false ? (
                    <div className="message">USDT deposits are not enabled yet. Check back soon.</div>
                  ) : addresses.length === 0 ? (
                    <div className="field-note">Generating your deposit addresses…</div>
                  ) : (
                    <div className="deposit-list">
                      {addresses.map((entry) => (
                        <div className="deposit-row" key={entry.network}>
                          <div className="deposit-meta">
                            <span className="pick-slot-label">{entry.label}</span>
                            <code className="deposit-address">{entry.address}</code>
                            {entry.memo ? <small>Memo: {entry.memo}</small> : null}
                          </div>
                          <button
                            className="button secondary"
                            onClick={() => copyText(entry.address, "Address")}
                            type="button"
                          >
                            <Copy size={16} />
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="deposit-warning">
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>
                      Only send USDT on the exact network shown. Sending any other asset or network
                      may result in permanent loss.
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {agent ? (
              <section className="wallet-wide">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Agent — ticket codes</h2>
                      <p className="panel-subtitle">
                        Hand a code to a player; they redeem it for one entry ticket.
                      </p>
                    </div>
                    <Gift size={18} color="var(--gold)" />
                  </div>
                  <div className="panel-body">
                    <div className="account-status-grid agent-stats">
                      <div>
                        <span>Codes to give out</span>
                        <strong>{agent.availableCount}</strong>
                        <small>{agent.redeemedCount} redeemed</small>
                      </div>
                      <div>
                        <span>Paid tickets</span>
                        <strong>{agent.paidTickets}</strong>
                        <small>{agent.commissionTickets} free earned</small>
                      </div>
                      <div>
                        <span>Next free ticket</span>
                        <strong>{agent.progressInCycle}/10</strong>
                        <small>+1 free every 10</small>
                      </div>
                    </div>

                    <div
                      className="commission-bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={10}
                      aria-valuenow={agent.progressInCycle}
                    >
                      <span style={{ width: `${(agent.progressInCycle / 10) * 100}%` }} />
                    </div>

                    {agent.availableCodes.length === 0 ? (
                      <div className="field-note">
                        No codes yet. An admin assigns codes after your payment is recorded.
                      </div>
                    ) : (
                      <div className="code-list">
                        {agent.availableCodes.map((entry) => (
                          <div className="code-row" key={entry.code}>
                            <code className="code-value">{entry.code}</code>
                            {entry.kind === "commission" ? (
                              <span className="code-tag">free</span>
                            ) : null}
                            <button
                              className="button secondary"
                              onClick={() => copyText(entry.code, "Code")}
                              type="button"
                            >
                              <Copy size={16} />
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

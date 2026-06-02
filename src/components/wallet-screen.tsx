"use client";

import { AlertTriangle, CircleDollarSign, Copy, Lock, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

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

export function WalletScreen() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [depositsConfigured, setDepositsConfigured] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const signedIn = session?.user.app_metadata.provider === "google";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const token = session?.access_token;

    Promise.resolve().then(async () => {
      if (!token || !signedIn) {
        setStatus(null);
        setAddresses([]);
        setDepositsConfigured(null);
        return;
      }

      try {
        const [meResponse, addressResponse] = await Promise.all([
          fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/deposits/address", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const me = (await meResponse.json()) as Partial<AccountStatus>;
        setStatus({
          walletBalance: me.walletBalance ?? "0.00",
          ticketsAvailable: me.ticketsAvailable ?? 0,
          ticketsAssigned: me.ticketsAssigned ?? 0,
          ticketPriceAmount: me.ticketPriceAmount ?? "0",
        });

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
  }, [session?.access_token, signedIn]);

  function refreshStatus(token: string) {
    fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((me: Partial<AccountStatus>) =>
        setStatus({
          walletBalance: me.walletBalance ?? "0.00",
          ticketsAvailable: me.ticketsAvailable ?? 0,
          ticketsAssigned: me.ticketsAssigned ?? 0,
          ticketPriceAmount: me.ticketPriceAmount ?? "0",
        }),
      )
      .catch(() => undefined);
  }

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
      refreshStatus(token);
    });
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    setMessage("Address copied.");
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
                          onClick={() => copyAddress(entry.address)}
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
        )}
      </div>
    </main>
  );
}

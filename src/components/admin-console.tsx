"use client";

import { ClipboardCheck, GitBranch, Lock, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { formatMoneyAmount } from "@/lib/economy";
import { formatPrizeAmount } from "@/lib/prize-pool";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  AdminAccountRow,
  AdminReferralReportRow,
  DueMatch,
  WorldCupMatch,
  WorldCupTournament,
  WorldCupTeam,
} from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

type AdminConsoleProps = {
  tournament: WorldCupTournament;
  teams: WorldCupTeam[];
  matches: WorldCupMatch[];
  dueMatches: DueMatch[];
};

type ResultForm = {
  matchId: string;
  finishMethod: "90" | "extra_time" | "penalties";
  homeGoals90: string;
  awayGoals90: string;
  homeGoalsTotal: string;
  awayGoalsTotal: string;
  homePenalties: string;
  awayPenalties: string;
  winnerTeamId: string;
};

const initialResultForm: ResultForm = {
  matchId: "",
  finishMethod: "90",
  homeGoals90: "0",
  awayGoals90: "0",
  homeGoalsTotal: "0",
  awayGoalsTotal: "0",
  homePenalties: "",
  awayPenalties: "",
  winnerTeamId: "",
};

export function AdminConsole({ tournament, teams, matches, dueMatches }: AdminConsoleProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [breakGlassSecret, setBreakGlassSecret] = useState("");

  const [resultForm, setResultForm] = useState<ResultForm>(initialResultForm);
  const [prizePoolAmount, setPrizePoolAmount] = useState(tournament.prize_pool_amount);
  const [ticketPriceAmount, setTicketPriceAmount] = useState(tournament.ticket_price_amount);
  const [accounts, setAccounts] = useState<AdminAccountRow[]>([]);
  const [ticketUserId, setTicketUserId] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("1");
  const [walletFromUserId, setWalletFromUserId] = useState("");
  const [walletToUserId, setWalletToUserId] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const [assignMatchId, setAssignMatchId] = useState("");
  const [assignHomeTeamId, setAssignHomeTeamId] = useState("");
  const [assignAwayTeamId, setAssignAwayTeamId] = useState("");
  const [referralRows, setReferralRows] = useState<AdminReferralReportRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signedIn = Boolean(session?.user);

  function authHeaders(): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    if (breakGlassSecret) {
      headers["x-admin-secret"] = breakGlassSecret;
    }

    return headers;
  }

  function run(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    startTransition(action);
  }

  async function readResult(response: Response) {
    const result = (await response.json()) as Record<string, unknown> & { error?: string };

    if (!response.ok) {
      throw new Error(result.error ?? "Request failed.");
    }

    return result;
  }

  function submitResult() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/results", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            matchId: resultForm.matchId,
            finishMethod: resultForm.finishMethod,
            homeGoals90: Number(resultForm.homeGoals90),
            awayGoals90: Number(resultForm.awayGoals90),
            homeGoalsTotal: Number(resultForm.homeGoalsTotal),
            awayGoalsTotal: Number(resultForm.awayGoalsTotal),
            homePenalties: resultForm.homePenalties === "" ? null : Number(resultForm.homePenalties),
            awayPenalties: resultForm.awayPenalties === "" ? null : Number(resultForm.awayPenalties),
            winnerTeamId: resultForm.winnerTeamId || null,
          }),
        });
        const result = await readResult(response);
        setMessage(
          `Result saved. Awarded rows: ${result.awardedRows ?? 0}. Bracket advanced: ${result.bracketAdvanced ?? 0}.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not apply result.");
      }
    });
  }

  function savePrizePool() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/prize-pool", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ prizePoolAmount: Number(prizePoolAmount) }),
        });
        const result = await readResult(response);
        setPrizePoolAmount(String(result.prizePoolAmount ?? prizePoolAmount));
        setMessage("Prize pool saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save prize pool.");
      }
    });
  }

  function advanceBracket() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/advance-bracket", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setMessage(`Bracket advanced. Matches updated: ${result.assigned ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not advance bracket.");
      }
    });
  }

  function settlePayouts() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/settle-payouts", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setMessage(`Payouts settled. Records created: ${result.created ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not settle payouts.");
      }
    });
  }

  function assignMatchTeams() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/assign-match-teams", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            matchId: assignMatchId,
            homeTeamId: assignHomeTeamId || null,
            awayTeamId: assignAwayTeamId || null,
          }),
        });
        await readResult(response);
        setMessage("Match teams assigned.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not assign match teams.");
      }
    });
  }

  function loadAccounts() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setAccounts((result.accounts as AdminAccountRow[]) ?? []);
        setTicketPriceAmount(String(result.ticketPriceAmount ?? ticketPriceAmount));
        setMessage(`Accounts loaded. Rows: ${(result.accounts as AdminAccountRow[])?.length ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load accounts.");
      }
    });
  }

  function saveTicketPrice() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/tickets", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "set_price", ticketPriceAmount: Number(ticketPriceAmount) }),
        });
        const result = await readResult(response);
        setTicketPriceAmount(String(result.ticketPriceAmount ?? ticketPriceAmount));
        setMessage("Ticket price saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save ticket price.");
      }
    });
  }

  function assignTickets() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/tickets", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "assign", userId: ticketUserId, quantity: Number(ticketQuantity) }),
        });
        const result = await readResult(response);
        setMessage(`Assigned tickets: ${result.assignedTickets ?? ticketQuantity}.`);
        await reloadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not assign tickets.");
      }
    });
  }

  function transferFunds() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/wallet-transfer", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            fromUserId: walletFromUserId,
            toUserId: walletToUserId,
            amount: Number(walletAmount),
            note: walletNote,
          }),
        });
        const result = await readResult(response);
        setWalletAmount("");
        setWalletNote("");
        setMessage(`Transfer saved: ${result.transferId}.`);
        await reloadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not transfer funds.");
      }
    });
  }

  async function reloadAccounts() {
    const response = await fetch("/api/admin/accounts", { method: "POST", headers: authHeaders() });

    if (response.ok) {
      const result = (await response.json()) as { accounts?: AdminAccountRow[] };
      setAccounts(result.accounts ?? []);
    }
  }

  function loadReferralReport() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/referrals", { method: "POST", headers: authHeaders() });
        const result = await readResult(response);
        setReferralRows((result.referrals as AdminReferralReportRow[]) ?? []);
        setMessage(`Referral report loaded. Rows: ${(result.referrals as AdminReferralReportRow[])?.length ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load referral report.");
      }
    });
  }

  async function signInWithGoogle() {
    setError(null);
    setMessage(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });

    if (authError) {
      setError(getOAuthErrorMessage(authError.message));
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck size={20} />
          </span>
          <span>WorldCup Admin</span>
        </div>
        <nav className="nav" aria-label="Admin navigation">
          <Link href={{ pathname: "/" }}>
            <Trophy size={16} />
            Game
          </Link>
          <Link href={{ pathname: "/schema" }}>
            <GitBranch size={16} />
            Schema
          </Link>
        </nav>
      </header>

      <div className="page">
        <section className="status-row" aria-label="Admin status">
          <div className="stat">
            <div className="stat-label">Signed in</div>
            <div className="stat-value">{signedIn ? "Yes" : "No"}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Prize pool (gross)</div>
            <div className="stat-value">{formatPrizeAmount(tournament.prize_pool_amount)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Due checks</div>
            <div className="stat-value">{dueMatches.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Accounts loaded</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Admin access</h1>
                <p className="panel-subtitle">
                  Sign in with an allowlisted Google account. The break-glass secret is only for
                  emergencies when email auth is unavailable.
                </p>
              </div>
              <Lock size={18} color="var(--green)" />
            </div>
            <div className="entry-form">
              <div className="auth-box">
                <div>
                  <strong>{signedIn ? "Google account connected" : "Not signed in"}</strong>
                  <p>{signedIn ? session?.user.email : "Use an allowlisted admin email."}</p>
                </div>
                {signedIn ? (
                  <button className="button secondary" onClick={() => supabase.auth.signOut()} type="button">
                    Sign out
                  </button>
                ) : (
                  <button className="button" onClick={signInWithGoogle} type="button">
                    Sign in with Google
                  </button>
                )}
              </div>
              <div className="field">
                <label htmlFor="break-glass">Break-glass secret (optional)</label>
                <input
                  id="break-glass"
                  type="password"
                  value={breakGlassSecret}
                  onChange={(event) => setBreakGlassSecret(event.target.value)}
                  placeholder="x-admin-secret header"
                />
              </div>
              {message ? <div className="message">{message}</div> : null}
              {error ? <div className="message error">{error}</div> : null}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Result entry</h2>
                <p className="panel-subtitle">Manual fallback; also progresses the bracket.</p>
              </div>
              <ClipboardCheck size={18} color="var(--green)" />
            </div>
            <div className="admin-form">
              <div className="field">
                <label htmlFor="result-match">Match</label>
                <select
                  id="result-match"
                  value={resultForm.matchId}
                  onChange={(event) => setResultForm((current) => ({ ...current, matchId: event.target.value }))}
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.match_number} {match.home_slot} vs {match.away_slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="result-finish">Finish method</label>
                <select
                  id="result-finish"
                  value={resultForm.finishMethod}
                  onChange={(event) =>
                    setResultForm((current) => ({
                      ...current,
                      finishMethod: event.target.value as ResultForm["finishMethod"],
                    }))
                  }
                >
                  <option value="90">90 minutes</option>
                  <option value="extra_time">Extra time</option>
                  <option value="penalties">Penalties</option>
                </select>
              </div>
              <div className="two-col">
                <NumberField
                  label="Home 90"
                  value={resultForm.homeGoals90}
                  onChange={(value) => setResultForm((c) => ({ ...c, homeGoals90: value }))}
                />
                <NumberField
                  label="Away 90"
                  value={resultForm.awayGoals90}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayGoals90: value }))}
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home total"
                  value={resultForm.homeGoalsTotal}
                  onChange={(value) => setResultForm((c) => ({ ...c, homeGoalsTotal: value }))}
                />
                <NumberField
                  label="Away total"
                  value={resultForm.awayGoalsTotal}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayGoalsTotal: value }))}
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home pens"
                  value={resultForm.homePenalties}
                  onChange={(value) => setResultForm((c) => ({ ...c, homePenalties: value }))}
                />
                <NumberField
                  label="Away pens"
                  value={resultForm.awayPenalties}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayPenalties: value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="result-winner">Winner</label>
                <select
                  id="result-winner"
                  value={resultForm.winnerTeamId}
                  onChange={(event) => setResultForm((c) => ({ ...c, winnerTeamId: event.target.value }))}
                >
                  <option value="">No winner / group draw</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button secondary"
                disabled={!resultForm.matchId || isPending}
                onClick={submitResult}
                type="button"
              >
                <ClipboardCheck size={16} />
                Save Result & Apply Points
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Bracket & payouts</h2>
                <p className="panel-subtitle">Advance knockouts, override pairings, settle prizes.</p>
              </div>
              <GitBranch size={18} color="var(--green)" />
            </div>
            <div className="admin-form">
              <div className="two-col">
                <button className="button secondary" disabled={isPending} onClick={advanceBracket} type="button">
                  Advance Bracket
                </button>
                <button className="button secondary" disabled={isPending} onClick={settlePayouts} type="button">
                  Settle Payouts
                </button>
              </div>
              <div className="field">
                <label htmlFor="assign-match">Override match teams</label>
                <select
                  id="assign-match"
                  value={assignMatchId}
                  onChange={(event) => setAssignMatchId(event.target.value)}
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.match_number} {match.home_slot} vs {match.away_slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="assign-home">Home team</label>
                  <select id="assign-home" value={assignHomeTeamId} onChange={(e) => setAssignHomeTeamId(e.target.value)}>
                    <option value="">Unchanged</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="assign-away">Away team</label>
                  <select id="assign-away" value={assignAwayTeamId} onChange={(e) => setAssignAwayTeamId(e.target.value)}>
                    <option value="">Unchanged</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="button secondary"
                disabled={!assignMatchId || isPending}
                onClick={assignMatchTeams}
                type="button"
              >
                Assign Match Teams
              </button>
              <div className="field">
                <label htmlFor="prize-pool">Prize pool (gross collected)</label>
                <input
                  id="prize-pool"
                  min="0"
                  type="number"
                  value={prizePoolAmount}
                  onChange={(event) => setPrizePoolAmount(event.target.value)}
                />
              </div>
              <button className="button secondary" disabled={isPending} onClick={savePrizePool} type="button">
                Save Prize Pool
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Tickets & wallets</h2>
                <p className="panel-subtitle">Assign entry tickets and record internal transfers.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadAccounts} type="button">
                Load Accounts
              </button>
            </div>
            <div className="admin-form">
              <div className="two-col">
                <NumberField label="Ticket price" value={ticketPriceAmount} onChange={setTicketPriceAmount} />
                <button className="button secondary" disabled={isPending} onClick={saveTicketPrice} type="button">
                  Save Ticket Price
                </button>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="ticket-account">Assign ticket to account</label>
                  <select id="ticket-account" value={ticketUserId} onChange={(e) => setTicketUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · {account.email ?? account.referralCode}
                      </option>
                    ))}
                  </select>
                </div>
                <NumberField label="Quantity" value={ticketQuantity} onChange={setTicketQuantity} />
              </div>
              <button
                className="button secondary"
                disabled={!ticketUserId || isPending}
                onClick={assignTickets}
                type="button"
              >
                Assign Tickets
              </button>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="wallet-from">Transfer from</label>
                  <select id="wallet-from" value={walletFromUserId} onChange={(e) => setWalletFromUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · balance {formatMoneyAmount(account.walletBalance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="wallet-to">Transfer to</label>
                  <select id="wallet-to" value={walletToUserId} onChange={(e) => setWalletToUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · {account.email ?? account.referralCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="two-col">
                <NumberField label="Amount" value={walletAmount} onChange={setWalletAmount} />
                <div className="field">
                  <label htmlFor="wallet-note">Note</label>
                  <input
                    id="wallet-note"
                    value={walletNote}
                    onChange={(event) => setWalletNote(event.target.value)}
                    placeholder="Reason for transfer"
                  />
                </div>
              </div>
              <button
                className="button secondary"
                disabled={!walletFromUserId || !walletToUserId || !walletAmount || isPending}
                onClick={transferFunds}
                type="button"
              >
                Transfer Funds
              </button>
              {accounts.length > 0 ? (
                <div className="admin-referral-list">
                  {accounts.map((account) => (
                    <div className="admin-referral-row" key={account.userId}>
                      <div>
                        <strong>{account.displayName}</strong>
                        <span>{account.email ?? "No email stored"} · {account.referralCode}</span>
                        <span>
                          Tickets: {account.ticketsAvailable}/{account.ticketsAssigned} available
                        </span>
                      </div>
                      <div>
                        <strong>{formatMoneyAmount(account.walletBalance)}</strong>
                        <span>Wallet</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-note">Load accounts to assign tickets or transfer funds.</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Referral report</h2>
                <p className="panel-subtitle">Accepted referral agreements for payout auditing.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadReferralReport} type="button">
                Load Report
              </button>
            </div>
            <div className="admin-form">
              {referralRows.length > 0 ? (
                <div className="admin-referral-list">
                  {referralRows.map((row) => (
                    <div className="admin-referral-row" key={row.id}>
                      <div>
                        <strong>{row.invitedDisplayName}</strong>
                        <span>
                          Invited by {row.inviterDisplayName} · code {row.referralCode}
                        </span>
                      </div>
                      <div>
                        <strong>{row.feePercent}%</strong>
                        <span>
                          Rank {row.invitedLeaderboardRank ?? "-"} · {row.invitedTotalPoints} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-note">Load the report to see accepted referral agreements.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getOAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("unsupported provider")) {
    return "Google login is not enabled in Supabase yet. Enable the Google provider in Supabase Auth before using the admin console.";
  }

  return message;
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} min="0" type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

# Post-promote smoke test — free permanent team lock

Run after promoting the new build to production. Use a **fresh/non-admin Google
account** for the player checks. ~5 minutes total.

## 0. Promote (prerequisite)
The DB migration is already applied. Put the new app on the production domain:

```bash
npm run vercel:promote -- --confirm     # terminal with Vercel auth
```
…or in the Vercel dashboard: open the latest `main` deployment → **Promote to Production**.

Confirm https://worldcup26.world serves the new build (hard-refresh).

---

## 1. Free signup → pick → lock (the headline flow)
1. Sign in with Google (a free account, no ticket).
2. Pick exactly 3 teams.
3. Click **Lock my 3 teams** (the free primary CTA — *not* "Lock & enter prize pool").
4. ✅ Expect: success message "Your 3 teams are locked forever…", the pick UI is
   replaced by the locked-teams view with the **Locked · free** pill.
5. Reload the page. ✅ Teams still locked; no way to edit them.

## 2. Picks are immutable after lock
1. As that same locked-free user, try to change teams (there should be no editor;
   the pick workflow is gone).
2. ✅ Expect: no path to edit. (Backend guard: a save-draft attempt returns
   `TEAMS_LOCKED` / "Your 3 teams are locked and can no longer be changed.")

## 3. Free "playing for fun" experience
1. Open the account / **My standing** section.
2. ✅ Expect: live **Points**, a **Preview rank** labeled **"if you were paying"**,
   and (if in a paying position) an **"If you were paying — projected share"** line.
3. ✅ Expect: the player is **not** shown on the public paid leaderboard, and the
   copy makes clear they're playing for fun until they buy a ticket.

## 4. Convert to paid — enter the pool (anytime)
1. Have an admin assign this user 1 ticket (see §6).
2. In the locked-teams view, click **Enter the prize pool**.
3. ✅ Expect: status flips to **In pool**; the player now appears on the public
   leaderboard with their **full accumulated points** (retroactive), and the
   standing switches from "preview rank" to a real **Rank** + projected payout.
4. ✅ Integrity: team *selection* is still cutoff-bound (you can't lock a brand-new
   team after its first match), but an already-committed player can convert at any
   time during the tournament.

## 5. Bug fix — agent "next code to sell" card (PR #55)
1. Sign in as an **agent** account that has assigned codes.
2. Open **My standing**.
3. ✅ Expect: the **"Next code to sell"** card is visible **by default** (no need to
   click the gift icon), showing the next sellable code.

## 6. Bug fix — admin "send ticket to a user" (PR #55)
1. Sign in as the owner admin and open `/admin`.
2. ✅ Expect on arrival (no manual "Load Accounts"): the **account dropdown is
   populated** and the **admin inventory count** is shown.
3. If inventory is 0, use **Request tickets** first; then select a user, set qty 1,
   and **Assign user ticket**.
4. ✅ Expect: the **Assign user ticket** button is enabled (when inventory ≥ qty and
   a user is selected) and the assignment succeeds; the user's ticket count goes up.

---

## Rollback note
The change is additive — all payout/leaderboard/referral logic still keys off
`status='locked'`. If needed, you can revert the app (re-promote the previous
build); the migration can stay in place harmlessly (older code simply never
writes the `committed` status).

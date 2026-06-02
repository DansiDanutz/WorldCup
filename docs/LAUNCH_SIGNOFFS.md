# Launch Sign-Offs

Production launch requires evidence for real money movement and operator/legal
approval. The app stores that evidence in `worldcup_launch_signoffs`.

Required sign-offs:

- `real_usdt_trc20_deposit_test`: send a small real TRC20 USDT deposit, submit a
  claim, verify it, and credit the wallet.
- `real_usdt_erc20_deposit_test`: send a small real ERC20 USDT deposit, submit a
  claim, verify it, and credit the wallet.
- `real_usdt_withdrawal_payout_test`: request a small payout, approve it, send
  the external transfer, and record the payout transaction hash.
- `operator_policy_review`: confirm country policy and deposit/withdrawal caps.
- `legal_compliance_review`: confirm Terms, Privacy, eligibility, and operating
  compliance are approved.

Statuses:

- `pending`: not approved yet.
- `completed`: evidence is recorded and the launch requirement is satisfied.
- `waived`: an operator intentionally waived a non-payment requirement with a
  reason.

Completed and waived sign-offs must include an evidence note. Use the note for
transaction hashes, KuCoin timestamps, admin ticket IDs, reviewer names, or the
reason a sign-off was waived. Use `evidence_url` only for HTTPS links to
external supporting records.

Payment sign-offs have additional backend guards:

- TRC20 and ERC20 deposit tests can be marked `completed` only after a credited
  `worldcup_deposit_claims` row exists for that network and is linked to a
  wallet deposit.
- The withdrawal payout test can be marked `completed` only after a paid
  `worldcup_withdrawal_requests` row exists with an external payout transaction
  hash.
- Real USDT payment tests cannot be marked `waived`; they must stay pending
  until the live deposit or payout evidence exists.

The `/admin` Launch sign-offs panel shows an evidence status for each row before
you save it. Payment evidence is checked against the live deposit/withdrawal
tables, operator policy evidence is checked against the launch gate, and legal
approval remains a manual evidence note.

Use **Evidence Snapshot** in `/admin` before final approval. It captures the
canonical production URL, current Vercel deployment URL, Git commit metadata
when available, readiness summary, operator policy, legal version, and all
required sign-off evidence statuses. Attach that snapshot or an HTTPS approval
record that references it to the operator and legal sign-offs.

The backend endpoint is `/api/admin/launch-signoffs` and requires the same admin
authorization as the rest of the admin console.

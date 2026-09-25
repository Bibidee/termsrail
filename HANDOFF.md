# TermsRail Handoff

## Production release (v3 custody-enabled)

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0xd689F01a5A68B1B5320757F49139EeB13f9BAB2e`
- Deployment transaction: `0xc5d52299c76135040aab739acae0eea6b5e58aac74656ad9f5518177847ae683`
- Deployed contract source SHA-256: `83DB21CF94384B809CC28B0847F7346F3ABBC780693688DC3A85545B70F95D11`
- Deployment receipt: FINALIZED, GenVM SUCCESS, consensus Accepted.

## Accepted v1 deployment (untouched)

- Contract: `0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`
- Deployment transaction: `0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`
- Deployed contract source SHA-256: `E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`

## Verification

- Direct Mode: 29 passed in hosted CI
- GenVM lint: PASS
- Frontend tests: 26 passed
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Exact-head CI: PASS (see GitHub Actions history for the release commit)

## v3 custody checkpoint

- Current frontend/contract checkpoint: inspect `git log -1` (HEAD is intentionally not embedded here).
- Agent Plans: bounded multi-step creation, policy-bound authorization, stale invalidation, reassessment and receipts implemented.
- Escrow: plan-bound state machine with payable GEN funding. `fund_escrow` requires `gl.message.value` to equal the declared amount and records custody as `HELD`. Guarded release/refund and dispute resolution emit finalized external transfers to the recipient or payer, then record `TRANSFER_QUEUED` settlement state. Studio balance reads are simulated; Studionet uses the Intelligent Contract ghost balance.
- Frontend routes: `/plans`, `/plans/new`, `/plans/[id]`, `/escrow`, `/escrow/new`, `/escrow/[id]`, `/receipts`, `/receipts/[id]`, `/activity`.
- v3 deployment: FINALIZED on Studionet at the custody-enabled address above; v1 and the prior logical v2 deployment remain untouched.
- v3 source SHA-256: `83DB21CF94384B809CC28B0847F7346F3ABBC780693688DC3A85545B70F95D11`.
- Hosted CI: the exact final main commit is green; use the GitHub Actions run attached to the commit for the run ID.

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

Reachable change states are `UNCHANGED`, `NON_MATERIAL_CHANGE`, `MATERIAL_CHANGE`, and `POLICY_UNAVAILABLE`. `UNKNOWN_CHANGE` is canonical/reserved but unreachable in the deployed implementation. Every loss of an explicit `ALLOWED` dimension, including `ALLOWED` to `NOT_ADDRESSED` or `UNKNOWN`, is a material change that invalidates the snapshot and its authorizations; the gate stays closed until snapshot rebuild and action reassessment. `check_policy_change` is verified by canonical change-history advancement.

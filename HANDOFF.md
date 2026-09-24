# TermsRail Handoff

## Production release (v2)

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0xcbC2eD344cb21dB2Dc0E7a4C22C67BF350F037dF`
- Deployment transaction: `0xb8945e4a147f7ffe72114be0ba21838b9cd753c2f64a6b0915c58becb81d5f34`
- Deployed contract source SHA-256: `FF50D595657ADC0B3DE06FD2F86C72ED11B9F8CC5BB293A131ADEBBB1401F86B`
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

## v2 checkpoint

- Current frontend/contract checkpoint: inspect `git log -1` (HEAD is intentionally not embedded here).
- Agent Plans: bounded multi-step creation, policy-bound authorization, stale invalidation, reassessment and receipts implemented.
- Escrow: plan-bound logical state machine with funding/locking labels, policy-change freeze, completion evidence, normalized adjudication, guarded release/refund and dispute evidence/adjudication/resolution. It does not custody or transfer GEN.
- Frontend routes: `/plans`, `/plans/new`, `/plans/[id]`, `/escrow`, `/escrow/new`, `/escrow/[id]`, `/receipts`, `/receipts/[id]`, `/activity`.
- v2 deployment: FINALIZED on Studionet at the v2 address above; the v1 deployment remains untouched.
- v2 source SHA-256: `FF50D595657ADC0B3DE06FD2F86C72ED11B9F8CC5BB293A131ADEBBB1401F86B`
- Hosted CI: the exact final main commit is green; use the GitHub Actions run attached to the commit for the run ID.

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

Reachable change states are `UNCHANGED`, `NON_MATERIAL_CHANGE`, `MATERIAL_CHANGE`, and `POLICY_UNAVAILABLE`. `UNKNOWN_CHANGE` is canonical/reserved but unreachable in the deployed implementation. Every loss of an explicit `ALLOWED` dimension, including `ALLOWED` to `NOT_ADDRESSED` or `UNKNOWN`, is a material change that invalidates the snapshot and its authorizations; the gate stays closed until snapshot rebuild and action reassessment. `check_policy_change` is verified by canonical change-history advancement.

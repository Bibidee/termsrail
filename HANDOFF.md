# TermsRail Handoff

## Production release

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`
- Deployment transaction: `0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`
- Deployed contract source SHA-256: `E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`
- Deployment receipt: FINALIZED, GenVM SUCCESS, consensus Accepted.

## Verification

- Direct Mode: 28 passed in hosted CI
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
- v2 deployment: NOT YET DEPLOYED. The accepted v1 contract remains the production deployment until v2 exact-head CI and live lifecycle proof are complete.
- Latest v2 predeployment source SHA-256: `FF50D595657ADC0B3DE06FD2F86C72ED11B9F8CC5BB293A131ADEBBB1401F86B`
- Latest v2 hosted CI: run `36068523511` passed on the exact predeployment checkpoint recorded by the current release.
- Deployment blocker: this environment has no GenLayer deployment CLI, funded signer, or deployment credentials; no v2 address or deployment transaction is claimed.

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

Reachable change states are `UNCHANGED`, `NON_MATERIAL_CHANGE`, `MATERIAL_CHANGE`, and `POLICY_UNAVAILABLE`. `UNKNOWN_CHANGE` is canonical/reserved but unreachable in the deployed implementation. Every loss of an explicit `ALLOWED` dimension, including `ALLOWED` to `NOT_ADDRESSED` or `UNKNOWN`, is a material change that invalidates the snapshot and its authorizations; the gate stays closed until snapshot rebuild and action reassessment. `check_policy_change` is verified by canonical change-history advancement.

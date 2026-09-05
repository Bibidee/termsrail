# TermsRail Handoff

## Production release

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`
- Deployment transaction: `0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`
- Deployed contract source SHA-256: `E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`
- Deployment receipt: FINALIZED, GenVM SUCCESS, consensus Accepted.

## Verification

- Direct Mode: 20 passed in hosted CI
- GenVM lint: PASS
- Frontend tests: 23 passed
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Exact-head CI: PASS (see GitHub Actions history for the release commit)

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

Reachable change states are `UNCHANGED`, `NON_MATERIAL_CHANGE`, `MATERIAL_CHANGE`, and `POLICY_UNAVAILABLE`. `UNKNOWN_CHANGE` is canonical/reserved but unreachable in the deployed implementation. Every loss of an explicit `ALLOWED` dimension, including `ALLOWED` to `NOT_ADDRESSED` or `UNKNOWN`, is a material change that invalidates the snapshot and its authorizations; the gate stays closed until snapshot rebuild and action reassessment. `check_policy_change` is verified by canonical change-history advancement.

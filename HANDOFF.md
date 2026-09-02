# TermsRail Handoff

## Production release

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0xd4FB52094c1DED0Ca71fc29D6E85Eff8E9089a8A`
- Deployment transaction: `0x9426e572331f1f70f68f3ffe1b0cdc23b73a0e6abea18c7978bc7476cd2131f5`
- Frozen contract source SHA-256: `B16AA5E274651C5EF9FA1C582CC2E8E7F7BAFDE1FC786ED2955B72C52DCA614C`
- Contract source was not changed or redeployed.

## Verification

- Direct Mode: 18 passed in hosted CI
- GenVM lint: PASS
- Frontend tests: 12 passed
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Exact-head CI: PASS (see GitHub Actions history for the release commit)

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

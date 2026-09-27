# TermsRail Handoff

## Previous production release (v3 custody-enabled)

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0x1Bdd534a9db2519F130462ea8666B25cB5764C4b`
- Deployment transaction: `0x7707579237eb0befcc020d859be045c71c5a9af68fa24cccdfe8b13242bf6929`
- Deployed contract source SHA-256: `AFAAC5B2ED46F080C28858CC324A3B0E0B1949BF50D1E599B5A8FBB58BF22E85`
- Deployment receipt: FINALIZED, GenVM SUCCESS, consensus Accepted.

## Reviewed escrow-fix deployment (production)

- Network: Studionet, chain 61999
- Contract: `0x561016E2bA38513ee3e4CCb39aAad454fDE30Ffd`
- Deployment transaction: `0x0717b3f11046711e699ab2cf4dae5c1149dcde7122e24f1f0ff5626e6856e0dd`
- Deployer: `0x2cd419603eBa593074653930Ddc4073d4FD8fc60` (`fresh-bob`)
- Receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`
- Source SHA-256: `86C335677C486B24D4F9BF80D54D287AC51A3742B0C729EBDC19379DADAD5812`
- Production frontend: `https://termsrail.vercel.app` (latest Vercel deployment `dpl_2uzgEHou9oJCoFn4njDZyqU5qrZ5`, Ready; deployment URL `https://termsrail-3q8lmcud8-bibidees-projects.vercel.app`). This release explicitly explains that the copied demo service is `NEEDS_SNAPSHOT` and links users to register a service with a real public source. Production `NEXT_PUBLIC_CONTRACT_ADDRESS` points to this contract; the production bundle was verified to contain the new address.
- Migration: old contract retained unchanged. The service at old ID `0` was re-registered at new ID `0` (tx `0x231a7193dc773e5badfe07dc70e5756ba7788cae345c02550b46b558e078a78f`). Actions, plans, receipts, escrows, and custody were not migrated; the new escrow list and custody balance are both zero.
- Snapshot tx `0xd7f9fba92a02b4c6ab980acb4fac59ab60c4c6559226a890fdc29a1d29466464` ended `UNDETERMINED` after four rounds. The copied demo service therefore remains `NEEDS_SNAPSHOT` (policy version 0); do not treat it as an active authorization basis. Retry only with valid source evidence and accepted consensus.
- Production build and aliasing succeeded after `.vercelignore` excluded local test/cache artifacts. Read-only verification returned HTTP 200 for the production home and `/escrow`, and `/api/version` reported production environment. The live escrow page now explains the creation/funding prerequisites and the missing accepted snapshot.

## Accepted v1 deployment (untouched)

- Contract: `0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`
- Deployment transaction: `0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`
- Deployed contract source SHA-256: `E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`

## Verification

- Direct Mode: 31 passed for the deployed contract source
- GenVM lint: static contract checks passed; SDK validation could not run in the current Windows environment because shared-cache access was denied
- Frontend tests: 29 passed
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Custody recovery: `resolve_dispute_choice(did, RELEASE|REFUND)` provides an explicit bounded resolution when dispute consensus returns `OTHER`.
- Exact-head CI: PASS (see GitHub Actions history for the release commit)

## Milestone adjudication correction round

- The accepted V1 boundary remains `510e0e2fae`; the custody milestone and this correction round are separate work.
- Completion adjudication preserves the submitted manifest, fetches bounded evidence, records explicit unavailable/mismatch/oversized states, and requires meaningful leader/validator semantic agreement rather than enum-only validation.
- Dispute evidence is append-only and records `submission_id`, wallet, deterministic party role, statement, references and timestamp. Payer and recipient evidence are both included in adjudication.
- Each escrow now carries one canonical settlement outcome for its current cycle. Historical verdicts cannot authorize opposing destinations. A finalized RELEASE always transfers to the recipient; a finalized REFUND always transfers to the payer; either relevant party may trigger an already-authorized outcome, and a second settlement is rejected.
- Optional plan steps remain in receipts but do not block a plan; required steps continue to gate it. Policy change, plan hash, source/policy version and authorization identity checks remain mandatory.
- Local correction validation: 34 Direct Mode tests pass with a Windows stdin-unlink workaround; frontend tests and static lint are run separately. The corrected contract has not been redeployed from this worktree, so no live correction-round result is claimed.
- Local corrected contract source SHA-256: `0DB6BAB48A493AD0B74630191185DC08C0EC6330C791C215DA41773EBCD7CC85` (not the deployed SHA; deployment remains pending final review/CI).

## v3 custody checkpoint

- Current frontend/contract checkpoint: inspect `git log -1` (HEAD is intentionally not embedded here).
- Agent Plans: bounded multi-step creation, policy-bound authorization, stale invalidation, reassessment and receipts implemented.
- Escrow: plan-bound state machine with payable GEN funding. `fund_escrow` requires `gl.message.value` to equal the declared amount and records custody as `HELD`. Guarded release/refund and dispute resolution emit external transfers to the recipient or payer, then record `TRANSFER_QUEUED` settlement state. The custody balance is the contract's canonical payable balance; no frontend placeholder balance is used.
- Frontend routes: `/plans`, `/plans/new`, `/plans/[id]`, `/escrow`, `/escrow/new`, `/escrow/[id]`, `/receipts`, `/receipts/[id]`, `/activity`.
- v3 deployment: FINALIZED on Studionet at the custody-enabled address above; v1 and the prior logical v2 deployment remain untouched.
- v3 source SHA-256: `AFAAC5B2ED46F080C28858CC324A3B0E0B1949BF50D1E599B5A8FBB58BF22E85`.
- Hosted CI: the exact final main commit is green; use the GitHub Actions run attached to the commit for the run ID.

## Frontend safeguards

The UI validates the contract address at runtime, uses canonical service fields, restores wallets passively with `eth_accounts`, keeps wallet account separate from contract target, verifies finalized execution plus canonical readback, and routes newly registered actions/services to their canonical IDs. Registry lookup paginates until the requested key is found.

Reachable change states are `UNCHANGED`, `NON_MATERIAL_CHANGE`, `MATERIAL_CHANGE`, and `POLICY_UNAVAILABLE`. `UNKNOWN_CHANGE` is canonical/reserved but unreachable in the deployed implementation. Every loss of an explicit `ALLOWED` dimension, including `ALLOWED` to `NOT_ADDRESSED` or `UNKNOWN`, is a material change that invalidates the snapshot and its authorizations; the gate stays closed until snapshot rebuild and action reassessment. `check_policy_change` is verified by canonical change-history advancement.

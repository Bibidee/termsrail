# TermsRail Handoff

## Current audited release

- Frontend source: see `git log -1` for the exact release HEAD (this document intentionally avoids a self-invalidating literal HEAD claim).
- Frontend: https://termsrail.vercel.app
- Production Vercel deployment: Ready at `https://termsrail-5om5sai3z-bibidees-projects.vercel.app`, aliased to `https://termsrail.vercel.app`.
- Public production build check: the production alias serves the corrected contract target and the escrow release state; `/api/version` reports `environment: production` (the direct CLI deployment has no Git commit metadata).
- Production bundle uses `NEXT_PUBLIC_CONTRACT_ADDRESS=0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0`.
- Current audited Studionet contract: `0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0`.
- Deployment transaction: `0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c`.
- Deployer: `0x865e118a3be4FA0760775565fCd31be156e1e3d7` (`signalbond-challenger-unlocked`).
- Contract receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`.
- Deployed contract source SHA-256: `EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`.
- No records or custody were migrated from prior deployments.
- Exact-head hosted CI: PASS, run `37077555789`, https://github.com/Bibidee/termsrail/actions/runs/37077555789 (HEAD `b4e8fabc51435e553cce096a7322d0c6e094e6ca`). Production `/api/version` reports the same SHA.
- Current live non-financial proofs on the prior registry remain historical and are not presented as records on this fresh deployment.
- Fresh live release proof on escrow `3`: create `0x7c135d6ee0920b06bb379abc2365a25b24d94ad3c7ff54cc6fc3b95f01ba0a38`, fund `0x20ad41066749e3fa6db244547e0bdaa275145186523a5c3678001a8e872bb474`, lock `0x4b0f65bb818a6c88e63c13e4f47b6ef53fb25d09c8d7659c0cfd658e3866008a`, completion evidence `0x6e3684271d13a696948a91df551cc9daa3aca479d511bf3cfe3f3776dfbba3a7`, completion adjudication `0x52064de1fc7f817c5b1aef45cefb34cc943d28d38b83cd3ec79634b473d3a66a`, and final release `0xc39b48416e43cbba164c0825dc5cb92dc7171963a18b17332357b5995df41ca3`. Final canonical state is `RELEASED`, `TRANSFER_QUEUED`, `RELEASE_TO_RECIPIENT` on the current contract.
- Fresh challenge-reversal/refund proof on escrow `4`: create `0x0b7f051c98fa7692e06ae9240a8de8285bb3122a12be4a18b8c822085611c9ff`, lock `0xb6b9ef0a8290be70f2a0689ac6ceea60c73a7e564cd0c52fa044e443b4fa1dbd`, recipient dispute evidence `0x84a492d9ee4e58d8ae0b00e3df25c513315da34aa05cdc3d1185956aaa705e03`, dispute adjudication `0x3f558b6f3801831661624adc71459c2028e12b997da4be4b6c449c1e49032807`, and canonical refund `0xe7f76366efd64b8788234ddba4854d7b292b57f129cbab49168a3b5c32692de3`. The two-party dispute reached `REFUND`; final canonical state is `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`, with challenge status `CHALLENGE_CLEARED` and custody balance reduced from `0.0002` to `0.0001 GEN`. Evidence used the pinned README SHA-256 `337dd72bde077c5a5f808c66f33b2aabd6e36cd466e12bc9379b9e0aa834ebc3` and package manifest SHA-256 `0db42d7ddd51d33861dcb1254f170d1268f57895d1837d066c7223416f53dbeb`.

## Previous production release (v3 custody-enabled)

- Frontend release commit: see `git log -1` (documentation intentionally avoids embedding a self-invalidating HEAD).
- Frontend: https://termsrail.vercel.app
- Contract: `0x1Bdd534a9db2519F130462ea8666B25cB5764C4b`
- Deployment transaction: `0x7707579237eb0befcc020d859be045c71c5a9af68fa24cccdfe8b13242bf6929`
- Deployed contract source SHA-256: `AFAAC5B2ED46F080C28858CC324A3B0E0B1949BF50D1E599B5A8FBB58BF22E85`
- Deployment receipt: FINALIZED, GenVM SUCCESS, consensus Accepted.

## Previous correction deployment (retained)

- Network: Studionet, chain 61999
- Contract: `0x3D03382e2BEc45c34a67b00A82329F576A32B826`
- Deployment transaction: `0x2c0273bad0b54c9340eee702fd8cddce65178df39fdf4e255d3c7f022a00106f`
- Deployer: `0x2cd419603eBa593074653930Ddc4073d4FD8fc60` (`fresh-bob`)
- Receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`
- Source SHA-256: `0DB6BAB48A493AD0B74630191185DC08C0EC6330C791C215DA41773EBCD7CC85`
- Production frontend: `https://termsrail.vercel.app` (deployment `dpl_3x9CJExs2EpUYGMAGWawF6E9gQx8`, Ready). Production `NEXT_PUBLIC_CONTRACT_ADDRESS` points to the current contract above.
- Migration: previous contracts retained unchanged. No service, action, plan, receipt, escrow or custody records were migrated; the new registry starts empty.
- Snapshot tx `0xd7f9fba92a02b4c6ab980acb4fac59ab60c4c6559226a890fdc29a1d29466464` ended `UNDETERMINED` after four rounds. The copied demo service therefore remains `NEEDS_SNAPSHOT` (policy version 0); do not treat it as an active authorization basis. Retry only with valid source evidence and accepted consensus.
- Production build and aliasing succeeded after `.vercelignore` excluded local test/cache artifacts. Read-only verification returned HTTP 200 for the production home and `/escrow`, and `/api/version` reported production environment. The live escrow page now explains the creation/funding prerequisites and the missing accepted snapshot.

## Previous custody deployment (retained)

- Network: Studionet, chain 61999
- Contract: `0x744102f8f1C89a7568c135f3cbB650f6995e1599`
- Deployment transaction: `0x8c9f87d938a89d0a4d8067d746c045b25d5f65ff36a7aaf73ff64df2dd9a34ba`
- Deployer: `0x2cd419603eBa593074653930Ddc4073d4FD8fc60` (`fresh-bob`)
- Receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`
- Source SHA-256: `1A6FC43EECA117CE5A4B7089C53F76C8602217D03492CF2CEEF74F0CFF2E9753`
- Migration: previous registries remain deployed and untouched; no records or custody were migrated.

## Current audited deployment (historical duplicate of the release above)

- Network: Studionet, chain 61999
- Contract: `0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b`
- Deployment transaction: `0x880d4b609cf0a4bd234b47134a4047c09c7d1f7929cddc05a64bfb9acecaf537`
- Deployer: `0x865e118a3be4FA0760775565fCd31be156e1e3d7` (`signalbond-challenger-unlocked`)
- Receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`
- Source SHA-256: `11089B067E86575558EC3F59775DBA096DE3D691226CBF497A482152648D9C20`
- Migration: the prior custody deployment remains untouched; the new registry starts empty.

## Accepted v1 deployment (untouched)

- Contract: `0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`
- Deployment transaction: `0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`
- Deployed contract source SHA-256: `E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`

## Verification for the current audited release

- Direct Mode/security: 52 passed for the deployed contract source
- GenVM lint: `✓ Lint passed (3 checks)`
- Frontend tests: 36 passed (6 files)
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Custody recovery: when dispute consensus returns `OTHER`, the payer proposes `RELEASE` or `REFUND` with `resolve_dispute_choice`; the recipient must accept the identical bounded choice with `accept_dispute_choice` before custody moves. The proposal is stored with a 900-second deadline; if the recipient does not respond, anyone may call `resolve_expired_dispute_proposal` and custody deterministically refunds to the payer. The fallback never releases to a silent recipient and cannot be replayed after settlement.
- Exact-head CI: PASS, run `37077555789`, https://github.com/Bibidee/termsrail/actions/runs/37077555789 (HEAD `b4e8fabc51435e553cce096a7322d0c6e094e6ca`).

## Milestone adjudication correction round

- The accepted V1 boundary remains `510e0e2fae`; the custody milestone and this correction round are separate work.
- Completion adjudication preserves the submitted manifest, fetches bounded evidence, records explicit unavailable/mismatch/oversized states, and requires meaningful leader/validator semantic agreement rather than enum-only validation.
- Dispute evidence is append-only and records `submission_id`, wallet, deterministic party role, statement, references and timestamp. Payer and recipient evidence are both included in adjudication.
- Each escrow now carries one canonical settlement outcome for its current cycle. Historical verdicts cannot authorize opposing destinations. A finalized RELEASE always transfers to the recipient; a finalized REFUND always transfers to the payer; an `OTHER` recovery requires an explicit payer proposal plus matching recipient acceptance, and a second settlement is rejected.
- Optional plan steps remain in receipts but do not block a plan; required steps continue to gate it. Policy change, plan hash, source/policy version and authorization identity checks remain mandatory.
- Final correction validation: 36 Direct Mode tests and 34 frontend tests pass; typecheck, ESLint and build pass. GenVM static and SDK validation pass. Hosted CI run `36625413972` passed on exact HEAD `a9256af9baf3131cef09428617862059c8fb38b7`.
- Audited contract source SHA-256: `11089B067E86575558EC3F59775DBA096DE3D691226CBF497A482152648D9C20` (historical deployment; current SHA is recorded above).

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

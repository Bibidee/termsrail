# TermsRail Handoff

## Current audited release

- Frontend source: see `git log -1` for the exact release HEAD (this document intentionally avoids a self-invalidating literal HEAD claim).
- Frontend: https://termsrail.vercel.app
- Production Vercel deployment: the frontend-only correction is Ready at `https://termsrail-gm58xv02l-bibidees-projects.vercel.app`, aliased to `https://termsrail.vercel.app`.
- Public production build check: the production alias serves the corrected contract target and the escrow release state; `/api/version` reports `environment: production` (the direct CLI deployment has no Git commit metadata).
- Production bundle uses `NEXT_PUBLIC_CONTRACT_ADDRESS=0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b`.
- Current audited Studionet contract: `0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b`.
- Deployment transaction: `0x880d4b609cf0a4bd234b47134a4047c09c7d1f7929cddc05a64bfb9acecaf537`.
- Deployer: `0x865e118a3be4FA0760775565fCd31be156e1e3d7` (`signalbond-challenger-unlocked`).
- Contract receipt: FINALIZED, GenVM SUCCESS, consensus `MAJORITY_AGREE`.
- Deployed contract source SHA-256: `11089B067E86575558EC3F59775DBA096DE3D691226CBF497A482152648D9C20`.
- No records or custody were migrated from prior deployments.
- Hosted CI and final frontend deployment are release gates; the exact successful run and production deployment are recorded with the final release report rather than duplicated as mutable values here.
- Current live non-financial proofs on the prior registry remain historical and are not presented as records on this fresh deployment.
- Fresh live refund proof on escrow `1`: create `0x2fe1e7508643f953d6b57f4e53aaccf2018626bad2fe4a94f39d47f52e1d0a43`, fund `0x2f67aa4b6d2121855eab45cd4d04292b9f28f8ecf9f1bca13ae6f323b8837a3d`, lock `0x4fe70b955d280a427060e1777775c193cc97c5477e77f06775bce2fb9b9b9066`, completion evidence `0x005912910363337be7f78fff433cac066f5e47ccece8a3e2eda87be48e916599`, completion adjudication `0x2613e9cb8eb7e2f35f20a09750235ac7b1e43c472cb7667efcb5453f16f3aa28`, followed by a two-party `OTHER` refund proposal/acceptance. Final canonical state was `RESOLVED_REFUND`, `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`, with custody balance `0`.
- Fresh live release proof on escrow `3`: corrected acceptance artifact commit `9a01b12`, payer evidence append `0xcf3e44f8f8062a1bdea3a55b617d11622951165fab6c3f43b2d4b6ea16784366`, recipient evidence append `0xb056a4f38017a3945bed369712523fd46fe5070140b1139ea29337802c5a084f`, dispute adjudication `0x5199cdd1baf92f968ccec59db66dc7ab72d6c31efb84b036703ce875ee6da16c`, and final release `0xe23ac901c45e66af6f9f258c769f252eec2f5bf2136353fd9dbe857837896254`. The release finalized with GenVM `SUCCESS` on the current contract. Final canonical state is `RELEASED`, `TRANSFER_QUEUED`, `RELEASE_TO_RECIPIENT`; custody balance decreased from `0.004` to `0.003 GEN` and the recipient is `0x4A7D76b8C4668a3426d6d54eC24b41Fa87b532f5`.

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
- Production frontend: `https://termsrail.vercel.app` (latest Vercel deployment `dpl_2uzgEHou9oJCoFn4njDZyqU5qrZ5`, Ready; deployment URL `https://termsrail-3q8lmcud8-bibidees-projects.vercel.app`). This release explicitly explains that the copied demo service is `NEEDS_SNAPSHOT` and links users to register a service with a real public source. Production `NEXT_PUBLIC_CONTRACT_ADDRESS` points to this contract; the production bundle was verified to contain the new address.
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

- Direct Mode: 39 passed for the deployed contract source
- GenVM lint: `✓ Lint passed (3 checks)`
- Frontend tests: 36 passed (6 files)
- Typecheck: PASS
- ESLint: 0 errors, 0 warnings
- Production build: PASS
- Custody recovery: when dispute consensus returns `OTHER`, the payer proposes `RELEASE` or `REFUND` with `resolve_dispute_choice`; the recipient must accept the identical bounded choice with `accept_dispute_choice` before custody moves. The proposal is stored with a 900-second deadline; if the recipient does not respond, anyone may call `resolve_expired_dispute_proposal` and custody deterministically refunds to the payer. The fallback never releases to a silent recipient and cannot be replayed after settlement.
- Exact-head CI: PASS, run `36696834126`, https://github.com/Bibidee/termsrail/actions/runs/36696834126 (HEAD `05685b4be3ed524f818e118bf6ec049a04441de2`)

## Milestone adjudication correction round

- The accepted V1 boundary remains `510e0e2fae`; the custody milestone and this correction round are separate work.
- Completion adjudication preserves the submitted manifest, fetches bounded evidence, records explicit unavailable/mismatch/oversized states, and requires meaningful leader/validator semantic agreement rather than enum-only validation.
- Dispute evidence is append-only and records `submission_id`, wallet, deterministic party role, statement, references and timestamp. Payer and recipient evidence are both included in adjudication.
- Each escrow now carries one canonical settlement outcome for its current cycle. Historical verdicts cannot authorize opposing destinations. A finalized RELEASE always transfers to the recipient; a finalized REFUND always transfers to the payer; an `OTHER` recovery requires an explicit payer proposal plus matching recipient acceptance, and a second settlement is rejected.
- Optional plan steps remain in receipts but do not block a plan; required steps continue to gate it. Policy change, plan hash, source/policy version and authorization identity checks remain mandatory.
- Final correction validation: 36 Direct Mode tests and 34 frontend tests pass; typecheck, ESLint and build pass. GenVM static and SDK validation pass. Hosted CI run `36625413972` passed on exact HEAD `a9256af9baf3131cef09428617862059c8fb38b7`.
- Audited contract source SHA-256: `11089B067E86575558EC3F59775DBA096DE3D691226CBF497A482152648D9C20`.

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

# TERMSRAIL

Live frontend: https://termsrail.vercel.app  
Latest reviewed contract: `0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b` (Studionet, chain 61999). Deployment transaction: `0x880d4b609cf0a4bd234b47134a4047c09c7d1f7929cddc05a64bfb9acecaf537`. Source SHA-256: `11089B067E86575558EC3F59775DBA096DE3D691226CBF497A482152648D9C20`. This is a fresh deployment; prior service, action, plan, receipt, escrow and custody records were not migrated.

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. Policy snapshot extraction and material policy-change detection use semantic consensus; structured action authorization is deterministic derivation over the accepted snapshot.

## Escrow correction status

The current custody-enabled contract is deployed at `0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b`. It adds immutable funding snapshots, escrow deadlines independent of policy-authorization expiry, bounded dispute response windows, method-specific canonical readbacks, strict finalized-execution sequencing, and a two-party `OTHER` dispute recovery handshake with a 15-minute proposal deadline and deterministic timeout refund to the payer. The previous custody deployment `0x9Ce1b913C40e4F766ed816F05911D341Dd00aa1E` and earlier registries remain deployed and untouched; records and custody are not migrated automatically.

## Milestone correction state machine

The accepted V1 boundary is commit `510e0e2fae`. The milestone adds policy-bound Agent Plans, authorization receipts, payable GEN custody, bounded completion evidence, dispute adjudication and canonical settlement. Completion and dispute submissions retain their bounded manifests, submitting wallet and party role. Validators independently fetch the same bounded references and treat every statement, metadata field and fetched body as untrusted evidence; prompt injection cannot alter the protocol or output schema. Hash mismatches, unavailable, malformed and oversized evidence fail closed and are reported explicitly.

Each escrow has one canonical `settlement_outcome` for its current cycle. A `COMPLETED` adjudication authorizes `RELEASE`; a `NOT_COMPLETED` adjudication authorizes `REFUND`; insufficient or `OTHER` evidence leaves settlement unresolved until the explicit bounded recovery path is used. Historical or superseded verdicts cannot unlock opposing outcomes. For `OTHER`, the payer may propose RELEASE or REFUND, but the recipient must accept the same bounded choice before custody moves; no unilateral party can redirect funds. Policy-version, source-version, plan-hash and authorization-identity checks remain mandatory, and material policy changes freeze funded custody until reassessment and rebinding.

Optional plan steps remain visible in authorization receipts but do not block an otherwise valid plan; required steps continue to gate execution. The frontend labels evidence submission, adjudication, unresolved outcomes, canonical settlement, policy freezes and stale/superseded state separately. Settlement is real payable GEN custody on the deployed contract. The frontend never substitutes a placeholder balance for canonical custody.

## v3 policy-gated commerce with GEN custody

Agent Plans bind bounded multi-step actions to a plan hash, policy/source versions and append-only authorization receipts. Escrow records bind payer, recipient and amount to an executable plan; unsafe policy changes stale authorizations and freeze funded escrows before settlement. Funding is a payable GEN deposit equal to the declared amount. Completion evidence is bounded and adjudicated into normalized verdicts before guarded release/refund or dispute handling; release/refund emit finalized external GEN transfers and mark the canonical transfer as queued. The v3 UI exposes canonical Plans, Escrow, Receipts and Activity routes, including custody balance, funding, completion/dispute evidence and settlement controls, while preserving finalized transaction verification.

## Run

```bash
npm install
npm run dev
```

The frontend targets Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`). The current verified deployment is configured in `.env.example`; copy it to `.env.local` for local use. Empty chain state is rendered as empty; the UI never fabricates production records.

## Contract

`contracts/termsrail.py` contains service/source registration, URL hardening, per-source/per-dimension evidence states, append-only histories, bounded observations from `gl.nondet.web.render`, deterministic verdict precedence, change invalidation, TTL checks and the fail-closed `is_action_authorized` gate. Losing an explicit `ALLOWED` dimension—including a transition to `NOT_ADDRESSED` or `UNKNOWN`—is material: it invalidates the current snapshot and prior authorizations until a new snapshot is built and the action is reassessed.

Dispute consensus is bounded to `RELEASE`, `REFUND`, or `OTHER`. An `OTHER` verdict never moves funds automatically: the payer proposes one of the two bounded outcomes with `resolve_dispute_choice`, then the recipient must accept the identical proposal with `accept_dispute_choice` before settlement.

## Verification

```bash
npm ci
npm run typecheck
npm test
npm run lint
npm run build
python -m pytest -q tests/test_contract_direct.py
genvm-lint check contracts/termsrail.py
```

The reviewed contract and production frontend cutover are deployed on Studionet/Vercel; exact receipts and current status are recorded in `HANDOFF.md`. Snapshot consensus uses independent semantic validation and fails closed when source evidence is unavailable. Earlier contracts remain deployed and untouched.

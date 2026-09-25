# TERMSRAIL

Live frontend: https://termsrail.vercel.app  
Studionet v3 contract: `0xd689F01a5A68B1B5320757F49139EeB13f9BAB2e` (chain 61999). Deployment transaction: `0xc5d52299c76135040aab739acae0eea6b5e58aac74656ad9f5518177847ae683`.

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. Policy snapshot extraction and material policy-change detection use semantic consensus; structured action authorization is deterministic derivation over the accepted snapshot.

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

The live CLI validation and v2 deployment were run on Studionet with the unlocked `fresh-bob` account. Snapshot consensus now uses independent semantic validation and fails closed when source evidence is unavailable; exact receipts are recorded in `HANDOFF.md`. The accepted v1 deployment remains documented there as the prior deployment and was not modified.

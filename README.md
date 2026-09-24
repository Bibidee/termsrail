# TERMSRAIL

Live frontend: https://termsrail.vercel.app  
Studionet v2 contract: `0xcbC2eD344cb21dB2Dc0E7a4C22C67BF350F037dF` (chain 61999). Deployment transaction: `0xb8945e4a147f7ffe72114be0ba21838b9cd753c2f64a6b0915c58becb81d5f34`.

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. Policy snapshot extraction and material policy-change detection use semantic consensus; structured action authorization is deterministic derivation over the accepted snapshot.

## v2 policy-gated commerce

Agent Plans bind bounded multi-step actions to a plan hash, policy/source versions and append-only authorization receipts. Escrow records bind payer, recipient and amount to an executable plan; unsafe policy changes stale authorizations and freeze funded escrows before settlement. Completion evidence is bounded and adjudicated into normalized verdicts before guarded release/refund or dispute handling. Escrow is currently a logical, policy-gated state machine and does not custody or transfer GEN. The v2 UI exposes canonical Plans, Escrow, Receipts and Activity routes, including completion/dispute evidence controls, while preserving finalized transaction verification.

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

# TERMSRAIL

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. It keeps three consensus paths distinct: policy snapshot extraction, structured action authorization, and material policy-change detection.

## Run

```bash
npm install
npm run dev
```

The frontend targets Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`). The current verified deployment is configured in `.env.example`; copy it to `.env.local` for local use. Empty chain state is rendered as empty; the UI never fabricates production records.

## Contract

`contracts/termsrail.py` contains service/source registration, URL hardening, source and policy versioning, append-only histories, bounded observations from `gl.nondet.web.render`, deterministic verdict precedence, change invalidation, TTL checks and the fail-closed `is_action_authorized` gate.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

The live CLI validation, schema retrieval, deployment and service writes were run on Studionet with the unlocked `faultline-dev` account. Snapshot consensus now uses independent semantic validation and fails closed when source evidence is unavailable; exact receipts are recorded in `HANDOFF.md`.

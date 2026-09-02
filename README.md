# TERMSRAIL

Live frontend: https://termsrail.vercel.app  
Studionet contract: `0xd4FB52094c1DED0Ca71fc29D6E85Eff8E9089a8A` (chain 61999). The current repository HEAD may be newer than the frozen contract source because frontend-only releases do not redeploy the contract.

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. Policy snapshot extraction and material policy-change detection use semantic consensus; structured action authorization is deterministic derivation over the accepted snapshot.

## Run

```bash
npm install
npm run dev
```

The frontend targets Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`). The current verified deployment is configured in `.env.example`; copy it to `.env.local` for local use. Empty chain state is rendered as empty; the UI never fabricates production records.

## Contract

`contracts/termsrail.py` contains service/source registration, URL hardening, per-source/per-dimension evidence states, append-only histories, bounded observations from `gl.nondet.web.render`, deterministic verdict precedence, change invalidation, TTL checks and the fail-closed `is_action_authorized` gate.

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

The live CLI validation, schema retrieval, deployment and service writes were run on Studionet with the unlocked `faultline-dev` account. Snapshot consensus now uses independent semantic validation and fails closed when source evidence is unavailable; exact receipts are recorded in `HANDOFF.md`.

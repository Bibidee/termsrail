# TERMSRAIL

TermsRail is a Next.js dApp and GenLayer Intelligent Contract for consensus-backed policy execution gates. It keeps three consensus paths distinct: policy snapshot extraction, structured action authorization, and material policy-change detection.

## Run

```bash
npm install
npm run dev
```

The frontend targets Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`). Set a deployed contract address in the integration layer before connecting a wallet. Empty chain state is rendered as empty; the UI never fabricates production records.

## Contract

`contracts/termsrail.py` contains service/source registration, URL hardening, source and policy versioning, append-only histories, bounded observations from `gl.nondet.web.render`, deterministic verdict precedence, change invalidation, TTL checks and the fail-closed `is_action_authorized` gate.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

GenLayer lint, schema generation, Studionet deployment and live transaction evidence require the GenLayer CLI/runtime and a funded injected wallet; neither is present in this workspace, so no addresses or hashes are invented.

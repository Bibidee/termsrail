# TERMSRAIL — Test & Live Proof

## Current challenge-state security deployment

Current Studionet contract: `0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0`.

Deployment transaction: `0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c`.

Deployed source SHA-256: `EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`.

The deployment finalized successfully with consensus `MAJORITY_AGREE` and successful GenVM execution. It is a fresh registry; prior records and custody were not migrated.

## Automated verification

The current release gate runs:

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run check:deployment
python -m pytest -q tests/test_contract_direct.py tests/test_contract_security.py
genvm-lint check contracts/termsrail.py
npm run typecheck
npm run lint
npm test
npm run build
```

Current expected coverage includes:

- 52 Direct Mode/security tests covering service/source bounds, snapshot failure, action invariants, plan authorization, immutable milestone criteria, challenge reversal, bounded `OTHER` recovery, custody recovery and terminal settlement guards.
- Frontend tests covering wallet/network handling, finalized execution verification, canonical readback, escrow settlement controls, transaction-hash persistence, explorer links and superseded provisional-outcome labeling.
- Production dependency audit enforced as a CI release gate.

Use the latest successful GitHub Actions run attached to the current release HEAD as the authoritative CI record. This file intentionally avoids embedding a literal run/SHA pair that becomes stale after documentation-only commits.

## Settlement model

```text
FUNDED / LOCKED
  → completion evidence
  → completion adjudication
  → provisional RELEASE or REFUND
  → challenge window
     ├─ unchallenged → canonical settlement
     └─ challenged → dispute adjudication
                       ├─ RELEASE
                       ├─ REFUND
                       └─ OTHER → bounded recovery
  → TRANSFER_QUEUED
  → RELEASED or REFUNDED
```

`provisional_outcome` is distinct from final `settlement_outcome`. A challenge can reverse the provisional direction. `OTHER` never moves funds automatically; it uses the bounded proposal/acceptance path or timeout refund. Settlement of already-held custody is governed by the immutable funding snapshot and canonical outcome.

## Current live verified custody proofs

### Escrow 3 — release

- Create: `0x7c135d6ee0920b06bb379abc2365a25b24d94ad3c7ff54cc6fc3b95f01ba0a38`
- Fund: `0x20ad41066749e3fa6db244547e0bdaa275145186523a5c3678001a8e872bb474`
- Lock: `0x4b0f65bb818a6c88e63c13e4f47b6ef53fb25d09c8d7659c0cfd658e3866008a`
- Completion evidence: `0x6e3684271d13a696948a91df551cc9daa3aca479d511bf3cfe3f3776dfbba3a7`
- Completion adjudication: `0x52064de1fc7f817c5b1aef45cefb34cc943d28d38b83cd3ec79634b473d3a66a`
- Final release: `0xc39b48416e43cbba164c0825dc5cb92dc7171963a18b17332357b5995df41ca3`
- Canonical final state: `RELEASED`, `TRANSFER_QUEUED`, `RELEASE_TO_RECIPIENT`

### Escrow 4 — challenge reversal / refund

- Create: `0x0b7f051c98fa7692e06ae9240a8de8285bb3122a12be4a18b8c822085611c9ff`
- Lock: `0xb6b9ef0a8290be70f2a0689ac6ceea60c73a7e564cd0c52fa044e443b4fa1dbd`
- Recipient dispute evidence: `0x84a492d9ee4e58d8ae0b00e3df25c513315da34aa05cdc3d1185956aaa705e03`
- Dispute adjudication: `0x3f558b6f3801831661624adc71459c2028e12b997da4be4b6c449c1e49032807`
- Canonical refund: `0xe7f76366efd64b8788234ddba4854d7b292b57f129cbab49168a3b5c32692de3`
- Verdict: `REFUND`
- Canonical final state: `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`, `CHALLENGE_CLEARED`
- Evidence SHA-256: README `337dd72bde077c5a5f808c66f33b2aabd6e36cd466e12bc9379b9e0aa834ebc3`; package manifest `0db42d7ddd51d33861dcb1254f170d1268f57895d1837d066c7223416f53dbeb`

## Historical proofs

Older custody proofs remain valid historical evidence for their original deployments but are not presented as current-deployment proof. The previous pre-challenge v4 contract was `0x6a1023185e64Ae635EC9474AaF1360E89A845541`; older release/refund transaction chains remain documented in repository history.

## Handoff evidence

For submission, record the repository HEAD, current source SHA, current contract, deployment transaction, current successful CI run, production frontend, release proof, challenge-reversal/refund proof, automated verification counts and known limitations. Current deployment configuration must remain internally consistent across `.env.example`, `lib/genlayer.ts`, README and HANDOFF.

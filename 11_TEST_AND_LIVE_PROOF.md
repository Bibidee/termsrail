# TERMSRAIL — Test & Live Proof

## Current challenge-state security deployment

The current challenge-state source is deployed fresh to Studionet at `0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0` (deployment transaction `0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c`, source SHA-256 `EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`). The deployment finalized with status `7`, consensus `MAJORITY_AGREE`, and successful GenVM execution. Its registry starts empty; prior service, action, plan, receipt, escrow and custody records were not migrated.

## Previous v4 security deployment (historical pre-challenge build)

The prior v4 source was deployed fresh to Studionet at `0x6a1023185e64Ae635EC9474AaF1360E89A845541` (deployment transaction `0x17f5acc957d8c022ea125f1cb1709a67bf19abbd39f82ccd74023e075bd5fc0f`, source SHA-256 `2E3565C8C2CC8C3A63F1C46929EEEA762D2C755ABE3182AF665E10529936E99D`). This is a historical pre-challenge deployment. Its registry and custody remain untouched; the challenge-state source in the current repository requires a fresh deployment and fresh proofs.

## Contract tests
### Service/source
Valid registration, duplicate keys, source bounds, source-role mismatch, invalid/non-HTTPS/credential/private URLs, oversized fields, TTL bounds, permissions.

### Policy snapshot
Fixtures covering allowed, prohibited, restricted, conflict, not-addressed, insufficient evidence and prompt injection.

### Snapshot failure
Timeout, 500, empty render, model unavailable, malformed output, validator non-convergence. Verify no snapshot append/version bump/TTL extension.

## Milestone correction coverage

Completion and dispute adjudication now fetch only bounded HTTPS evidence, compare fetched bytes with the submitted SHA-256 manifest, and persist an explicit evidence state. Validators independently perform the same bounded assessment; statements and fetched content are untrusted data and cannot change protocol instructions. Direct Mode coverage includes unavailable and hostile evidence, append-only payer/recipient submissions, canonical settlement outcomes, non-payer settlement triggering, double-settlement guards, optional-step semantics, policy freezing/reassessment and receipt invalidation.

The settlement state machine is:

```text
FUNDED/LOCKED
  → evidence SUBMITTED
  → UNDER_REVIEW / DISPUTED
  → one canonical RELEASE or REFUND outcome
  → TRANSFER_QUEUED
  → RELEASED or REFUNDED
```

`OTHER`, insufficient or unverifiable evidence never authorizes a destination. It requires a bounded two-party recovery handshake: the payer proposes RELEASE or REFUND and the recipient must accept the identical choice before custody moves. The proposal deadline is persisted canonically for 900 seconds. If the recipient does not respond, `resolve_expired_dispute_proposal` deterministically refunds held custody to the payer; it cannot release to a silent recipient, replay after settlement, or overwrite a prior canonical outcome. New execution requires a current plan authorization; settlement of already-held custody is governed by the immutable funding snapshot and canonical settlement outcome.

### Actions
Valid structured action, duplicate action key, invalid enums, bounds, missing service.

### Authorization
All six verdicts. Test deterministic precedence, spec/policy/source binding and freshness.

### Change detection
UNCHANGED, NON_MATERIAL_CHANGE, MATERIAL_CHANGE, POLICY_UNAVAILABLE, UNKNOWN_CHANGE.

### Invalidation
Material change/source update closes gate but preserves history. Reassessment appends new authorization and leaves old history intact.

### Equivalence
Different prose with same categorical result should converge; ALLOWED vs PROHIBITED or material vs non-material must not.

### Capacity
Hard caps and pagination.

## Frontend tests
Provider missing, disconnected, wrong chain, switch chain, rejected tx, pending/finalised/readback mismatch, empty state, active/stale/conflict/change states and reassessment. Escrow UX covers matching RELEASE/REFUND acceptance controls, canonical proposal deadline/status, timeout-refund availability and terminal-state labels.

## Bounded `OTHER` recovery tests
Direct Mode covers cooperative release, cooperative refund, wrong outcome and third-party/payer acceptance rejection, active and expired proposal replay prevention, timeout refund, double-settlement rejection, and policy/authorization staleness while custody is held. The current source run is 52 passed across the Direct Mode and security suites.

## Real Studionet lifecycle
Required minimum:
1. deploy exact source
2. register service
3. build policy snapshot
4. register action
5. authorize action
6. verify gate
7. run policy change check
8. prove non-material or unchanged path
9. exercise controlled/legitimate material-change lifecycle where safely possible
10. rebuild snapshot
11. prove old authorization stale
12. reassess action
13. verify new gate
14. document all tx hashes

Also prove at least one fail-closed condition such as source-version invalidation, stale TTL, policy conflict or spec mismatch.

## Live verified custody proofs

### Historical refund path (escrow 1; superseded proof)

A prior deployment recorded a finalized refund proof: create `0x2fe1e7508643f953d6b57f4e53aaccf2018626bad2fe4a94f39d47f52e1d0a43`, fund `0x2f67aa4b6d2121855eab45cd4d04292b9f28f8ecf9f1bca13ae6f323b8837a3d`, lock `0x4fe70b955d280a427060e1777775c193cc97c5477e77f06775bce2fb9b9b9066`, submit evidence `0x005912910363337be7f78fff433cac066f5e47ccece8a3e2eda87be48e916599`, adjudicate `0x2613e9cb8eb7e2f35f20a09750235ac7b1e43c472cb7667efcb5453f16f3aa28`, then complete the two-party `OTHER` refund handshake. Canonical terminal state: `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`.

### Historical release path (escrow 3; superseded proof)

 A prior deployment recorded a finalized release proof. The corrected acceptance artifact was pinned to commit `9a01b12` with SHA-256 `67006A9DA1DE5F7BE3E80A66CAB493BE573DAEF419DE1CFA15DC447AA4AE7C1E`. Payer evidence append: `0xcf3e44f8f8062a1bdea3a55b617d11622951165fab6c3f43b2d4b6ea16784366`; recipient evidence append: `0xb056a4f38017a3945bed369712523fd46fe5070140b1139ea29337802c5a084f`; dispute adjudication: `0x5199cdd1baf92f968ccec59db66dc7ab72d6c31efb84b036703ce875ee6da16c` with verdict `RELEASE`; final release: `0xe23ac901c45e66af6f9f258c769f252eec2f5bf2136353fd9dbe857837896254`.

 Historical explorer verification: that prior release is `FINALIZED` with validator execution results `SUCCESS` on its then-current contract. It is not evidence for the current challenge-state deployment; use the current deployment proof below.

## HANDOFF evidence
Record repo, commit, source SHA, frontend, network, contract, explorer, deploy/service/snapshot/action/authorization/change/rebuild/reassessment/fail-closed txs, lint/schema/tests/typecheck/lint/build and limitations.

## Challenge-state live proof status

The current challenge-state source is deployed at `0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0` with deployment transaction `0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c` and source SHA-256 `EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`. The registry is intentionally fresh; prior records and custody were not migrated.

### Current deployment: release and challenge-reversal/refund proofs

- Escrow 3 release: create `0x7c135d6ee0920b06bb379abc2365a25b24d94ad3c7ff54cc6fc3b95f01ba0a38`, fund `0x20ad41066749e3fa6db244547e0bdaa275145186523a5c3678001a8e872bb474`, lock `0x4b0f65bb818a6c88e63c13e4f47b6ef53fb25d09c8d7659c0cfd658e3866008a`, completion evidence `0x6e3684271d13a696948a91df551cc9daa3aca479d511bf3cfe3f3776dfbba3a7`, completion adjudication `0x52064de1fc7f817c5b1aef45cefb34cc943d28d38b83cd3ec79634b473d3a66a`, final release `0xc39b48416e43cbba164c0825dc5cb92dc7171963a18b17332357b5995df41ca3`. Canonical terminal state: `RELEASED`, `TRANSFER_QUEUED`, `RELEASE_TO_RECIPIENT`.
- Escrow 4 challenge reversal/refund: create `0x0b7f051c98fa7692e06ae9240a8de8285bb3122a12be4a18b8c822085611c9ff`, lock `0xb6b9ef0a8290be70f2a0689ac6ceea60c73a7e564cd0c52fa044e443b4fa1dbd`, recipient dispute evidence `0x84a492d9ee4e58d8ae0b00e3df25c513315da34aa05cdc3d1185956aaa705e03`, dispute adjudication `0x3f558b6f3801831661624adc71459c2028e12b997da4be4b6c449c1e49032807`, canonical refund `0xe7f76366efd64b8788234ddba4854d7b292b57f129cbab49168a3b5c32692de3`. The dispute adjudicated `REFUND`; canonical terminal state is `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`, with `CHALLENGE_CLEARED` and custody reduced from `0.0002` to `0.0001 GEN`. Evidence artifacts were pinned by SHA-256: README `337dd72bde077c5a5f808c66f33b2aabd6e36cd466e12bc9379b9e0aa834ebc3`; package manifest `0db42d7ddd51d33861dcb1254f170d1268f57895d1837d066c7223416f53dbeb`.
- The frontend release is exact-head green: CI run `37077555789` passed for `b4e8fabc51435e553cce096a7322d0c6e094e6ca`; production `/api/version` reports the same SHA.

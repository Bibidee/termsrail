# TERMSRAIL — Test & Live Proof

## Current v4 security deployment

The revised source was deployed fresh to Studionet at `0x6a1023185e64Ae635EC9474AaF1360E89A845541` (deployment transaction `0x17f5acc957d8c022ea125f1cb1709a67bf19abbd39f82ccd74023e075bd5fc0f`, source SHA-256 `2E3565C8C2CC8C3A63F1C46929EEEA762D2C755ABE3182AF665E10529936E99D`). This registry starts empty; all older records and custody proofs below are historical and remain on their original contracts.

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
Direct Mode covers cooperative release, cooperative refund, wrong outcome and third-party/payer acceptance rejection, active and expired proposal replay prevention, timeout refund, double-settlement rejection, and policy/authorization staleness while custody is held. The current source run is 39 passed.

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

### Refund path (escrow 1)

The new deployment has a finalized refund proof: create `0x2fe1e7508643f953d6b57f4e53aaccf2018626bad2fe4a94f39d47f52e1d0a43`, fund `0x2f67aa4b6d2121855eab45cd4d04292b9f28f8ecf9f1bca13ae6f323b8837a3d`, lock `0x4fe70b955d280a427060e1777775c193cc97c5477e77f06775bce2fb9b9b9066`, submit evidence `0x005912910363337be7f78fff433cac066f5e47ccece8a3e2eda87be48e916599`, adjudicate `0x2613e9cb8eb7e2f35f20a09750235ac7b1e43c472cb7667efcb5453f16f3aa28`, then complete the two-party `OTHER` refund handshake. Canonical terminal state: `REFUNDED`, `TRANSFER_QUEUED`, `REFUND_TO_PAYER`.

### Release path (escrow 3)

The current deployment also has a finalized release proof. The corrected acceptance artifact is pinned to commit `9a01b12` with SHA-256 `67006A9DA1DE5F7BE3E80A66CAB493BE573DAEF419DE1CFA15DC447AA4AE7C1E`. Payer evidence append: `0xcf3e44f8f8062a1bdea3a55b617d11622951165fab6c3f43b2d4b6ea16784366`; recipient evidence append: `0xb056a4f38017a3945bed369712523fd46fe5070140b1139ea29337802c5a084f`; dispute adjudication: `0x5199cdd1baf92f968ccec59db66dc7ab72d6c31efb84b036703ce875ee6da16c` with verdict `RELEASE`; final release: `0xe23ac901c45e66af6f9f258c769f252eec2f5bf2136353fd9dbe857837896254`.

Explorer verification: the final release is `FINALIZED` with validator execution results `SUCCESS`, targets `0xc515F0742D0d94cA3EE7d50702C0669c2B03EC0b`, and originates from the recipient wallet. Canonical escrow 3 is `RELEASED`, `TRANSFER_QUEUED`, `RELEASE_TO_RECIPIENT`; custody decreased from `4000000000000000` wei to `3000000000000000` wei. The recipient is `0x4A7D76b8C4668a3426d6d54eC24b41Fa87b532f5`.

## HANDOFF evidence
Record repo, commit, source SHA, frontend, network, contract, explorer, deploy/service/snapshot/action/authorization/change/rebuild/reassessment/fail-closed txs, lint/schema/tests/typecheck/lint/build and limitations.

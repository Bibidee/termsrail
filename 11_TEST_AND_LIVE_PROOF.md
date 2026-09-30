# TERMSRAIL — Test & Live Proof

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

## HANDOFF evidence
Record repo, commit, source SHA, frontend, network, contract, explorer, deploy/service/snapshot/action/authorization/change/rebuild/reassessment/fail-closed txs, lint/schema/tests/typecheck/lint/build and limitations.

# More Information

## Reviewer Fix: Explicit Allowance Loss

Gen. Dave requested:

> Please make every loss of an explicit allowance, including `ALLOWED` changing to `NOT_ADDRESSED` or `UNKNOWN`, immediately invalidate the current snapshot and its authorizations until a new snapshot is built and the action is reassessed. Add behavioral tests proving the execution gate stays closed throughout that transition.

This review item is implemented in the deployed TermsRail contract.

## What Changed

TermsRail now treats every loss of an explicit `ALLOWED` policy dimension as a material policy change.

The deployed rule is effectively:

```text
previous == ALLOWED
and
current != ALLOWED
→ MATERIAL_CHANGE
```

This covers:

- `ALLOWED → CONDITIONAL`
- `ALLOWED → RESTRICTED`
- `ALLOWED → PROHIBITED`
- `ALLOWED → NOT_ADDRESSED`
- `ALLOWED → CONFLICTING`
- `ALLOWED → UNKNOWN`

An explicit allowance is therefore never silently weakened into a less certain or more restrictive state.

## Immediate Invalidation

When `check_policy_change()` detects a material loss of allowance, the service is immediately moved out of active policy state:

```text
policy_status = NEEDS_SNAPSHOT
policy_valid_until = 0
unresolved_change = true
```

This makes the current policy non-fresh and prevents existing authorizations from passing the execution gate.

As a result:

- `is_policy_fresh()` becomes false.
- `is_authorization_fresh()` can no longer establish a usable authorization against the invalidated policy state.
- `is_action_authorized()` becomes false.
- `get_execution_state()` reports the gate as closed through `execution_authorized`.

Historical snapshots, authorizations and change records remain preserved. They are retained as audit history, but they are no longer valid execution authority after the material change.

## Snapshot Rebuild Alone Does Not Reopen the Gate

A new snapshot advances the service to a new policy version.

An authorization created against the previous policy version does not become valid again merely because the snapshot was rebuilt. The affected action must be reassessed against the current policy state.

The intended lifecycle is:

```text
previous authorization valid
→ explicit allowance is lost
→ MATERIAL_CHANGE
→ execution gate closes immediately
→ new snapshot is built
→ old authorization remains unusable
→ action is reassessed
→ only the new reassessment can establish current execution authority
```

This prevents stale authorizations from surviving policy changes.

## Behavioral Proof: `ALLOWED → NOT_ADDRESSED`

The Direct Mode test:

`test_allowed_to_not_addressed_invalidates_gate_through_reassessment`

proves the requested lifecycle:

1. The initial `automation` policy dimension is `ALLOWED`.
2. An `API_CALL` action with `automation=YES` is registered.
3. The action is authorized as `ALLOWED`.
4. `is_action_authorized()` is true before the policy change.
5. The automation dimension changes from `ALLOWED` to `NOT_ADDRESSED`.
6. `check_policy_change()` returns `MATERIAL_CHANGE`.
7. The service becomes `NEEDS_SNAPSHOT`.
8. `unresolved_change` becomes true.
9. The existing authorization immediately stops passing the execution gate.
10. A new snapshot is built.
11. The old authorization still cannot execute against the new policy version.
12. The action is reassessed.
13. The new verdict is `CONDITIONAL`.
14. The execution gate remains closed.

This proves that `ALLOWED → NOT_ADDRESSED` immediately invalidates the previous execution permission and that rebuilding the snapshot alone is not enough to restore it.

## Behavioral Proof: `ALLOWED → UNKNOWN`

The Direct Mode test:

`test_allowed_to_unknown_invalidates_until_rebuild_and_reassessment`

proves the second explicitly requested transition:

1. The initial `automation` policy dimension is `ALLOWED`.
2. The API action receives an `ALLOWED` authorization.
3. The execution gate is open before the change.
4. The automation dimension changes from `ALLOWED` to `UNKNOWN`.
5. `check_policy_change()` returns `MATERIAL_CHANGE`.
6. The previous authorization immediately becomes unusable.
7. A new snapshot is built.
8. The previous authorization still cannot execute against the new policy version.
9. Reassessment is required.
10. Only a current valid reassessment can restore execution authority.

This proves that the gate remains closed throughout invalidation and snapshot rebuilding until reassessment establishes a current authorization.

## Verification

The reviewed implementation passed hosted verification on exact-head CI:

- Direct Mode: **20 passed**
- Frontend tests: **23 passed**
- GenVM lint/validation: **PASS**
- Typecheck: **PASS**
- ESLint: **PASS**
- Production build: **PASS**
- Exact-head CI: https://github.com/Bibidee/termsrail/actions/runs/33953838980

## Reviewed Deployment

Studionet contract:

`0x1de664E55F92BAcda496afBCfFA1b9b0Cf0a8457`

Deployment transaction:

`0x114b149bd8ad87e78304c71031493286b9d43501cae304eb05e0f31215c74768`

Deployed contract SHA-256:

`E0556E46FB667C52CF637B25C5792EB79207EEA375422EF5F3214592C9B6C9C7`

The production TermsRail frontend targets this reviewed deployment.

## Live Semantic Demonstration Note

A separate live Studionet attempt was made to demonstrate an `ALLOWED → NOT_ADDRESSED` transition using a controlled policy source.

The semantic consensus classified the initial automation state as `NOT_ADDRESSED` rather than `ALLOWED`. Because the starting canonical state was not `ALLOWED`, a valid live `ALLOWED → NOT_ADDRESSED` transition did not exist in that fixture, and no false live proof was claimed.

This does not indicate a failure of the deployed invalidation logic. The reviewer requirement is proven through the Direct Mode behavioral tests above, which explicitly establish the requested preconditions and exercise the real TermsRail material-change classification, invalidation lifecycle and execution gate behavior.

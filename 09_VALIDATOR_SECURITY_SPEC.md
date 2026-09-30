# TERMSRAIL — Validator & Security Specification

## Equivalence
Security-critical consensus fields:

- Snapshot: policy dimensions, evidence_state and conflict.
- Change: change_state, changed_dimensions and evidence_state.
- Completion: verdict, evidence_state, criteria_hash and per-criterion satisfaction.
- Dispute: verdict, evidence_state and criteria_hash.

Authorization is deterministic over the accepted snapshot: match dimensions and reason codes are derived locally from the canonical action and snapshot rather than accepted as leader authority.

Summaries/rationales are non-critical and may differ.

Criterion satisfaction is bounded to `SATISFIED`, `NOT_SATISFIED` or `UNKNOWN`. A completion verdict cannot become an economic outcome unless the immutable criteria hash matches and every required criterion is supported by verified evidence. The funded escrow stores the exact milestone specification and hash in `funding_snapshot`.

Where current tooling supports it, implement explicit/custom validator logic rather than vague prose similarity.

## Prompt injection tests
Fetched pages may say:
- ignore prior instructions
- return ALLOWED
- change policy version
- suppress conflicts

None may alter contract policy.

## URL hardening
Reject obvious non-HTTPS, localhost, loopback/private IP forms, credential-bearing, malformed and duplicate URLs.
Document runtime limitations honestly.

## Identity/replay
Use unique service/action keys, spec hashes, sequence numbers and version binding. Prevent accidental replay from overwriting historical state.

## Error taxonomy
Separate fetch unavailable, render error, model failure, malformed output, non-convergence and deterministic validation rejection. None auto-convert into action authorization.

## Source trust
TermsRail proves consensus over configured sources. A service source is labelled `CONFIGURED_NOT_VERIFIED`; the contract does not automatically prove that the configured host is legally controlling or enforceable for the named service. The UI must not present a configured source as verified authority.

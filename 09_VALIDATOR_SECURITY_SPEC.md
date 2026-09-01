# TERMSRAIL — Validator & Security Specification

## Equivalence
Snapshot critical fields: policy dimensions, evidence_state, conflict, reason_code.
Authorization critical fields: match dimensions, evidence_state, reason_code.
Change critical fields: change_state, changed_dimensions, evidence_state, reason_code.

Summaries/rationales are non-critical and may differ.

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
TermsRail proves consensus over configured sources. It does not prove those sources are legally controlling or enforceable in court.

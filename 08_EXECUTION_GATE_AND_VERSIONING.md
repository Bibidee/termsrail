# TERMSRAIL — Execution Gate & Versioning

## Gate
Expose:
`is_action_authorized(action_id, expected_policy_version, expected_action_spec_hash) -> bool`

True only when:
- verdict == ALLOWED
- authorization fresh
- policy snapshot fresh
- authorization.policy_version == service.policy_version
- authorization.source_version == service.source_version
- action spec hash matches expected
- service policy state active
- no unresolved material-change condition

Everything else false.

## Version semantics
Authorization is judgement against a specific action + source universe + policy version + time window.

Source update: increment source_version, preserve history, close gate, require new snapshot.
Material policy change: advance policy_version, preserve history, close gate for old authorizations, require reassessment.

TTL is deterministic. LLM never decides staleness.

Expose structured execution state with verdict, freshness, spec/source/policy matches and `execution_authorized`.

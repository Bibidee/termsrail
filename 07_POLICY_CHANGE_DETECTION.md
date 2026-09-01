# TERMSRAIL — Policy Change Detection

## Purpose
Determine whether published policies materially changed since the accepted snapshot.

## Output
UNCHANGED, NON_MATERIAL_CHANGE, MATERIAL_CHANGE, POLICY_UNAVAILABLE, UNKNOWN_CHANGE, plus changed_dimensions, evidence_state and reason_code.

## Material examples
- scraping ALLOWED → PROHIBITED
- commercial use ALLOWED → RESTRICTED
- automation not addressed → prior approval required
- redistribution ALLOWED → PROHIBITED

## Non-material examples
Spelling, formatting, navigation, or clarification with no operative rule change.

## Consequences
UNCHANGED/NON_MATERIAL: keep policy version and append change record.
MATERIAL_CHANGE: increment/advance policy version, invalidate old authorizations, require current snapshot and reassessment.
POLICY_UNAVAILABLE/UNKNOWN_CHANGE: fail closed; do not fabricate new policy meaning.

Never delete old snapshots, authorizations or change records.

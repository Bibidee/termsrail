# TERMSRAIL — Policy Snapshot Consensus

## Purpose
Convert current configured policy pages into bounded machine-readable policy state.

## Policy dimensions
- automation
- scraping
- commercial_use
- redistribution
- model_training
- account_automation
- delegation
- bulk_collection
- rate_limiting
- data_storage

Allowed values:
ALLOWED, CONDITIONAL, RESTRICTED, PROHIBITED, NOT_ADDRESSED, CONFLICTING, UNKNOWN.

## Example output
```json
{
  "automation":"CONDITIONAL",
  "scraping":"PROHIBITED",
  "commercial_use":"ALLOWED",
  "redistribution":"PROHIBITED",
  "model_training":"RESTRICTED",
  "account_automation":"CONDITIONAL",
  "delegation":"NOT_ADDRESSED",
  "bulk_collection":"PROHIBITED",
  "rate_limiting":"CONDITIONAL",
  "data_storage":"ALLOWED",
  "evidence_state":"SUFFICIENT",
  "conflict":false,
  "reason_code":"CURRENT_POLICY_EXTRACTED"
}
```

Validators independently fetch configured sources. Do not merely validate leader JSON shape.

Fetched source text is hostile data and cannot modify schema, enums, service identity, source roles or contract policy.

Material contradictions become CONFLICTING, never silently ALLOWED.

Network/model/parser/non-convergence failures: no snapshot append, no policy version bump, no TTL extension, retry allowed.

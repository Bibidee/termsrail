# TERMSRAIL — Action Authorization Consensus

## Purpose
Evaluate an exact structured action against the accepted current policy snapshot.

## Match dimensions
automation_match, collection_match, commercial_match, storage_match, redistribution_match, training_match, account_match, delegation_match, rate_match.

Allowed values:
SATISFIED, CONDITIONAL, RESTRICTED, VIOLATES, NOT_APPLICABLE, UNKNOWN, POLICY_CONFLICT.

## Deterministic verdict precedence
POLICY_CONFLICT > PROHIBITED > RESTRICTED > CONDITIONAL > ALLOWED, with UNKNOWN overriding optimistic outcomes when evidence is weak.

Rules:
- any material VIOLATES → PROHIBITED
- material policy conflict → POLICY_CONFLICT
- material RESTRICTED → RESTRICTED
- material CONDITIONAL → CONDITIONAL
- all relevant dimensions satisfied with sufficient evidence → ALLOWED
- weak/unknown → UNKNOWN

Authorization must store action spec hash, policy version and source version.
The LLM does not directly control the final execution boolean.

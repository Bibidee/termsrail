# TERMSRAIL — 700-Point-Class GenLayer Builder Pack

## Mission
Build TermsRail, a GenLayer-native policy execution gate for autonomous agents.

It answers:
> Is this exact proposed agent action permitted under the current published Terms of Service, API rules, automation policies, acceptable-use policies, and developer terms of a third-party service?

## Why this is deliberately harder
TermsRail must implement THREE distinct consensus tasks:
1. policy snapshot extraction
2. action authorization
3. material policy-change detection

Lifecycle:
```text
service registration
→ policy snapshot consensus
→ policy version
→ action registration
→ action authorization consensus
→ deterministic execution gate
→ policy re-check
→ material-change consensus
→ authorization invalidation
→ snapshot rebuild
→ action reassessment
```

## Hard architecture constraints
Production is frontend + GenLayer Intelligent Contract only.
No Firebase, Supabase, FastAPI, Express, application DB, trusted policy server, off-chain AI judge, serverless adjudicator, or hidden scraping backend as authority.

## GenLayer target
Use current official tooling. Studionet target unless current verified tooling requires a documented alternative:
- RPC: https://studio.genlayer.com/api
- chain ID: 61999
- currency: GEN
- explorer: https://explorer-studio.genlayer.com

## Non-negotiable rules
- all external web/LLM work inside valid nondeterministic execution
- validators independently fetch/verify
- no business mutation before consensus
- no raw HTML equality
- structured state-relevant fields
- technical errors stay separate from business verdicts
- source version changes invalidate old authorizations
- perform post-finality readback
- no mock production state

## Action verdicts
ALLOWED, CONDITIONAL, RESTRICTED, PROHIBITED, UNKNOWN, POLICY_CONFLICT

## Policy change states
UNCHANGED, NON_MATERIAL_CHANGE, MATERIAL_CHANGE, POLICY_UNAVAILABLE, UNKNOWN_CHANGE

## Read order
1. 01_PRODUCT_BRIEF.md
2. 02_PRD.md
3. 03_ARCHITECTURE.md
4. 04_CONTRACT_STATE_MACHINE.md
5. 05_POLICY_SNAPSHOT_CONSENSUS.md
6. 06_ACTION_AUTHORIZATION_CONSENSUS.md
7. 07_POLICY_CHANGE_DETECTION.md
8. 08_EXECUTION_GATE_AND_VERSIONING.md
9. 09_VALIDATOR_SECURITY_SPEC.md
10. 10_FRONTEND_UX_AND_UI.md
11. 11_TEST_AND_LIVE_PROOF.md
12. 12_700_POINT_RELEASE_GATE.md
13. 13_CODEX_MASTER_PROMPT.md

Official docs to verify during build:
- https://docs.genlayer.com/developers/networks
- https://docs.genlayer.com/developers/intelligent-contracts/features/web-access
- https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism
- https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle

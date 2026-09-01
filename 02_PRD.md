# TERMSRAIL — PRD

## Objective
Ship a complete GenLayer dApp that:
1. registers a service and policy sources
2. creates a versioned policy snapshot through consensus
3. registers structured agent actions
4. authorizes actions against the current snapshot
5. exposes a fail-closed execution gate
6. rechecks policies
7. detects material changes
8. invalidates old authorizations
9. reassesses actions under new policy versions

## Entities
### Service
id, creator, service_key, service_name, service_domain, source_urls, source_roles, source_version, policy_version, policy_status, policy_checked_at, policy_valid_until, created_at.

### Policy Snapshot
service_id, sequence, source_version, policy_version, requested_by, created_at plus policy dimensions:
automation, scraping, commercial_use, redistribution, model_training, account_automation, delegation, bulk_collection, rate_limiting, data_storage, evidence_state, conflict, reason_code, summary.

### Action
id, creator, service_id, action_key, action_type, description, automation, frequency, commercial_purpose, storage, redistribution, model_training, account_operation, delegation, authentication, volume_class, created_at.

### Authorization
action_id, sequence, policy_version, source_version, spec_hash, requested_by, created_at, match dimensions, evidence_state, reason_code, verdict, valid_until.

### Policy Change Check
service_id, sequence, from_policy_version, source_version, change_state, changed_dimensions, evidence_state, reason_code, checked_at.

## Source roles
TERMS_OF_SERVICE, ACCEPTABLE_USE_POLICY, API_TERMS, DEVELOPER_TERMS, AUTOMATION_POLICY, SCRAPING_POLICY, DATA_POLICY, COMMERCIAL_USE_POLICY, OTHER_POLICY.

## Action types
DATA_COLLECTION, API_CALL, AUTOMATED_PURCHASE, AUTOMATED_MESSAGE, ACCOUNT_ACTION, MODEL_TRAINING, DATA_REDISTRIBUTION, AGENT_DELEGATION, CONTENT_GENERATION, OTHER.

## Pages
/, /services/new, /service/[id], /action/new, /action/[id], /changes, /about.

## Completion criteria
Injected wallet, Studionet, all three consensus paths, versions, TTL, histories, pagination, retry-safe failures, prompt-injection resistance, real readback, deployed frontend, real Studionet lifecycle, zero fake production records.

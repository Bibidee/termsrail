# TERMSRAIL — Contract State Machine

## Service lifecycle
```text
REGISTERED → NEEDS_SNAPSHOT → SNAPSHOT_ACTIVE → CHANGE_CHECK
CHANGE_CHECK:
  UNCHANGED/NON_MATERIAL → SNAPSHOT_ACTIVE
  MATERIAL_CHANGE → NEW_POLICY_VERSION / NEEDS_SNAPSHOT
  POLICY_UNAVAILABLE/UNKNOWN_CHANGE → SNAPSHOT_UNCERTAIN
```

## Action lifecycle
```text
REGISTERED → NEEDS_AUTHORIZATION
→ ALLOWED / CONDITIONAL / RESTRICTED / PROHIBITED / UNKNOWN / POLICY_CONFLICT
→ STALE_ON_POLICY_CHANGE
→ REASSESS
→ new authorization state
```

Historical ALLOWED may remain stored while effective execution is false because policy version or TTL changed. Never rewrite history.

## Required writes
- register_service
- update_policy_sources
- build_policy_snapshot
- register_action
- authorize_action
- check_policy_change
- rebuild_policy_snapshot
- reassess_action

## Required views
- get_service(s)
- get_policy_snapshot/history
- get_action(s)
- get_authorization/history
- get_change_check/history
- is_policy_fresh
- is_authorization_fresh
- is_action_authorized
- get_execution_state

Hard-cap services, actions, snapshots, authorizations, change checks, source count, string lengths and page sizes.

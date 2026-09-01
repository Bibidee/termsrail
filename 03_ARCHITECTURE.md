# TERMSRAIL — Architecture

```text
FRONTEND
Next.js / TypeScript / genlayer-js / injected wallet
        |
        v
GENLAYER INTELLIGENT CONTRACT
 deterministic:
 - services, sources, versions, actions
 - TTL/freshness, histories, spec hashes
 - verdict derivation, invalidation, execution gate
 nondeterministic:
 A. policy snapshot extraction
 B. action authorization
 C. material policy-change detection
        |
        v
independent validator fetches
ToS | API Terms | AUP | Automation Policy
```

## Three consensus stages
A: fetch current policy sources and establish bounded policy dimensions.
B: compare exact structured action to the accepted policy snapshot.
C: fetch policy sources again and determine whether operative rule meaning materially changed.

## Source update
Creator replaces full source universe → source_version increments → current policy usability closes → new snapshot required → previous history remains.

## Material change
Accepted MATERIAL_CHANGE → policy_version increments/new snapshot cycle → all authorizations tied to old policy version become non-executable → reassessment required.

## Agent gate
`is_action_authorized(action_id, expected_policy_version, expected_spec_hash)` is true only when verdict ALLOWED, both policy and authorization are fresh, source version current, policy version current, spec matches, and no unresolved change state exists.

## Frontend trust boundary
Frontend submits transactions and renders authoritative state. It never scrapes policy pages to decide or overrides stale state.

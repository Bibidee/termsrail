# TERMSRAIL — 700-Point-Class Release Gate

No document guarantees 700 points. Earn it with evidence.

## GenLayer depth
Prove three distinct consensus tasks:
1. policy extraction
2. action authorization
3. material policy-change detection
At least two should be exercised live on Studionet; target all three.

## State depth
Source version, policy version, action spec hash, snapshot history, authorization history, change history, deterministic TTL, invalidation, reassessment and fail-closed execution gate.

## Validator quality
Independent source fetch, structured equivalence, prompt-injection resistance, conflict handling, technical/business error separation, no raw HTML equality and no prose-driven state.

## Contract engineering
Bounds, pagination, permissions, replay controls, deterministic verdict/gate, source-update invalidation, material-change invalidation and comprehensive tests.

## Live evidence
Deployment, source fetch, snapshot, authorization, fail-closed path, version transition, tx hashes, Explorer and source parity.

## Frontend
Complete real workflow, wallet/network, transaction progression, readback, stale/conflict/change states, histories, material-change UI, unique signalling design, mobile, accessibility and deployed URL.

## Mandatory evidence matrix
For every major scoring criterion map:
`criterion → implementation file/method → test → live tx → frontend screen → documentation`.

Any row supported only by prose is incomplete.

## Difference from ~400-point build
~400 often: `register → one judgement → store verdict`.
TermsRail target: `register service → snapshot consensus → policy version → register action → authorization consensus → gate → change consensus → invalidate → rebuild → reassess → new gate`.

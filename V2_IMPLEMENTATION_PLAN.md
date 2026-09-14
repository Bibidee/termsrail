# TermsRail v2 implementation plan

1. Freeze and regression-test the current service, snapshot, action, authorization, pagination, and fail-closed policy behavior.
2. Extend the Intelligent Contract with bounded first-class plan records and deterministic step binding to `service_id`, `action_id`, and action `spec_hash`; add plan authorization, version binding, expiry, and an executable gate.
3. Add policy-linked escrow state transitions with payer/recipient authorization, replay-safe release/refund, and automatic freeze when any referenced service becomes stale or materially changes.
4. Add bounded completion evidence, normalized GenLayer adjudication categories, disputes, settlement rules, and immutable authorization receipts.
5. Add frontend routes for plans, escrows, receipts, and activity while preserving existing routes and transaction/readback safeguards.
6. Add contract Direct Mode and frontend tests for every state transition, access-control rule, stale-policy path, and canonical readback.
7. Run local and hosted CI, deploy the new contract only after exact-head verification, then execute the complete live lifecycle and record evidence.

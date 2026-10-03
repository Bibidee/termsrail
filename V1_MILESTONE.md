# TermsRail V1 Milestone

## GEN Escrow, Evidence, Disputes and Settlement

**Repository:** https://github.com/Bibidee/termsrail  
**Live app:** https://termsrail.vercel.app  
**Current Studionet contract:** `0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0`  
**Deployment transaction:** `0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c`  
**Deployed contract source SHA-256:** `EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`

---

## 1. Milestone overview

TermsRail originally focused on policy-gated services, actions, plan authorization and policy-change handling.

This V1 milestone added a new escrow and settlement layer so an approved TermsRail plan can move from authorization into an actual GEN-backed agreement between a payer and recipient.

The milestone evolved from a logical escrow record into a payable custody system with:

- plan-bound escrow creation
- GEN funding and custody
- escrow locking
- immutable milestone criteria
- completion evidence submission
- GenLayer-based completion adjudication
- provisional settlement outcomes
- challenge windows
- two-party dispute evidence
- dispute adjudication
- guarded `RELEASE` and `REFUND` settlement
- bounded `OTHER` recovery
- terminal settlement protection
- canonical custody accounting
- transaction hash and explorer evidence in the frontend
- live Studionet RELEASE and REFUND proofs
- CI, security and dependency hardening

The final V1 contract remains deployed at the address above and was not changed during the final frontend, documentation and dependency cleanup.

---

## 2. Escrow foundation

The first escrow foundation was introduced in commit:

`a8b6a75fdba01aaed7cf2656cc638e1a536bd769`  
**feat: add policy-gated escrow foundation**

This added the first canonical escrow storage and state model to the Intelligent Contract.

### Added

- `escrows`
- `escrow_ids`
- `escrow_histories`
- `next_escrow_id`
- `create_escrow`
- `fund_escrow`
- `lock_escrow`
- `get_escrow`
- `get_escrows`
- `get_escrow_history`
- `get_escrow_execution_state`
- `is_escrow_executable`

Escrows were bound to an executable TermsRail plan and recorded:

- payer
- recipient
- amount
- deadline
- plan ID
- plan hash
- authorization identity
- canonical status history

This was the point where escrow became a new TermsRail capability rather than an improvement to an existing escrow system.

---

## 3. Policy-gated escrow safety

Subsequent work connected escrow state to TermsRail's existing policy and plan authorization model.

Relevant commits included:

`137f0c9696de292837294711ca0a5231a8cdc789`  
**feat: freeze plans and escrow on policy changes**

`9cabe60ebce66dd6c55bd156e3dd09f8636c1d76`  
**fix: harden escrow bindings and receipt history**

### Improvements

- escrow execution was tied to the authorized plan
- policy/source changes could invalidate new execution
- funded escrow recovery was separated from unsafe new execution
- plan hash and authorization bindings were hardened
- canonical escrow history was preserved
- stale or changed policy state could not silently authorize a new settlement path

This ensured escrow remained constrained by TermsRail's policy-gated execution model.

---

## 4. Escrow frontend and evidence controls

The V1 milestone added dedicated user-facing escrow flows.

Relevant commits included:

`e49389b9e70b33b879b1ecc4eea436c1804ed861`  
**feat: add v2 plan escrow receipt activity routes**

`0903b1d385eb1981637b2d7f6ba969dfd429da47`  
**feat: wire escrow and evidence forms**

`5c68d88f705fd7e44b7a19fd7221a88af58c1d90`  
**feat: wire escrow controls and receipt detail**

### Added UI flows

- `/escrow`
- `/escrow/new`
- `/escrow/[id]`
- escrow creation
- funding controls
- lock controls
- completion evidence submission
- dispute creation
- dispute evidence submission
- adjudication controls
- settlement controls
- receipt and activity views
- canonical state reload after writes

The frontend was designed around canonical contract reads rather than local-only state.

---

## 5. Real GEN custody and settlement

The major custody upgrade was introduced in:

`10230a551ba408ddc591e69643d34cbe42c55ee6`  
**feat: add payable GEN escrow custody and settlement**

Before this change, escrow behaved as a logical state machine and did not actually custody or transfer GEN.

### Added

- payable GEN escrow funding
- exact-value funding checks
- canonical held custody
- release transfer to the recorded recipient
- refund transfer to the recorded payer
- transfer queue state
- contract custody balance reads
- custody-aware frontend controls

The settlement model became:

`payer → TermsRail escrow custody → recipient or payer`

according to the final canonical outcome.

---

## 6. Completion evidence and adjudication

The escrow lifecycle was extended so settlement did not depend only on a manual button press.

Completion now requires evidence and adjudication.

### Evidence improvements

- completion evidence is stored canonically
- bounded HTTPS evidence sources are used
- SHA-256 manifests bind fetched content
- malformed, unavailable or mismatched evidence fails closed
- self-authored irrelevant evidence cannot directly authorize settlement
- evidence is evaluated against the escrow's milestone criteria
- semantic satisfaction is supported without requiring literal sentence matching

### Adjudication outcomes

Completion adjudication can produce a provisional direction such as:

- `RELEASE`
- `REFUND`

The result is not immediately treated as an irreversible final destination.

---

## 7. Immutable milestone criteria

A major hardening round ensured that the basis for settlement could not be changed after funding.

Relevant work included:

`350127bb3ee219380bf7d8f02faa30c47616cdad`  
**harden milestone criteria and escrow settlement**

### Added or hardened

- immutable milestone specification
- criteria hash binding
- funding snapshot
- payer/recipient/amount binding
- evidence-to-criteria binding
- adjudication-to-criteria binding
- settlement checks against the funded agreement

This prevents the agreement from being silently rewritten after GEN is already held.

---

## 8. Dispute evidence and adjudication

The milestone added a two-party dispute system for challenged completion results.

### Dispute capabilities

- payer or recipient can open a dispute when allowed
- dispute evidence is append-only
- evidence records the submitting wallet and deterministic party role
- payer and recipient evidence are both available to adjudication
- dispute adjudication can return:
  - `RELEASE`
  - `REFUND`
  - `OTHER`

### Final destination rules

- `RELEASE` always settles to the recorded recipient
- `REFUND` always settles to the recorded payer
- the caller of the settlement transaction does not control the destination
- a third party cannot redirect custody
- a terminal settlement cannot be replayed

---

## 9. Bounded `OTHER` recovery

A dispute returning `OTHER` must not leave GEN stuck indefinitely.

Relevant work included:

`bf3f3fea19ff4804b7673f0cab8c5ac607bf8e81`  
**harden escrow dispute recovery handshake**

`873e3b7aa1faaa812dbdb3668c56cad51e3783d3`  
**bound other dispute recovery and escrow UX**

### Recovery model

When dispute adjudication returns `OTHER`:

1. the payer proposes either `RELEASE` or `REFUND`
2. the recipient must accept the same bounded choice
3. the proposal has a canonical deadline
4. if the recipient does not respond before expiry, custody deterministically refunds to the payer

### Protections

- no unilateral release to a silent recipient
- no indefinite custody
- no replacing an active proposal with a conflicting one
- no replay after settlement
- no double settlement
- held custody remains recoverable even if current policy authorization later becomes stale

---

## 10. Challenge-state redesign

The most important state-machine correction was completed in:

`4bece3879fd9684b8799f31b7a97bdaabe052644`  
**fix escrow challenge settlement state machine**

### Previous issue

A provisional completion result could be written too early into the final settlement field.

That made it difficult or impossible for a later challenge to legitimately reverse the economic direction.

Example of the broken shape:

`provisional RELEASE → final field already RELEASE → dispute REFUND conflicts`

### Final V1 model

TermsRail now separates:

- `provisional_outcome`
- `settlement_outcome`

Completion adjudication sets only the provisional direction.

For example:

`COMPLETED → provisional RELEASE`

or:

`NOT_COMPLETED → provisional REFUND`

During the challenge period:

`settlement_outcome = ""`

A final settlement outcome is only established when:

- the challenge period expires without a dispute and the provisional result is promoted, or
- dispute adjudication produces the final canonical outcome

This allows legitimate reversal:

`PROVISIONAL RELEASE → CHALLENGE → REFUND`

and:

`PROVISIONAL REFUND → CHALLENGE → RELEASE`

without conflicting final state.

---

## 11. Challenge window and deadline safety

The challenge model was hardened so the original escrow deadline could not accidentally remove a valid challenge opportunity.

### Final behavior

- challenge deadline is distinct from the original escrow deadline
- a provisional outcome remains challengeable while the challenge window is open
- challenge can still be opened after the original escrow deadline if the challenge deadline has not passed
- unchallenged provisional settlement cannot execute before the challenge deadline
- expiry cannot overwrite an active dispute
- expiry cannot overwrite a provisional or already finalized settlement outcome

---

## 12. Terminal settlement protections

The final settlement path enforces one canonical economic destination.

### Guardrails

- terminal RELEASE cannot later become REFUND
- terminal REFUND cannot later become RELEASE
- settlement cannot execute twice
- custody must still be held before settlement
- final payer/recipient/amount must match the funding snapshot
- a final dispute outcome cannot be overwritten
- settlement direction is independent of which permitted party calls the transaction

This protects the escrow from replay, direction changes and post-finality mutation.

---

## 13. Frontend outcome clarity and transaction evidence

Frontend evidence and state clarity were completed in:

`b4e8fabc51435e553cce096a7322d0c6e094e6ca`  
**show escrow transaction hashes and superseded outcomes**

### Added

- transaction hash state for escrow mutations
- persistence of the submitted hash through later lifecycle phases
- direct GenLayer Studio explorer links
- clearer provisional vs final outcome presentation
- superseded provisional labels when a dispute resolves in the opposite direction

Example:

`PROVISIONAL OUTCOME: RELEASE · SUPERSEDED`

`FINAL OUTCOME: REFUND`

This removed ambiguity between historical provisional decisions and the canonical final settlement.

---

## 14. Live Studionet proofs

The final V1 challenge-state contract is:

`0x07Ef5B0c8FAeCA0B3C9fFF4fb3CCa9264F46FbC0`

Deployment transaction:

`0x624ca24baa77efb270dcbdcfa797ba4cedcabb2af3a8bab765727bb680c6310c`

Source SHA-256:

`EB09F44B9956355210BEA77169660F7A745C8871C3167C028B8C1DC609D76668`

### Live RELEASE proof — Escrow 3

- create: `0x7c135d6ee0920b06bb379abc2365a25b24d94ad3c7ff54cc6fc3b95f01ba0a38`
- fund: `0x20ad41066749e3fa6db244547e0bdaa275145186523a5c3678001a8e872bb474`
- lock: `0x4b0f65bb818a6c88e63c13e4f47b6ef53fb25d09c8d7659c0cfd658e3866008a`
- completion evidence: `0x6e3684271d13a696948a91df551cc9daa3aca479d511bf3cfe3f3776dfbba3a7`
- completion adjudication: `0x52064de1fc7f817c5b1aef45cefb34cc943d28d38b83cd3ec79634b473d3a66a`
- final release: `0xc39b48416e43cbba164c0825dc5cb92dc7171963a18b17332357b5995df41ca3`

Final canonical state:

- `RELEASED`
- `TRANSFER_QUEUED`
- `RELEASE_TO_RECIPIENT`

### Live challenge/refund proof — Escrow 4

- create: `0x0b7f051c98fa7692e06ae9240a8de8285bb3122a12be4a18b8c822085611c9ff`
- lock: `0xb6b9ef0a8290be70f2a0689ac6ceea60c73a7e564cd0c52fa044e443b4fa1dbd`
- recipient dispute evidence: `0x84a492d9ee4e58d8ae0b00e3df25c513315da34aa05cdc3d1185956aaa705e03`
- dispute adjudication: `0x3f558b6f3801831661624adc71459c2028e12b997da4be4b6c449c1e49032807`
- canonical refund: `0xe7f76366efd64b8788234ddba4854d7b292b57f129cbab49168a3b5c32692de3`

Final canonical state:

- `REFUNDED`
- `TRANSFER_QUEUED`
- `REFUND_TO_PAYER`
- `CHALLENGE_CLEARED`
- `FINAL OUTCOME: REFUND`

The refund destination remained the recorded payer even though either permitted party may call the guarded settlement function.

---

## 15. Automated security coverage

The final challenge-state source is covered by:

- **52 contract/security tests**
- **39 frontend tests**
- GenVM lint
- deployment consistency checks
- TypeScript typecheck
- ESLint
- production build
- production dependency audit

Important contract/security coverage includes:

- irrelevant self-authored evidence cannot release funds
- false payer evidence cannot force a refund
- criteria hash tampering is rejected
- early settlement is rejected
- provisional RELEASE can be overturned to REFUND
- provisional REFUND can be overturned to RELEASE
- `OTHER` can recover through mutual choice
- `OTHER` timeout refunds the payer
- unchallenged provisional outcomes finalize only after the challenge window
- challenge remains available after the original escrow deadline
- semantic criterion satisfaction does not require exact sentence matching
- final dispute outcomes cannot be overwritten
- malicious criteria-hash changes cannot be accepted
- double settlement is rejected
- frozen held custody remains recoverable

---

## 16. CI and dependency hardening

The final cleanup also hardened the release pipeline.

### Production dependency audit

CI now includes:

`npm audit --omit=dev --audit-level=high`

A production audit identified vulnerable dependency versions and the lockfile was repaired.

### Dependency fixes

- Next.js `16.3.4 → 16.3.8`
- `@next/*` runtime packages updated to the matching patched release
- `brace-expansion 1.1.18 → 1.1.21`

The final production-only audit passes.

The CI workflow was returned to read-only verification after the one-time lockfile repair.

No TermsRail contract source change was required for this dependency cleanup.

---

## 17. Documentation cleanup

V1 documentation was cleaned so historical proofs are not presented as evidence for the current deployment.

### Improvements

- historical deployments are clearly separated from the current challenge-state contract
- old RELEASE/REFUND proofs are marked historical
- current Escrow 3 and Escrow 4 proofs are documented separately
- stale literal exact-head CI references were removed
- documentation now points reviewers to the successful CI run attached to the current release HEAD
- current frontend test count was updated to 39

---

## 18. Selected milestone commit timeline

| Commit | Change |
|---|---|
| `a8b6a75` | Added policy-gated escrow foundation |
| `137f0c9` | Froze plans and escrow on policy changes |
| `e49389b` | Added plan, escrow, receipt and activity routes |
| `0903b1d` | Wired escrow and evidence forms |
| `5c68d88` | Wired escrow controls and receipt detail |
| `9cabe60` | Hardened escrow bindings and receipt history |
| `386f0c4` | Wired canonical escrow receipts and completion IDs |
| `10230a5` | Added payable GEN custody and settlement |
| `bdd1755` | Completed escrow lifecycle validation and frontend safeguards |
| `3590944` | Repaired escrow custody and dispute lifecycle |
| `bf3f3fe` | Hardened dispute recovery handshake |
| `873e3b7` | Bounded `OTHER` recovery and escrow UX |
| `350127b` | Hardened milestone criteria and settlement |
| `4bece38` | Fixed challenge settlement state machine |
| `b4e8fab` | Added transaction hashes and superseded outcome display |
| `5241962` | Repaired production dependency audit findings |
| `c941da7` | Kept production dependency audit as a read-only CI gate |
| `0c0302a` | Removed stale live-proof CI literal |

---

## 19. Final V1 state

TermsRail V1 now supports the complete lifecycle:

`POLICY-GATED PLAN`

`→ ESCROW CREATED`

`→ GEN FUNDED`

`→ LOCKED`

`→ COMPLETION EVIDENCE`

`→ ADJUDICATION`

`→ PROVISIONAL OUTCOME`

`→ CHALLENGE WINDOW`

`→ DISPUTE WHEN NEEDED`

`→ FINAL RELEASE / REFUND`

`→ TERMINAL CUSTODY STATE`

The deployed contract has live proof for both RELEASE and REFUND settlement and the challenge-state architecture has been validated through automated security tests and live Studionet execution.

**V1 status: READY**

---

## 20. Out of scope for V1

The following are intentionally not part of this milestone:

- multi-milestone staged escrow
- partial GEN releases
- second-level appeals after finalized dispute settlement
- subjective reputation scoring

These can be treated as separate future milestones rather than reopening the audited V1 custody architecture.

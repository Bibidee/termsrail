# TermsRail Frontend UX

TermsRail is a cool, bright policy-infrastructure product with its own identity. It does not reproduce Jestor’s palette, layout, card system, typography, branding, wording, or component geometry.

## Design system

- Pale cool mint-grey background with a subtle blue grid
- Electric blue, cyan, mint, coral, lavender, and white surfaces
- Deep navy text and crisp blue outlines
- Bold editorial headings paired with readable body text; monospace only for hashes, IDs, and canonical records
- Route/checkpoint motif: **SOURCE → SNAPSHOT → ACTION → GO**
- Text always accompanies status colour: ALLOWED, CONDITIONAL, RESTRICTED, PROHIBITED, UNKNOWN, CONFLICTING

## Product surfaces

The homepage introduces the policy route and links to the live registry. Services use a structured board and service cards. The service control room presents canonical metadata, policy-dimension tiles, source ledger, policy timeline, change timeline, execution gates, and raw canonical details. The Action Builder uses bounded controls for all ten action types and validates contract invariants before submission. Wallet and network state remain visible and truthful.

## Transaction safety

Every mutation is presented as:

`SUBMIT → FINALIZED → FINISHED_WITH_RETURN VERIFIED → CANONICAL READBACK → SUCCESS`

Finality alone is never treated as success. Snapshot builds require canonical policy/snapshot advancement. Policy-change checks require canonical change-history advancement, so UNCHANGED and NON_MATERIAL_CHANGE succeed even when the service object is unchanged. Reachable change states are UNCHANGED, NON_MATERIAL_CHANGE, MATERIAL_CHANGE, and POLICY_UNAVAILABLE. UNKNOWN_CHANGE is canonical/reserved but unreachable in the frozen implementation.

## Accessibility and responsive behavior

Status uses text plus colour, focus states remain visible, controls target comfortable touch sizes, and layouts remain readable from mobile through widescreen. The route/checkpoint animation respects `prefers-reduced-motion` and becomes static when reduced motion is requested.

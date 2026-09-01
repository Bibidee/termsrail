# TERMSRAIL — Frontend UX & UI

## Visual direction
Railway signalling control panel × legal redline document × machine policy console.

Do NOT use purple/blue AI gradients, glassmorphism, glow, robots/brains/sparkles, chatbot UI, giant rounded SaaS cards, neon, gradient buttons, generic metric-card dashboard, pill overload or legal-scale clip art.

Suggested palette: signal-paper off-white, dark control ink, muted rules, proceed green, caution amber, stop red, restrained signal blue.
Use one sans + one mono. Use 0–4px radii, hard rules and minimal shadow.

## Signature elements
### Signal Head
PROCEED / CAUTION / STOP with text plus colour.

### Policy Rail
`POLICY V003 ───●─── POLICY V004` with material-change marker.

### Action Track
Show each action dimension flowing into the final signal.

### Redline panel
Show bounded dimension changes such as `redistribution: ALLOWED → PROHIBITED`, not huge prose diffs.

## Required pages
- `/` policy execution board
- `/services/new`
- `/service/[id]`
- `/action/new`
- `/action/[id]`
- `/changes`
- `/about`

Service detail shows policy dimensions, versions, source ledger, history, BUILD SNAPSHOT, CHECK POLICY CHANGE and UPDATE SOURCES.

Action detail shows structured action, signal, verdict, execution gate, match dimensions, versions/freshness/spec match and authorization history.

Transaction progression:
SUBMITTING → LEADER EXECUTION → VALIDATOR REVIEW → CONSENSUS → FINALISED → CANONICAL READBACK → UPDATED.
Never show UPDATED before readback.

Mobile must use compact signal/policy rows, not giant cards. Accessible focus, keyboard nav, AA contrast, 44px touch targets and non-colour-only statuses.

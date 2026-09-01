# TermsRail handoff

## Delivered

- Next.js App Router frontend with `/`, `/services/new`, `/service/[id]`, `/action/new`, `/action/[id]`, `/changes`, and `/about`.
- Railway-signal/legal-redline visual system with responsive layout, keyboard-friendly controls, non-colour status labels and truthful empty state.
- GenLayer contract implementing service registry, source roles/versioning, snapshot/authorization/change histories, deterministic precedence and fail-closed gate.
- EIP-1193 wallet connect and Studionet chain switching (`0xf22f` / 61999).
- Deterministic frontend unit tests for precedence and binding invalidation.

## Verification evidence

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS (2 assertions groups) |
| `npm run build` | PASS (7 routes) |
| GenVM lint/schema | BLOCKED after CLI install: deployment receipts report `AttributeError: module 'genlayer' has no attribute 'contract'` / `ValueError: too many values to unpack`; schema lookup therefore returns contract not found |
| Studionet deployment/lifecycle | CLI and unlocked funded account available; deployment attempts were submitted but contract execution failed validation, so no service/snapshot/action lifecycle was executed |

No contract address, transaction hash, Explorer URL or frontend hosting URL is claimed because those require external credentials and finality evidence.

## Live CLI attempts

The unlocked `faultline-dev` account (`0x79b3ecbe6a65bee93b2fcda78e6909892671507f`, 971.084999999999999988 GEN) was selected on Studionet. Deployment transactions were submitted and finalized with contract errors: `0xe0200635e84bb2a354672322b0f47a19105eef3f6379bc7c2708e568b996b049`, `0x1684c5b0d6cdf9be46f6b91ad6a5a83be0f9d67a01d6f5b03096ec75646dd6f1`, `0x6270407c29a906a259ceb6ff4c530733f75ed7d25bc67789fccf2d2a458df53f`, `0xdd869a448dbd55b42350f7fbe59990317ea6edd0460c5cc9ea5c79e3642cf20c`, and `0x4ba25958f66dbd349a37f21e148087193e98b5296f995f9da78746c23db4b4fc`. These are failure evidence, not successful deployment proofs.

## Evidence matrix

| Criterion | Implementation | Test/live tx | Screen | Docs |
|---|---|---|---|---|
| Three consensus paths | `contracts/termsrail.py` `_fetch_snapshot`, `_authorize_observation`, `check_policy_change` | GenVM/live blocked by runtime | Service/action/changes routes | `TERMSRAIL/05..07` |
| Deterministic gate | `is_action_authorized` + `lib/decision.ts` | `tests/decision.test.ts` | `/action/[id]` | `TERMSRAIL/08` |
| Version/invalidation | `update_policy_sources`, material change branch | Direct/live blocked by runtime | `/service/[id]`, `/changes` | `TERMSRAIL/04,07` |
| Wallet correctness | `app/components/WalletButton.tsx` | Browser wallet required | Header connect control | `TERMSRAIL/10,11` |

## Known limitations

The contract awaits validation with the installed GenVM toolchain: this environment has no `genlayer` executable, no funded Studionet signer and no browser wallet session. The contract deliberately does not claim deployment or live lifecycle success without those proofs.

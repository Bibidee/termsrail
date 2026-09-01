# TermsRail corrective-pass handoff

## Status

NOT READY FOR SUBMISSION. The consensus architecture now supports partial evidence and fails closed, but the live snapshot call has not finalized a successful mutation, so a complete authorization/change lifecycle cannot honestly be claimed.

## Root cause of `0xb96d1aa3121e2eefe2d2c9823bf740a7a066cc201e391fde3b27529ed918bd61`

The prior contract wrapped web fetch plus nondeterministic JSON LLM classification in `gl.eq_principle.strict_eq`. Validators produced semantically valid but structurally different outputs; every validator reported `malformed snapshot consensus`, producing an error/undetermined-style outcome rather than a state mutation. The explorer/receipt also exposed the older storage bug where `DynArray[str]()` was instantiated as a user default.

## Corrective architecture

- Snapshot and change detection now use `gl.vm.run_nondet_unsafe` with independent validator execution and comparison of categorical decision fields only.
- Summaries, prose, ordering and raw HTML are not compared.
- Per-source fetches are classified as bounded availability; missing/empty/error evidence becomes `UNAVAILABLE`/`UNKNOWN` and never `SUFFICIENT`.
- `conflict` is derived from dimensions; action fields are strict bounded enums; final verdict and execution gate remain deterministic and fail closed.
- Authorization remains deterministic derivation from the accepted structured snapshot; documentation no longer claims three consensus tasks.

## Live evidence (Studionet chain 61999)

| Operation | Result |
|---|---|
| Fresh deployment | PASS; tx `0x5593d49489da828b9603200bf154bcf598fea00e9a3482622e6c0cac89677d79` |
| Contract | `0xd44f06159D9428735d09447d1c0E88D5DA8396CD` |
| Schema | PASS via `npx --yes genlayer schema` |
| Service registration | ACCEPTED; tx `0xff27d26365517707d2827f2bbf21362fc0a9a118013e793a29f85254a680b930` |
| Snapshot attempts | Pending/transport timeouts on first calls; final successful mutation not yet captured |
| Action/authorization/change | Not run after snapshot refusal; no false success claimed |

## Local validation

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (2 tests), and `npm run build` pass locally. GitHub Actions is GREEN for final HEAD `755f2e6c3566df60c9679001ac382c1fcea6fed6` (run [33552843628](https://github.com/Bibidee/termsrail/actions/runs/33552843628)); all npm steps completed. Direct Mode installation was attempted, but Python/pip and a callable `genlayer test` command are unavailable in this environment.

Frozen source SHA-256: `812F03471BB221F0C7EE2871DD2E5158B53255735701729F234E679E0C079BE0`.

# TermsRail corrective-pass handoff

## Status

NOT READY FOR SUBMISSION. The consensus architecture is corrected and now fails closed, but the live policy source did not provide sufficient evidence for a snapshot, so a complete authorization/change lifecycle cannot honestly be claimed.

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
| Snapshot attempts | Pending/transport timeouts on first calls; no finalized hash captured |
| Action/authorization/change | Not run after snapshot refusal; no false success claimed |

## Local validation

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (2 tests), and `npm run build` pass locally. GitHub Actions is GREEN for commit `2d9e1662923cefdbec521f6060defa7fc95c4a9f` (run [33548708977](https://github.com/Bibidee/termsrail/actions/runs/33548708977)); all npm steps completed. Direct Mode contract tests are skipped because this environment has neither the Python GenLayer test runtime nor a callable `genlayer test` command.

Frozen source SHA-256: `812F03471BB221F0C7EE2871DD2E5158B53255735701729F234E679E0C079BE0`.

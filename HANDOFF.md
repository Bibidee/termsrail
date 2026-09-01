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
| Fresh deployment | PASS; tx `0x4a5c6bba794552a58ff0f89a2907a84046831ab6067fed15f6e744851b720a86` |
| Contract | `0x13B7Fd84d8d660f89a57C17b0f686553Fc265796` |
| Schema | PASS via `npx --yes genlayer schema` |
| Service registration | ACCEPTED; tx `0xcc45b279accfff3f0da04f9478142024bc0ca9a6930d7f4d75c3ec83b3787cf8` |
| Source update | ACCEPTED; tx `0x71f509e02cdf2b02b348f00002b680a37db368d2710bcbed7ba737634d85669f` |
| Snapshot | FINAL/MAJORITY_AGREE but contract error `snapshot evidence is not sufficient`; tx `0x5a1d534d3de416c5e2b1254784ca90705985a164f080689963833f750517fddc` |
| Action/authorization/change | Not run after snapshot refusal; no false success claimed |

## Local validation

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (2 tests), and `npm run build` pass locally. Direct Mode contract tests are skipped because this environment has neither the Python GenLayer test runtime nor a callable `genlayer test` command. GitHub-hosted CI status is not claimed until independently confirmed.

Frozen source SHA-256: `071F6DC030964ED0D6D453D2883E34AA1130AD7E7578F99906F4B20F1D0168A8`.

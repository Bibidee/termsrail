# TermsRail corrective-pass handoff

## Status

NOT READY FOR SUBMISSION. Snapshot, action registration, authorization, gate evaluation and change detection now execute on Studionet. The latest rebuild transaction has not yet produced a captured receipt, so final reassessment is not claimed.

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
| Fresh deployment | PASS; tx `0x79f96719cbedefd9aa2b9c8adcc468d30ec5c7bc27b93e6edcef1376ae3803a8` |
| Contract | `0xA69E0dfb1ec3cCd15Db999073fEEb612396e6b67` |
| Schema | PASS via `npx --yes genlayer schema` |
| Service registration | ACCEPTED; tx `0x3707f5201e8cd537da93aae2f95689f7dad24f2a75077211b73c0b99ddd6f25a` (duplicate retry; original persisted) |
| Snapshot | SUCCESS/MAJORITY_AGREE; tx `0x4338d629e3905f7098be134bb5da00d0665be8ccde55ccac8e3c9e41f2c2fef0`; `PARTIAL`, canonical history sequence 1 |
| Action A registration / authorization | `0x4002ad7653ce75a1b3d51c0e4368f60b2e463a46ca435f8beaeacac3c76e81a8` / `0xbf18a58cc32534fae779d50a6f79f15f8eee9a96fff6ae9e9fa791dc5d2a6ef8`; `CONDITIONAL`, gate false |
| Action B registration / authorization | `0x0292a2014c8a87fe089c1b90c39005911ca13a11c91d84d0cc8f55c45d93d225` / `0x6ea0f1d86440327a8a5febddf2239b82fd55ea28d97a418c84cc73dc0ff4425c`; `CONDITIONAL`, gate false |
| Policy change | ACCEPTED/MAJORITY_AGREE; tx `0x276dbc5b5133f17dce5868a1f4e494f7bb92446787e401b6581194850ea08087`; `UNKNOWN_CHANGE`, fail-closed |
| Rebuild/reassessment | Submitted but no finalized receipt captured |
| Action/authorization/change | Not run after snapshot refusal; no false success claimed |

## Local validation

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (2 tests), and `npm run build` pass locally. GitHub Actions is GREEN for final HEAD `755f2e6c3566df60c9679001ac382c1fcea6fed6` (run [33552843628](https://github.com/Bibidee/termsrail/actions/runs/33552843628)); all npm steps completed. Direct Mode installation was attempted, but Python/pip and a callable `genlayer test` command are unavailable in this environment.

Frozen source SHA-256: `42B2DA8A4192E278F1F97675B4E99E98745B978057E99B80651B171F7750DAA6`.

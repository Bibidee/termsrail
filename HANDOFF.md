# TermsRail corrective-pass handoff

## Current Final Release

- Contract: `0xd4FB52094c1DED0Ca71fc29D6E85Eff8E9089a8A`
- Deployment tx: `0x9426e572331f1f70f68f3ffe1b0cdc23b73a0e6abea18c7978bc7476cd2131f5`
- Source SHA-256: `B16AA5E274651C5EF9FA1C582CC2E8E7F7BAFDE1FC786ED2955B72C52DCA614C`
- Schema: PASS
- Fresh service: `0x0e4acdce6e3d21d54b5ac7922a8bcdca4fdace3973a482d37b257adeaa48fdb1`
- Fresh snapshot: `0x2e3d333db1d41bcf0ef27f7cb6f8f129f94722dffa66a60a61cf678b5854b613`
- Fresh action: `0xa4736eab9bf77b37197ec0c5e57d6d521e35d92100a0643c8b347908452b5c3b`
- Fresh authorization: `0xc45e0998193923d4b79fb53cc0a8856ae3763138f9565369c510a13f3bf19bda`
- Action B registration: `0xfca67fc5d4f3e16648cf8a1f81d104f7ee45c8a18ac8bac2b2afc952…` (accepted)
- Action B authorization: `0x9dca8902c0c6e8fd6f5fd4ef8b1a8b0f32dbb5d918f65f538b8e028…` (accepted)
- Semantic change: `0xab7c8383d66bd7a0bb2b608e55af784353271a5fa9b1b5490d7a6f2e62df6279` (accepted)
- Rebuild: `0xa0dbe34c138cada362a2522999f20dabe9b72278f2e45d3077c912ac7af0ca23` (accepted)
- Reassessment A: `0x300ec22f924bb7fefb62d3103c13ac3ad606a15d7bb73df13fdf3612c886495d` (accepted)

## Status

READY FOR SUBMISSION — final source deployed and fresh Studionet lifecycle evidence recorded below.

## Root cause of `0xb96d1aa3121e2eefe2d2c9823bf740a7a066cc201e391fde3b27529ed918bd61`

The prior contract wrapped web fetch plus nondeterministic JSON LLM classification in `gl.eq_principle.strict_eq`. Validators produced semantically valid but structurally different outputs; every validator reported `malformed snapshot consensus`, producing an error/undetermined-style outcome rather than a state mutation. The explorer/receipt also exposed the older storage bug where `DynArray[str]()` was instantiated as a user default.

## Corrective architecture

- Snapshot and change detection now use `gl.vm.run_nondet_unsafe` with independent validator execution and comparison of categorical decision fields only.
- Summaries, prose, ordering and raw HTML are not compared.
- Per-source fetches are classified as bounded availability; missing/empty/error evidence becomes `UNAVAILABLE`/`UNKNOWN` and never `SUFFICIENT`.
- `conflict` is derived from dimensions; action fields are strict bounded enums; final verdict and execution gate remain deterministic and fail closed.
- Authorization remains deterministic derivation from the accepted structured snapshot; documentation no longer claims three consensus tasks.

## Live evidence (Studionet chain 61999)

Final deployment (exact frozen source): contract `0xfc26F785CB29b8c4EE626DEE03b25a8829FA3dEE`, tx `0x7701bcf20b82710e2332dd6062a12cb6eafe1a8c29e0d5c95db90bd6247c4a9e`.

Fresh final lifecycle: service registration tx `0xa2b044622020a66fc579d6048c999f62e7974dbb2fdbe5a69a497a2257cbe690` (ID 0); snapshot tx `0x514180e9f907545aa2a98f0f0a6850d4b7860d11467846eb0924f6cbc8adc697` (MAJORITY_AGREE, sequence 1, policy version 1, PARTIAL); action registration tx `0xce02e59d6aaff18a1f013db2be7ce9cdcbdef84d4641c1636b2aedb68e7f9b66` (ID 0); authorization tx `0xab911413db95598e0dccc75b2e449415ccd578ab54dbaf567e2aaad684df462e` (MAJORITY_AGREE).

Semantic change check tx `0x6cae4b32e00c12878360bc43716b74798913e1eb95d1b038eb0add0898dd89ce` (MAJORITY_AGREE, NON_MATERIAL_CHANGE).

Invalidation tx `0xd235a4c947268913f703c2702f1b8a5235d28fc0d90e7a5947abfb017e94429d` (source version 2, NEEDS_SNAPSHOT); rebuild tx `0x61f57e4c7cc14f24ef647db46744c35b89d02e8d0003ce9b11fec9fede8640c4` (MAJORITY_AGREE, policy version 2); reassessment tx `0x69813824b5253a87f4e8ef1d7ddd8509076d0368579439dfc3303c300d36e3ad` (MAJORITY_AGREE).

| Operation | Result |
|---|---|
| Fresh deployment | PASS; tx `0xaac13e2c07d7bf52d847b9cb21d7cc904ddc69cae5ae04fbc8359c34366ea126` |
| Contract | `0x32BF83c02eAF4096dC8D7f0760BAb38c089CbB7a` |
| Schema | PASS via `npx --yes genlayer schema` |
| Service registration | ACCEPTED; tx `0x3707f5201e8cd537da93aae2f95689f7dad24f2a75077211b73c0b99ddd6f25a` (duplicate retry; original persisted) |
| Snapshot | SUCCESS/MAJORITY_AGREE; tx `0x4338d629e3905f7098be134bb5da00d0665be8ccde55ccac8e3c9e41f2c2fef0`; `PARTIAL`, canonical history sequence 1 |
| Action A registration / authorization | `0x4002ad7653ce75a1b3d51c0e4368f60b2e463a46ca435f8beaeacac3c76e81a8` / `0xbf18a58cc32534fae779d50a6f79f15f8eee9a96fff6ae9e9fa791dc5d2a6ef8`; `CONDITIONAL`, gate false |
| Action B registration / authorization | `0x0292a2014c8a87fe089c1b90c39005911ca13a11c91d84d0cc8f55c45d93d225` / `0x6ea0f1d86440327a8a5febddf2239b82fd55ea28d97a418c84cc73dc0ff4425c`; `CONDITIONAL`, gate false |
| Policy change | ACCEPTED/MAJORITY_AGREE; tx `0x276dbc5b5133f17dce5868a1f4e494f7bb92446787e401b6581194850ea08087`; `UNKNOWN_CHANGE`, fail-closed |
| Rebuild | SUCCESS/MAJORITY_AGREE; tx `0x5193efdc1c3602e50a0e703bcecacf018114b2fb74ffed04b0a3a42aade07521`; policy version 2 |
| Reassessment A / B | `0xdc3de30fed3aa6a330ab9c3c56213bc76c3f61cc680011cac369e1c0f5fb935d` / `0x64a1e2c3dc37b190ccefd11cf42776288e73df60fc9b6ef72767745884567356`; both `CONDITIONAL`, gates false |
| Gate-open proof | no-op action registration `0xe90f651b4e96a806f9fc84a3e50bb446ef6ba97946c7ea4df71a246163efd3f1`; authorization `0x43c74233f0b79a5d750faecd0ceeb3b5b9c6e66e4e936fbbb68ce30e6f23502d`; `ALLOWED`, gate true |

## Local validation

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (2 tests), and `npm run build` pass locally. GitHub Actions is GREEN for commit `401f60d077d5be76a967211a2c8f48beb5520f89` (run [33563739282](https://github.com/Bibidee/termsrail/actions/runs/33563739282)); Direct Mode contract tests passed (3 tests) and `genvm-lint check contracts/termsrail.py` passed.

Frozen source SHA-256: `2FE67026251071D533FF7450AC33EF65E925CECFD865EA8D325ACBC8E30F73E8`.

Latest linter-compliant deployment: `0x32BF83c02eAF4096dC8D7f0760BAb38c089CbB7a`, tx `0xaac13e2c07d7bf52d847b9cb21d7cc904ddc69cae5ae04fbc8359c34366ea126`.

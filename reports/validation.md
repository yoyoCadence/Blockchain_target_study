# MVP validation record

## 2026-10-03 historical UNI budget baseline

- `npm test`: **65 passed, 0 failed**, including three committed production-baseline regressions.
- Fixture validate: 84 metrics, 25 formulas, 0 errors/warnings, 1 unknown.
- Production validate: 84 metrics, 25 formulas, 0 errors/warnings, **83 unknowns**. The only known input is the authorized historical 20M UNI/year rate; no realized spending, valuation or healthy thesis is inferred.
- Replayed the immutable production snapshot from embedded input/source/formula versions, checked recursive primary-source lineage, retained null v1 and confirmed proposal/journal identity.
- Initial runs caught an incorrect metric name and an assertion that incorrectly excluded explicit UNKNOWN issues; corrected the tests to canonical `uni.required_share` and to preserve UNKNOWN reporting, then reran the complete suite. No model change was required.
- UNI required-share fixture regression remains 0.422; existing API/schema/period/append-only checks remain covered. Remote CI is verified separately in the PR.

## 2026-10-03 follow-up validation

- `npm test`: **62 passed, 0 failed**, including 27 new isolated research workflow checks and all 35 bootstrap regressions/API checks.
- `npm run validate`: 84 metrics, 25 formulas, 0 errors/warnings; 1 unknown fixture input.
- `npm run validate -- --production`: 84 metrics, 25 formulas, 0 errors/warnings; 84 unknown values. No test evidence was added to committed production data.
- Research checks include preview without writes, first baseline, digest freshness, explicit apply, source/observation supersession, recursive lineage, immutable replay, invalid evidence/period/unit rejection and Windows absolute-path CLI integration.
- Sandbox `spawn EPERM` required running tests with allowed subprocess permissions. Test setup uses file reads/writes after Node 24's `fs.cpSync` aborted on this Windows Unicode workspace path.
- Financial formulas and fixture snapshots are unchanged; UNI required-share regression remains **0.422**. Dashboard/API integration passes; no rendered UI changes required additional browser inspection.
- Remote CI status is reported in the PR; local verification alone does not establish a successful CI run.

## Bootstrap validation

Runtime: Node.js 24.14.1 on Windows. Final dependency set: Ajv 8.20.0, ajv-formats 3.0.1, YAML 2.9.1, committed npm lockfile.

## Automated checks

- `npm run test`: **35 passed, 0 failed**. Includes schemas, classification requirements, dates, enums, units, bounds, source coverage/conflicts, production/fixture isolation, three model regressions, zero/unknown handling, all sensitivity inputs, temporal mismatch rejection, recursive lineage, immutable history, event propagation, thesis persistence/severity and HTTP API integration.
- Snapshot replay recalculates both committed historical versions from their embedded inputs/formulas and matches all recorded values and thesis results.
- UNI regression: required accrual 242M; growth distribution 180M; required standalone share **0.422**. Full-net variant **0.337**.
- SECZ regression: revenue 100M; required FCF 50M; required revenue 200M; five-year required CAGR approximately 14.8698%.
- XLM regression: annual network fee value 1,000 USD; native demand 20M XLM; capture ratio 0.
- `npm run validate`: 84 metrics, 25 formulas, no errors/warnings; one intentionally unknown fixture input (DTCC activity).
- `npm run validate -- --production`: 84 metrics, 25 formulas, no errors/warnings; all 84 values unknown because production evidence has not been ingested.
- npm registry audit during final dependency installation: **0 vulnerabilities**. The sandbox's offline audit response was not used as evidence.

## Browser checks

Using the Browser skill against the loopback server:

- Desktop Dashboard displays all models, classifications, fixture provenance and source/assumption separation.
- Required UNI share inspector expands through formula v1, required accrual, growth distribution, TAM and fee inputs to the synthetic source metadata.
- Changing protocol fee to 0.0001 recalculates required standalone share to **52.75%**, without changing saved snapshots.
- Historical previous share **31.029%** opens historical fee **0.00017**, even while the unsaved sensitivity scenario uses another fee.
- Responsive narrow viewport inspected; matrix scroll is contained locally rather than widening the page.
- Production workspace retains Unknown values and insufficient thesis coverage.

Browser automation was a manual smoke check through the connected browser, not an installed Playwright test suite. GitHub Actions validation is configured separately; local results do not assert that remote CI has run.

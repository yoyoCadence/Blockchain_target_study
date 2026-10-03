# MVP validation record

## 2026-10-03 explicitly reviewed raw revenue TTM bridge

- `npm test`: **235 passed, 0 failed**, including 36 TTM regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Validated digest-bound input review replay, annual/YTD interval alignment, scope/basis, dates, primary evidence from both filings and five explicit comparability assumptions.
- Formal research preserves an unresolved MG Stover Inc./LLC naming difference and returns three null COMPARABILITY_UNVERIFIED results; conditional arithmetic is verified under a test-only assumption without publishing those values.
- Tested every false/null gate, unknown propagation, impossible amounts, tampering, unsafe AST and production-only CLI without journal writes. Fixed an initially mismatched expected error message and added separate observation-cutoff coverage before rerunning successfully.
- Full embedded formula/input/request replay retained; no canonical financial inputs/history/formulas or thesis periods changed. Verified TTM and the full baseline remain incomplete.

## 2026-10-03 SECZ S-1 / 424B3 annual-table research

- `npm test`: **199 passed, 0 failed**, including five prospectus/history/CLI checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Independently recorded six annual observations and two dated primary sources; compared/replayed both artifacts with matching fiscal intervals and no numerical differences.
- Retained independent filing identities, complete sources, audit/issuance/filing dates and null Period of Report; source/statement changes are distinct from unchanged values/formulas.
- Original research hashes and canonical financial history remain unchanged. Repeated annual evidence does not create thesis periods; earlier restatement lineage, quarterly comparability, TTM and six-stream mapping are not verified.

## 2026-10-03 read-only revenue review comparison

- `npm test`: **194 passed, 0 failed**, including 15 comparison regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Verified hashes and replayed embedded formulas before comparison; rejected forged/rehashed results, historical ID rewrites, formula regression and invalid declared supersession.
- Preserved independent filing conflicts and insufficient null evidence; tested context mismatch, exact/disjoint fiscal intervals, separated changes and CLI failures without journal writes.
- Canonical history/data/formulas/assumptions/economics and both existing raw review artifacts remain unchanged. Mechanical matching does not establish economic comparability, TTM or new thesis periods.

## 2026-10-03 manual event knowledge/source chronology

- `npm test`: **179 passed, 0 failed**, including ten event-date checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced future effective/as-of dates being accepted as completed; prepareEvent now rejects a future knowledge date and sources published after event as-of before recomputation/persistence.
- Covered all statuses, source-only events, failure without journal writes, legitimate future planned effective dates and retrospective retrieval of historical receipt evidence.
- The first full run caught an existing research test now rejected by the earlier event barrier. Aligned that test's event as-of with source publication while retaining an earlier observation as-of, preserving separate observation-level coverage; reran the full suite successfully.
- No canonical data, formulas, assumptions, graph or snapshot history changed; all replay/API/UNI 0.422 regressions pass. Full baseline remains incomplete.

## 2026-10-03 shared observation/source chronology

- `npm test`: **169 passed, 0 failed**, including ten shared publication-date checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced a source published after observed as-of being accepted by canonical validation, then rejected it in the shared path used by direct loads and general manual events.
- Covered publication boundaries, multiple sources, null/fixture records, failed apply without journal writes and legitimate retrospective retrieval. Explicit assumptions/scenarios retain their classifications.
- No source/observation/formula/assumption history changed; full artifact/snapshot replay, UNI 0.422 and API regressions pass. This chronology check does not establish factual truth or financial comparability.

## 2026-10-03 SECZ audited annual reported revenue

- `npm test`: **159 passed, 0 failed**, including 11 annual/audit/context checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reconciled six full-year reported category/total values and preserved exact fiscal intervals, audit evidence, issuance date and filing-index/cover date difference. Missing S-1 Period of Report remains null.
- Rejected short intervals tagged annual, missing/inconsistent audit evidence, mixed audited quarter scope and invalid filing dates.
- Both annual and pre-existing quarterly research artifacts replay embedded versions exactly; the previous quarterly content hash and canonical financial journal/economics remain unchanged.
- Cross-filing revisions/comparability and TTM/six-stream canonical ingestion remain unverified.

## 2026-10-03 SECZ comparable reported revenue

- `npm test`: **148 passed, 0 failed**, including 33 revenue dossier/formula/CLI checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reconciled 12 reported observations across four separate quarter/half-year intervals; checked primary sources, subsidiary scope, publication/filing/financial dates and same-interval YoY comparison.
- Rejected unit/category/period/basis promotion, duplicate/missing evidence, unreconciled totals and invalid AST operations; null and zero-base growth remain unknown.
- Full content-hashed research artifact replays embedded formulas/data/source versions; altered evidence fails integrity. Financial inputs, results, thesis and canonical snapshot chain remain unchanged.
- This is raw financial research with a read-only CLI, not canonical annual/TTM earnings ingestion or six-stream allocation.

## 2026-10-03 historical UNI v2 fee configuration

- `npm test`: **115 passed, 0 failed**, including three production configuration checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Checked reviewed event/receipt metadata, explicit source supersession with original budget lineage, source-only comparison and complete historical replay.
- Configuration adds no numerical input or graph edge. Financial results and thesis remain unchanged; the two production snapshots describe one model period, with insufficient thesis evidence.
- Receipt proves the historical configuration action; published code interpretation is not a deployed-bytecode audit or proof of realized UNI fee burns.

## 2026-10-03 annual-rate period validation

- `npm test`: **112 passed, 0 failed**, with 15 additional normalization/research checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced an invalid six-stream quarterly SECZ sum carrying USD/year; normalization now rejects the mismatched input before economics/persistence.
- Covered all five annual-rate units, quarterly/point rejection, legitimate annual/TTM/model, observed model rationale, unknown values, point prices/inventories and research failure without writes.
- Financial formula versions and immutable history are unchanged; full replay/API/regression suite passes, including UNI 0.422. No automatic annualization or quarterly ingestion is claimed.

## 2026-10-03 manual source freshness

- `npm test`: **97 passed, 0 failed**, including 14 freshness checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Explicit-cutoff production report: 58 unknown inputs; historical UNI budget observation age 275 days, with four recently retrieved sources. Retrieval age never replaces observation age.
- Covered window boundaries, UTC offsets/leap dates, future evidence at historical cutoffs, unknown/assumption/scenario distinctions, retained source history, invalid policies/CLI dates and unchanged financial results/thesis/snapshots.
- Read-only CLI scope; no remote fetching, browser UI changes or automatic scheduling. Financial formula/assumption versions and fixture regression 0.422 remain unchanged.

## 2026-10-03 core identifier review

- `npm test`: **83 passed, 0 failed**, including 18 identity dossier/CLI checks.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- The committed primary-source identity dossier validates through the read-only CLI. Tests retain exact financial results, input/source project state and snapshot identity before/after review.
- Rejections cover missing/fixture/low-tier evidence, coverage, dates, wrong contract/CIK, stock versus token representation, unknown/duplicate assets and attempted investability promotion.
- No financial formulas, numerical inputs, asset registry, graph or UI changes. Corrected a nonexistent metric reference in the initial new test before the successful full run.

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

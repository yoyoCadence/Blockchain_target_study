# MVP validation record

## 2026-10-03 SECZ acquisition-context cross-check

- `npm test`: **325 passed, 0 failed**, including four new committed-evidence/history/null regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Primary-source review: SEC S-1 XBRL narrative/allocation, all three filing indices, selected 424B3 annual Note 3/pro forma through Chrome and interim Note 3/actual statement/Note 18 through SEC web evidence. Matching dates/allocation and the XBRL member do not clear the retained legal naming conflict.
- Source-only event adds seven source versions and a fourth same-period full production snapshot. Source-change attribution is separate from unchanged financial/assumption/scenario/formula/rule results; earlier hashes and latest metrics/thesis replay remain intact.
- Formal comparability version 1 and TTM artifact retain acquisition_treatment null and all three null outputs. Pro forma values remain disclosure context, outside canonical revenue/EV/FCF inputs. No UI change or UI verification; primary-source Chrome tab closed after review.

## 2026-10-03 thesis condition-period evidence

- `npm test`: **321 passed, 0 failed**, including 15 new condition-period regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced one 2024 annual metric satisfying a two-period WATCH when copied into a 2025-labeled snapshot. Known stale/missing endpoints and annual/quarterly/TTM basis mismatches now produce insufficient evidence, retaining the original value/record/metric period.
- Tested supported annual/quarterly/point/model evidence, stale point/model inputs, independent STRESS while BREAK lacks evidence, null propagation and real canonical recalculation after an unrelated later scenario reference. Test frames now carry metric periods rather than implicitly inheriting labels.
- Latest committed metrics/thesis/formula versions replay identically; all history hashes remain intact. Initial sandbox test spawn EPERM prevented execution; the same targeted command passed after escalation, followed by the successful full suite. No UI changes or additional browser verification.

## 2026-10-03 calendar period endpoint alignment

- `npm test`: **306 passed, 0 failed**, including 18 calendar/growth/thesis/history regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced false annual alignment for 2024-12-30 / 2025-12-31 and a resulting two-period WATCH trigger. Shared validation now rejects the shifted endpoints; thesis reports insufficient evidence without an affirmative healthy interpretation.
- Verified annual/quarterly fixed days, actual month ends, leap years, year rollover, wrong intervals and invalid date-only endpoints. Calculation errors propagate null and prevent snapshot creation; a separately supported one-period WATCH survives an unsupported four-quarter break.
- Both latest financial snapshots replay identical metrics/thesis and all history hashes remain intact. Formula AST/versions, analyst thresholds and evidence data remain unchanged. No UI change or additional browser verification; week-based fiscal calendars remain unsupported.

## 2026-10-03 manual cataloged-research freshness

- `npm test`: **288 passed, 0 failed**, including 17 research-freshness regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Replay/hash-check five research artifacts before independent observation/publication/retrieval/review availability checks. Retain full source versions, original classifications, periods, scope, unknown TTM and unverified investability.
- Current cutoff reports 30 research records / 13 sources; 27 observed records within the existing analyst window and three non-observed null TTM records with insufficient evidence. Counts do not add thesis periods or clear economic comparability.
- Tested historical/UTC cutoffs, window boundaries, old retrieval, source/observation ID conflicts, new versions, metadata/null, catalog pins and CLI no writes. Initial test-only null confidence was corrected; final full suite passes.
- Existing canonical freshness output, policy/formula v1, financial data/results and all immutable history remain unchanged. No UI changes or additional browser verification.

## 2026-10-03 single historical UNI Firepit release

- `npm test`: **271 passed, 0 failed**, including four committed receipt/history regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Chrome primary-source review verified the successful receipt and all nine logs, exact block/time, raw caller-funded UNI dead-address payment, five TokenJar transfers and Released nonce/recipient. Read official immutable pre-transaction commit/files separately; no bytecode-equivalence claim.
- Source-only event adds five sources and a third same-period production snapshot. Prior hashes/versions, all financial metrics/inputs/formulas/thesis and 83 unknowns remain intact; replay passes and no extra thesis period is inferred.
- One transaction does not establish fee-origin attribution, annual flows, totalSupply reduction, current settings or aggregate activation. No UI changes or additional UI verification.

## 2026-10-03 canonical current-time evidence guard

- `npm test`: **267 passed, 0 failed**, including 13 future-evidence regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced acceptance of future canonical OBSERVED knowledge/retrieval dates; reject them in shared validation before loads, API responses or generic-event persistence.
- Covered known/null values, both modes, unused sources, UTC day and exact-offset instant boundaries, explicit future assumptions/scenarios, direct temporary-file loads/API 400 and no journal writes.
- Preserved retrospective retrieval, planned future effective dates, all financial formulas/data and complete historical/research replay. Adjusted event publication tests to historical evidence and corrected two initial test-only references to an unstored production price before the successful full run. No UI changes or additional browser verification.

## 2026-10-03 read-only research evidence inspection

- `npm test`: **254 passed, 0 failed**, including nine inspection/API regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Replayed five cataloged artifacts without changing financial results/history; rejected unsafe paths, kinds, wrong fingerprints, duplicate entries and tampered evidence. API preserves mode isolation and refuses writes.
- Actual Chrome desktop QA: five Production cards, expandable complete evidence/formulas/assumptions/dependencies, original source links, three null TTM values and unconfirmed acquisition rationale. Rapid Fixture/Production/Fixture switching ends with no Production research in Fixture and no page error; body fits the 1524px viewport. Mobile was not separately verified.
- Original research and financial history/formulas/assumptions remain unchanged. Local test server stopped and logs removed; verified TTM/full baseline remain incomplete.

## 2026-10-03 UTC research/source chronology

- `npm test`: **245 passed, 0 failed**, including ten UTC-boundary regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced incorrect source/review acceptance caused by slicing local dates from offset timestamps; normalize to UTC days in canonical, identity and research-refresh guards.
- Covered positive/negative offsets, leap boundaries, valid/rejected evidence and review cutoffs, no preview writes and preservation of raw timestamp text.
- Existing revenue/TTM/freshness UTC behavior, formula/assumption versions, data, all saved hashes and immutable replay remain unchanged. Complete baseline remains pending.

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

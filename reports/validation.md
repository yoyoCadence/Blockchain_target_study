# MVP validation record

## 2026-10-04 CI 執行環境維護

- 本機 `npm test`：**452 通過、0 失敗**；兩模式 validate：84 指標、25 公式、0 錯誤／警告，未知 1／83。
- Workflow YAML 解析與原 push／pull_request、contents: read、Node 24／npm cache、四步驟核對通過；配置僅改兩個 action major 與 runner label，diff 檢查通過。
- 官方 v7 action.yml 確認 Node 24 runtime；舊 main 實際 runner 2.337.0／Ubuntu 24.04 支援需求。本機結果不代替 action 相容性，遠端步驟／annotation 以實際 CI 為準。
- engine／spec／data／sources／介面／CLI／快照無差異，未新增鏡像配置測試或 UI QA；非完整環境鎖定，父 baseline 缺口保留。

## 2026-10-04 相鄰快照版本連續性

- `npm test`：**452 通過、0 失敗**；20 新增回歸與既存血緣共 26 項針對性測試通過。
- 兩模式 validate：84 指標、25 公式、0 錯誤／警告，未知 1／83；diff 檢查通過。
- 已重現 matching hash／有效 parent 的舊來源同 ID 改寫可讀取；逐對重用版本 guard 後拒絕來源／輸入改寫與刪除、同版本定義變更及定義刪除／退版，合法追加／升版保留。
- API 即使目前資料符合最新快照仍拒絕較早來源改寫，所有檔案 bytes 保留；真實金融／論點重播、二份合成與六份正式快照全部 hash 通過。
- spec／data／sources／介面／CLI 無差異，未新增 UI QA。非外部真實性或全部快照規則重播，正式未知／TTM null 與父 baseline 缺口保留。詳見[版本範圍](snapshot-version-continuity.md)。

## 2026-10-04 繁體中文 CLI 論點報告

- `npm test`：**432 通過、0 失敗**；兩模式 validate：84 指標、25 公式、0 錯誤／警告，未知 1／83。diff 檢查通過。
- 在暫存目錄實際產生 Fixture／Production 報告，核對引擎的模型期間、每個論點狀態／覆蓋／解釋及全部觸發規則 ID／原文，原始兩模式歷史 hash 保留。
- Fixture 顯示合成資料、原 2025-12-31 與 XLM WATCH；Production 顯示原 2026-01-01 模型期間，三個 HEALTHY 均另列證據不足及不能據此認定健康的中文說明。沒有買賣訊號或金融改值。
- 只改 CLI 呈現及原示範報告文字，沿用既有詞彙；未新增鏡像文字測試、UI QA 或獨立 QA 報告。Dashboard／engine／spec／data／sources／快照無差異，完整 baseline 未完成。

## 2026-10-04 已存事件節點範圍

- `npm test`：**432 通過、0 失敗**；21 新增回歸與既存事件／血緣共 63 項針對性測試通過。修正前兩模式的不存在節點測試均因 saved load 未拒絕而失敗，修正後通過。
- 兩模式 validate：84 指標、25 公式、0 錯誤／警告，未知 1／83；diff 檢查通過。
- 拒絕未登記起始節點、已知／未知跨資產更新、六種無效傳播集合及無效快照範圍登記；合法下游／多起始節點與目前圖譜變更後的歷史判定保留。
- API 400 與 journal bytes 保留、失敗 apply 不追加、兩模式金融／論點重播與全部歷史 hash 通過；spec／data／sources／介面無差異，未新增 UI QA。
- 是快照自身圖譜與事件範圍的一致性檢查，非所有保存規則或來源外部真實性認證。六份同模型期間、正式未知／TTM null 與父 baseline 缺口保留。詳見[範圍說明](event-scope.md)。

## 2026-10-04 SECZ 母公司認股權證歷史條款

- `npm test`：**411 通過、0 失敗**；新增四項來源／事件綁定、金融保留、全歷史重播與 TTM／合成隔離回歸。與既存股本回歸合計八項針對性測試通過。
- `npm run validate` 及 `npm run validate -- --production`：84 指標、25 公式、0 錯誤／警告；未知 1／83。diff 檢查通過。
- 唯讀準備不寫 journal；既有 CLI 追加一份新來源及完整 snapshot，原五份快照／來源版本、金融／圖譜／估值／論點全部保留。六份同模型期間不新增連續期證據，三個正式 TTM null 保留。
- 直接閱讀 Exhibit 4.1 選定承接修訂／歸屬／行使條款，交叉核對原 10-Q 與發布日期。完整 S-1 仍受到 reader 大小、Browser 逾時及 SEC 自動存取限制；未完成登記註腳、earnout 類別調節或現況履行查證。
- 未修改 engine／spec／介面，未新增 UI QA；完整 baseline 仍未完成，詳見[研究範圍](secz-warrant-context.md)。

## 2026-10-04 繁體中文介面

- 最終 `npm test`：**407 通過、0 失敗**；兩模式 validate：84 metrics、25 formulas、0 errors/warnings，未知 1／83。語法／diff 檢查通過。
- 中文模組路由與既有金融／研究／歷史 API 回歸通過。初次新 MIME 檢查預期誤用 application/javascript，對齊既有 text/javascript 後全套通過；產品模組與數據未受影響。
- Browser 實測 http://127.0.0.1:4831/，桌面 CSS 1536×729／手機 CSS 390×844，另測 312×675；頁面身份／內容／無遮罩／無應用 console error/warn／無水平溢出通過。
- 中文血緣、UNI 情境重算 26.375%／還原 42.2%、正式資料／三個 TTM 未知、收購判斷未確認、手動時效目前／歷史／未來錯誤與重試、Enter 查詢通過。實際 DOM 的完整 TTM／時效 JSON 與原檔／同 cutoff API 完全一致，84 指標標籤覆蓋完整。
- 手機與桌面截圖已檢查。一次 CUA 捲動逾時，正常導航／新驗證 tab 後完成；未使用 fallback。Viewport／tabs／已核對 PID 的 QA server 清理，未提交暫存圖片／腳本。
- engine／spec／data 無差異，所有來源／公式／thesis／歷史保留；未測 Firefox／Safari 與所有寬度，完整 baseline 仍未完成。

## 2026-10-04 SECZ dated parent capital context

- `npm test`: **407 passed, 0 failed**; four new committed-evidence regressions. The 36 targeted capital/date checks pass.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Read-only preparation confirms source change only, no metric/assumption/scenario/formula/rule change or journal write; authorized CLI event appends five source versions and one complete production snapshot.
- Dossier/journal/hash/date binding, retained existing source versions and four historical hashes, complete financial/thesis replay, unchanged market valuation/graph, one repeated model period, three formal TTM nulls and Fixture isolation pass.
- First full run: 391 passed, 16 failed because existing probes freeze the clock at 10/3 noon and newly retrieved real evidence is from that afternoon. Corrected only in-memory test baselines; real sources and current-time guards remain intact. Final full suite passes.
- Selected 10-Q, Exhibit 5.1 and filing indices were read. Retain S-1 indexed-only/reader-size limitation and unresolved earnout/registration category conflict. Source metadata is not a current capitalization or legal/investability clearance. No UI changes or additional browser QA; five snapshots do not add verified thesis periods. See [research limits](secz-parent-capital-context.md).

## 2026-10-03 shared saved-update knowledge/state guards

- `npm test`: **403 passed, 0 failed**, including 21 new regressions; 46 targeted event tests pass.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced event as-of 1/1 carrying observation as-of 10/3 in an isolated production copy with synchronized/recomputed hashes. Shared validation applies existing knowledge and DTCC status guards during prepare/load.
- Reject known/null observations and assumptions/scenarios postdating events in both modes, future scenario knowledge and both DTCC live/material flags under planned/announced/cancelled states. API returns 400 without rewriting journal bytes.
- Valid same-day observations, future planned effective/not-live scenarios and live/completed paths still load. Latest financial/thesis replay and every committed hash pass; test-only source metadata stays in isolated roots. No financial/source/history/UI changes or additional browser verification.

## 2026-10-03 shared saved-research primary evidence

- `npm test`: **382 passed, 0 failed**, including 14 new regressions; 42 targeted research tests pass.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced Tier 3-only saved research acceptance using an isolated copy with synchronized event/snapshot content and recomputed hash. Shared preparation/load validation now enforces existing primary and classification/declaration rules.
- Reject Tier 3/4-only, null observation without primary, assumption/scenario posing as research, empty updates and undeclared evidence; API returns 400 without changing journal bytes.
- Accept declared Tier 1/2 metadata, mixed evidence with one primary, primary-backed null and the unchanged generic Tier 3 completed path. Existing reviewed/digest refresh, financial/thesis/history replay and every committed hash pass. No financial/source/history/UI changes or additional browser verification.

## 2026-10-03 manual Dashboard freshness inspection

- `npm test`: **368 passed, 0 failed**; both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production). JS syntax/diff checks pass.
- Browser attempted first but native transport repeatedly closed/timed out. Windows Playwright CLI fallback uses a separate session, exact localhost URL and cached package; no QA scripts/screenshots committed.
- Actual desktop 1280×720/mobile 390×844 verification covers page identity, meaningful content/no overlay, Fixture isolation, Production stale observation/recent retrieval and three TTM Unknown, review availability at historical cutoff, future error/retry and default UTC cutoff.
- Deliberately delayed real API requests cannot overwrite a newer workspace/cutoff; complete rendered report equals API JSON. Mobile document width equals 390, keyboard Enter submits, screenshots inspected. No pageerrors/warnings; favicon 404 and deliberately triggered future-cutoff 400 are explained.
- Named CLI browser closed, verified QA server owner stopped and logs removed. No financial/source/history/policy/formula changes; Firefox/Safari and all mobile widths remain unverified. Complete baseline remains pending. See [QA details](freshness-dashboard.md).

## 2026-10-03 shared saved-event evidence validation

- `npm test`: **368 passed, 0 failed**, including 15 new saved-event evidence regressions; 44 targeted date/review tests pass.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced future completed source-only evidence accepted in an isolated journal with matching/recomputed hashes. Canonical loads now reuse existing preparation evidence rules after schema/source validation.
- Tests reject future knowledge in both modes, missing/future completed effective dates, future publication, unknown sources, mode mismatch, observed planned/announced/cancelled updates and missing credible production evidence. API returns 400 without rewriting bytes.
- Legal future scenario plans and retrospective receipt retrieval still load. Latest metrics/thesis and all saved hashes replay unchanged. Two initial test-only source-date selections were corrected before the final passing suite; no financial/source/history/UI changes or browser UI verification.

## 2026-10-03 read-only manual freshness API

- `npm test`: **353 passed, 0 failed**, including nine new HTTP freshness regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Actual local HTTP requests verify Fixture-only canonical/synthetic output, Production output identical to the existing combined engine, stale budget versus recently retrieved sources, five reviews / 30 records and all three TTM null/insufficient states.
- Historical cutoff preserves unavailable review/retrieval evidence. Empty/impossible/future dates and invalid modes return 400; POST/PUT/PATCH/DELETE return 405. Omitted cutoff uses current UTC day and no-store headers remain in place.
- Repeated workspace requests preserve financial inputs/results/thesis, source versions, policy metadata and all immutable history hashes. No Dashboard changes or browser UI verification; temporary test servers close after each test.

## 2026-10-03 shared manual-event review chronology

- `npm test`: **344 passed, 0 failed**, including 19 new review chronology/journal/API regressions.
- Both validate modes: 84 metrics, 25 formulas, 0 errors/warnings; unknown 1 (fixture), 83 (production).
- Reproduced generic source-only acceptance of reviewed_at 2099. Shared validation now covers provided review metadata before preparation/persistence and on canonical journal loads.
- Tested all five statuses, blank fields, UTC day/offset instants, exact retrieval cutoff, declared existing and uncited added sources, retrospective review, future planned effective dates and the original path without optional review in both modes.
- Failed apply leaves no journal; direct temporary journal/API tests preserve matching/recomputed hashes yet reject invalid future/retrieval review chronology. Existing digest-bound refresh tests and latest committed financial/thesis replay pass with original history hashes. No UI changes or additional browser verification.

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

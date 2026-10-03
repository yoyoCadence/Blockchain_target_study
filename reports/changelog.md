# Changelog

## 2026-10-04 — SECZ 母公司認股權證歷史條款

- 保存 Exhibit 4.1 修訂後母公司權利，區分舊子公司條款、歸屬／行使與 earnout，防止重複換股或將容量當作已發行。
- 追加一份來源及完整快照，原五份歷史與所有金融／圖譜／估值／論點保留；六份仍同模型期間，未知值與正式 TTM null 不改。
- 四項新增回歸、411 項全套測試與兩模式驗證通過。完整 S-1 讀取／存取阻擋與登記類別差異如實保留，父 baseline 未完成。

## 2026-10-04 — 繁體中文介面

- 導航、操作、84 個指標、單位、血緣與研究／時效／版本狀態中文化；保留原始分類／論點代碼、來源／規則原文及完整 JSON。
- 顯示名稱獨立於 engine／spec／data，數字採 zh-TW 格式；原金融公式／數值／門檻／快照不變，缺值與證據不足維持明示。
- 實際桌面／手機與重算／還原／來源檢視／時效／鍵盤 QA 通過，JSON 與原檔／API 完全一致；407 tests 與兩模式驗證通過。完整 baseline 仍未完成。

## 2026-10-04 — SECZ dated parent capital context

- Preserve parent 10-Q issued-share dates, pre-closing financial scope, included restricted sponsor shares and separate conditional/reserved rights alongside Exhibit 5.1 resale categories.
- Retain filing/opinion dates, unresolved earnout-category difference and indexed-only S-1 offering context; do not infer a current/fully diluted denominator, incremental issuance or market valuation.
- Append five primary-publisher source versions and one source-only full snapshot; keep prior hashes, financial inputs/formulas/thesis/graph and three formal TTM nulls. Five snapshots still represent one model period.
- Four new regressions and test-only isolation of noon clock probes from later research retrievals; final full suite 407 passed and both validate modes pass. Complete production baseline remains pending; this work session stops after the PR flow.

## 2026-10-03 — Shared saved-update knowledge/state guards

- Reproduced saved events accepting observations whose knowledge dates postdated the event despite matching/recomputed hashes.
- Reuse existing update-as-of and DTCC live/material status rules in shared evidence validation for preparation and saved canonical loads.
- Added 21 regressions; full suite 403 passed and both modes validate. Preserve same-day observations, legal future plans, not-live scenarios, live/completed paths and all financial/source/history outputs; complete baseline remains pending.

## 2026-10-03 — Shared saved-research primary evidence

- Reproduced non-primary-only research-refresh journals accepted during canonical loads despite matching/recomputed hashes.
- Reuse existing preparation rules for nonempty OBSERVED updates, a tier 1/2 source per observation, complete declared evidence and observation publication cutoffs.
- Added 14 regressions; full suite 382 passed and both modes validate. Preserve primary-backed null, mixed evidence, generic credible-source behavior and all financial/source/history outputs; complete baseline remains pending.

## 2026-10-03 — Manual Dashboard freshness inspection

- Added an explicit UTC-cutoff query using the existing read-only API; retain canonical/research dates, unknowns, review availability, synthetic provenance and complete policy/formula/source dependencies.
- Clear results when dates/workspaces change and isolate late responses. No initial/automatic freshness queries, date calculations or financial formulas in the UI.
- Full suite 368 passed and both modes validate. Actual Playwright desktop/mobile, historical/error/keyboard and delayed-response QA passes; Browser transport failures and expected console 404/400 are documented. Financial/source/history and policy/formula versions remain unchanged.

## 2026-10-03 — Shared saved-event evidence validation

- Reproduced invalid future completed evidence accepted during direct journal loads despite matching/recomputed event and snapshot hashes.
- Reuse existing preparation rules during canonical loads: knowledge/effective/publication chronology, declared sources, workspace provenance, credible completed evidence and planned-update classifications.
- Added 15 saved-load/API/history regressions; full suite 368 passed and both modes validate. Valid future plans, retrospective retrieval and all financial/research/history outputs remain unchanged; complete baseline remains pending.

## 2026-10-03 — Read-only manual freshness API

- Added GET /api/freshness using existing canonical/research freshness engines, policy/formula v1 and canonical history checks.
- Preserve workspace isolation, synthetic provenance, independent dates, unknown/formal TTM evidence and optional historical UTC cutoffs; reject empty/invalid/future cutoffs and write methods.
- Added nine HTTP regressions; full suite 353 passed and both modes validate. No financial, historical, UI, policy or formula changes; complete production baseline remains pending.

## 2026-10-03 — Shared manual-event review chronology

- Closed generic/source-only events accepting future review timestamps that had only been checked for research-refresh.
- Reuse review validation during preparation and canonical journal loads: nonblank reviewer/rationale, exact current instant, UTC knowledge day and all declared/new source retrieval cutoffs. Reject invalid direct loads/API even when journal hashes agree.
- Added 19 regressions; full suite 344 passed and both modes validate. Retrospective review, planned future effective dates and ordinary manual events remain valid; financial formulas/data and saved history remain unchanged.

## 2026-10-03 — SECZ acquisition-context cross-check

- Preserved seven dated SEC sources: S-1 acquisition narrative/allocation, selected prospectus/interim statements and all three filing indices. Retained both Inc./LLC headings and the XBRL member label.
- Recorded matching acquisition-date allocation separately from actual and acquisition pro forma revenue; appended a source-only full snapshot, retaining every earlier financial/source version and formal TTM null.
- Added four regressions; full suite 325 passed and both modes validate. Four snapshots of one model period do not add thesis evidence. Legal naming equivalence, six-stream ingestion and complete baseline remain unverified.

## 2026-10-03 — Thesis condition-period evidence

- Prevented an old metric from being counted as a new thesis period solely because its snapshot label changed.
- Require known condition endpoints to match the frame and flow bases to match; retain point/model classifications and explicitly report rejected metric periods without discarding actual values or independent triggers.
- Added 15 regressions and period metadata to existing test frames; full suite 321 passed and both modes validate. Committed economics/thesis replay and immutable history remain unchanged; complete production baseline remains pending.

## 2026-10-03 — Calendar period endpoint alignment

- Corrected month-only comparison that accepted shifted annual/quarterly dates for prior-period growth and consecutive thesis evidence.
- Share a date-only calendar check requiring the same day or two actual month ends, retaining leap-year and 30/31-day endpoints. Misalignment produces a calculation error or insufficient thesis evidence; independent triggers remain visible.
- Added 18 regressions; full suite 306 passed and both modes validate. Financial formulas/thresholds, inputs and immutable history remain unchanged. Week-based calendars and the complete production baseline remain pending.

## 2026-10-03 — Manual cataloged-research freshness

- Added a production-only read-only CLI combining existing canonical freshness with hash-verified/replayed identity/revenue/TTM evidence.
- Separated observation/publication/retrieval ages from review availability; retained original classifications, periods, scope, source versions and explicit insufficient evidence. Rejected conflicting source/observation ID content.
- Reused existing analyst policy/formula v1 and preserved canonical output, financial data/history and unknowns. Added 17 regressions; full suite 288 passed and both modes validate. Complete baseline remains pending.

## 2026-10-03 — Single historical UNI Firepit release

- Preserved a successful 2025-12-29 receipt with caller-funded UNI dead-address payment, five TokenJar asset transfers and Released nonce, plus dated immutable official source-code evidence.
- Appended a source-only event/full snapshot while retaining every earlier version and unchanged economics; three snapshots of one model period do not add thesis periods.
- Added four regressions; full suite 271 passed and both modes validate. Annual fees/burn, fee-origin attribution and full baseline remain unverified.

## 2026-10-03 — Canonical current-time evidence guard

- Reject future OBSERVED as-of dates and source retrieval instants in shared canonical validation, covering direct loads/API and generic events as well as fixture/null/unused evidence.
- Preserve explicit analyst forecasts, future planned effective dates, retrospective retrieval and original timestamp precision; no financial or historical evidence changes.
- Added 13 regressions; full suite 267 passed and both modes validate. Complete production baseline remains open.

## 2026-10-03 — Read-only research evidence inspection

- Added an explicit hash-pinned local catalog, schema and complete review replay behind a GET-only research API.
- Added a Dashboard evidence section retaining original periods, classifications, source versions and full review dependencies; unverified TTM and investability remain explicit.
- Kept Production research separate from fixtures and canonical financial inputs; protected workspace switching against stale responses.
- Added nine regressions; full suite 254 passed, both modes validate and actual desktop inspection passed. Full baseline remains incomplete.

## 2026-10-03 — UTC research/source chronology

- Corrected source/review date comparison across UTC midnight by normalizing offset timestamps in shared canonical validation, identity review and research refresh.
- Retained original timestamp metadata, date-only precision, financial formulas/assumptions and every saved artifact/history record.
- Added ten regressions; full suite 245 passed and both modes validate. Full production baseline remains incomplete.

## 2026-10-03 — Explicitly reviewed raw revenue TTM bridge

- Added versioned research formula v1, strict review schema and read-only production TTM CLI with bound immutable inputs, exact annual/YTD intervals and complete lineage.
- Preserved comparability as explicit ASSUMPTION; false/null checks block numerical output. Saved a full review retaining the unresolved MG Stover Inc./LLC name difference and three null TTM values.
- Added 36 regressions; full suite 235 passed and both modes validate. No financial ingestion, canonical formula change, additional thesis periods or automated collection; verified TTM/model mapping and parent baseline remain pending.

## 2026-10-03 — SECZ S-1 / 424B3 annual-table research

- Added an independently sourced August 7 prospectus dossier, six annual raw revenue observations and immutable research/comparison artifacts matching July 31 S-1 cells.
- Preserved filing-specific identities and full evidence without superseding prior observations, financial ingestion or additional thesis periods. Extended standalone schema to allow 424B3 only.
- Added five regressions; full suite 199 passed and both modes validate. Quarterly comparability, earlier correction lineage, TTM and the parent baseline remain pending.

## 2026-10-03 — Read-only raw revenue review comparison

- Added production-only revenue-compare with embedded-formula replay, explicit method v1, separate source/formula/context/record/value changes and full evidence retention.
- Rejected reused historical IDs and invalid declared supersession; retained independent observation conflicts and unknown evidence without selecting a filing or changing financial inputs.
- Added 15 regressions; full suite 194 passed and both modes validate. Cross-filing economic comparability, TTM and the parent production baseline remain incomplete.

## 2026-10-03 — Manual event knowledge/source chronology

- Reject future event as-of dates and event sources published after knowledge as-of, including source-only manual events, before recomputation or journal writes.
- Retain legitimate planned/announced future effective dates and retrospective retrieval; live/completed evidence requirements and observation classification barriers remain in place.
- Added ten event chronology/no-write checks; full suite 179 passed and both modes validate. No canonical evidence, financial formula/assumption or immutable history changes.

## 2026-10-03 — Shared observation/source publication validation

- Fixed direct canonical loads and general events accepting sources published after observed as-of; moved the restriction already used in reviewed research into the shared validator.
- Check all referenced sources, including null/fixture observations, before recomputation/persistence. Retrospective retrieval and explicit assumption/scenario classifications remain valid.
- Preserved financial formulas, assumptions, all canonical evidence and immutable research/financial history.
- Added ten chronology/boundary/no-write checks; full suite 169 passed and both modes validate. Full production baseline remains open.

## 2026-10-03 — SECZ audited annual reported revenue

- Added a separate six-observation full-year revenue dossier and immutable research artifact with primary audit, annual statement, XBRL and filing-index evidence.
- Extended the existing read-only review for full calendar years, S-1, explicit audit evidence and absent Period of Report; retained cover/index date differences and financial issuance separately.
- Preserved the original quarterly artifact, formula v1 ASTs and all canonical financial history/unknowns. No TTM bridge, annualization or six-stream mapping occurs.
- Added 11 full-year/audit/date/replay checks; full suite 159 passed and both modes validate. Earlier correction lineage and full production baseline remain pending.

## 2026-10-03 — SECZ comparable reported revenue

- Added an independent primary-source dossier of 12 disaggregated quarterly/half-year revenue observations with explicit fiscal intervals, filing dates and subsidiary GAAP scope.
- Added strict schema and read-only revenue-review CLI. Two research formulas v1 reconcile categories and compare corresponding prior-year intervals through the existing restricted AST; missing or zero-base evidence stays null.
- Saved a full immutable content-hashed research artifact with embedded observations, source versions, context, review, formulas and results; canonical annual formulas/assumptions and financial snapshot chain are unchanged.
- Added 33 evidence/period/replay/CLI checks; full suite 148 passed and both data modes validate. Annual/TTM conversion, six-stream mapping and full production baseline remain pending.

## 2026-10-03 — Historical UNI v2 fee configuration

- Saved proposal 93's executed v2 feeTo configuration as a source-only manual event and immutable production snapshot, with receipt, governance and pinned official contract sources.
- Explicitly superseded receipt/governance source versions while retaining old records, budget observation lineage and the reported execution timestamp conflict.
- Preserved all financial inputs, formula/assumption versions, graph and thesis. Configuration is separate from realized fee revenue, UNI burns, current state and v3 pool activation.
- Added three production replay/source-only regressions; full suite 115 passed and both modes validate. Full production baseline remains incomplete.

## 2026-10-03 — Annual-rate input period validation

- Reject known annual-rate inputs tagged quarterly/point, preventing quarterly totals from silently entering USD/year or other annual-rate calculations.
- Require rationale for observed model annual rates; retain unknowns, valid annual/TTM/model rates and point prices/inventories.
- Added 15 checks and retained formula accounting-basis coverage. Full suite 112 passed; both modes validate; financial formulas, canonical observations and historical snapshots are unchanged.
- Quarterly raw-data ingestion and revenue-category mapping remain pending; this correction does not annualize data.

## 2026-10-03 — Manual source freshness

- Added read-only freshness CLI and explicit versioned analyst policy, separating observation as-of, publication and retrieval ages.
- Retained source versions and null data; unavailable-at-cutoff evidence cannot appear fresh. Old historical facts are not invalidated by review-window age.
- Included DERIVED UTC-calendar-day formula v1 and policy digest/dependencies in report metadata. No financial calculations or thesis rules changed.
- Added 14 freshness regressions; full suite 97 passed, both modes validate without errors/warnings. Manual NEXT subtask complete; full production baseline remains pending.

## 2026-10-03 — Core identity dossier

- Recorded dated primary-source identities for UNI (Ethereum ERC-20), SECZ (NYSE parent common stock and SEC CIK) and XLM (native Stellar asset); kept personal eligibility/custody unknown.
- Added a strict standalone dossier schema and read-only identity-review CLI with evidence/date/type validation. No asset promotion or numerical research-apply occurs.
- Distinguished announced SECZ trading from later SEC confirmation; retained filing/report/financial dates and native versus wrapped-asset boundaries.
- Added 18 read-only/evidence rejection checks; full suite 83 passed, both data modes validate. Complete production baseline remains open.

## 2026-10-03 — Historical UNI approved budget baseline

- Added a reviewed historical proposal and immutable production journal for the 20M UNI/year approved rate effective 2026-01-01, with four dated primary sources.
- Explicitly superseded null assumption v1 with observed v2 while retaining all history; recorded successful execution, allowance evidence and the governance-page/receipt timestamp conflict.
- Distinguished approved rate from realized distributions, minting, fee accrual and current settings. Remaining 83 metric values are unknown; thesis coverage remains insufficient.
- Added production snapshot replay, evidence identity and null-propagation checks. Full suite: 65 passed; both data modes validate without errors/warnings. Financial formula and analyst-assumption versions remain unchanged.

## 2026-10-03 — Reviewed primary-source refresh workflow

- Added manual production-only research preview and digest-bound apply commands, with recorded reviewer, review time and rationale.
- Persist new sources and observations together in the exclusive event journal, retaining full economics, formula versions, source lineage and historical replay.
- Reject stale previews, missing primary evidence, fixture leakage, incompatible periods, duplicate IDs and invalid supersession before writing.
- Check the entire saved event against its immutable snapshot, including source and review metadata; historical bootstrap journals remain readable.
- Fixed absolute YAML input paths for Windows CLI workflows.
- Added 27 research workflow checks; full suite: 62 passed, 0 failed. Financial formulas and assumptions retain their existing versions. Production research baseline remains pending.

## 0.1.0 — MVP bootstrap

- Created canonical YAML specs, schemas, data dictionary and distinct fixture/production stores.
- Implemented 25 versioned formulas across 84 metrics, including three required models and recursive lineage.
- Preserved the exact UNI standalone required-share equation and added a separately labeled full-net reverse hurdle.
- Added ten-parameter sensitivity recomputation, nine analyst-defined thesis rules, period persistence checks and explicit insufficient-evidence reporting.
- Added typed research graph, gated candidate promotion, validated manual event propagation and append-only observations.
- Added content-hashed immutable snapshots, parent-chain verification and previous/current change attribution.
- Added local Dashboard, input/derived inspector, per-cell sensitivity lineage and snapshot-specific historical lineage.
- Production starts without observed facts. All financial demo values remain synthetic; no listings, integrations or budget facts were asserted as verified.
- Upgraded YAML to 2.9.1 and Ajv to 8.20.0 after npm registry audit identified issues in the initial dependency choices. Registry audit after upgrade reported zero vulnerabilities.

## Fixture material-update demonstration

Initial protocol-fee assumption: 1.70 bp. Revision: 1.25 bp. Required standalone UNI share: approximately 31.03% → 42.2%.

Source change: No. Assumption change: Yes. Formula change: No. Both revisions belong to 2025; they do not constitute two accounting periods. The event is `planned` and synthetic, not a statement that a real protocol fee changed.

The authoritative per-update changelog is each immutable snapshot's `reason`, `parent_id` and embedded event. Append entries here when reviewing further material changes; never alter or delete historical source/input records.

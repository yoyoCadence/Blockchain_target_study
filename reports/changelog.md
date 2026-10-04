# Changelog

## 2026-10-04 — 中文已保存事件查閱

- 唯讀研究 API 加入已審查事件，從每份不可變快照保留當時來源版本、生效／知識／審查／模型日期及原始內容；重用歷史鏈與事件語意驗證。
- 中文介面顯示八筆事件、執行證據與限制、來源及完整 JSON；raw 整數不轉數值。查閱不套用事件，合成工作區不含正式紀錄。
- 切換／重試立即清除舊事件，沿用最新回應防線；503 後 Enter 重試保留金融及未套用輸入。
- 11 項新增回歸、全套 562 項與兩模式驗證通過，桌面／窄視窗及鍵盤驗收完成；金融、來源、公式、八份同模型期間歷史及父 baseline 缺口保留。

## 2026-10-04 — UNI v2 單筆 LP 費用份額歸集

- 保存原始 Factory PairCreated 與後續 TokenJar LP 鑄造 receipt、raw uint256／UTC／log 順序、固定官方源碼及推論限制。
- 新增 protocol_fee_accrual 手動事件類型，沿用既有來源／日期／範圍與完整重算；四來源追加及一份不可變 source-only journal，金融／公式／假設／情境／圖譜不變。
- 四項新回歸、相關 17／日期 32／全套 551 項與兩模式驗證通過；合法追加不改寫歷史，固定昨日日期測試獨立於未使用的今日來源。
- LP／caller 贖回不當成 UNI burn 或年度收入；83 個金融未知、同模型期間及父 baseline 缺口保留。

## 2026-10-04 — 研究證據單獨重試

- 研究失敗提供中文手動重試，保留金融結果與未套用試算輸入；只讀取目前工作區研究，不重載金融／時效。
- 回應匹配工作區，最新請求獨占 busy／重試狀態，保留原順序防線；無自動重試、採集或資料變更。
- 四項新增回歸、全套 547 項與兩模式驗證通過，實際研究 503／延遲／Enter 重試／Fixture 隔離及桌面／窄視窗驗收通過，金融與父 baseline 缺口不改。

## 2026-10-04 — 中文開始使用

- 加入正式研究、合成試算與手動時效入口；網址保留明示工作區，無效／重複模式先停止載入並要求選擇。
- Windows 手動啟動檔核對 Node／依賴，提供中文網址及缺依賴提示；不自動安裝、採集或套用。ASCII wrapper 固定 CRLF，既有服務／loopback 保留。
- 五項新增網址回歸、全套 543 項與兩模式驗證通過，啟動需求／失敗／實際服務及三個中文入口桌面／窄視窗驗收通過；README 修正過時操作說明，金融與歷史不改。

## 2026-10-04 — 工作區載入隔離與中文重試

- 切換立即清空舊金融呈現與血緣，載入失敗保持計算停用，提供所選工作區的基準重試。
- 拒絕模式／Fixture provenance 不符回應，保留原請求順序防線；同工作區重算失敗明示保留上一個成功結果。
- 八項新增回歸、全套 538 項及兩模式驗證通過，實際桌面／窄視窗與延遲／失敗／鍵盤重試驗收完成；金融與歷史不改。

## 2026-10-04 — 固定研究目錄假設版本一致性

- 已重現有效 hash／重播及相同 TTM null 可藏同可比性假設版本的理由、信心、判斷改寫；共用入口核對完整版本指紋，包含 canonical ASSUMPTION 衝突。
- 保留合法多版本、原歷史／分類／來源及 null；沒有修改保存假設、政策、公式、金融或歷史資料。
- 十項新增回歸、相關 54 項與全套 530 項測試、兩模式驗證通過；83 個金融未知及三項正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — 固定研究目錄公式版本一致性

- 已重現有效 hash／重播可接受同公式 ID／版本的 AST 或 null_policy 改寫；共用 reader 依完整公式定義指紋拒絕，包含 TTM 兩份嵌入收入研究。
- 保留合法多版本、正反目錄順序及原嵌入公式重播；沒有修改公式定義、資料、來源、金融／論點或歷史。
- 八項新增回歸、相關 44 項與全套 520 項測試、兩模式驗證通過；83 個金融未知及三項正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — 共用研究證據 ID 一致性

- 重現一般研究入口接受有效 hash 的來源／紀錄同 ID 改寫，與 canonical 來源／金融輸入 ID 的衝突；移動既有時效 guard 到共用目錄入口並加入完整輸入 ID 檢查。
- 兩個唯讀 API 在回傳前拒絕衝突，同一證據重用／新來源版本／獨立紀錄仍可讀；金融、研究、歷史、政策與公式不改。
- 13 新增回歸、全套 512 項測試及兩模式驗證通過；六份研究／145 紀錄／20 來源保留，正式 baseline 缺口仍未完成。

## 2026-10-04 — 股本研究目錄、API 與中文 Dashboard

- 固定目錄 v2 追加原股本 hash，共用語意重播後回傳觀測／推導／來源版本／context／完整依賴；原五份條目保留，Fixture 排除與唯讀 API 不改。
- 中文介面先呈現七項核對及未解分類，115 筆／九筆未知可獨立展開；point 日期直接顯示 end。手動時效保留原觀測與審查日期、unknown 與 NOT_OBSERVED，政策／公式不改。
- 全套 499 項測試、兩模式驗證及實際桌面／手機、歷史截止日／工作區切換 QA 通過；金融／歷史與父 baseline 的缺口保留。

## 2026-10-04 — 股本研究手動唯讀驗證

- 新增共用 schema／重播與 `capital-review FILE --production`，繁體中文摘要及完整原始研究分開呈現；匹配 hash 仍核對來源、表格、日期、分類、版本、依賴與七條受限 AST 算術。
- 保留九個 null、選取未知的下游傳播與 signed 調節差額；固定目錄／現在股本／估值驗證留待後續，金融／來源／歷史不改。
- 新增 36 回歸、全套 493 項測試及兩模式驗證通過；83 個金融未知、三項 TTM null 與未解分類保留，父 baseline 未完成。

## 2026-10-04 — SECZ 轉售登記分類核對

- 直接閱讀 S-1 選定披露，另存 50 列原始欄位、108 個 OBSERVED（9 個 null）及 7 條 v1 研究算術公式／完整依賴；source-only event 釘選不可變研究 hash。
- 追加 S-1／申報費來源及 opinion／10-Q coverage v2，舊版本保留；對照登記量、權證與已發行類別，保留 Sponsor 重疊及未解 earnout 差額，不建立現在估值。
- 全套 457 項測試、兩模式驗證與全部金融／歷史重播通過；追加一份完整快照，七份同模型期、83 個金融未知及正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — CI 執行環境維護

- 核對實際 main 平台淘汰提示及官方 action metadata，將 checkout／setup-node 升至 v7（Node 24），runner 固定目前 Ubuntu 24.04。
- 保留原 Node 24／npm cache／觸發器／讀取權限／安裝與兩模式驗證步驟，未新增工作或業務自動化。
- 本機 452 項測試與兩模式驗證通過；遠端 action／平台提示結果以實際 CI 為準，金融與歷史保留，完整 baseline 仍未完成。

## 2026-10-04 — 相鄰快照版本連續性

- 已重現 matching hash／有效 parent 的舊來源同 ID 改寫可讀取；歷史讀取逐對重用既有來源／輸入及公式／規則版本 guard。
- 拒絕同 ID 改寫／刪除、未升版與退版定義；保留合法追加及升版，未修改真實來源、金融或快照。
- 20 新增回歸、452 項全套測試與兩模式驗證通過，API 檔案保留與真實歷史 hash／金融重播通過；父 baseline 仍未完成。

## 2026-10-04 — 繁體中文 CLI 論點報告

- CLI report 沿用介面中文詞彙，顯示工作區／模型期間／狀態與證據覆蓋；保留論點代碼及全部觸發規則原文。
- 已存示範報告重生為中文，合成標記、原期間／狀態與證據不足警語保留；金融與歷史不變。
- 實際兩模式產生報告並核對引擎輸出／歷史 hash，432 項全套測試與兩模式驗證通過；完整 baseline 仍未完成。

## 2026-10-04 — 已存事件節點範圍

- 已重現未登記節點在同步／重算 hash 後可載入；新事件與 saved load 共用起始節點／圖譜端點／可到達更新資產限制。
- 依各快照保存的資產與圖譜核對完整、無重複傳播集合，保留目前圖譜改版後的歷史判定；原傳播算法與金融資料不改。
- 21 新增回歸、432 項全套測試與兩模式驗證通過，API 不寫入與全部真實歷史 hash 保留；父 baseline 仍未完成。

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

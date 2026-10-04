# Roadmap

## CURRENT

- [x] Canonical principles and permanent AGENTS.md.
- [x] Human-readable schemas, registries, dictionary and separated classifications.
- [x] UNI / SECZ / XLM formulas, normalization, validation and recursive lineage.
- [x] Ten-parameter sensitivity and nine-rule thesis engine.
- [x] Dependency graph with all requested nodes; gated open-universe promotion.
- [x] Manual event → append observations → recompute → thesis → snapshot/changelog.
- [x] Immutable version history and previous/current comparison.
- [x] Dashboard with source, formula, period, classification and historical inspection.
- [x] Deterministic regressions, schema/temporal/lineage/thesis/API tests.
- [x] README, methodology, current thesis and changelog.
- [x] 繁體中文介面：導航、84 個指標、操作、血緣、研究及時效狀態中文化，保留原始分類／論點代碼及完整證據。驗收含實際桌面／手機操作、情境重算／還原、TTM 未知與原始 JSON 一致；金融／來源／歷史不變。
- [x] 繁體中文 CLI 論點報告：沿用介面詞彙，中文化工作區、模型期間、狀態與證據覆蓋；保留全部觸發規則原文、論點代碼、合成標記與證據不足警語。兩工作區實際產生報告並核對引擎輸出，未更新金融／歷史。
- [x] CI 執行環境維護：既有 checkout／setup-node 升至官方 v7（Node 24 action runtime），固定目前 Ubuntu 24.04，維持既有 Node 24／npm cache／測試步驟與讀取權限；以實際 push／PR CI 驗證相容性，金融 baseline 缺口保留。

## NEXT

- [ ] **Recommended next task:** primary-source research refresh workflow and first reviewed production baseline. Verify identifiers/investability, UNI budget and actual value-capture activation; collect dated prices/valuations and comparable financial periods. Keep unavailable values null.
  - [x] Manual reviewed primary-source refresh workflow: preview, digest-bound apply, append-only sources/observations, full recomputation and immutable journal. Acceptance: read-only preview, primary evidence and period validation, stale-preview rejection, historical replay and CLI integration. See [workflow](reports/research-refresh.md) and [handoff](reports/handoff.md).
  - [ ] First reviewed production baseline: identifier/investability checks, UNI budget/capture activation, dated valuations and comparable periods.
    - [x] Historical UNI approved budget rate effective 2026-01-01: 20M UNI/year, four dated primary sources, execution/allowance evidence, retained timestamp conflict, append-only observation and immutable production snapshot. See [research](reports/uni-growth-budget-baseline.md). This is authorization, not realized spending or a current valuation.
    - [x] Primary-source identifier dossier for UNI / SECZ / XLM with dated evidence, SEC filing/announcement distinction and read-only validation. See [identity research](reports/core-identifiers.md). No promotion or personal investability clearance.
    - [x] Annual-rate period validation: reject known quarterly/point amounts labeled `/year` before computation/persistence, retain null and legitimate annual/TTM/model rates. See [period validation](reports/annual-rate-period-validation.md). Quarterly ingestion/category mapping remains incomplete.
    - [x] Historical UNI v2 feeTo configuration execution on 2025-12-27: retain receipt/calldata, governance and pinned contract-source evidence in an append-only source-only event/snapshot. See [configuration research](reports/uni-v2-fee-configuration.md). No realized fees/burn, current settings or v3 pool activation inferred.
    - [x] SECZ disaggregated comparable reported revenue dossier: 12 observed quarter/half-year values, explicit dates/subsidiary scope, source checks, reconciliation and versioned YoY review with immutable research replay. See [revenue research](reports/secz-comparable-revenue.md). Annual/TTM conversion and six-stream model mapping remain pending.
    - [x] SECZ audited full-year revenue dossier: six reported 2025/2024 category/total values, audit evidence, S-1 date conflict, exact 12-month checks and immutable research replay. See [annual research](reports/secz-annual-revenue.md). Cross-filing revision/comparability, TTM bridge and canonical six-stream mapping remain pending.
    - [x] Shared observation/source publication chronology: canonical loads and general manual events reject sources published after observed as-of, including null/fixture records; retrospective retrieval stays valid. See [date validation](reports/observation-source-dates.md). No evidence history rewritten.
    - [x] Manual event chronology: reject future knowledge as-of and event evidence published after as-of, including source-only events; preserve future planned effective dates and retrospective retrieval. See [event dates](reports/event-source-dates.md). No automation or history rewrite.
    - [x] Read-only raw revenue review comparison: verify/replay immutable artifacts, separate source/formula/context/record/value changes, preserve independent conflicts and reject ID rewrites/invalid supersession. See [comparison](reports/revenue-review-comparison.md). Mechanical alignment does not establish cross-filing economic comparability or TTM eligibility.
    - [x] SECZ S-1 / 424B3 annual-table comparison: independently preserve the August 7 prospectus evidence and six cells matching July 31, with replayable research/comparison artifacts and retained filing IDs. See [cross-filing research](reports/secz-cross-filing-revenue.md). Earlier correction lineage, quarterly comparability, TTM and six-stream mapping remain unverified.
    - [x] Explicitly reviewed raw TTM bridge tooling: digest-bound annual/YTD selection, embedded formula replay, versioned comparability assumptions, exact intervals and null propagation. See [TTM review](reports/secz-revenue-ttm.md). Production request preserves the MG Stover Inc./LLC naming conflict; all TTM outputs remain null. Verified TTM baseline and six-stream ingestion are incomplete.
    - [x] UTC research/source chronology: normalize offset timestamps before day comparisons in shared canonical validation, identity review and research refresh; retain original timestamps. See [UTC dates](reports/utc-research-chronology.md). No financial or source history rewritten.
    - [x] Read-only research evidence API / Dashboard: explicit hash-pinned local catalog, schema validation and embedded review replay; preserve source versions, periods, classification, comparability assumptions and complete dependencies. See [inspection](reports/research-inspection.md). Production research stays outside fixture/canonical financial inputs; verified TTM and the parent baseline remain incomplete.
    - [x] Canonical current-time evidence guard: reject future OBSERVED knowledge dates and future source retrieval instants in shared validation, including direct loads/API/generic events, null and fixture records. See [future evidence](reports/future-canonical-evidence.md). Explicit assumptions/scenarios and planned effective dates remain distinct; no history rewritten.
    - [x] Single historical UNI Firepit release: successful 2025-12-29 receipt, caller-funded UNI dead-address Transfer, five TokenJar asset transfers and Released nonce, with dated pinned official code and append-only source-only snapshot. See [release evidence](reports/uni-firepit-release.md). Fee-origin attribution, annual fees/burn, current settings and aggregate activation remain unverified; financial inputs stay null.
    - [x] Aligned calendar endpoints for prior-period growth and consecutive thesis evidence: same day or two actual month ends, with 12-month annual/TTM and 3-month quarterly spacing. See [calendar validation](reports/calendar-period-alignment.md). Shifted dates cannot manufacture comparable growth or persistence; week-based fiscal calendars and verified consecutive production periods remain pending.
    - [x] Thesis condition-period evidence: require each known metric's own endpoint to match its snapshot period and reject mixed flow bases; preserve original values/periods when evidence is insufficient. See [condition periods](reports/thesis-metric-periods.md). Relabeling snapshots or advancing unrelated model dates cannot renew old evidence; verified consecutive production periods remain pending.
    - [x] SECZ acquisition-context cross-check: preserve the S-1 XBRL Inc./LLC headings/member, matching acquisition-date allocation and separate actual/pro forma revenue in a source-only immutable event. See [acquisition context](reports/secz-acquisition-context.md). Legal naming equivalence remains unverified; formal comparability and TTM stay null, with no six-stream ingestion or additional thesis period.
    - [x] Shared manual-event review chronology: validate provided review metadata for generic/source-only events and saved journal loads, including future instants, UTC knowledge day and declared/new source retrieval cutoffs. See [review dates](reports/manual-event-review-dates.md). Retrospective retrieval and future planned effective dates remain valid; no financial or historical updates.
    - [x] Shared saved-event evidence validation: apply existing preparation rules to canonical journal loads, including knowledge/effective/publication dates, declared sources, workspace provenance, credible completed evidence and planned-update classifications. See [saved evidence](reports/saved-event-evidence.md). Matching hashes cannot bypass semantic validation; lawful future plans and retrospective retrieval remain valid, with all financial/history outputs preserved.
    - [x] Shared saved-research primary evidence: require nonempty OBSERVED updates, at least one tier 1/2 source per observation and complete declared evidence when loading research-refresh journals, reusing preparation rules. See [primary validation](reports/saved-research-primary-evidence.md). Null observations remain unknown and generic completed events retain their existing credible-source rule; no source/history or financial changes.
    - [x] Shared saved-update knowledge/state guards: updates cannot postdate event as-of, and planned/announced/cancelled DTCC flags cannot become live/material even through scenario updates. See [update knowledge](reports/event-update-knowledge.md). Same-day observations, future planned effective dates and existing live/completed paths remain valid; no financial/source/history changes.
    - [x] SECZ dated parent capital context: preserve 10-Q issued/common share dates, included restricted sponsor shares, separate conditional/reserved rights and Exhibit 5.1 resale categories in a source-only full snapshot. See [capital context](reports/secz-parent-capital-context.md). Retain filing/category conflicts and indexed-only S-1 limit; no current/fully diluted denominator, price, EV, financial update or additional thesis period.
    - [x] SECZ 母公司認股權證歷史條款：保存 Exhibit 4.1 修訂後母公司股數／價格及歸屬、行使、earnout 區分，追加來源與完整快照並重播歷史。見[權證條款](reports/secz-warrant-context.md)。完整 S-1 登記註腳受讀取／存取限制，類別調節與現況仍待查證；未更新金融輸入或完成父 baseline。
    - [x] 已存事件節點範圍：共用新事件的登記節點／可到達更新限制，依快照資產與圖譜核對完整傳播集合，保留圖譜改版後的歷史判定。見[範圍驗證](reports/event-scope.md)。兩模式、無效／合法範圍、API 不寫入與金融／歷史重播通過；不是全部已存商業規則或外部真實性認證，父 baseline 未完成。
    - [x] 相鄰快照版本連續性：歷史讀取逐對重用既有版本檢查，拒絕舊來源／輸入同 ID 改寫、刪除與未升版／退版定義，保留合法追加及升版。見[版本連續性](reports/snapshot-version-continuity.md)。兩模式、API 檔案保留及真實歷史重播通過；非外部不可變性認證，父 baseline 未完成。
    - [x] SECZ 轉售登記分類核對：直接讀取 S-1 選定股數表、50 列轉售資料／註腳，保存 108 個 OBSERVED（9 個 null）及 7 條 v1 研究算術公式，與費表／Exhibit 5.1／10-Q 對照；追加來源版本及 hash 綁定完整快照。見[分類研究](reports/secz-resale-capital-reconciliation.md)。Sponsor 已發行重疊與 961,384 差額／原分類衝突保留，未補目前股本／估值或完成父 baseline。
    - [x] 股本研究手動唯讀驗證：共用 schema／重播核對原始表格、來源／日期／版本、七條嵌入公式與確切依賴，繁體中文摘要保留九個 null 與未解分類。見[操作與限制](reports/manual-capital-review.md)。匹配 hash 仍需語意驗證；金融／來源／歷史不改，目錄呈現與完整 baseline 尚待完成。
    - [x] 股本研究目錄／API／中文 Dashboard：目錄 v2 釘選原 artifact，共用重播保留 108 個觀測／7 項推導、九個 null、全部來源版本／point 日期／完整依賴；既有手動時效保留審查可用日與原觀測日。見[操作與驗收](reports/capital-research-inspection.md)。桌面／手機與工作區／截止日切換通過，金融／歷史不改，父 baseline 仍未完成。
    - [x] 共用研究證據 ID 一致性：將時效來源／紀錄 guard 集中到固定目錄讀取，另拒絕重用 canonical 金融輸入 ID；兩個唯讀 API 拒絕有效 hash 的衝突，合法來源新版本與獨立紀錄保留。見[驗證與限制](reports/research-evidence-id-consistency.md)。研究／金融／歷史不改，完整 baseline 仍未完成。
    - [x] 固定研究目錄公式版本一致性：共用 reader 核對相同公式 ID／版本的完整定義，含 TTM 本體及兩份嵌入收入研究；拒絕有效 hash 的同版本改寫，保留合法多版本與嵌入重播。見[重現與驗證](reports/research-formula-version-consistency.md)。沒有公式／金融／歷史變更，父 baseline 未完成。
    - [x] 固定研究目錄假設版本一致性：共用 reader 拒絕同可比性假設 ID／版本的理由、信心與判斷改寫，以及 canonical 假設衝突；合法升版保留兩份歷史／ASSUMPTION／TTM null。見[重現與驗證](reports/research-assumption-version-consistency.md)。沒有假設／金融／歷史變更，父 baseline 未完成。
    - [x] 工作區載入隔離與中文重試：切換立即清空舊指標、情境與血緣，失敗前後停用計算，拒絕模式／provenance 不符回應；快速切換不接受較早回應，同工作區重算失敗保留上一個成功結果。見[驗收](reports/workspace-loading.md)。實際延遲／失敗／鍵盤重試／窄視窗通過，金融與父 baseline 缺口保留。
    - [x] 中文開始使用：三個用途入口、明示／可保留的工作區網址、無效模式先停止並明確選擇恢復、Windows 手動啟動與缺依賴提示；修正過時 README 操作說明。見[操作與驗收](reports/getting-started.md)。實際啟動、桌面／窄視窗／鍵盤及三入口通過；來源、金融與父 baseline 未變。
    - [ ] Current access/investability checks, actual value-capture activation, dated valuations and comparable financial periods. Remaining values stay null; this parent baseline is incomplete.
- [ ] Automated research refresh workflow with reviewed source/observation proposals.
- [ ] Additional asset models.
- [ ] Better bottom-up TAM engine.
- [x] Manual source freshness and stale-data detection: read-only CLI, explicit analyst policy, independent observation/publication/retrieval dates, unknown/future evidence and preserved historical sources. See [freshness](reports/source-freshness.md). Scheduling, automatic retrieval and identity-dossier monitoring remain outside this completed scope.
  - [x] Manual cataloged-research freshness: replay five existing identity/revenue/TTM reviews, separate original observation/publication/retrieval dates from review availability, retain periods/contexts/unknowns and reject conflicting source/observation IDs. See [research freshness](reports/research-source-freshness.md). Same policy/formula versions; read-only CLI, no scheduling or automatic retrieval. Complete production baseline remains pending.
  - [x] Read-only manual freshness API: canonical Fixture report and combined Production research report reuse existing engine/policy/formula versions, with optional historical UTC cutoff, invalid-date/write rejection and no financial/history changes. See [API](reports/freshness-api.md). Dashboard freshness controls remain outside this API subtask; no automatic retrieval or scheduling.
  - [x] Manual Dashboard freshness controls: explicit UTC cutoff query, canonical/research dates and unknown evidence, independent review availability, policy/formula dependencies and fixture isolation. See [Dashboard](reports/freshness-dashboard.md). Actual desktop/mobile, historical/error/keyboard and delayed-response QA passes; no automatic queries, scheduling, financial/history or policy/formula changes.
- [ ] External event-driven recalculation adapters (manual MVP event path exists).
- [ ] Quarterly earnings ingestion and explicitly aligned fiscal periods. Raw SECZ quarter/half-year revenue review is complete; canonical annual model ingestion, six-stream mapping and broader statements remain pending.
- [ ] Protocol governance monitoring.
- [ ] Populate enough verified consecutive periods for persistence rules.

## LATER

- [ ] Unattended API automation.
- [ ] Scheduler.
- [ ] Automatic PR creation.
- [ ] Notifications.
- [ ] Portfolio integration.
- [ ] Expected-return model.
- [ ] Permanent-loss model.

NEXT/LATER items are intentionally not implemented in this bootstrap.

2026-10-03 follow-up: the explicitly authorized manual research-refresh subtask is complete. Its parent task remains open; other NEXT/LATER work requires separate scope authorization.

2026-10-03 continued authorization: proceed through prioritized, independently verifiable NEXT subtasks; publish ready Chinese PRs, merge after successful verification and continue. Unattended automation, scheduling, notifications and portfolio/return-loss models remain excluded.

2026-10-03 baseline research constraints: SECZ quarterly flows and disclosed revenue categories cannot yet be mapped into the annual six-stream model without explicit period/category work; synchronized verified valuations and current access/custody checks are missing. Preserve nulls. Manual source freshness is independent and completed; automated collection, extra models and TAM expansion are deferred while the baseline remains incomplete.

2026-10-04 最新授權：持續完成可獨立驗收的工作，產品介面及新增紀錄使用繁體中文；依既有授權提交中文非 Draft PR，驗證成功後合併並接續。原始來源、歷史紀錄與機器代碼保留，不擴大自動化或金融模型範圍。

2026-10-04 使用優先：先處理能開始使用的 MVP 工作與必要防線，再接續完善；不為可用性犧牲來源、分類、未知值、期間或版本驗證。完整 production baseline 仍須獨立完成研究驗收。

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
    - [x] XLM 官方回報供給與定義：保留原 API／七位精確小數／更新和取得時間，九個 provider_reported OBSERVED、兩個研究殘差 v1，追加兩來源與完整 source-only 快照。見[研究與驗收](reports/xlm-reported-supply.md)。五項新增／全套 770、兩模式 validate、桌面／窄鍵盤與 Fixture 隔離通過；ledger／獨立流通／完全稀釋定義／同步估值保持 null，共用唯讀 reader／catalog 與父 baseline 未完成。
    - [x] 公開市場資料包驗證／研究目錄／API／中文逐列查閱：production／digest 共用 reader、schema／方法 v1 核對四 HTTP、26 typed 欄位、原身份與公式／依賴；v5 目錄綁原 bytes／review，九研究／185 紀錄／28 來源。見[操作與驗收](reports/public-venue-research-review.md)。65 新增／全套 765、兩模式 validate、桌面／窄鍵盤、Fixture 與兩 cutoff 審查列通過；金融／原資料／來源／歷史不變，個人存取與完整 baseline 保留。
    - [x] UNI／XLM 單一公開市場與網路表示：四份原 HTTP／個別 UTC 取得時間、26 typed OBSERVED、XLM 空合約 raw／null、原身份依賴與研究比較 v1，追加六來源與 source-only 完整快照；產品 v2 明示 supersedes，價格／金融／投資性／模型期間不變。見[研究與驗收](reports/uni-xlm-public-venue.md)。700 項／兩模式 validate／桌面與窄鍵盤／JSON／六安全來源／Fixture 隔離通過；個人／託管／提款、資料包共用 reader／目錄及父 baseline 保留。
    - [x] UNI 餘額／供給目錄／唯讀 API／中文查閱：v4 釘選原 bytes／事件／review，共用 reader 保留四 raw OBSERVED／一 DERIVED、v1／完整依賴與 point／原時間。見[操作與驗收](reports/token-state-research-inspection.md)。696 項／兩模式 validate／桌面與窄鍵盤、Fixture 與兩 cutoff 審查列通過；原資料／金融／歷史不變，流通／FDV／全年 capture 與父 baseline 保留。
    - [x] UNI 餘額／供給手動唯讀驗證：明示 digest／production，重用原 owner reader，再核對同 hash／ABI／raw 字串／來源／UTC／比較 v1／確切依賴；見[操作與限制](reports/manual-token-state-review.md)。45 新增／全套 688、兩模式 validate／實際 CLI 不寫入通過；金融／原資料／歷史不變，目錄與父 baseline 尚待完成。
    - [x] UNI 固定區塊 owner 餘額／供給：同 hash／canonical 呼叫保存四個 OBSERVED raw 整數與研究 BigInt 比較 v1／確切依賴，追加一來源及 source-only 全快照；見[研究與驗收](reports/uni-token-state.md)。643 項／兩模式 validate／桌面與窄鍵盤、Fixture 隔離通過；只支持該時點餘額不少於 allowance，流通／FDV／同步估值與父 baseline 保留，新格式共用 reader／研究目錄尚待完成。
    - [x] 固定區塊研究目錄／唯讀 API／中文查閱：v3 目錄釘選原 bytes／已存事件、共用手動 reader；八個 raw 字串與 point／原時間／confidence／receipt null 保留，Fixture 隔離與 cutoff 不可用。見[操作與驗收](reports/fixed-block-research-inspection.md)。639 項／兩模式 validate／桌面與窄鍵盤／工作區通過；目前日審查列工具展開限制明示，金融／原來源／archive／歷史不變，父 baseline 保留。
    - [x] 固定區塊資料包手動唯讀驗證：明示 production／已審查 SHA-256，v1 schema 與 ABI 方法核對同 hash／request／response／位寬／calldata／來源與 UTC；matching digest 仍拒絕混區塊與錯配。見[操作與限制](reports/manual-fixed-block-review.md)。35 新增／全套 631 項與兩模式 validate 通過，金融／archive／來源／歷史不變，不連 RPC，父 baseline 保留。
    - [x] Historical UNI approved budget rate effective 2026-01-01: 20M UNI/year, four dated primary sources, execution/allowance evidence, retained timestamp conflict, append-only observation and immutable production snapshot. See [research](reports/uni-growth-budget-baseline.md). This is authorization, not realized spending or a current valuation.
    - [x] UNI 固定區塊參數／剩餘授權：保存 finalized block 26119713／hash，六 getter、allowance／decimals 與 runtime 以 requireCanonical=true 查詢並核對 header；獨立保留 prior receipt null 與 Explorer／未固定 UI 歷史。見[研究與驗收](reports/uni-vesting-fixed-block.md)。596 項／兩模式 validate／桌面與窄視窗通過；unknown 80、舊年率時效、金融／公式／論點不變，部署等價與完整 baseline 保留。
    - [x] UNI 單筆季度提領與公開參數：核對 2026-10-01 成功 receipt 的 Approval／Transfer／Withdrawn 三 logs，以及 10 月 4 日六個未固定區塊 getter；保存 raw 整數、未知 block／response time、Similar Match 界線，追加兩來源與完整快照。見[查證與驗收](reports/uni-vesting-execution.md)。592 項測試／兩模式 validate／桌面與窄視窗鍵盤、JSON、Fixture 隔離通過；金融 unknown 80／原預算時效／三項 TTM null 保留，固定區塊現況與全年支出仍待研究。
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
    - [x] 研究證據單獨重試：研究失敗後手動恢復所選模式，保留金融／未套用試算輸入；拒絕錯模式與晚到回應，重試狀態／busy 不互相覆蓋。見[驗收](reports/research-retry.md)。實際研究 503、延遲、Enter、窄視窗與 Fixture 隔離通過，不自動重試或更新資料，父 baseline 保留。
    - [x] UNI v2 單筆 LP 費用份額歸集：核對原始 Factory PairCreated 與後續 TokenJar LP 鑄造、完整 raw 整數／UTC／log 順序，追加四來源與完整快照。見[查證與界線](reports/uni-v2-fee-accrual.md)。LP／caller 贖回不當 UNI burn 或年度收入，成長來源／部署等價未驗證；金融輸入、原歷史及父 baseline 缺口保留。
    - [x] 中文已存事件查閱：唯讀研究 API／介面顯示八筆已審查事件，保留各快照的來源版本、完整事件、raw 整數與四種日期；重用歷史／事件驗證，Fixture 不含正式事件。見[操作與驗收](reports/reviewed-event-inspection.md)。562 項測試與桌面／窄視窗、Enter 展開、503／延遲重試通過，金融輸入與八份同期間歷史不改；父 baseline 仍未完成。
    - [x] UNI／XLM 單次交易所價格資料包：四份公開原始回應、兩筆 point OBSERVED 候選、完整 decimal／nanosecond 與商品幣別，唯讀預覽後追加四來源及 source-only 事件／快照。見[查證與阻擋](reports/manual-market-quotes.md)。研究頁九筆事件與中文卡片可查閱；567 項測試通過，83 個金融未知與三項 TTM null 保留。
    - [ ] 同步估值與年度／point 依賴明示對齊：原 UNI 候選的三項期間阻擋已由下列明示政策與公式升版完成價格子項，歷史 v1 拒絕仍可重播；不回填價格日期或偽裝實際會計期間。供給量／市值／FDV、現行預算與年度捕獲、SECZ 股本／價格及父 baseline 仍未完成。
      - [x] 名目年率／point 期間政策前置：新增明示折算及下游日期政策，區分模型負擔與實際年度收入；未知占位維持 null，已知跨期／季度／估值日期衝突仍拒絕。見[期間設計](reports/uni-valuation-period-policy.md)。此前置完成時正式公式維持 v1，UNI 候選未套用；升版與匯入由下一項獨立驗收。
      - [x] UNI 單筆價格與公式 v2：明示採用五條期間政策，preview／digest 追加 9.0556 USD／1 UNI 與完整快照，歷史名目率折算為 DERIVED model 181112000 USD/year，正式 unknown 82→80。十一份正式／三份 Fixture 歷史重播、588 項測試與兩模式 validate、桌面／窄視窗／鍵盤／工作區隔離通過。見[價格基準與驗收](reports/uni-quote-baseline.md)。現行預算／同步估值／捕獲／TTM／父 baseline 仍未完成。
    - [x] 中文計算阻擋診斷：共用快照拒絕錯誤保留全部原始 ERROR，CLI 顯示中文說明／指標名與 machine ID／公式原因。實際價格候選 preview／apply 的三項阻擋完整輸出，exit 1、stdout 空與不寫入驗證；相關 60／全套 571 項通過。見[診斷與限制](reports/research-preview-diagnostics.md)。計算、公式、日期及期間拒絕規則不變，父 baseline 保留。
    - [x] XLM 單筆交易所價格基準：重用已保存的兩份 Tier 1 來源，依原 preview／digest 流程獨立追加 0.216265 USD／1 XLM 的 point OBSERVED 與完整不可變快照，重算全部下游。中文卡片／血緣／比較保留價格精度；十份歷史各自重播、Fixture 隔離及截止日驗證通過，全套 575 項與兩模式 validate 通過，正式未知由 83 降為 82。見[價格基準與驗收](reports/xlm-quote-baseline.md)。UNI 候選仍有三項期間阻擋，三項 TTM null、估值／投資性與父 baseline 保留；本次窄視窗實測未驗證。
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

2026-10-04 最新停止要求：完成目前 XLM 單筆價格子項的中文 PR、CI 與合併後告一段落，不再啟動下一項；使用者將換帳號接續。接續先閱讀 AGENTS.md 與交接，重新確認遠端／工作區狀態。

2026-10-04 接續授權：使用者已要求繼續完成其他任務，自主開中文非 Draft PR，驗證與 CI 成功後合併；解除上一輪停止要求。先完成 baseline 必要的 UNI 期間語意與價格子項，再依優先順序研究現行估值／可比期間；未授權 unattended 自動化、排程、通知或投資組合模型。

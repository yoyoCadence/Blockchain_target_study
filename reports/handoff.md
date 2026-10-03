# 開發交接

## 2026-10-03 — UNI 單筆 Firepit 執行證據

PR #16 遠端 CI 全部通過後已合併（`8323fb2`）。`research/uni-firepit-release` 從最新 origin/main 建立，原工作目錄乾淨。回到 NEXT baseline 的捕獲執行證據，範圍限定單筆 release；不依據配置或文件推定已實現年度收入。

Chrome 核對成功 receipt Overview／九個 logs：block 24116850、2025-12-29T07:36:47Z，UNI raw payment 4000000000000000000000 從 caller 到 dead address，五項 TokenJar asset transfers，以及 Firepit Released nonce 0／同一 recipient。讀取交易前官方 commit 8604e4b（2025-12-18）及固定 TokenJar／ExchangeReleaser／Firepit 源碼；源碼解讀不冒稱 deployed-bytecode 等價驗證。未採 explorer 即時 USD 顯示，Approval／零 PAXG transfer 不另計 burn。

使用既有 token_burn source-only event，新增五份完整 dated sources、空 updates、Codex review 與 immutable snapshot `c242eeb441c989b608a9520d13e54b9e142ee213a818a88dd76d9db15ed763c9`。保留先前 budget／configuration snapshot hashes；source change 與不變的 assumption／scenario／formula／values 分開。三份 production snapshots 同一模型期，thesis insufficient、83 unknown 不變。

驗證：271 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。四項新增驗證涵蓋來源／raw receipt identity、append-only old versions、完整重播及不得年化／升級已驗證 capture 的界線；prospectus test 改為核對原兩個 hash 與同模型期間，允许來源事件增量。無 UI 變更；Chrome 僅用于 primary-source 查證。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。這筆執行不證明每項資產的 protocol-fee origin、totalSupply 減少、全期間 burn／fee revenue、現行閾值或所有 pool／chain activation。下一步須追溯 fee-origin 與明確計算期間，不能把單次 4,000 UNI 年化或和 100M treasury transfer 混合。SECZ 名稱差異／TTM、六類 mapping、FCF／margin、同步母公司估值與個人管道亦未完成。詳見 [release 研究](uni-firepit-release.md)。

## 2026-10-03 — Canonical 未來證據日期防線

PR #15 遠端 CI 全部通過後已合併（`0d01067`）。`fix/future-canonical-evidence` 從最新 origin/main 建立，原工作目錄乾淨。以純記憶體重現直接 canonical validation 接受 2099 OBSERVED as-of 與 retrieval；一般 source-only event 也缺精確 retrieval 現在時間防線。優先修復可独立驗收的 baseline 證據屏障。

共用驗證每次擷取一次 now，OBSERVED 使用當前 UTC 日上限，來源取得使用精確 instant 上限，涵蓋 null／fixture／未引用来源與直接 load/API。保留 retrospective retrieval、原始時區文字、分析者假設／情境及 planned/announced 未來 effective date；沒有 financial formula／assumption／data／history/artifact 變更。

驗證：267 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。13 項新增回歸包含直接隔離檔案載入／API 400、source-only apply 無寫入及時區／精度邊界。既有 source-after-event 測試改用歷史來源，獨立維持原屏障 coverage。首輪兩項誤引用未儲存 production price，改為隔離 fixture 後完整重跑；未補造正式值。無 UI 修改，未另做瀏覽器驗證。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成，research 依賴與 83 個金融 Unknown 保留。日期防線依赖環境時鐘，不能代替來源內文查證；尚待 MG Stover 名稱差異／TTM、六類 mapping、margin／FCF、同步母公司估值、UNI realized capture／現況及個人投資管道。詳見 [未來證據日期](future-canonical-evidence.md)。

## 2026-10-03 — 唯讀研究證據 API／Dashboard

PR #14 遠端 CI 全部通過後已合併（`a4793c1`）。`feat/research-inspection` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 的独立審閱子項，把已完成的身份／財報／TTM research artifacts 帶入 Dashboard，以便直接檢查來源、判斷與未知原因；未越過尚未滿足的金融 ingest 依賴。

新增固定本地 catalog／schema、hash 核對與完整 semantic replay、GET-only research API，以及沿用既有風格的研究 section。五份資料保留身份／報表範圍、日期／分類／來源版本及完整內嵌公式／依賴。Fixture 回傳空清單；工作區切換清除舊研究並拒絕遲到回應，canonical refresh 亦加入世代檢查。所有原始資料、金融公式／假設、不可變研究與財務快照不變。

驗證：254 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。九項新增回歸涵蓋唯讀／重播／hash／路徑／篡改／隔離與 API 禁止寫入。Chrome 桌面操作確認五卡片、完整證據／來源連結、TTM 三個 Unknown 與 ASSUMPTION 原因、快速工作區切換後 Fixture 無卡片，1524px body 無橫向溢出；未另驗證手機版。測試伺服器已停止，暫存日誌已移除。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。MG Stover Inc./LLC 名稱差異未澄清，正式 TTM 保持 null，身份 investability 仍 unverified；六類收入映射、margin／FCF、同步母公司估值、UNI realized capture／現況與個人管道仍缺。新增證據必須另存版本并人工更新 catalog，不能覆寫 artifact。詳見 [研究檢視](research-inspection.md)。

## 2026-10-03 — UTC research／source chronology

PR #13 遠端 CI 全部通過後已合併（`02299b4`）。`fix/utc-research-chronology` 從最新 origin/main 建立，原工作目錄乾淨。估值／來源日期檢視發現 `.slice(0,10)` 比較 offset timestamps 會跨 UTC 日誤判，純記憶體重現 canonical source 與 identity review 的錯誤接受。此問題可獨立修正，優先補共用 ingest／研究屏障。

新增 schema 後使用的 utcDay helper，四處改為 UTC 日比較：canonical source publication/retrieval、identity dossier as-of/review、identity publication/retrieval、research review as-of。原始 timestamps／offsets 保留，已正確使用 UTC 的 revenue／TTM／freshness 不改；金融公式、假設及所有資料／artifacts／journal 不變。

驗證：245 tests passed、0 failed；两模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十项新增回歸涵蓋正負時區、閏日、兩模式 source validation、identity、research preview 成敗／無寫入與 metadata 保留。原 UNI 0.422、API、完整歷史與 research replay 通過。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。SECZ 尚缺名稱差異澄清／TTM confirmation、六類收入映射、margin／FCF、同步股本／估值及個人管道。Prospectus 有歷史單日報價但無本次同步 EV 證據，canonical SECZ 模型輸入是 EV；未把不同日期股數／subsidiary shares／浮動股數套用價格。UNI realized capture／current state 亦未完成。只推進独立可驗收工作，詳見 [UTC 日期](utc-research-chronology.md)。

## 2026-10-03 — 明示可比性審查的原始收入 TTM 工具

PR #12 遠端 CI 全部通過後已合併（`ab4d5f3`）。`feat/reviewed-revenue-ttm` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 可比期間的條件式工具子項，驗收完整 review hash 綁定、年／YTD 日期、人工 ASSUMPTION、null 屏障與完整 immutable replay。

新增 schema／受限 AST 公式 v1／production-only revenue-ttm。先核對兩份原研究 hash 與 embedded-formula 重播，檢查 entity／scope／basis／fiscal end；只接受前一全年減去年同長度 YTD 加今年 YTD。五項人工可比性判斷皆保留 ASSUMPTION、rationale、雙 filing primary evidence；未確認則不產生數值。輸出 DERIVED、完整觀察／假設／範圍／來源／期間 dependencies；金融 registry 25 公式与 canonical journal 不變。

已讀年度與季度收入定義、actual-acquisition basis、停止營業與 pro forma 區分；發現年度 MG Stover, Inc.／季度 MG Stover LLC 標題差異，未宣稱等價。正式 request 的 acquisition_treatment 為 null，三個 TTM 結果保持 null／COMPARABILITY_UNVERIFIED。新研究 artifact 完整保存 request／雙 input reviews／formula／results，舊檔與 hash 保留。此阻擋不影响工具與可独立驗收的其他工作；真正 TTM／六類 ingest 父項不能勾選。

驗證：235 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。36 新增檢查包括每項 false／null、分類、日期、hash 綁定、scope、未知、negative／annual limit、重播、unsafe AST、CLI 無寫入；條件全確認只在 test-only 假設的記憶體測試驗算。首輪錯誤訊息預期不符已修正並補独立 observation cutoff coverage，完整重跑通過。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。後續需以 primary clarification 解決名稱差異或保持 null；尚缺完整更正沿革、六類收入映射、FCF／margin、同步母公司估值、UNI realized capture／現況及個人投資管道。不可修改本版 artifact 的判斷；新證據另存新版本。詳見 [TTM review](secz-revenue-ttm.md)。

## 2026-10-03 — SECZ S-1／424B3 年度表查證

PR #11 遠端 CI 全部通過後已合併（`9578304`）。`research/secz-cross-filing-revenue` 從最新 origin/main 建立，原工作目錄乾淨。選擇首項 NEXT baseline 的限定跨 filing 研究，獨立查證 8/7 prospectus 年度表與 7/31 S-1，而非直接推進未驗證 TTM。

核對 424B3 index／cover／營業子公司 KPMG 審計／Note 19 表與分類文字／Note 21 issuance。六個 2025／2024 全年 USD 值與已保存 S-1 相同，entity／scope／GAAP／audit／period context 一致。新資料包六 OBSERVED、兩 tier 1 sources 使用獨立 filing ID 與 8/7 as-of，不 supersede 舊 filing。Schema 只增量允許 424B3；金融及研究公式不變。新研究 snapshot／比較輸出以 exclusive create 保存，舊 quarterly／annual artifacts 原 hash 保留。

驗證：199 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。五項新增回歸核對 exact raw cells、來源／日期、比較 hash 與 semantic replay、舊歷史及 CLI 無 journal 寫入。遠端 CI 以 PR 實際結果為準。大型 SEC 網頁首次讀取逾時後，在相同已載入 tab 重讀成功。

此子項只完成兩份年度表／已讀分類文字的一致性；更早重編沿革、季度／年度 scope 與 recognition comparability、TTM／六類映射仍未完成。重複同期間不增加 thesis evidence，canonical production journal 仍只有兩個同期間 snapshots。下一步需核對季度 exhibit 的收入定義與 presentation／prior-period 說明，再決定是否可提出明示 review 的 TTM bridge。UNI realized capture／現況、估值及個人投資管道仍缺。詳見 [研究](secz-cross-filing-revenue.md)。

## 2026-10-03 — 原始收入研究快照比較

PR #10 遠端 CI 全部通過後已合併（`968b8ec`）。`feat/revenue-review-comparison` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 跨 filing 的唯讀比較前置子項，驗收完整重播、版本／來源區分、範圍／相同區間對齊與無財務寫入。

新增 revenue-compare、spec 方法 v1 與觀察 optional supersedes。比較前驗證雙方雜湊與 embedded formulas 重播，拒絕歷史 ID 改寫／公式無版本變更與倒退／無效宣告取代。不同 filing 的独立觀察保留；已知值衝突明列，不強迫宣告取代或選一方。範圍／會計基礎／審計狀態不同不配對，相同期間才列前後值；null 獨立標 insufficient。所有既有資料包與 artifact 原 hash 保留。

驗證：194 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。15 項新增檢查涵蓋歷史／supersession／完整重播／偽造結果／範圍／期間／衝突／缺值與 CLI；金融公式／假設／journal／thesis 不變。遠端 CI 以 PR 實際結果為準。

父 baseline 未完成。工具不判定經濟可比性／更正沿革、TTM 或六類映射；現有年度對季度報告為 audit_status CONTEXT_MISMATCH。後續可獨立查證 8/7 prospectus 與 7/31 S-1 的同範圍年度表，另保存來源／版本後使用比較；仍需人工核對披露。UNI realized fee burn／現況、估值與個人投資管道仍缺。詳見 [比較工具](revenue-review-comparison.md)。

## 2026-10-03 — 手動事件 as-of 與來源日期

PR #9 遠端 CI 全部通過後已合併（`e85bb73`）。`fix/future-event-as-of` 從最新 origin/main 建立，原工作目錄乾淨。以純記憶體 production project 重現：event.as_of／effective date 都填 2099 年仍被接受為 completed，未寫任何資料。另補齊 source-only event 的 source publication 日期檢查。

在共用 prepareEvent 限制 as-of <= 目前 UTC 日，並要求所有 event.source_ids 的 date <= event.as_of。未知來源先拒絕，日期檢查在重算／journal 寫入之前完成。今日 recorded 的未來 planned／announced effective date 仍保留，既有狀態／OBSERVED 屏障不變；晚取得的歷史 receipt 不會因 retrieval date 而被錯誤排除。

驗證：179 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十項新增驗證涵蓋所有狀態的 future as-of、合法未來 plan、failed apply 無寫入、source-only future publication、歷史來源晚取得。金融公式／假設、所有來源／觀察／snapshot、graph／thesis 保留；遠端 CI 以 PR 實際執行結果為準。

父 baseline 仍未完成。已保存 UNI historical authorization／v2 configuration 與 SECZ 分期／全年原始收入，但 fee-generated burn、現況、跨 filing 更正／comparability、TTM／六類收入 mapping、同步估值及個人投資管道均尚待驗證。只接續可獨立驗收的工作，保留 null 與來源衝突。詳見 [事件日期](event-source-dates.md)。

## 2026-10-03 — 共用觀察／來源日期驗證

PR #8 CI 通過後已合併（`e7fe1f9`）。`fix/observation-source-dates` 從最新 origin/main 建立，原工作目錄乾淨。在 baseline 來源／期間工作中以純記憶體資料重現：canonical validator 接受 7 月觀察引用 8 月發布的來源；一般 event 也能繞過 research-refresh 已有日期檢查。此漏洞可獨立修正，優先補齊 ingest barrier。

在共用 validateProject 增加 OBSERVED 的全部 source.date <= observation.as_of_date 檢查，涵蓋 canonical loads／普通手動事件、null 與 fixture。晚取得來源仍能用於回溯研究；期間與知識 as-of 分開保留，ASSUMPTION／SCENARIO 不提升成事實。未改公式、假設、來源／觀察或 immutable artifacts，未擴大自動化範圍。

驗證：169 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十項新增驗證涵蓋 boundary、多來源、一般 event／apply 拒絕且不寫入、null、fixture 及分析者輸入；原資料包與 financial snapshots 完整重播保留。遠端 CI 以 PR 實際執行結果為準。

父 baseline 未完成。後續可推進 SECZ 跨 filing presentation／更正沿革比較，才考慮 TTM；8/7 prospectus 的同主體年度收入表已做人工初讀，但本次未建立其正式版本或 comparability 結論。UNI fee-generated burn／現況、同步估值、六類收入 mapping 與個人投資管道仍未完成。詳見 [日期驗證](observation-source-dates.md)。

## 2026-10-03 — SECZ 已審計全年原始收入

PR #7 遠端 CI 全部通過後合併（`44fe516`）。`research/secz-annual-revenue` 從最新 origin/main 建立，原工作目錄乾淨。延續 baseline 的可比期間前置工作，增量保存 2025／2024 已審計全年兩類分項與合計，共六筆 OBSERVED。

核對 S-1 的 Securitize Inc. 審計段落、Note 19、issuance note 及 matching XBRL entity/product duration contexts。Audit／financial issuance 為 2026-04-10，cover 7/30 與 EDGAR index filing date 7/31 並列保留；S-1 無 Period of Report，保存 null。此版使用本 filing availability，不以 audit date 推定已取得同版；不替代 listed-parent 財務／資本結構，也不宣稱已核對所有更正／重編沿革。

Schema／唯讀 review 增量支援完整日曆年度與 S-1、審計來源及報告日期檢查。原研究公式 v1、金融公式／assumptions 均不變。新 dossier／content-hashed snapshot 使用獨立檔案與 exclusive create，保留舊季度 artifact 原 hash 與完整重播；canonical journal／83 個未知 financial metric／thesis 不變。

驗證：159 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增 11 項全年區間、審計證據、日期與新舊 artifact replay；遠端 CI 以 PR 實際執行為準。

子項完成。下一步仍需跨 filing 更正沿革與財務 comparability 才能建立 TTM bridge；兩類收入不足以供應六類年度模型，未知 mapping／margin／FCF／母公司估值與個人投資管道不能補值。UNI fee-generated burn／current state 亦未完成。詳見 [年度原始收入](secz-annual-revenue.md)。

## 2026-10-03 — SECZ 可比較分期收入

PR #6 遠端 CI 全部通過後合併（`fc0f7ea`）。`research/secz-comparable-revenue` 從最新 origin/main 建立，原工作目錄乾淨。UNI 配置子項已完成，其餘 fee-generated burn／current state 仍缺獨立查證，先推進 baseline 可獨立驗收的 SECZ 財務期間子項。

新增 standalone revenue dossier／schema／唯讀 CLI，保存 2026／2025 Q2、半年的 Tokenization、Asset Servicing 與披露合計，共 12 筆 OBSERVED；SEC exhibit、filing index、IR 三份 dated primary sources。區間開始／截止、duration、fiscal year／quarter、GAAP、未經審計、營業子公司範圍與 filing／financial issuance／Period of Report 分開保存。研究公式 v1 使用既有受限 AST，核對合計與同長度去年同期；unknown／zero base 保持 null。

以 exclusive create 保存完整 content-hashed 研究快照，包含所有來源、觀察、報表範圍、review、公式與結果，可用 embedded versions 重播。這是原始財報研究，沒有 canonical annual financial updates；兩個 production financial snapshots 與 fixture 歷史保持原狀，83 個 financial metric 未知值不變。後續更正另建版本檔案，不改此版。

驗證：148 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。33 個新增檢查包括來源／分類／日期／區間／合計拒絕、null／zero base、完整重播、hash tamper rejection 與 CLI 無 financial journal 寫入。遠端 CI 以 PR 實際結果為準。

子項完成，父 baseline 與季度 ingestion 仍未完成。仍缺年度／TTM 銜接、六類收入分配證據、其他財務指標、母公司資本結構／估值與投資管道。不可把半年乘二、季度乘四當 OBSERVED 年度值，或把 operating subsidiary 的股數套用 SECZ parent。詳見 [分期收入研究](secz-comparable-revenue.md)。

## 2026-10-03 — UNI v2 歷史 feeTo 配置

PR #5 CI 全部通過後合併（`a4ebd51`）。`research/uni-v2-fee-configuration` 從最新 origin/main 建立，原工作目錄乾淨。回到 baseline 的最高優先捕獲查證，範圍限定 proposal 93 已執行的 v2 factory setFeeTo(TokenJar) 配置，保存 receipt、治理規格與固定 commit 的官方 Factory／Pair 程式碼。

使用既有手動 protocol_fee_change event 保存 sources 與完整 immutable snapshot；updates 為空。receipt／governance v2 明確 supersedes v1，舊來源及 budget 既有觀察 lineage 原封保留。保留 Agora／receipt 執行時間衝突。非零 feeTo 與 feeOn 的解讀來自公開程式碼，未完成部署 bytecode 等價驗證；不能以配置推定已實現收入或 UNI burn。graph 與全部數值／公式不變，production 仍有 83 個未知 metric。

驗證：115 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增三項驗證：事件與來源一致性、source-only 比較與版本／lineage 保留、歷史重播及同期間不足證據。遠端 CI 以 PR 實際執行結果為準。

子項完成，完整 baseline 未完成。仍待 fee-generated TokenJar／Firepit／UNI burn 的期間與鏈上證據、v3 各 pool 的實際配置、現況查證、估值與個人投資管道；不能把 treasury 的 100M transfer 當 fee revenue。SECZ 季度／年度與收入分類對應仍待處理。詳見 [配置研究](uni-v2-fee-configuration.md)。

## 2026-10-03 — 年率單位與期間防線

PR #4 CI 成功後已合併（`7f09c16`）；分支 `fix/annual-rate-period-validation` 從該最新 origin/main 建立，工作目錄乾淨。接續 baseline 期間障礙，在 synthetic fixture 重現六個季度 SECZ 示範收入可產生 USD/year 加總的錯誤標籤，完成可獨立驗收的輸入防線。

共同 normalize 拒絕已知 `/year` input 使用 quarterly／point；annual／TTM／model 保留，OBSERVED model 年率必須有 rationale。null 與 point 價格／存量仍合法。沒有年化、改寫來源／分類、修改公式或既有 fixture／production history；錯誤 research proposal 會在寫入前拒絕。

驗證：112 tests passed／0 failed；fixture／production validate 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。新增 15 項檢查，涵蓋五個年率單位、合法期間、unknown、model rationale、價格／存量及研究失敗不寫入。原先 mixed-basis 測試調整為輸入提前拒絕，並繼續直接驗證 formula accounting-basis 檢查。UNI 0.422、完整歷史重播與 API 回歸均通過。遠端 CI 另於 PR 確認。

子項完成，父 baseline 與季度 ingestion 尚未完成：仍需原始期間／YoY-QoQ／收入分類對照、同步估值、現行可投資性及 UNI 執行後 fee-path 證據。驗證器不驗證來源內文；不能靠把季度資料改成 TTM metadata 取得正確年度值。詳見 [期間防線](annual-rate-period-validation.md)。

## 2026-10-03 — 手動來源時效分析

PR #3 CI 全部成功後已合併（`0e079f6`）；分支 `feat/manual-source-freshness` 從該最新 origin/main 建立，工作目錄乾淨。完整 baseline 尚缺年度／季度收入分類與可比期對照、同步估值及現行可投資性查證，因此保留 null，接續獨立的 NEXT 時效子項。

新增 `freshness` 只讀 CLI、versioned ASSUMPTION policy 與 DERIVED 日數 metadata。原始 observation as-of、publication date、retrieved_at 分開；過去 cutoff 不使用未來來源，UNKNOWN／ASSUMPTION／SCENARIO 不變成新鮮事實，全部歷史來源保留。超過窗口只是當前使用前需重查，不否定歷史觀测或修改 thesis。沒有 scheduler、自動採集、通知、API／UI 或財務模型變更。詳見 [操作與限制](source-freshness.md)。

驗證：97 tests passed／0 failed；fixture／production validate 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。2026-10-03 報告：UNI 歷史 budget age 275 天、四來源本日重新取得；58 個 input 未知。14 項新增檢查驗證 UTC／閏日／窗口／未知／未來證據、policy 與 CLI，並確認經濟結果、thesis、project 及快照不變。遠端 CI 以本 PR 的實際結果為準。

來源時效分析子項完成，完整 baseline 仍未完成。下一個有價值且可獨立驗收的工作是 SECZ 收入分類與明確期間處理，或 UNI 以執行後 fee-path 證據查證 activation；不可把 proposal 93 的一次性 treasury burn 當 fee revenue。Identity dossier 的時效與 journal 整合、當前 venue／custody、同步價格／估值與連續期數仍缺。

## 2026-10-03 — 核心識別碼資料包與只讀驗證

PR #2 的 Canonical validation 全部成功後已依最新授權合併（merge `215039e`）；本分支 `research/core-identifiers` 從該最新 origin/main 建立，工作目錄乾淨。GitHub connector 合併權限回報 403，改用已登入 Chrome 完成並以遠端 API／fetch 確認，無須另請使用者確認。

本子項查證 UNI Ethereum token、SECZ 上市母公司 NYSE common stock／CIK、XLM 原生身份。五個完整來源 metadata 與三筆 OBSERVED 身份保存於獨立日期／版本資料包；新增 schema 及只讀 `identity-review` 命令驗證來源、日期與資產類型。保持數字型 refresh、asset registry、graph 及 promotion gates 的界線，沒有財務 journal 或財務公式變更；投資人資格／託管仍為 null，investability 仍 unverified。詳見 [身份研究](core-identifiers.md)。

驗證：83 tests passed／0 failed，fixture／production validate 仍為 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。只讀檢查確認專案、財務結果及快照不變；拒絕錯誤來源／日期、native 偽合約、股票與 wrapper 混淆、自動投資性升級。首輪測試中不存在的 SECZ price 名称已修正為完整財務結果不變的比較。

下一步缺實際 UNI capture 執行後證據、現行通道／資格／託管、可比財務期與估值。SECZ 附件提供季度資料，現有模型流量為 USD/year，尚不能直接匯入；收入分項也需要與目前六類做明確對照。可獨立推進 read-only freshness 分析，避免把 2026 年初的歷史 budget 當成當前證據。識別資料包尚未連接 immutable financial journal；後续修訂須保留原始日期／版本文件。

## 2026-10-03 — UNI 歷史核准預算 baseline 子項

依 NEXT 首項繼續查證 UNI 預算，分支 `research/uni-growth-budget-baseline` 從最新 `origin/main`（`f475d18`，PR #1 已合併）建立；開始時工作目錄乾淨。新增一份可重讀的研究資料包與中文研究紀錄，使用 preview／digest-bound apply 保存第一筆 production journal。

截至 2026-01-01 的觀測為核准額度 20M UNI/year：保留原先 null ASSUMPTION v1，新增明確 supersedes 的 OBSERVED v2、四個有日期的一手來源、完整公式／來源／輸入／thesis 快照。核對 proposal 93 的 successful receipt、40M allowance 與 ProposalExecuted；治理網站與 receipt 的執行日期衝突保留。review 標明 Codex 查證，沒有冒稱人類已簽核。實際支出、新增 mint、當前設定、已實現 fee capture 與估值均未從該額度推定。

驗證：`npm test` 65 passed／0 failed；fixture 與 production validate 均為 84 metrics、25 formulas、0 errors／0 warnings，unknown 分別為 1／83。新增檢查覆蓋來源／資料包一致性、舊假設保留、未知估值／不足 thesis 證據及正式歷史快照重播。沒有公式、分析者假設或 UI 變更。遠端 CI 另以 PR 的實際結果為準。

完整父任務仍未完成。下一項可獨立推進識別碼／投資性與 UNI 實際捕獲啟用；同日估值、可比財務期及足夠連續期數仍缺。DUNI 年終報告未顯示可確認發布日，僅留研究參考，不假造 source.date。所有限制見 [UNI 研究紀錄](uni-growth-budget-baseline.md)。使用者後續已授權逐項提交可審查 PR，驗證成功後合併並繼續；MVP 排除範圍仍維持。

## 2026-10-03 — 人工審查研究更新流程

選擇 NEXT 首項的工具子項，因為 canonical schema、事件重算、血緣與不可變快照已具備。功能分支 `feat/reviewed-research-refresh` 從最新 `origin/main` 的 `f50d466` 建立；開始時工作目錄乾淨。

已完成 research-preview／research-apply、研究資料包 schema、來源隨事件新增與重新載入、review metadata 與 digest、舊預覽拒絕套用，以及完整事件內容與快照的一致性檢查。保留所有既有 fixture／歷史、財務公式與 thesis 規則；正式資料仍沒有已匯入觀測。

驗收包含預覽不寫入、第一筆 production journal、重算與 null 傳播、來源與觀測 supersession、來源血緣、快照重播、舊 preview／重複 ID 拒絕，以及 metadata／單位／期間／fixture／tier 等失敗時不寫入。操作詳見 [research-refresh.md](research-refresh.md)。

驗證：`npm test` 62 passed／0 failed；`npm run validate` 與 `npm run validate -- --production` 均為 84 metrics、25 formulas、0 errors、0 warnings，unknown 分別為 1 與 84。UNI required-share 仍為 0.422。既有 Dashboard/API 測試通過；本次沒有 UI 修改，未另作瀏覽器視覺驗證。遠端 CI 結果以 PR 的實際狀態為準。

環境紀錄：sandbox 中測試子程序回報 spawn EPERM，完整測試改於獲准環境執行。Node 24 在此 Windows Unicode 路徑上執行 fs.cpSync 時會原生異常退出，新增測試改以逐檔讀寫準備隔離目錄。CLI 整合測試發現並修正 readYaml 使用絕對路徑時重複拼接目錄的問題。

父任務尚未完成：識別碼與可投資性、一手來源內容、UNI 預算／實際捕獲啟用、同日估值、可比財務期間及首份正式 baseline 仍待研究與審查。review metadata 不提供身份驗證，journal 沿用 single-writer 與中斷需人工修復的限制。後續應繼續首項 NEXT 的研究驗收，不擴張自動採集、排程或新資產模型。

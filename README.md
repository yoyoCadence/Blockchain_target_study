# 代幣化資本市場・持有人價值研究引擎

可追溯、可重算、可比較版本的 tokenized capital markets 研究系統。第一版包含 UNI、SECZ、XLM 三種價值捕獲模型，以及 14 個研究／基礎設施節點。

預設介面為繁體中文，指標、操作、資料血緣、研究與時效狀態均提供中文呈現。四種分類與五種論點狀態保留原始代碼；來源、規則／假設原文及完整 JSON 仍可核對。中文標籤不修改金融定義、公式、門檻或歷史證據。

**這是研究引擎，不是交易訊號。TAM ≠ asset value；network adoption ≠ token-holder value。**

## 啟動

需求：Node.js 22 以上（開發及驗證使用 Node.js 24）。不需要 API key、資料庫或 AI SDK。

Windows 第一次先在本專案執行 `npm ci`；之後雙擊 [start-research.cmd](start-research.cmd)，啟動本機服務並顯示中文網址。也可在終端機執行下列命令。啟動檔只檢查需求並啟動既有服務，不會自動安裝依賴、取得來源或套用研究。

```powershell
npm ci
npm start
```

開啟 **http://127.0.0.1:4310**。伺服器只監聽本機。終端機按 Ctrl+C 停止；可用 `PORT` 環境變數更換連接埠。

首頁的「開始使用」提供三個入口，可直接開啟或加入書籤：

- [閱讀正式研究證據](http://127.0.0.1:4310/?mode=production#research)：查看身份、原始財報、TTM 未解可比性及股本分類，展開來源與完整證據；研究不會自動補入金融模型。
- [練習情境試算](http://127.0.0.1:4310/?mode=fixture#sensitivity)：使用明示合成資料調整、重算與還原，點擊數值追蹤血緣；情境不儲存。
- [手動查詢來源時效](http://127.0.0.1:4310/?mode=production#freshness)：填 UTC 截止日後按查詢，不會在開頁時自動取得報告。

工作區選擇會更新網址並保留頁內位置，重新整理仍載入相同模式。無效、空白或重複的 `mode` 會先停止載入，請明確選擇工作區再繼續。完整操作與驗收見[中文入門](reports/getting-started.md)。

```powershell
npm test
npm run validate
npm run validate -- --production
```

Windows Codex 沙箱若回報 `spawn EPERM`，需使用允許建立測試子程序的環境執行測試。這是環境權限問題。

來源取得與人工 review 的帶時區時間戳會先換算 [UTC 日](reports/utc-research-chronology.md)再比較知識日期，原始 offset／時間文字保留。

人工預覽若有計算錯誤，CLI 會輸出[中文快照阻擋診斷](reports/research-preview-diagnostics.md)，列出每個指標名稱、ID 與公式原始原因。`research-preview`／`research-apply` 仍 exit 1，stdout 不回傳成功結果，也不寫入；診斷不改日期、公式或驗證規則。
Canonical [未來證據防線](reports/future-canonical-evidence.md)亦拒絕晚於當前 UTC 日的 OBSERVED as-of，以及晚於現在精確時間的來源取得；明示情境／假設與計畫 effective date 仍分開。
手動事件若附 review，亦套用 [review 日期檢查](reports/manual-event-review-dates.md)：未來 review、早於知識日或來源晚於 review 會在寫入／journal 載入前被拒絕。

已存事件載入時也重用[事件證據檢查](reports/saved-event-evidence.md)：知識／生效／來源日期、workspace provenance 與計畫狀態分類必須有效。雜湊一致仍需語意驗證；合法未來計畫與晚取得的歷史來源保留。

已存 `research_refresh` 亦沿用[主要來源驗證](reports/saved-research-primary-evidence.md)：非空 OBSERVED 更新，每項引用至少一個 Tier 1／2，且全部證據列入 event.source_ids；null 不會因此補值。

[已存事件節點範圍](reports/event-scope.md)沿用新事件的起始節點與更新資產限制，依每份快照保存的資產／圖譜核對完整傳播集合；目前圖譜改版不會改寫歷史範圍，金融與未知值不改。

[相鄰快照版本連續性](reports/snapshot-version-continuity.md)也逐對核對保存歷史：舊來源／輸入不得同 ID 改寫或刪除，公式／論點規則變更須升版；目前資料與最新快照相符，仍不能繞過較早的版本約束。

事件內更新的知識日亦[不得晚於事件 as-of](reports/event-update-knowledge.md)；planned／announced／cancelled 的 DTCC 更新不能變成 live／material。新事件與已存載入共用原規則，保留合法的未來 planned 生效日。

## 資料品質：請先閱讀

- **Fixture 模式**：預設的合成示範資料，全部清楚標示。`OBSERVED` 標籤在此只表示資料結構，不代表真實世界查證；synthetic source 並非新聞或一手證據。
- **Production 模式**：已加入截至 2026-01-01 的歷史 UNI 核准預算額度（20M UNI/year），以及 2026-10-04 Coinbase Exchange UNI／XLM 單筆最後成交價（9.0556 USD／1 UNI、0.216265 USD／1 XLM）。歷史名目年率按 UNI 價格折算為 181,112,000 USD/year 的推導模型負擔，其餘 80 個數值仍為 `Unknown`。模型折算不代表當日額度仍有效或實際支出；價格保留原成交時間與 point 期間，不會即時更新，也不證明合理價值或個人交易資格。查證見[預算研究](reports/uni-growth-budget-baseline.md)、[UNI 價格基準](reports/uni-quote-baseline.md)與[XLM 價格基準](reports/xlm-quote-baseline.md)，不從 fixture 補值。
- **ASSUMPTION**：分析者設定與理由。原先使用者提供的 20M UNI/year fixture 假設與 production null v1 均保留；正式資料以 OBSERVED v2 明確 supersede 該 null，代表經查證的核准額度。
- **SCENARIO**：4T TAM 與互動敏感度等反事實情境，不是預測事實。
- **DERIVED**：25 條 versioned 公式，包含完整遞迴血緣與確切輸入版本；上游未知則結果未知。
- 圖譜的初始 edges 全部是 `assumed` 研究假設。沒有宣稱 DTCC 整合已 live，或圖譜收購已完成。初始 asset registry 的投資性仍是 unverified。

最新研究參考日為 2026-10-04；它不是全部年度財務資料的觀測日，也不能補足論點所需的連續證據。最近的數值更新是 UNI 單筆價格與名目年率折算負擔；其來源／公式變更分開呈現，假設／情境未改。最新季度提領查證只增加來源，沒有數值變動；舊快照保留原日期、數值與 v1 公式。五條 UNI 公式升至 v2，將折算明示為 model 並傳遞報價日，已知跨期收入／市值仍拒絕。原未套用候選保留當時研究，現在已有同 ID 的觀測，不能再次直接 apply；新的研究需新 ID／版本及重新 preview。

UNI v2 的[歷史 feeTo 配置證據](reports/uni-v2-fee-configuration.md)已保存為來源事件與快照，財務數值仍不變；實際 fee 收入、UNI burn 與現況查證仍待完成。
已另存[單筆 Firepit 執行證據](reports/uni-firepit-release.md)：2025-12-29 同一 receipt 的 UNI dead-address payment 與 TokenJar 資產交換。未完成 fee-origin／全期間收入與 burn 查證，沒有年度數值 ingest。
已另存[單筆 v2 LP 費用份額歸集](reports/uni-v2-fee-accrual.md)：2026-10-04 原始 Factory 建池事件與 TokenJar LP 鑄造流入相符。保留 raw 整數與源碼推論界線；LP／caller 贖回不是 UNI burn 或年度收入，金融輸入仍未知。

已另存 [UNI／XLM 單次交易所價格資料](reports/manual-market-quotes.md)：兩筆 Coinbase Exchange 最後成交與四份完整原始回應，保留 decimal／nanosecond、取得及商品幣別時間。原雙資產預覽被 v1 期間防線阻擋，當時只保存來源事件；後續分別保存[XLM](reports/xlm-quote-baseline.md)與[UNI](reports/uni-quote-baseline.md)。研究頁可展開十四筆中文事件；這不是同步估值、收盤價或個人交易資格確認。

已另存 [UNI 單筆季度提領](reports/uni-vesting-execution.md)：2026-10-01 成功 receipt 的三 logs，及 10 月 4 日稍後公開 getter 回應。保留 raw 整數、未固定區塊／時間的 null 與 Similar Match 限制；原金融輸入與預算時效不變，單筆提領不當作年度分配或實際下游支出。

已另存 [UNI 固定區塊參數與剩餘授權](reports/uni-vesting-fixed-block.md)：finalized block 26119713，六 getter／allowance／decimals 與 runtime 使用相同 hash；保留原始回應及先前 receipt 查詢 null。單點授權不更新原核准年率時效；部署 source 等價、完整可轉帳條件與全年分配仍待查證。

可使用[固定區塊資料包手動唯讀驗證](reports/manual-fixed-block-review.md)重新核對原始 request／response、ABI 解碼、同區塊與來源日期。命令明示 production 與已審查 hash，不連 RPC 或寫入資料；matching hash 仍須通過語意驗證。

[固定區塊研究目錄／中文介面](reports/fixed-block-research-inspection.md)也能直接查閱同一份 hash 固定資料包：八個完整 raw 字串、分類／可信程度及三種時間分開，保留 receipt 無結果。研究共七份 review／十四筆事件；歷史截止日不能提前取得這份 10 月 4 日證據，Fixture 隔離保留。

同一區塊的[owner 餘額與 totalSupply](reports/uni-token-state.md)另存四個 OBSERVED raw 值、原 owner getter 依賴及 BigInt 比較 v1。可使用[手動唯讀驗證](reports/manual-token-state-review.md)核對原始呼叫與比較結果：

```powershell
node cli.js token-state-review data/research/uni-token-state-2026-10-04-v1.json --production --digest 848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d
```

餘額不少於 allowance 只限該時點；totalSupply 尚不足以確認流通／完全稀釋分母。原價格時點不同，市值／FDV 與全年實際分配仍未知。

UNI／SECZ／XLM 的[一手來源身份資料包](reports/core-identifiers.md)已獨立查證合約、上市母公司與原生幣身份；asset registry 的投資性仍未提升，身份資料不參與財務計算。檢查命令：

```powershell
node cli.js identity-review data/research/core-identifiers-2026-10-03.yaml --production
```

SECZ 的[分期收入資料包](reports/secz-comparable-revenue.md)保留兩類季度／半年收入及可比較期間；[年度資料包](reports/secz-annual-revenue.md)另存已核對審計來源的全年披露。唯讀命令核對合計與同比，不更新六類年度模型：

```powershell
node cli.js revenue-review data/research/secz-comparable-revenue-2026-10-03-v1.yaml --production
node cli.js revenue-review data/research/secz-annual-revenue-2026-10-03-v1.yaml --production
```

兩份研究 JSON 可用[唯讀比較](reports/revenue-review-comparison.md)檢查來源、公式、報表範圍與相同期間觀察差異，保留獨立 filing 的衝突。先驗證雜湊與重播，不自動判定經濟可比性或更新金融模型：

```powershell
node cli.js revenue-compare data/research/revenue-reviews/secz-annual-v1.json data/research/revenue-reviews/secz-q22026-v1.json --production
```

已另存 [S-1／424B3 年度表查證](reports/secz-cross-filing-revenue.md)：8/7 prospectus 的六個年度值與 7/31 S-1 一致，保留獨立來源／觀察與可重播比較；這不代表完整更正沿革、季度可比性或 TTM 已驗證。

原始收入 [TTM 銜接](reports/secz-revenue-ttm.md)必須附明示可比性假設與雙 filing 證據。現有正式 review 保留 MG Stover 名稱衝突，三項 TTM 結果均為 null，沒有金融 ingest：

```powershell
node cli.js revenue-ttm data/research/secz-ttm-20260630-review-v1.yaml data/research/revenue-reviews/secz-prospectus-v1.json data/research/revenue-reviews/secz-q22026-v1.json --production
```

後續 [收購範圍查證](reports/secz-acquisition-context.md)另存 S-1 XBRL 的 Inc.／LLC 標題、相同收購日期／對價及 actual／pro forma 區分。只追加來源事件／完整快照；法律名稱等價未獲直接澄清，原 TTM null 與所有金融輸入保留。

[母公司歷史股本範圍](reports/secz-parent-capital-context.md)另存 10-Q／Exhibit 5.1 的已發行、條件發行、預留與轉售登記區分，保留日期／類別衝突與 S-1 索引閱讀限制；只追加來源及完整快照，目前估值與 TTM 仍未知。

[母公司認股權證條款](reports/secz-warrant-context.md)保存 Exhibit 4.1 修訂後的母公司權利及歸屬／行使區分，防止沿用舊子公司價格或重複換股；只追加來源，完整登記註腳、現況行使與估值仍未驗證。

[轉售登記分類核對](reports/secz-resale-capital-reconciliation.md)已直接讀取 S-1 選定股數表及 50 列轉售／註腳，保存原始觀察、null 與版本化算術依賴。披露加總對上登記量，仍保留已發行 Sponsor 股重疊、earnout 差額及分類衝突；來源／完整快照追加，83 個金融未知與 TTM null 不改。固定研究目錄已包含此股本紀錄，可在正式工作區展開中文核對、原始紀錄與完整證據。

手動來源時效檢查分開顯示觀測 age、發布 age 與重新取得 age；門檻是明示分析者假設，不會改動財務值或 thesis。完整說明見 [來源時效](reports/source-freshness.md)。

```powershell
node cli.js freshness --production --as-of 2026-10-03
```

[研究來源時效](reports/research-source-freshness.md)另納入已保存的身份／財報／TTM review，分開顯示觀察、publication、retrieval 與 review 可用日期；不把窗口內的資料當成可比性或投資性確認：

```powershell
node cli.js research-freshness --production --as-of 2026-10-03
```

## 使用研究介面

工作區切換時會先清空舊金融結果與血緣，載入失敗時可按「重新載入目前工作區」。新基準載入前情境計算停用；同工作區的重算失敗會保留上一個成功結果並標示輸入尚未套用。見[載入與重試驗收](reports/workspace-loading.md)。

研究證據單獨載入失敗時，可在「研究證據」按「重新載入研究證據」，保留金融結果與尚未套用的情境輸入。研究回應必須符合目前工作區，較早回應不會覆蓋最新結果。見[獨立重試驗收](reports/research-retry.md)。

正式研究頁的[已保存事件與鏈上證據](reports/reviewed-event-inspection.md)可查閱八筆已審查事件，包括 UNI 核准預算、歷史配置、Firepit 交換及 LP 歸集。每筆保留生效日、知識日、審查時間、原模型期間、當時來源版本與完整原始 JSON；鏈上 raw 整數以字串保留。展開事件只查閱證據，不套用歷史更新；單筆執行仍不代表年度收入或目前配置。

1. 選擇「合成示範資料（Fixture）」或「正式研究資料（Production）」工作區。
2. 點擊任何指標卡，查看分類、單位、知識日、期間、來源、可信程度、公式版本與每一層依賴。
3. 資產卡下方展開「基準輸入與市場估值」查看價格、估值、收入分項與需求存量。
4. 在「敏感度分析」改變參數並按「重新計算情境」。比例採小數：`0.05` = 5%，`0.000125` = 1.25 bp。矩陣每格也可點擊查看該情境自己的血緣。
5. 「投資論點監測」顯示所有規則、最高嚴重度、證據、最後狀態變更與歷史覆蓋程度。`HEALTHY + insufficient` 代表沒有已確認觸發，不代表已證實健康。
6. 「目前與前一版本」比較已儲存快照；兩版數值各自連到當時的血緣，與未儲存敏感度情境分開。
7. 正式工作區的[研究證據](reports/research-inspection.md)展開已保存身份／原始財報研究、可比性假設、來源與完整審查原文；也可查看[股本分類研究](reports/capital-research-inspection.md)的中文核對、115 筆紀錄與九筆未知、point 日期及完整依賴。合成工作區不混入正式研究，研究數值也不補入金融模型。
8. [來源時效](reports/freshness-dashboard.md)填寫 UTC 截止日後手動查詢（留空使用目前 UTC 日），分開查看原觀測、發布、取得與審查時效、政策與完整依賴。更換日期／工作區會清除舊結果，需再次按下查詢；不修改金融資料或論點狀態。

## 架構

```text
sources + observations + assumptions + scenarios (YAML)
  → schema / classification / temporal / unit validation
  → normalization (explicit bps → ratio)
  → data dictionary + formula AST / topological dependency order
  → unit economics + reverse underwriting + sensitivity recomputation
  → consecutive-period thesis rules + evidence coverage
  → immutable content-hashed snapshot + material-update reason
  → HTTP API → presentation-only dashboard
```

| 位置 | 責任 |
| --- | --- |
| `spec/` | Schema、dictionary、資產／公式 registry、假設、情境、graph、規則 |
| `sources/sources.yaml` | 正式來源，附版本與可追溯 metadata |
| `data/observed/` | 正式 append-only observations |
| `data/fixtures/` | 明確隔離的 deterministic synthetic inputs |
| `data/events/{mode}/` | 事件 transaction：event + updates + snapshot + changelog reason |
| `data/snapshots/{mode}/` | 初始及手動 material-update snapshots |
| `engine/` | 純計算、驗證、血緣、敏感度、thesis、propagation、版本比較 |
| `dashboard/` | 原生 HTML/CSS/JS，沒有財務數字或公式 |
| `tests/` | schema / formulas / lineage / thesis / regression / API |
| `reports/` | 方法、當前 thesis、changelog、實作計畫與驗證紀錄 |

公式以受限 AST 儲存在 YAML，只允許 add/sub/mul/div/pow；不使用 eval。輸入 ID 與 metric ID 分開，supersedes 建立歷史版本鏈。公式 registry 保留現行版本，舊公式完整保存在快照與 Git。

## 手動更新與版本紀錄

已保存的 SECZ 轉售股本研究可用[手動唯讀驗證](reports/manual-capital-review.md)核對來源、原始表格、七條嵌入公式與依賴，取得繁體中文摘要及完整原文：

```powershell
node cli.js capital-review data/research/capital-reviews/secz-resale-20261004-v1.json --production
```

此命令不更新金融輸入，也不代表現在或完全稀釋股本已驗證；原始 null、分類差異與來源版本保留。

所有正式更新先查證來源。新增來源版本，包含 URL、publisher、title、date、retrieved_at、tier、covered_metrics。新增 observation 的唯一 ID 與遞增 version，以 `supersedes` 連到舊紀錄，不能刪除舊紀錄。既有來源、輸入或同版本公式被修改時，snapshot / API / validate 會拒絕該變更。

初始 material update：

```powershell
npm run snapshot -- --production --reason "Initial verified research baseline"
```

事件更新：以 `spec/event-schema.yaml` 的格式建立 YAML，然後執行：

```powershell
node cli.js event path/to/reviewed-event.yaml --production
node cli.js report --production
```

論點報告寫入 `reports/current-thesis.md`，使用繁體中文，保留原始論點代碼與觸發規則原文，另外標示證據不足。未指定 `--production` 時仍使用合成示範工作區；產生報告不會追加或修改金融資料／快照。

既有 GitHub CI 使用 Ubuntu 24.04、Node 24 及官方 v7 checkout／setup-node；安裝後執行完整測試與兩模式驗證。只固定 OS 版本及 action major，hosted image 與上游修正仍會更新，沒有新增業務排程或自動研究。

人工審查的一手來源研究更新可先預覽，再使用預覽 digest 明確套用；完整格式、來源要求與剩餘研究驗收見 [研究更新流程](reports/research-refresh.md)。

```powershell
node cli.js research-preview path/to/reviewed-research.yaml --production
node cli.js research-apply path/to/reviewed-research.yaml --production --digest <review_digest>
```

預覽不寫入資料；資料包、模型或父快照變動會使舊 digest 失效。此工具子項及歷史 UNI 預算子項已完成；完整 production baseline 的識別碼、價值捕獲、估值與財務期間仍待研究。

事件會先驗證、找出受影響節點、append observations、重算全部公式、評估 thesis，再把 event 與 snapshot 寫成單一 exclusive-create journal。reason 即該更新的持久 changelog。規劃中／已宣布事件只能建立假設或情境；live/completed 必須有 effective date 與來源。假設改變也要新版本、supersedes、reason。互動敏感度不自動寫入。

套件附三個 fixture snapshots：1.70 bp baseline → 1.25 bp 假設更新 → UNI 期間公式 v2。Required UNI Share 31.03% → 42.2% → 42.2%；第三份只升版公式與 metadata，金融數值不變。三份屬於同一年度，不會冒充三期 thesis 證據。`scripts/seed-history.mjs` 僅供沒有歷史的乾淨 workspace 使用，存在歷史時會拒絕執行；不要重跑 bootstrap authoring script 覆寫 spec。

## API

TTM [可比性假設也須維持同版本定義](reports/research-assumption-version-consistency.md)；合法升版保留歷史與 ASSUMPTION 分類，null 不因版本檢查而補值。

目錄也檢查[相同公式 ID／版本的完整定義](reports/research-formula-version-consistency.md)，含 TTM 嵌入收入研究；各檔案重播自己的公式，合法多版本可並存。

固定研究目錄與[共用證據 ID 檢查](reports/research-evidence-id-consistency.md)會在研究／時效回應前拒絕同 ID 的不同來源或紀錄，包括重用金融輸入 ID；匹配檔案 hash 仍須通過語意與跨集合一致性驗證。

- `GET /api/state?mode=fixture|production`：指標、完整 lineage、thesis、矩陣、graph 與版本比較。
- `GET /api/lineage?metric=uni.net_accrual&mode=fixture`：單一指標遞迴血緣。
- `POST /api/sensitivity?mode=fixture`：`{"overrides":{"uni.fee":0.0001}}`，只計算、不存檔。
- `GET /api/snapshots?mode=fixture`：快照摘要與差異。
- `GET /api/research?mode=production`：固定目錄中已驗證／重播的研究證據，與金融輸入分開；Fixture 回傳空清單，禁止写入。
- `GET /api/freshness?mode=production&as_of=2026-10-03`：唯讀時效報告；Production 包含 canonical 與固定研究目錄，Fixture 只回 canonical synthetic 資料。省略日期使用目前 UTC 日，無效／未來／空日期拒絕。詳見 [API](reports/freshness-api.md)。

## 邊界與後續

目前只有歷史核准預算與單筆交易所價格，缺少完整四期證據、自動研究、外部事件訂閱或 scheduler。來源衝突保留且阻擋無聲選取，仍需分析者明確處理。Snapshot 使用雜湊與禁止覆寫 API，並非抵抗管理員修改檔案的外部不可變儲存。CLI 使用單一寫入者；不是多人協作資料庫。完整 unit-dimensional algebra 與可配置會計曆尚未實作；目前會檢查宣告單位、basis、期間與明確轉換。

目前可以閱讀已保存研究、操作合成情境與手動查詢時效；人工預覽／明確套用流程及歷史 UNI 核准預算已完成。**完整 production baseline 尚未完成**，後續仍需現行投資性、完整價值捕獲、同步估值與可比財務期間。詳見 [task.md](task.md)、[方法說明](reports/methodology.md) 與 [Agent 規範](AGENTS.md)。

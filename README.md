# Tokenized Capital Markets Living Underwriting Engine

可追溯、可重算、可比較版本的 tokenized capital markets 研究系統。第一版包含 UNI、SECZ、XLM 三種價值捕獲模型，以及 14 個研究／基礎設施節點。

**這是研究引擎，不是交易訊號。TAM ≠ asset value；network adoption ≠ token-holder value。**

## 啟動

需求：Node.js 22 以上（開發及驗證使用 Node.js 24）。不需要 API key、資料庫或 AI SDK。

```powershell
npm ci
npm start
```

開啟 **http://127.0.0.1:4310**。伺服器只監聽本機。終端機按 Ctrl+C 停止；可用 `PORT` 環境變數更換連接埠。

```powershell
npm test
npm run validate
npm run validate -- --production
```

Windows Codex 沙箱若回報 `spawn EPERM`，需使用允許建立測試子程序的環境執行測試。這是環境權限問題。

來源取得與人工 review 的帶時區時間戳會先換算 [UTC 日](reports/utc-research-chronology.md)再比較知識日期，原始 offset／時間文字保留。
Canonical [未來證據防線](reports/future-canonical-evidence.md)亦拒絕晚於當前 UTC 日的 OBSERVED as-of，以及晚於現在精確時間的來源取得；明示情境／假設與計畫 effective date 仍分開。
手動事件若附 review，亦套用 [review 日期檢查](reports/manual-event-review-dates.md)：未來 review、早於知識日或來源晚於 review 會在寫入／journal 載入前被拒絕。

已存事件載入時也重用[事件證據檢查](reports/saved-event-evidence.md)：知識／生效／來源日期、workspace provenance 與計畫狀態分類必須有效。雜湊一致仍需語意驗證；合法未來計畫與晚取得的歷史來源保留。

已存 `research_refresh` 亦沿用[主要來源驗證](reports/saved-research-primary-evidence.md)：非空 OBSERVED 更新，每項引用至少一個 Tier 1／2，且全部證據列入 event.source_ids；null 不會因此補值。

## 資料品質：請先閱讀

- **Fixture 模式**：預設的合成示範資料，全部清楚標示。`OBSERVED` 標籤在此只表示資料結構，不代表真實世界查證；synthetic source 並非新聞或一手證據。
- **Production 模式**：已加入截至 2026-01-01 的歷史 UNI 核准預算額度（20M UNI/year），其餘 83 個數值仍為 `Unknown`。這不是目前估值或實際支出；不從 fixture 補值。查證與日期衝突見 [研究紀錄](reports/uni-growth-budget-baseline.md)。
- **ASSUMPTION**：分析者設定與理由。原先使用者提供的 20M UNI/year fixture 假設與 production null v1 均保留；正式資料以 OBSERVED v2 明確 supersede 該 null，代表經查證的核准額度。
- **SCENARIO**：4T TAM 與互動敏感度等反事實情境，不是預測事實。
- **DERIVED**：25 條 versioned 公式，包含完整遞迴血緣與確切輸入版本；上游未知則結果未知。
- 圖譜的初始 edges 全部是 `assumed` 研究假設。沒有宣稱 DTCC 整合已 live，或圖譜收購已完成。初始 asset registry 的投資性仍是 unverified。

UNI v2 的[歷史 feeTo 配置證據](reports/uni-v2-fee-configuration.md)已保存為來源事件與快照，財務數值仍不變；實際 fee 收入、UNI burn 與現況查證仍待完成。
已另存[單筆 Firepit 執行證據](reports/uni-firepit-release.md)：2025-12-29 同一 receipt 的 UNI dead-address payment 與 TokenJar 資產交換。未完成 fee-origin／全期間收入與 burn 查證，沒有年度數值 ingest。

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

手動來源時效檢查分開顯示觀測 age、發布 age 與重新取得 age；門檻是明示分析者假設，不會改動財務值或 thesis。完整說明見 [來源時效](reports/source-freshness.md)。

```powershell
node cli.js freshness --production --as-of 2026-10-03
```

[研究來源時效](reports/research-source-freshness.md)另納入已保存的身份／財報／TTM review，分開顯示觀察、publication、retrieval 與 review 可用日期；不把窗口內的資料當成可比性或投資性確認：

```powershell
node cli.js research-freshness --production --as-of 2026-10-03
```

## 使用 Dashboard

1. 選擇 Fixture 或 Production workspace。
2. 點擊任何指標卡，查看分類、單位、as-of、會計期間、來源、信心水準、公式版本與每一層依賴。
3. 資產卡下方展開 `Canonical inputs & market valuation` 查看價格、估值、收入分項與需求存量。
4. 在 Sensitivity lab 改變參數並按 Recalculate。比例採小數：`0.05` = 5%，`0.000125` = 1.25 bp。矩陣每格也可點擊查看該情境自己的血緣。
5. Thesis monitor 顯示所有規則、最高嚴重度、證據、最後狀態變更與歷史覆蓋程度。`HEALTHY + insufficient` 代表沒有已確認觸發，不代表已證實健康。
6. Version history 比較持久化快照；previous/current 數值各自連到當時的血緣，與未儲存敏感度情境分開。
7. Production 的 [Research evidence](reports/research-inspection.md) 展開已保存身份／原始財報研究、可比性假設、來源與完整 review；Fixture 不混入這些正式研究，研究數值也不補入金融模型。
8. [Source freshness](reports/freshness-dashboard.md) 填寫 UTC 截止日後手動查詢（留空使用目前 UTC 日），分開查看原觀測、發布、取得與 review 時效、政策與完整依賴。更換日期／workspace 會清除舊結果，需再次按下查詢；不修改金融資料或 thesis。

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

人工審查的一手來源研究更新可先預覽，再使用預覽 digest 明確套用；完整格式、來源要求與剩餘研究驗收見 [研究更新流程](reports/research-refresh.md)。

```powershell
node cli.js research-preview path/to/reviewed-research.yaml --production
node cli.js research-apply path/to/reviewed-research.yaml --production --digest <review_digest>
```

預覽不寫入資料；資料包、模型或父快照變動會使舊 digest 失效。此工具子項及歷史 UNI 預算子項已完成；完整 production baseline 的識別碼、價值捕獲、估值與財務期間仍待研究。

事件會先驗證、找出受影響節點、append observations、重算全部公式、評估 thesis，再把 event 與 snapshot 寫成單一 exclusive-create journal。reason 即該更新的持久 changelog。規劃中／已宣布事件只能建立假設或情境；live/completed 必須有 effective date 與來源。假設改變也要新版本、supersedes、reason。互動敏感度不自動寫入。

套件已附兩個 fixture snapshots：1.70 bp baseline → 1.25 bp 假設更新；Required UNI Share 31.03% → 42.2%。這兩個版本屬於同一年度，不會冒充兩期 thesis 證據。`scripts/seed-history.mjs` 僅供沒有歷史的乾淨 workspace 使用，存在歷史時會拒絕執行；不要重跑 bootstrap authoring script 覆寫 spec。

## API

- `GET /api/state?mode=fixture|production`：指標、完整 lineage、thesis、矩陣、graph 與版本比較。
- `GET /api/lineage?metric=uni.net_accrual&mode=fixture`：單一指標遞迴血緣。
- `POST /api/sensitivity?mode=fixture`：`{"overrides":{"uni.fee":0.0001}}`，只計算、不存檔。
- `GET /api/snapshots?mode=fixture`：快照摘要與差異。
- `GET /api/research?mode=production`：固定目錄中已驗證／重播的研究證據，與金融輸入分開；Fixture 回傳空清單，禁止写入。
- `GET /api/freshness?mode=production&as_of=2026-10-03`：唯讀時效報告；Production 包含 canonical 與固定研究目錄，Fixture 只回 canonical synthetic 資料。省略日期使用目前 UTC 日，無效／未來／空日期拒絕。詳見 [API](reports/freshness-api.md)。

## 邊界與後續

目前沒有正式市場資料、完整四期歷史、自動研究、外部事件訂閱或 scheduler。來源衝突保留且阻擋無聲選取，仍需分析者明確處理。Snapshot 使用雜湊與禁止覆寫 API，並非抵抗管理員修改檔案的外部不可變儲存。CLI 使用單一寫入者；不是多人協作資料庫。完整 unit-dimensional algebra 與可配置會計曆尚未實作；目前會檢查宣告單位、basis、期間與明確轉換。

下一步只建議：**建立一手來源的研究 refresh 流程，填入並審核首批 production observations。** 詳見 [task.md](task.md)、[方法說明](reports/methodology.md) 與 [Agent 規範](AGENTS.md)。

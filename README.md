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

## 資料品質：請先閱讀

- **Fixture 模式**：預設的合成示範資料，全部清楚標示。`OBSERVED` 標籤在此只表示資料結構，不代表真實世界查證；synthetic source 並非新聞或一手證據。
- **Production 模式**：初始沒有已查證 observations；所有 84 個數值為 `Unknown`。不從 fixture 補值。
- **ASSUMPTION**：分析者設定與理由。20M UNI/year 是使用者提供、尚待查證的 baseline；只在 fixture 中使用，production 保留 null。
- **SCENARIO**：4T TAM 與互動敏感度等反事實情境，不是預測事實。
- **DERIVED**：25 條 versioned 公式，包含完整遞迴血緣與確切輸入版本；上游未知則結果未知。
- 圖譜的初始 edges 全部是 `assumed` 研究假設。沒有宣稱 DTCC 整合已 live，或任何收購已完成。SECZ 等符號為需求指定的研究識別碼，上市與可投資性尚未查證。

## 使用 Dashboard

1. 選擇 Fixture 或 Production workspace。
2. 點擊任何指標卡，查看分類、單位、as-of、會計期間、來源、信心水準、公式版本與每一層依賴。
3. 資產卡下方展開 `Canonical inputs & market valuation` 查看價格、估值、收入分項與需求存量。
4. 在 Sensitivity lab 改變參數並按 Recalculate。比例採小數：`0.05` = 5%，`0.000125` = 1.25 bp。矩陣每格也可點擊查看該情境自己的血緣。
5. Thesis monitor 顯示所有規則、最高嚴重度、證據、最後狀態變更與歷史覆蓋程度。`HEALTHY + insufficient` 代表沒有已確認觸發，不代表已證實健康。
6. Version history 比較持久化快照；previous/current 數值各自連到當時的血緣，與未儲存敏感度情境分開。

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

預覽不寫入資料；資料包、模型或父快照變動會使舊 digest 失效。此工具子項已完成，首份經審查的 production baseline 仍待研究。

事件會先驗證、找出受影響節點、append observations、重算全部公式、評估 thesis，再把 event 與 snapshot 寫成單一 exclusive-create journal。reason 即該更新的持久 changelog。規劃中／已宣布事件只能建立假設或情境；live/completed 必須有 effective date 與來源。假設改變也要新版本、supersedes、reason。互動敏感度不自動寫入。

套件已附兩個 fixture snapshots：1.70 bp baseline → 1.25 bp 假設更新；Required UNI Share 31.03% → 42.2%。這兩個版本屬於同一年度，不會冒充兩期 thesis 證據。`scripts/seed-history.mjs` 僅供沒有歷史的乾淨 workspace 使用，存在歷史時會拒絕執行；不要重跑 bootstrap authoring script 覆寫 spec。

## API

- `GET /api/state?mode=fixture|production`：指標、完整 lineage、thesis、矩陣、graph 與版本比較。
- `GET /api/lineage?metric=uni.net_accrual&mode=fixture`：單一指標遞迴血緣。
- `POST /api/sensitivity?mode=fixture`：`{"overrides":{"uni.fee":0.0001}}`，只計算、不存檔。
- `GET /api/snapshots?mode=fixture`：快照摘要與差異。

## 邊界與後續

目前沒有正式市場資料、完整四期歷史、自動研究、外部事件訂閱或 scheduler。來源衝突保留且阻擋無聲選取，仍需分析者明確處理。Snapshot 使用雜湊與禁止覆寫 API，並非抵抗管理員修改檔案的外部不可變儲存。CLI 使用單一寫入者；不是多人協作資料庫。完整 unit-dimensional algebra 與可配置會計曆尚未實作；目前會檢查宣告單位、basis、期間與明確轉換。

下一步只建議：**建立一手來源的研究 refresh 流程，填入並審核首批 production observations。** 詳見 [task.md](task.md)、[方法說明](reports/methodology.md) 與 [Agent 規範](AGENTS.md)。

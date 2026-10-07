# UNI 研究層估值資料包：唯讀驗證、研究目錄與中文查閱

為 [UNI 供給口徑與日期對齊的研究層估值](uni-aligned-valuation.md)（原資料包 SHA-256 `227008fc…`）加入規格、唯讀核對、研究目錄與中文表格。仍只在研究層：不改 canonical `uni.price`／`uni.market_cap`／`uni.fdv`。

## 手動唯讀驗證

[共用 reader](../engine/research/aligned-valuation.js) 只讀已保存的[原資料包](../data/research/uni-aligned-valuation-2026-10-07-v1.json)，套用 [schema v1](../spec/uni-aligned-valuation-schema.yaml)／[方法 v1](../spec/uni-aligned-valuation-method.yaml)。不連 RPC 或交易所、不寫入。

```powershell
node cli.js uni-aligned-valuation-review data/research/uni-aligned-valuation-2026-10-07-v1.json --production --digest 227008fc44076ba5a09a159e6531158a5605979484a0c21e4f155b5fca4d2356
```

核對內容：

- **錨點與供給**：與其他固定區塊 reader 相同——mainnet、finalized、同 hash header 與同高度 recheck；五個 `eth_call` 的目標、calldata、canonical 釘選與 32-byte 解碼。
- **價格對齊（結構性要求）**：K 線 URL 必須等於由錨點算出的 URL——Coinbase `UNI-USD`、60 秒、視窗為區塊所在分鐘前後各一分鐘；回應中必須有該分鐘的列。對不上就拒絕，不產生任何估值。請求順序必須是錨點 → K 線 → 狀態批次，且該分鐘在請求時已收盤。
- **價格數值**：回應 body SHA-256 重算；回應必須是純十進位數字列（不接受科學記號或負數），六個欄位由原文字逐字擷取、不經浮點；紀錄的值、原值、欄位位置、K 線時間與取得時間須一致；開盤與收盤必須落在最低與最高之間。
- **依賴資料包**：重新驗證 `basis_dependency` 指向的 UNI 供給組成資料包（`de66eac4…`），並確認 token／Timelock／dead 地址相同；Timelock 身份與鑄造語意的來源必須是該資料包使用的已存來源。
- **推導與情境**：六條公式完整定義必須等於方法檔，以 BigInt 重播；美元值＝價格 ×（第一個供給減去其餘）÷ 10^18，無條件捨去到美分。方法檔指名的兩條情境公式必須標為 SCENARIO 並帶 `timelock_excluded`；其餘必須是 DERIVED 且不得帶情境名稱——情境值不能被改標成推導值，研究口徑也不能被改標成情境。
- 已驗證流通量、canonical 市值／FDV、其他非流通持倉、Timelock 承諾／可支用、未來鑄造決定、成交量加權或跨交易所價格、部署原始碼等價必須維持 null。

一致但不同的收盤價或餘額會如實重算；鑄造時間條件未滿足時旗標為 0。matching replacement digest 不能繞過以上檢查。

共用模組 [finalized-rpc.js](../engine/research/finalized-rpc.js) 新增受限運算 `mul_decimal_sub_raw18_floor2` 與「只有方法指名的公式可以是 SCENARIO」檢查；既有供給組成與 Firepit reader 的 185 項回歸不變通過。

## 研究目錄、API 與介面

[目錄 v10](../spec/research-catalog.yaml)新增 `uni-valuation-20261007`（kind `uni_aligned_valuation`），綁原 bytes、已存事件 `uni-aligned-valuation-20261007` 與原 review `2026-10-07T11:17:00.029Z`；事件綁定檢查與其他 UNI 固定區塊資料包共用。全目錄十四份審查／251 筆紀錄／41 個來源；已存事件仍十九筆。

`/api/research` 保留 12 個 OBSERVED、4 個 DERIVED、2 個 SCENARIO 與四個來源版本。`/api/freshness` 在 2026-10-06 截止日不可用、10-07 可用；推導與情境紀錄恆為 NOT_OBSERVED／INSUFFICIENT，不會被當成觀測。

中文研究卡片把**三個供給口徑的研究值**放在最上面：每列顯示口徑、完整 raw 供給、分類（情境列顯示「情境（SCENARIO）：timelock_excluded」）、以千分位分組的美元值（字串處理，不經數值轉換）與界線文字。其下是區塊與 K 線分鐘的對齊說明、「不是同一瞬間成交」提示、「這些數值沒有寫入金融模型；正式的 UNI 市值與 FDV 仍為未知」、12 列原始觀測、6 列推導與情境、依賴、九項未知、限制、來源與原始 JSON。

## 驗證

97 項新增：89 項 reader（規格重現全部 calldata 與 K 線欄位、原值重播、合法替換收盤價與餘額、0 旗標、順序變更、63 個 matching-digest 拒絕、尚未收盤的 K 線、八組已存來源改寫、來源缺失、九項方法 schema 拒絕、CLI 不輸出不寫入、Fixture／物件／短 digest 拒絕）、7 項目錄／時效／API、1 項中文卡片。十五個既有測試檔的目錄數量由 13／233／39 更新為 14／251／41。`npm test` 全套 1210 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料、來源、金融／公式／假設／情境／論點、十九份正式／三份 Fixture 歷史與 Fixture 0.422 不變。

Chrome headless 實測 `http://127.0.0.1:4324/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：33 項檢查通過——

| 實際檢查 | 結果 |
| --- | --- |
| 十四份研究／十九筆事件 | 通過 |
| Enter 展開卡片；三個美元值、情境標示、兩條界線、區塊在第 47 秒、收盤價、「不是同一瞬間成交」、正式市值／已驗證流通量未知、審查時間 | 通過 |
| 三張表格；四個來源連結 https／`noopener noreferrer`／新分頁 | 通過 |
| 內層 Enter 展開原始 JSON（含 price_capture／mul_decimal_sub_raw18_floor2） | 通過 |
| `/api/state`：`uni.market_cap`／`uni.fdv`／`uni.required_share` 仍為 null、`uni.price` 仍 9.0556 | 通過 |
| 桌面無水平溢出；窄版頁面 312／312、卡片 278／278；三張表格各 ArrowRight 0→40 | 通過 |
| 全部 33 張研究／事件卡片窄版展開無溢出 | 通過 |
| Fixture 0／0 → 正式 14／19 | 通過 |
| 時效 10 月 6 日 NOT_AVAILABLE／7 日 AVAILABLE（14 份／251 筆） | 通過 |
| console warn／error、server stderr | 除瀏覽器自動 `/favicon.ico` 404 外無錯誤；stderr 空 |

截圖在 TEMP `uni-valuation-research-desktop.png`／`uni-valuation-research-mobile.png`。驗收服務 PID 41596 已核對 `node.exe server.js` 後停止；未驗證其他瀏覽器或真實手機。

第二階段（把口徑變成 canonical 推導）的建議設計見[第一階段報告](uni-aligned-valuation.md)末段，仍待確認。

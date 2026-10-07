# SECZ 近十二個月收入：保留衝突的附條件研究 v2

使用者（分析者）2026-10-07 指示：先做「保留衝突、附條件」的研究計算——可比性列為有理由的 ASSUMPTION，結果列為依賴該假設的 DERIVED，MG Stover 名稱衝突繼續保留。本子項以**新版本**記錄，原 [v1](secz-revenue-ttm.md) request、研究檔與三項 null 結果完全不改。

## 結果（研究層，不是已審計 TTM 報表）

期間 2025-07-01 → 2026-06-30，公式 `research.revenue_ttm_bridge` v1：`FY2025 − H1 2025 + H1 2026`，報表口徑為 Securitize, Inc. 及子公司合併（US GAAP）。

| 類別 | FY2025（已審計） | H1 2025（未審計） | H1 2026（未審計） | TTM（DERIVED） |
| --- | ---: | ---: | ---: | ---: |
| Tokenization | 37,411,171 | 20,136,056 | 18,974,344 | **36,249,459** |
| Asset Servicing | 24,740,969 | 9,160,139 | 14,939,967 | **30,520,797** |
| 合計 | 62,152,140 | 29,296,195 | 33,914,311 | **66,770,256** |

單位 USD；兩類相加等於合計。三個結果的信心為 **low**，狀態 AVAILABLE，各自保留三筆 OBSERVED 依賴、假設依賴 `secz-ttm-20260630-comparability@2` 與報表／期間依賴。收購 pro forma 值沒有使用；沒有把季度乘四或半年乘二。

## 假設 v2 與 v1 的差異

[v2 request](../data/research/secz-ttm-20260630-review-v2.yaml)（`secz-ttm-20260630-review@2`）綁定與 v1 相同的兩份收入研究 hash 與三個期間 ID，輸入研究與公式逐欄相同。五項可比性判斷中，收入定義、持續營業範圍、所選披露版本、審計差異四項**逐字沿用 v1**。只有三處改變：

- `acquisition_treatment`：null → **true**。理由：年度 Note 3 與期中 Note 3 都敘述自 2025-04-15 收購日起合併 MG Stover 的營運結果；已保存的[收購查證](secz-acquisition-context.md)記錄兩者的購買價格分配逐項相同（對價 21,090,525 USD、商譽 13,035,001 USD），S-1 XBRL 的收購 member 為 `secz_MGStoverLLCMember`。據此**假設**兩份報表對這筆收購的收入合併處理一致。
- 假設信心：medium → **low**，因為下面的衝突未解。
- 假設 ID／版本升為 `@2`／v2，並以中文記錄理由。

**保留的衝突**：年度標題是 MG Stover, Inc.，期中標題是 MG Stover LLC。沒有任何已讀文件解釋兩者關係；這個假設支持的是財務呈現的可比性，**不是法律主體等價的查證**。若日後查明兩者不是同一筆被收購業務，假設 v2 與三個 TTM 結果即失效。2026-10-06 另以網頁讀取工具再讀 S-1 XBRL R30（非 byte-exact，未另存為證據），兩段皆稱收購 MG Stover 全部已發行權益、同為 2025-04-15，未見型態轉換或更名說明。

## 界線

- 結果是 DERIVED 的研究層數字，依賴一個低信心 ASSUMPTION；不是 OBSERVED、不是已審計 TTM、不是有機成長或 pro forma，也不是完整歷史更正查證。
- 年度已審計與期中未審計的差異各自保留，沒有把期中證據升級。
- **沒有寫入 canonical 金融輸入**：`secz.tokenization`／`secz.servicing`／`secz.revenue` 等仍為 null，正式模式 unknown 仍 80；沒有新事件或快照，模型期間與論點不變。六類收入對應、利潤率／FCF、母公司估值與個人可投資性仍未完成。
- 這是同一期間的研究計算，不增加論點期數。

## 保存、目錄與介面

[v2 研究檔](../data/research/revenue-ttm-reviews/secz-20260630-v2.json) 以 exclusive-create 保存，內容雜湊 `cd09b167530a627545fbb7dfeaed1d3f3d267d21e2e091210ec3513595f8e45c`，可用下列命令完整重播：

```powershell
node cli.js revenue-ttm data/research/secz-ttm-20260630-review-v2.yaml data/research/revenue-reviews/secz-prospectus-v1.json data/research/revenue-reviews/secz-q22026-v1.json --production
```

[研究目錄 v9](../spec/research-catalog.yaml)在最後追加 `secz-ttm-20260630-v2`，原 `secz-ttm-20260630`（v1，null）保留在原位置；目錄的假設版本一致性檢查同時接受 `@1`／v1 與 `@2`／v2。全目錄十三份審查／233 筆紀錄／39 個來源。時效查詢中 v2 在 2026-10-06 截止日不可用、10-07 可用；三個結果是推導值，恆為 NOT_OBSERVED／INSUFFICIENT，不會被當成觀測。

研究頁 TTM 卡片新增：假設 ID／版本、中文化的限制說明，以及一行條件提示——v2 顯示「下列數值只在上列假設成立時有效，是研究層推導，不是已審計的 TTM 報表，也沒有寫入金融模型」，v1 顯示「可比性未全部確認，三項結果維持未知」。三個報表口徑收入指標改用中文名稱。

## 驗證

九項新增 v2 回歸：依保存的 request 重播得到相同雜湊與三個數值、逐項算術與依賴、與 v1 只差預期欄位、v1 檔案與 null 完整保留；收購假設改回 null／false 時三個結果回到未知；已確認的可比性仍需信心、理由、兩份 filing 的來源與正確的審查時序；目錄同時保留兩個假設版本；結果不進 canonical 輸入、不產生事件、Fixture 隔離；API 並列顯示 v1 null 與 v2 數值並拒絕寫入。另一項中文卡片回歸。十四個既有測試檔的目錄數量由 12／230 更新為 13／233（來源數不變）。`npm test` 全套 1107 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。

Chrome headless 實測 `http://127.0.0.1:4322/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：27 項檢查通過——十三份研究／十八筆事件、Enter 展開 v2 卡片與原始 JSON、三個數值與中文指標名、假設 `@2 / v2`、信心低、條件提示、衝突保留文字、TTM 期間；v1 卡片仍顯示尚未確認與未知；`/api/state` 的三個 SECZ 收入指標仍為 null；桌面與窄版（312／312、兩張卡片 278／278）無水平溢出；Fixture 0／0 → 正式 13／18；時效 10 月 6 日 NOT_AVAILABLE／7 日 AVAILABLE。除瀏覽器自動 `/favicon.ico` 404 外 console 無錯誤，stderr 空；服務 PID 5928 已核對後停止。未驗證其他瀏覽器或真實手機。

## 後續

要把這個數字用於模型，還需要：釐清 MG Stover 法律主體（可提升假設信心或使其失效）、六類收入對應、以及是否把研究層 TTM 作為 canonical 輸入的明確決定。本子項都不做。

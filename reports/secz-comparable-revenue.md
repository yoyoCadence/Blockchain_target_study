# SECZ 分期收入研究

保存四個可比期間的 12 筆 OBSERVED 收入：2026／2025 Q2 與半年各自保留 Tokenization、Asset Servicing、報表合計。單位是期間內 USD，季度與半年分開比較，不轉成 USD/year。來源是 [SEC Note 18](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm) 與 [官方 IR 表格](https://investors.securitize.io/news/news-details/2026/Securitize-Reports-Second-Quarter-2026-Results/default.aspx)。

| 期間 | Tokenization (USD) | Asset Servicing (USD) | 報表合計 (USD) |
| --- | ---: | ---: | ---: |
| 2026 Q2 | 7,839,139 | 6,596,706 | 14,435,845 |
| 2025 Q2 | 8,874,393 | 6,387,783 | 15,262,176 |
| 2026 半年 | 18,974,344 | 14,939,967 | 33,914,311 |
| 2025 半年 | 20,136,056 | 9,160,139 | 29,296,195 |

財報主體是 Securitize, Inc. and subsidiaries 的未經審計 US GAAP 合併報表，不直接供應上市母公司的股數或估值。8-K/A filing date、financial issuance date 為 2026-08-13，Period of Report 為 2026-07-08，與財務截止日 2026-06-30 分開保存；IR 發布日為 2026-08-12。[Filing index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/0001628280-26-056811-index.html)、[SEC 財報](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm)、[IR](https://investors.securitize.io/news/news-details/2026/Securitize-Reports-Second-Quarter-2026-Results/default.aspx)

## 唯讀查核

```powershell
node cli.js revenue-review data/research/secz-comparable-revenue-2026-10-03-v1.yaml --production
```

[Schema](../spec/revenue-review-schema.yaml) 限定本子項的日曆年度、季度／年初至今收入、兩類披露與合計；其他主體、會計基礎或六類模型對應要另行處理。檢查 primary source、分類、fixture、日期、單位、區間長度、重複紀錄與分項合計。每個區間均需三筆紀錄；未知保留 null，不以缺少一列當作零。

[兩條研究公式 v1](../spec/revenue-review-formulas.yaml) 使用既有受限 AST 引擎。合計差額未知則保持 null；同比只允許同長度、同 fiscal quarter 且相隔一年，零基期的成長率保持 null 並標示 ZERO_BASE。結果分類 DERIVED，附完整公式、觀察／期間／報表依賴及來源版本；不使用 YAML 任意程式執行。

核對後的合計差額均為 0；精確同比由資料包重算，不複製 IR 的四捨五入百分比。季度總收入同比約 -5.414%，半年約 +15.764%。這是營業數據比較，不代表股東價值或投資建議。

## 保存與限制

[研究資料包](../data/research/secz-comparable-revenue-2026-10-03-v1.yaml) 與 [完整研究快照](../data/research/revenue-reviews/secz-q22026-v1.json) 分開保存；快照包含來源、報表範圍、日期、12 筆原始觀察、四個期間、review、公式 v1 與衍生結果，content hash 為 `f98e20052dd8d05552e8a054d9a43a3e4ede417bccba875ea1a895b064e49173`。後續更正需另建版本檔案，保留此版；既有 financial journal 與 fixture 歷史不變。

唯讀 CLI 不寫檔或更新 canonical inputs。`persisted: false` 表示命令未持久化；上述研究快照由本次明示保存、exclusive create 後納入版本控制，不能當成 production financial snapshot。Production 仍有 83 個未知 metric；沒有把兩類收入硬分到六類年度模型，也未推導年度／TTM 收入、margin、FCF、上市母公司估值或新的 thesis 期間。

148 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增 33 項期間、來源、分類、缺值、零基期、合計、快照 integrity／重播與唯讀 CLI 檢查。完整 baseline、季度進入年度模型與 category mapping 均未完成。

# SECZ 兩份 filing 的年度收入表

將 2026-08-07 的 424B3 prospectus 與已保存的 2026-07-31 S-1 逐項核對。兩份文件的 Note 19 都是 Securitize, Inc. and subsidiaries、US GAAP、完整 2025／2024 年度；六個披露值一致，已讀 Tokenization／Asset Servicing 定義亦一致。[424B3](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)、[S-1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm)

| 期間 | Tokenization (USD) | Asset Servicing (USD) | Total (USD) |
| --- | ---: | ---: | ---: |
| 2025 全年 | 37,411,171 | 24,740,969 | 62,152,140 |
| 2024 全年 | 10,103,109 | 8,533,061 | 18,636,170 |

新文件的營業子公司 KPMG 審計報告與 financial issuance 均為 4/10；封面 prospectus date 與 EDGAR filing date 均為 8/7，index 未列 Period of Report，保存 null。不能引用同一文件中 Holdings 的另一份報表代替營業子公司。[424B3](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)、[index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/0001628280-26-054866-index.htm)

獨立保存六筆 OBSERVED 與兩份完整 tier 1 source metadata，使用 filing 專屬 ID／as-of；不宣告取代 S-1，不改寫舊版本。新 [資料包](../data/research/secz-prospectus-revenue-2026-10-03-v1.yaml) 與 [研究 artifact](../data/research/revenue-reviews/secz-prospectus-v1.json) 使用新檔；研究 hash `f0138d7c19d6c9d959bf5618c06032a4c72fd9a246db6cb451f1c104c68c1ba7`。

```powershell
node cli.js revenue-review data/research/secz-prospectus-revenue-2026-10-03-v1.yaml --production
node cli.js revenue-compare data/research/revenue-reviews/secz-annual-v1.json data/research/revenue-reviews/secz-prospectus-v1.json --production
```

[保存的比較](../data/research/revenue-comparisons/secz-s1-to-prospectus-v1.json) hash `d7713cac89a6dbacbc95237357af0f872577b0049d4e0ba901985f55c0c94d9b`，可由兩份研究 artifact 重播。六格均 MATCHED_INTERVALS／INDEPENDENT_OBSERVATIONS，value_change／conflict false，source_change／statement_change true，formula_change false。persisted false 表示唯讀命令沒有 journal 寫入；研究輸出由本次人工流程另存獨立檔案，供審查與重播。

範圍只涵蓋這兩份年度表及已讀分類文字。不代表所有更早或更晚 filing 沒有更正、所有財報附註一致，或上市母公司現況已驗證；亦未查證與 Q2／H1 報表的跨期可比性，不能據此建立 TTM 或六類收入 mapping。重複同年度披露不是額外 thesis 期間。Canonical journal、金融公式、83 個未知 metric 與 insufficient thesis 保留。

驗證：新增五項獨立證據／完整 replay／兩份比較／日期／CLI 回歸；全套 199 tests passed、0 failed。Fixture／production validate 均 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。父 baseline 保持未完成。

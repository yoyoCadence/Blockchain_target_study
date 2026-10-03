# SECZ 年度原始收入

保存 SEC S-1 中 Securitize, Inc. and subsidiaries 的 2025／2024 全年收入。已核對該主體的 KPMG 審計段落、Note 19 與 XBRL legal-entity／product duration contexts；不用同文件中 Cantor 或 Securitize Holdings 的報表替代。[S-1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm)、[收入表](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/R129.htm)

| 期間 | Tokenization (USD) | Asset Servicing (USD) | 披露合計 (USD) |
| --- | ---: | ---: | ---: |
| 2025 全年 | 37,411,171 | 24,740,969 | 62,152,140 |
| 2024 全年 | 10,103,109 | 8,533,061 | 18,636,170 |

這六筆 OBSERVED 保留原始期間內 USD，而非年化假設。兩個分項之和均與披露總額一致；總收入精確同比約 +233.503%，由研究公式 v1 推導，分類 DERIVED。[收入表](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/R129.htm)

財報 issuance 與 audit report date 為 2026-04-10；本次所讀的 S-1 封面寫 2026-07-30，EDGAR index 的 filing date 是 2026-07-31，保留這項差異。As-of／source date 使用本 filing 的 7/31，不以審計日期假設更早已取得此版。S-1 index 未列 Period of Report，保存 null。[S-1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm)、[filing index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/0001628280-26-051182-index.htm)

```powershell
node cli.js revenue-review data/research/secz-annual-revenue-2026-10-03-v1.yaml --production
```

既有 schema／唯讀驗證器增量支援日曆年度完整 12 個月與 S-1；audited annual dossier 必須附 auditor、report date、primary evidence，拒絕半年冒充全年、季度混入已審計年度資料或未經審計卻附 audit claim。研究公式 v1 的 AST、canonical 金融公式與門檻均不變。

[新資料包](../data/research/secz-annual-revenue-2026-10-03-v1.yaml) 與 [完整研究快照](../data/research/revenue-reviews/secz-annual-v1.json) 用獨立新檔保存；hash 為 `6711631d1d64d7f7837cdc4b1180eade966b456a71c959abd1f4140b764b54d1`。舊季度資料與快照仍能以原 hash／embedded formulas 完整重播。

限制：保留這份 filing 的 presentation，尚未比對更早文件的更正／重編沿革；不宣稱 2024／2025 未曾修正。審計標記不是對上市母公司的股東價值或現況保證。此版仍未驗證跨文件年度／半年 comparability、TTM bridge、六類收入 mapping、margin、FCF、母公司資本結構或同步估值。Canonical financial journal 沒有新增收入，83 個未知 metric 及 insufficient thesis 保留。

驗證：159 tests passed、0 failed；兩種 validate 均為 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增 11 項年度、審計、日期衝突與新舊資料重播檢查。父 baseline 與完整 earnings ingestion 未完成。

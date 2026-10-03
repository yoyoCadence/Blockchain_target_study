# 核心研究識別碼查證

截至 **2026-10-03**；來源閱讀與 review 由 Codex 執行，尚無人類簽核。這是獨立識別資料包，不會填入財務數字、改寫 asset registry 或提升 discovery 階段。

| 研究碼 | 已查證身份 | 一手依據 | 尚未驗證的投資性 |
| --- | --- | --- | --- |
| UNI | Ethereum mainnet 的 Uniswap governance ERC-20；地址 `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | [Uniswap 2020-09-16 原始發布](https://blog.uniswap.org/uni) | 現行交易通道、地區限制、託管及跨鏈表示 |
| SECZ | Securitize Corp. common stock；NYSE ticker SECZ，CIK 0002094496 | [SEC 8-K/A index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/0001628280-26-056811-index.html)、[附件 Note 1／20](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm) | 當前上市狀態、券商可用性、投資人資格、股別及稀釋；tokenized shares 需另查 |
| XLM | Stellar public network 的原生 lumen，不需要 issuer 或 trustline | [SDF Lumens 文件](https://developers.stellar.org/docs/learn/fundamentals/lumens) | 交易通道、地區資格、託管與原生／wrapped／SAC 表示的區別 |

## 時點與證據限制

SECZ 的 [2026-07-01 完成合併公告](https://investors.securitize.io/news/news-details/2026/Securitize-Completes-Business-Combination-with-Cantor-Equity-Partners-II/default.aspx) 對次日交易仍是預期；後來的 SEC 文件才確認 2026-07-02 已開始交易。CIK 指向上市母公司，不應用前身 CEPT 或營運子公司的歷史股數替代。SEC source.date 使用申報日 **2026-08-13**，保留 report period **2026-07-08** 與財務截止 **2026-06-30** 的區別。

UNI 原始文章包含歷史 supply 與預定 inflation 敘述；本次只採身份與地址，不把該公告的 inflation 計畫當成現行 mint 事實，也沒有認定 UNI 為 Uniswap Labs 股權。XLM 使用原生身份，沒有填入虛構 ERC-20 地址；SDF 文件的 source.date 使用可見 last-updated **2026-09-28**，沒有把範例 supply timestamp 當作發布日。

身份足夠明確仍不等於使用者可交易或完成價值捕獲查證。資料包中所有 investability.status 仍是 unverified，未知資格及託管欄位為 null；現有 asset registry、graph edges 與 promotion gates 均保留。

## 使用與驗收

[資料包](../data/research/core-identifiers-2026-10-03.yaml) 保留五個來源完整 metadata，以及三筆 OBSERVED 身份的唯一 ID、版本、日期、confidence 與 source IDs。它不符合數字型 research-refresh proposal，也不應經 research-apply 匯入估值。

```powershell
node cli.js identity-review data/research/core-identifiers-2026-10-03.yaml --production
```

命令只讀，回傳來源解析後的身份與限制。Schema 與引擎拒絕 fixture、缺來源、缺一手證據、時點錯誤、原生幣偽合約、股票／token 混用及投資性自動升級。後續修訂請新增日期／版本的資料包與明確交接，保留這份原始紀錄。這些 dossier 尚未整合到不可變財務 journal 的版本鏈；它們不影響財務計算，不能作為 promotion 的唯一憑據。

下一步仍需現行通道／資格／託管審查、UNI 執行後捕獲證據、同日估值與可比財務期。SECZ 季報已有 tokenization／asset servicing 揭露，但不應把季額寫成 USD/year，或把 aggregate total 默認分配到目前六個收入分類。

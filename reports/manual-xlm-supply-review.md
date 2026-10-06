# XLM 官方回報供給資料包手動唯讀驗證

[共用 reader](../engine/research/xlm-supply.js)只讀已保存的[原資料包](../data/research/xlm-supply-2026-10-05-v1.json)，先核對 exact bytes SHA-256，再套用獨立 [schema v1](../spec/xlm-supply-review-schema.yaml)／[方法 v1](../spec/xlm-supply-review-method.yaml)。沒有取得 API、ledger 或帳戶餘額，也不寫入、套用事件或提升投資性。

```powershell
node cli.js xlm-supply-review data/research/xlm-supply-2026-10-05-v1.json --production --digest 790c9763971cb01bd8712431ea7207eb4f4418e5a17459cf0df661f1ede5ad51
```

命令必須明示 production 與已審查 hash。核對內容：

- 兩次 GET 的固定 URL／content type／HTTP 200，開始 ≤ 收到 ≤ 現在、HTTP Date ≤ 收到，且都在同一個 UTC 知識日。
- API 原回應字串的 body SHA-256 `af89e0d5…` 重算；回應只能有九個方法欄位與 `_details`，不得增減。
- 九個 OBSERVED 的 value／raw_value 與原回應字串完全相同；八個供給欄位只接受非負、無前導零、最多七位小數的十進位字串，不經浮點數。
- 供應者 `updatedAt` 必須是原 UTC ISO 字串、早於收到時間且同一 UTC 日；每筆觀測的 `observed_at` 與 `response_received_at` 分開保存，point 期間不得回推。
- 嵌入的兩來源必須與已存事件追加的來源逐欄相同：Tier 2、URL、版本、取得時刻、覆蓋指標；文件 v2 必須明示 supersedes 原身份 v1（同 URL、較低版本、同頁面日期），且頁面日期等於 context 的 `document_last_updated_date`。
- 兩條 `signed_decimal_sum` v1 的完整定義（含符號、小數位、方法來源與理由）必須等於方法檔；同版本改寫即拒絕。以 BigInt 七位小數重播，DERIVED 值、確切依賴順序、point 日期與更新時間須一致。
- ledger sequence／hash、各組成帳戶、獨立流通、完全稀釋供給、同步市值／FDV 必須維持 null。

回應順序（觀測／推導／公式／來源）可不同；兩個 capture 的位置、ID 與意義固定。非零殘差也會如實重播（例如 `-0.0000001`），不把殘差視為健康或不健康訊號。matching replacement digest 仍不能繞過格式、時間、來源版本、依賴或公式檢查。

文件 capture 只有 body SHA-256，`last_updated_marker=null`；reader 回報 `body_replayable=false`，2026-09-28 頁面日期仍是人工閱讀證據。這是保存資料包的內部一致性與依賴驗證，不是 Stellar ledger、SDF 帳戶控制權或自由流通的獨立查證，也不提供個人資格、同步估值或 fee-only DCF。

74 項新增回歸：原值／三個非零殘差重播、順序變更、59 個 matching-digest 拒絕、七組已存＋嵌入來源規則、被取代來源缺失／改寫、CLI 成功／失敗不輸出不寫入，以及 Fixture／物件輸入拒絕。`npm test` 全套 844 通過；`npm run validate`／`npm run validate -- --production` 均為 84 指標／25 公式、無 errors／warnings，unknown 1／80。原資料 bytes、來源、金融／公式／假設／情境／論點、十六份正式／三份 Fixture 歷史、三項 SECZ TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

本子項沒有介面變更，未另做瀏覽器 QA。下一步把同一 reader 接入 hash 固定研究目錄、既有唯讀研究／時效 API 與中文逐列表格，沿用原已存事件 review；同步估值、完整 baseline 與個人資格仍待查證。

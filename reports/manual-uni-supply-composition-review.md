# UNI 供給組成資料包手動唯讀驗證

[共用 reader](../engine/research/supply-composition.js)只讀已保存的[原資料包](../data/research/uni-supply-composition-2026-10-06-v1.json)，先核對 exact bytes SHA-256，再套用 [schema v1](../spec/uni-supply-composition-schema.yaml)／[方法 v1](../spec/uni-supply-composition-method.yaml)。沒有連 RPC、取得文件、寫入、套用事件或提升投資性。

```powershell
node cli.js uni-supply-composition-review data/research/uni-supply-composition-2026-10-06-v1.json --production --digest de66eac4f1d0beda86dc04ee0e129162b4b7ecd29072b666682733da482f2de1
```

命令必須明示 production 與已審查 hash。核對內容：

- **錨點**：chainId 為 mainnet；probe 以 `finalized` 取得區塊，anchor 的高度／hash／時間與回應一致且時間可解碼；同 hash header 與同高度 recheck 都必須回到同一個 hash。
- **十個讀值**：每個 `eth_call` 必須只帶 `{to, data}`、目標是 UNI 合約、calldata 等於方法 selector 加上地址參數 padding，並以 `{blockHash, requireCanonical: true}` 釘選。回應必須是 32-byte 字；address 高位為零，uint8／uint32／uint256 不得超過位寬；解碼值、保存的回應字與原回應三者一致。每個 request 只能被使用一次。
- **時間**：區塊時間早於 probe；probe 早於 state；擷取時間等於 state 收到時間；HTTP Date 不晚於收到時間且同一 UTC 日；文件取得不晚於 state。
- **來源**：RPC 來源必須是已存事件追加的 tier ≤ 2 來源，URL 與取得時刻相同；兩份文件來源的 URL／取得時刻相同，地址表來源日期等於頁面 `dateModified` 的 UTC 日。
- **文件**：地址表兩列片段須含 label、`<code>` 內的地址與 etherscan 連結，地址（不分大小寫）等於方法釘選的 token／Timelock；Uni.sol 的 commit 與 12 行必須包含方法指定的原文片段。
- **五個推導**：公式完整定義必須等於方法檔，只允許四個受限運算（raw 減法、時間比較、整數乘除、casefold 地址比較）並以 BigInt 重播；值、依賴順序、ID、point 日期與區塊時間須一致。
- 流通供給與定義、dead 餘額歸因、Timelock 承諾／可支用、未來鑄造、同步價格、市值、FDV、部署原始碼等價必須維持 null。

不同但一致的讀值會如實重播：例如時間條件未滿足或 minter 不同時旗標為 0，不視為錯誤也不下結論；dead 餘額大於總供給則拒絕。觀測／推導／公式／label／回應／片段的順序可不同。matching replacement digest 不能繞過以上任何檢查。

這是保存資料包的內部一致性與來源版本驗證，不是共識 proof、部署合約與原始碼等價證明、流通供給定義、鑄造預測或估值。

98 項新增回歸：原值重播與不寫入、四組合法替換值（不同餘額、鑄造上限整數除法、兩個 0 旗標、順序變更）、81 個 matching-digest 拒絕、九組已存來源改寫、來源缺失、CLI 成功／失敗不輸出不寫入、Fixture／物件／短 digest 拒絕。`npm test` 全套 986 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料 bytes、來源、金融／公式／假設／情境／論點、十七份正式／三份 Fixture 歷史、三項 SECZ TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

本子項沒有介面變更，未另做瀏覽器 QA。下一步把同一 reader 接入研究目錄 v7、既有研究／時效 API 與中文表格。

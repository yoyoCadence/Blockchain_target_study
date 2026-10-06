# UNI 主網 Firepit 狀態資料包手動唯讀驗證

[共用 reader](../engine/research/firepit-state.js)只讀已保存的[原資料包](../data/research/uni-firepit-state-2026-10-06-v1.json)，先核對 exact bytes SHA-256，再套用 [schema v1](../spec/uni-firepit-state-schema.yaml)／[方法 v1](../spec/uni-firepit-state-method.yaml)。沒有連 RPC、取得原始碼、寫入、套用事件或提升投資性。

```powershell
node cli.js uni-firepit-state-review data/research/uni-firepit-state-2026-10-06-v1.json --production --digest 41c8fcb16267e1b068aea59f8675bcd27a913d1a52c3d5ed2602034e71a0e6f9
```

命令必須明示 production 與已審查 hash。核對內容：

- **錨點與時間**：mainnet chainId、`finalized` 錨點與時間解碼、同 hash header 及同高度 recheck；區塊早於 probe、probe 早於 state、擷取時間等於 state 收到時間；HTTP Date 與文件取得時間不晚於各自收到時間且同一 UTC 日。
- **九個讀值**：每個 `eth_call` 只帶 `{to, data}`、目標合約依方法為 Firepit 或 UNI、calldata 等於 selector 加參數 padding，並以 `{blockHash, requireCanonical: true}` 釘選；32-byte 回應字的 address padding 與 uint 位寬、解碼值與保存值一致；每個 request 只用一次。
- **不可變身份**：`RESOURCE` 必須是 UNI、`RESOURCE_RECIPIENT` 必須是 `0xdead`；否則乘積與差額沒有意義，直接拒絕。
- **來源與文件**：RPC 來源與五個 pinned 檔案來源必須是已存事件追加的版本（URL、取得時刻、tier ≤ 2）；五個檔案同一 commit `8604e4b`、來源日期等於 commit 日、選定行必須包含方法指定的原文片段；README 兩個部署地址必須出現在對應行並等於方法釘選的 Firepit／TokenJar。
- **四個推導**：公式完整定義必須等於方法檔，只用受限運算（次數×raw、raw 減去次數×raw、casefold 地址比較）以 BigInt 重播；值、依賴順序、ID、point 日期與區塊時間須一致。
- 門檻歷史、精確累計支付、dead 餘額歸因、L2 橋接銷毀、換出資產 USD 價值、費用來源、年化 burn、同步價格、部署原始碼等價必須維持 null。

一致但不同的讀值會如實重播：不同的次數或門檻得到新的乘積與差額；TokenJar 或門檻設定者不同時旗標為 0，不視為錯誤也不下結論；乘積大於 dead 餘額則拒絕。紀錄／公式／label／回應／文件／行的順序可不同。matching replacement digest 不能繞過以上任何檢查。

## 共用模組

錨點／時間／RPC 來源檢查、ABI 解碼、釘選呼叫檢查、已存文件與選定行檢查、受限運算與公式重播抽到 [finalized-rpc.js](../engine/research/finalized-rpc.js)，UNI 供給組成 reader 改為使用同一份實作；行為與錯誤訊息不變，由原 98 項 reader 回歸把關。新增兩個受限運算 `mul_raw_uint256`、`sub_mul_raw_uint256`，只有方法檔釘選的公式才會用到。

## 驗證

87 項新增回歸：規格接受原資料包並重現全部 calldata／行、原值重播與不寫入、兩組合法替換值、兩個 0 旗標、順序變更、64 個 matching-digest 拒絕、八組已存來源改寫、來源缺失、七項方法 schema 拒絕、CLI 成功／失敗不輸出不寫入、Fixture／物件／短 digest 拒絕。`npm test` 全套 1087 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料 bytes、來源、金融／公式／假設／情境／論點、十八份正式／三份 Fixture 歷史、三項 SECZ TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

這是保存資料包的內部一致性與來源版本驗證，不是共識 proof、部署合約與原始碼等價證明、門檻歷史、dead 餘額歸因、年化 burn 或估值。本子項沒有介面變更，未另做瀏覽器 QA。下一步把同一 reader 接入研究目錄、既有研究／時效 API 與中文表格。

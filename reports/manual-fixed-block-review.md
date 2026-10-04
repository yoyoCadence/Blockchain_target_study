# 固定區塊資料包手動唯讀驗證

先前保存的 RPC 原始回應可透過獨立命令重驗。命令要求明示 production 及已審查的完整 SHA-256；只讀檔案與已登記來源，不連 RPC、不簽名、不寫入金融或歷史。

```powershell
node cli.js fixed-block-review data/research/uni-vesting-fixed-block-2026-10-04-v1.json --production --digest cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195
```

輸出 `persisted:false`／`financial_inputs_updated:false`，中文摘要列固定 block／hash、block time、取得時間、八個精確字串值、receipt 無結果及部署 source 等價 null，並保留完整 archive。缺少 production／digest、digest 不符或語意錯誤，exit 1、stdout 空；錯誤在 stderr，不會補寫資料。

[schema](../spec/fixed-block-review-schema.yaml) 限定目前 v1 資料包；[方法 v1](../spec/fixed-block-review-method.yaml) 保存已知 UNI／UNIVesting target、ABI selector／型別、中文標籤及原一手來源 ID，與金融公式分開。[共用 reader](../engine/research/fixed-block.js) 核對 mainnet／finalized、所有 state call 的同 hash／requireCanonical、高度重查、完整 call target／calldata（含 allowance owner／spender）、request／response ID 與 labels、32-byte 解碼／型別位寬、runtime SHA-256、receipt null、來源／UTC／transport 日期。回應順序與 JSON object key 順序可不同；ID 必須正確且唯一。

hash 匹配後仍驗證語意。自行改寫 artifact 並重新計算 hash，不能繞過混區塊、ABI 錯配、回應錯誤／遺失或把未知證據升格的拒絕。這只證明保存資料包內部一致性；若原 provider 資料本身錯誤，不能靠 hash 證實外部真實性或鏈上共識。方法 v1 只支援現有八觀測與 null receipt 格式，未處理新 ABI、其他鏈、成功 receipt 解碼或部署 code 等價。

35 項新增測試通過，含重新簽訂匹配 digest 的錯誤樣本、合法重排、實際 CLI 的成功／exit 1／stdout 空、回傳 clone 及 source／financial／history bytes 不變。全套 631 項 `npm test`、兩模式 `npm run validate` 通過；84 指標／25 公式無錯誤與警告，unknown 1／80。未新增觀測、來源、快照、金融公式或 UI；本子項未重新執行瀏覽器驗收。

完整 production baseline 仍待部署等價、owner 餘額、全年分配及捕獲、同步供給／估值、SECZ 六收入／TTM／股本可比性與個人投資性。此命令不刷新原核准率日期或論點證據。

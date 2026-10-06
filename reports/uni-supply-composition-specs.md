# UNI 供給組成資料包 schema／方法 v1

為 [UNI 固定區塊供給組成](uni-supply-composition.md) 原資料包（SHA-256 `de66eac4…`）先定好唯讀核對要用的兩份規格；共用 reader、研究目錄與中文表格尚未實作。

- [schema v1](../spec/uni-supply-composition-schema.yaml)：鎖定資料包結構。anchor 必須是 finalized 且 `requireCanonical: true`；地址一律小寫 40 hex；兩份文件順序固定（地址表、原始碼），正文標記不可重播；13 筆 OBSERVED 各自只能是「RPC 回應字」或「文件片段」其中一種；5 筆 DERIVED 只能是非負整數字串或 0／1 旗標；流通供給定義、同步價格、市值、FDV 等九項 context 必須為 null；不得出現額外欄位。
- [方法 v1](../spec/uni-supply-composition-method.yaml)：釘選 token／Timelock／UNIVesting／dead 地址、RPC endpoint 與來源 ID；十個 getter 的 ABI 型別、函式簽章、selector、參數目標、單位與中文 label；官方地址表的 `dateModified` 原字串與兩列片段對應；Uni.sol commit 與 12 行必須包含的原文片段；五條研究公式的完整定義（必須與資料包逐欄相同）與中文推導 label。

[31 項回歸](../tests/research/uni-supply-composition-specs.test.js)確認：兩份規格都接受原資料包；方法 selector＋參數 padding 重現每一個已存 eth_call 的 calldata，label／ABI 型別／單位與觀測一致；文件片段與 Uni.sol 行完全對應；公式與資料包逐欄相同。另有 18 項竄改資料包、10 項竄改方法的拒絕案例，每項只改一個欄位。

`npm test` 全套 888 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，unknown 1／80。沒有新增 reader、API 或 UI，原資料、來源、金融／歷史與快照全部不變。

下一步：以這兩份規格實作 digest-bound 共用唯讀 reader（重放 probe／state 封裝、同 hash／canonical、32-byte 回應解碼、五個推導），再接研究目錄 v7、時效 API 與中文表格。

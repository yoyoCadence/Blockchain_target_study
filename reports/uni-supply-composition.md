# UNI 固定區塊供給組成與鑄造參數

前次 [owner 餘額與 totalSupply](uni-token-state.md) 明示未核對 mint 上限／未來增發與 dead-address 轉帳。本子項補上這兩項一手證據：同一個新的 finalized 區塊上，UNI 總供給、dead address 累計餘額、Timelock／UNIVesting 餘額與授權，以及合約鑄造參數。只保存研究層 point 證據，不定義流通供給、不計市值／FDV。

## 擷取

PublicNode 回報 finalized block **26133577**、hash `0x301ce0f2aed56d73a46cf4e6ac24aebe273892d4fd1e3aa2f19707cee87179f4`，區塊時間 UTC `2026-10-06T13:17:11Z`。同 hash header 與同高度 recheck 一致；十個 `eth_call` 都以 `{blockHash, requireCanonical: true}` 釘選，狀態回應收到時間 `13:34:54.065Z`。ABI selector 以 keccak 計算並對照已知 `balanceOf`／`totalSupply`／`allowance`／`decimals`。[原資料包](../data/research/uni-supply-composition-2026-10-06-v1.json)保存 probe／state 的完整 request／response、HTTP Date、各次開始與收到時間、32-byte 回應字與完整十進位字串；exact bytes SHA-256 `de66eac4f1d0beda86dc04ee0e129162b4b7ecd29072b666682733da482f2de1`，Git 固定 LF。

| 觀測（OBSERVED，point） | 原始值 |
| --- | --- |
| totalSupply（raw） | 1000000000000000000000000000（1,000,000,000 UNI） |
| decimals | 18 |
| dead address `0x…dEaD` 餘額（raw） | 112633581211219518941995199 |
| Timelock `0x1a9C…35BC` 餘額（raw） | 262247996305835021033106178 |
| UNIVesting 合約餘額（raw） | 0 |
| Timelock 對 UNIVesting 剩餘授權（raw） | 20000000000000000000000000 |
| minter | `0x1a9c8182c09f50c8318d769245bea52c32be35bc`（Timelock） |
| mintingAllowedAfter | 1704067200（2024-01-01T00:00:00Z） |
| mintCap | 2（%） |
| minimumTimeBetweenMints | 31536000 秒（365 日） |

Timelock／UNIVesting 餘額與授權和 10 月 4 日固定區塊讀值相同；新區塊不同，兩者不是同一時點的重複觀測。

## 身份與語意依據

- [官方 Governance Technical Reference](https://developers.uniswap.org/docs/ecosystem/governance/technical-reference)（JSON-LD `dateModified` 2026-04-09）的合約地址表列出 UNI Token 與 Timelock。只保存正文 SHA-256、`dateModified` 原字串與兩列表格的原始 HTML 片段（含頁面的 U+00A0 空白），兩個文件地址各為一筆 OBSERVED；正文不可離線完整重播。
- [Uni.sol](https://raw.githubusercontent.com/Uniswap/governance/ab22c084bacb2636a1aebf9759890063eb6e4946/contracts/Uni.sol)（commit `ab22c08`，2020-09-24）保存 12 個選定行：初始 `1_000_000_000e18`、`mintCap = 2`、365 日間隔、`block.timestamp >= mintingAllowedAfter`、單次上限 `totalSupply × mintCap / 100`、鑄造後重設時間、禁止轉入零地址。合約沒有 burn 函式，所以 dead-address 轉帳不會減少 totalSupply。部署 bytecode 與此原始碼是否等價未驗證。

## 研究推導（DERIVED v1，BigInt）

| 推導 | 結果 | 界線 |
| --- | --- | --- |
| totalSupply − dead | 887366418788780481058004801 | 機械減法，不是流通供給 |
| totalSupply − dead − Timelock | 625118422482945460024898623 | 其他團隊／投資人／合約／交易所持倉未分類 |
| 區塊時間 ≥ mintingAllowedAfter | 1 | 只是時間條件；鑄造仍需治理決定 |
| 單次鑄造上限 floor(totalSupply × 2 / 100) | 20000000000000000000000000 | 單次上限，不是年度實際增發或預測 |
| minter 與文件 Timelock 地址相符 | 1 | 不驗證治理程序或未來提案 |

totalSupply 仍等於原始碼初始值，代表這個區塊之前沒有增加供給的鑄造（前提是部署合約與原始碼一致）。dead address 餘額是累計總額；新聞報導的 2025-12-28 金庫 100M burn 與 Firepit 支付等組成本次未逐筆歸因。流通供給定義、Timelock 是否已承諾或可支用、同步價格、市值、FDV 與未來鑄造決定全部維持 null。

## 保存與不變項

[人工事件](../data/research/uni-supply-composition-2026-10-06.yaml)（`dilution`／completed）已套用一次，完整快照 `ffd270b923e3a157207333e130115fcdae3065d5467f2a3a63ec0c0270341cee`，parent 為前一份 XLM 供給快照。**不可再次套用相同事件。** 只追加三來源：RPC（tier 1）、官方文件（tier 2）、pinned Uni.sol（tier 2）；updates=[]、source_change=true、changes=[]，金融／公式／假設／情境／圖譜／論點精確重播相同。unknown 80、模型日期 2026-10-04、三項 SECZ TTM null、UNI 原名目年率 stale、Fixture required-share 0.422 不變；研究目錄仍十份，新資料由已審查事件卡片／原始 JSON 查閱。

## 驗證

四項新增 production 回歸覆蓋原 bytes／anchor／calldata／回應字、文件片段與 Uni.sol 行、五個推導 BigInt 重播與確切依賴、source-only 重播與 Fixture 隔離；另一項中文事件卡片回歸。`npm test` 全套 857 通過；`npm run validate`／`npm run validate -- --production` 均 84 指標／25 公式、無 errors／warnings，unknown 1／80。

Chrome headless 實測 `http://127.0.0.1:4318/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：Enter 展開事件卡片與原始事件 JSON、六個關鍵 raw 值與兩條界線文字、三個安全來源連結、窄頁 312／312 與卡片 278／278 無水平溢出、Fixture 0／0 → 正式 10／17。除瀏覽器自動 `/favicon.ico` 404 外 console 無錯誤，stderr 空；服務 PID 24292 已核對後停止。未驗證其他瀏覽器或真實手機。

## 後續

下一步把此新格式接入 digest-bound 共用唯讀 reader，再接研究目錄／中文逐列表格。流通供給定義（ASSUMPTION）、同步價格、`uni.market_cap`／`uni.fdv` 的模型設計、全年 capture／分配與完整 baseline 仍待查證；不從本研究直接補市值或 FDV。

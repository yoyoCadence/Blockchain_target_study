# UNI 供給口徑定義與日期對齊的研究層估值（第一階段）

使用者（分析者）2026-10-07 指示：同意為 UNI 市值／FDV 新增推導，但**先定義供給口徑**、分階段做——價格與供給日期要對齊；扣除 dead 地址後的供給先標為研究口徑，不能宣稱是已驗證流通量；治理金庫是否排除列為明確假設或情境；若以現行 totalSupply 算 FDV，要揭露未涵蓋未來增發。

本子項是第一階段：在同一個 finalized 區塊定義三個供給口徑，配上同一分鐘的價格，算出研究層美元值。**不改 canonical 的 `uni.price`／`uni.market_cap`／`uni.fdv`**；第二階段（模型版本升級）待口徑確認後另做。

## 擷取與對齊

1. PublicNode finalized block **26140081**、hash `0xaced3a9b3e5b866b0e1fc49c340b29d8291cd96fb17e5cb934f27aa827a114b2`，區塊時間 UTC `2026-10-07T11:02:47Z`（Unix 1791370967）。
2. Coinbase Exchange `UNI-USD` 一分鐘 K 線，取**包含區塊時間的那一分鐘**（起始 1791370920＝11:02:00，區塊在第 47 秒）。該分鐘在請求前已收盤。
3. 同 hash／`requireCanonical: true` 讀取供給與鑄造參數；同 hash header 與同高度 recheck 一致。

順序為錨點 → K 線 → 狀態批次，三次回應都在 `11:16:25.6Z`–`11:16:26.0Z`。價格是同一分鐘的收盤價，**不是同一瞬間成交**，也不是成交量加權或跨交易所價格。K 線數值由原回應文字逐字擷取（不經浮點），原回應完整保存可重播。[原資料包](../data/research/uni-aligned-valuation-2026-10-07-v1.json) exact bytes SHA-256 `227008fc44076ba5a09a159e6531158a5605979484a0c21e4f155b5fca4d2356`，Git 固定 LF。

| 觀測（OBSERVED，point） | 原始值 |
| --- | --- |
| totalSupply（raw） | 1000000000000000000000000000 |
| dead address 餘額（raw） | 112675581211219518941995199 |
| Timelock 餘額（raw） | 262247996305835021033106178 |
| mintCap／mintingAllowedAfter | 2（%）／1704067200（2024-01-01T00:00:00Z） |
| K 線 low／high／open／close | 7.9914／7.9946／7.9946／7.9914 USD/UNI |
| K 線成交量 | 97.581852 UNI |

與 10 月 6 日 block 26133577 相比，Timelock 餘額相同，dead 餘額多 42,000 UNI；兩者是不同區塊的獨立觀測，增加的來源本次未歸因。

## 三個口徑與研究值

美元值＝收盤價 × 供給 ÷ 10^18，以 BigInt 計算並無條件捨去到美分。

| 口徑 | 供給（raw） | 分類 | 美元值 | 界線 |
| --- | --- | --- | ---: | --- |
| 現行 totalSupply | 1000000000000000000000000000 | DERIVED | **7,991,400,000.00** | FDV 研究值；**未涵蓋未來增發**，不是 canonical FDV |
| 扣除 dead address | 887324418788780481058004801 | DERIVED | **7,090,964,360.30** | 研究口徑；**不是已驗證流通量**，不是 canonical 市值 |
| 再扣除 Timelock | 625076422482945460024898623 | **SCENARIO** `timelock_excluded` | **4,995,235,722.63** | 只在「治理金庫全部排除」情境下成立 |

- **扣除 dead**：UNI 合約沒有 burn 函式，轉入 dead address 的代幣仍計入 totalSupply，所以另列扣除後的供給。其他團隊、投資人、合約或交易所持倉未分類。
- **Timelock 排除**是具名情境，不是觀測事實：Timelock 餘額是否已承諾、可支用或應排除沒有查證。兩個情境紀錄的分類是 SCENARIO 並帶情境名稱。
- **未來增發揭露**：同區塊 `mintingAllowedAfter` 早於區塊時間（旗標＝1），minter 每 365 日可鑄造至多 totalSupply 的 2%；是否鑄造由治理決定。以 totalSupply 計算的值沒有涵蓋這項可能的稀釋。

Timelock 身份與鑄造語意沿用已保存的 [UNI 供給組成研究](uni-supply-composition.md)（archive `de66eac4…`）的官方地址表與 pinned Uni.sol 來源，資料包以 `basis_dependency` 明示這個依賴。已驗證流通量、canonical 市值／FDV、其他非流通持倉、Timelock 承諾／可支用、未來鑄造決定、成交量加權或跨交易所價格、部署原始碼等價全部維持 null。

## 保存與不變項

[人工事件](../data/research/uni-aligned-valuation-2026-10-07.yaml)（`market_data_review`／completed）已套用一次，完整快照 `92da521baed1fea414969a2ab2092a9c7cad5c04cc8f8cdd21cc14413466015f`，parent 為 Firepit 狀態快照 `b97d7644…`。**不可再次套用相同事件。** 只追加兩個 tier 1 來源（RPC、Coinbase K 線）；updates=[]、source_change=true、changes=[]。canonical `uni.price` 仍是 2026-10-04 的 9.0556、`uni.market_cap`／`uni.fdv`／`uni.required_share` 仍為 null，unknown 80、模型日期 2026-10-04、論點與 Fixture 0.422 不變。研究目錄仍十三份；新資料由已審查事件卡片與原始 JSON 查閱。

## 驗證

五項新增 production 回歸：原 bytes／錨點／calldata／回應字；K 線 URL、body hash、逐字 token、區塊落在該分鐘、請求順序與該分鐘已收盤；三個口徑與美元值的 BigInt 重播、SCENARIO 標示與界線文字；`basis_dependency` 指向的供給組成資料包重新驗證且地址一致；source-only 重播與 canonical 不變。另一項中文事件卡片回歸。`npm test` 全套 1113 通過；`npm run validate`／`npm run validate -- --production` 均 84 指標／25 公式、無 errors／warnings，unknown 1／80。

Chrome headless 實測 `http://127.0.0.1:4323/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：22 項檢查通過——十三份研究／十九筆事件、Enter 展開事件卡片與原始事件 JSON、收盤價與三個美元值、「非已驗證流通量」「情境 timelock_excluded」「未涵蓋未來增發」「不是 canonical 市值／FDV 更新」、四個安全來源連結、桌面與窄版（312／312、卡片 278／278）無水平溢出、Fixture 0／0 → 正式 13／19。除瀏覽器自動 `/favicon.ico` 404 外 console 無錯誤，stderr 空；服務 PID 17476 已核對後停止。未驗證其他瀏覽器或真實手機。

## 第二階段需要確認的設計

第一階段只把口徑與對齊方式做成可重播的研究證據。把它變成 canonical 推導會改動資料字典與公式（版本升級、changelog、歷史保留），建議的設計如下，待使用者確認：

1. 新增 canonical 輸入：`uni.total_supply`、`uni.dead_balance`（OBSERVED，同區塊）；`uni.price` 以同分鐘價格追加新觀測（不改寫 10/4 的觀測）。
2. `uni.fdv` 改為 DERIVED＝價格 × totalSupply，說明固定帶「未涵蓋未來增發」。
3. `uni.market_cap` 改為 DERIVED＝價格 ×（totalSupply − dead），指標名稱／說明標明是研究口徑而非已驗證流通市值；Timelock 排除作為 SCENARIO 參數（預設不排除），可在敏感度中切換。
4. 期間政策：價格與供給必須同一 UTC 日且價格分鐘包含區塊時間，否則拒絕；不同日的價格與供給不得相乘。

確認後市值會由 null 變成有值，`uni.required_accrual`／`uni.required_share` 等下游指標會跟著重算，所以這一步需要明確同意。

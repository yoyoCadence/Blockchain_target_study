# UNI 主網 Firepit 累計 release 次數與現行門檻

先前只保存過[單筆 Firepit release](uni-firepit-release.md)（2025-12-29，nonce 0）。本子項在新的 finalized 區塊讀取 Firepit 合約狀態，補上「到目前為止執行過幾次、現在每次要付多少 UNI」的一手證據，並與同區塊 dead address 餘額對照。只保存研究層 point 證據：不年化、不歸因、不計估值。

## 擷取

PublicNode 回報 finalized block **26133926**、hash `0xf00aa9e42de56c422eebd891c319a2dd6837f531100c1ee957779a599b644060`，區塊時間 UTC `2026-10-06T14:27:35Z`；同 hash header 與同高度 recheck 一致，九個 `eth_call` 都以 `{blockHash, requireCanonical: true}` 釘選，狀態回應收到時間 `14:43:40.447Z`。[原資料包](../data/research/uni-firepit-state-2026-10-06-v1.json)保存 probe／state 完整 request／response、HTTP Date、各次時間、32-byte 回應字與完整十進位字串；exact bytes SHA-256 `41c8fcb16267e1b068aea59f8675bcd27a913d1a52c3d5ed2602034e71a0e6f9`，Git 固定 LF。

| 觀測（OBSERVED，point） | 原始值 |
| --- | --- |
| Firepit `nonce()`（已執行 release 次數） | 1395 |
| Firepit `threshold()`（raw） | 4000000000000000000000（4,000 UNI） |
| `thresholdSetter()`／`owner()` | 皆為 `0x1a9c8182c09f50c8318d769245bea52c32be35bc`（Timelock） |
| `RESOURCE()` | `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`（UNI） |
| `RESOURCE_RECIPIENT()` | `0x000000000000000000000000000000000000dead` |
| `TOKEN_JAR()` | `0xf38521f130fccf29db1961597bc5d2b60f995f85` |
| `MAX_RELEASE_LENGTH()` | 20 |
| UNI `balanceOf(dead)`（raw） | 112633581211219518941995199 |

dead address 餘額與同日稍早 block 26133577 的讀值相同；兩者是不同區塊的獨立觀測。

## 身份與語意依據

同一 commit `8604e4b`（2025-12-18）的官方 protocol-fees repo，各只保存 body SHA-256 與選定行：

- **README 部署表**兩行列出主網 TokenJar 與 Releaser (Firepit) 地址，各為一筆 OBSERVED。
- **Firepit.sol**：收款地址設為 `address(0xdead)`。
- **ExchangeReleaser.sol**：`release` 先 `handleNonce`，由呼叫者支付 `threshold` 至 `RESOURCE_RECIPIENT`，再釋出 TokenJar 資產並發出 `Released`；單次最多 20 種資產。
- **Nonce.sol**：nonce 必須相符，每次成功加一。
- **ResourceManager.sol**：`threshold` 可由 `thresholdSetter` 以 `setThreshold` 變更。

部署 bytecode 與此原始碼是否等價未驗證。README 另說明 Unichain 的橋接 Firepit 最後也把 UNI 轉到 L1 的 `0xdead`（本次未讀取 Unichain）。

## 研究推導（DERIVED v1，BigInt）

| 推導 | 結果 | 界線 |
| --- | --- | --- |
| nonce × 現行 threshold | 5580000000000000000000000（5,580,000 UNI） | 只有門檻從未變更時才等於累計支付；門檻歷史未查證 |
| dead 餘額 − 上述乘積 | 107053581211219518941995199 | 機械差額；金庫轉帳、L2 橋接銷毀與其他轉入未逐筆歸因 |
| TOKEN_JAR 與 README 地址相符 | 1 | 不驗證 TokenJar 內資產或費用來源 |
| thresholdSetter 與 owner 相同 | 1 | 不代表門檻過去或未來不變 |

已保存的第一次 release 在 2025-12-29，距本區塊約 281 日；本研究**不**據此計算年化 burn，因為門檻歷史、每次換出資產的價值與 L2 部分都未查證。門檻歷史、精確累計支付、dead 餘額歸因、L2 橋接銷毀、換出資產 USD 價值、費用來源、年化 burn、同步價格與部署原始碼等價全部維持 null。

## 保存與不變項

[人工事件](../data/research/uni-firepit-state-2026-10-06.yaml)（`token_burn`／completed，描述的是狀態查證而非新銷毀）已套用一次，完整快照 `b97d7644ecbfe7feb87237ea2d2cd1c579de6c28b7c8741bac8675439e6b26ec`，parent 為 UNI 供給組成快照 `ffd270b9…`。**不可再次套用相同事件。** 只追加六來源：RPC（tier 1）與五個 pinned 官方檔（tier 2）；updates=[]、source_change=true、changes=[]，金融／公式／假設／情境／圖譜／論點精確重播相同。unknown 80、模型日期 2026-10-04、三項 SECZ TTM null、UNI 原名目年率 stale、Fixture required-share 0.422 不變；研究目錄仍十一份，新資料由已審查事件卡片／原始 JSON 查閱。

## 驗證

四項新增 production 回歸覆蓋原 bytes／anchor／calldata／回應字、README 與原始碼選定行、四個推導 BigInt 重播與確切依賴、source-only 重播與 Fixture 隔離；另一項中文事件卡片回歸。`npm test` 全套 1000 通過；`npm run validate`／`npm run validate -- --production` 均 84 指標／25 公式、無 errors／warnings，unknown 1／80。

Chrome headless 實測 `http://127.0.0.1:4320/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：21 項檢查通過——Enter 展開事件卡片與原始事件 JSON、nonce／門檻／乘積／差額／dead 餘額與界線文字、六個安全來源連結、桌面與窄版（312／312、卡片 278／278）無水平溢出、Fixture 0／0 → 正式 11／18。除瀏覽器自動 `/favicon.ico` 404 外 console 無錯誤，stderr 空；服務 PID 43012 已核對後停止。未驗證其他瀏覽器或真實手機。

## 後續

下一步為此格式建立 schema／方法 v1 與 digest-bound 共用唯讀 reader，再接研究目錄與中文表格。要把這份證據變成年度捕獲數字，還需要：門檻變更歷史（`setThreshold` 交易）、Unichain Firepit 狀態與橋接、每次 release 換出資產的價值與費用來源；這些都不在本子項範圍。

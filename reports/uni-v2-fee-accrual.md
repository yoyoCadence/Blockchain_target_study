# UNI v2 單筆 LP 費用份額歸集

於 2026-10-04 人工查證 Ethereum mainnet 兩筆成功交易，將原始 Factory 的建池事件與後續 TokenJar LP 流入對照。本子項補上一筆實際歸集執行例子；全期間費用來源與淨持有人收益仍待查證。

## 已觀察的鏈上紀錄

[建池 receipt](https://etherscan.io/tx/0xf7c2416207169d630ce3476ab9b3483260aa6b0cfea95b43ba61b926bf97d1bf#eventlog)：block **26118333**，UTC **2026-10-04 10:16:23**。原始 Factory `0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f` 的 **PairCreated log 413** 明列 Pair `0xb37f3ab2bb227c0e8b9b5aa837ecbbbac4c3c7da`、token0 `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`、token1 `0xfdcfc904806230a7277ebc34a19fe1ffdb8314ba` 及 pair count `523766`。

[後續 receipt](https://etherscan.io/tx/0xd2d2caf01956cfe301c998c39cd6c15831f6eb18f283c229ba86b315eb0925e5#eventlog)：block **26118477**，UTC **2026-10-04 10:45:47**。caller `0xff8026e53fbafbd36518e233dbc531ceea194dd6` 經 Router `0x7a250d5630b4cf539739df2c5dacb4c659f2488d` 移除流動性。以下整數皆為各合約 base units，以字串原樣保留，未作浮點或美元換算。

| Log | Emitting contract／事件 | 已觀察流向或數值 |
| --- | --- | --- |
| 336 | 該 Pair／Transfer | caller → Pair，LP `25331798199101460550857024` |
| 337 | 該 Pair／Transfer | zero address → TokenJar `0xf38521f130fccf29db1961597bc5d2b60f995f85`，LP `6952494133386631432161` |
| 338 | 該 Pair／Transfer | Pair → zero address，同額 caller LP 被銷毀 |
| 339 | token0／Transfer | Pair → Router，`2289919090676942734` |
| 340 | token1／Transfer | Pair → Router，`280998934126617543384345378311629` |
| 341 | 該 Pair／Sync | 更新 reserve0／reserve1 |
| 342 | 該 Pair／Burn | caller 移除流動性，兩項 underlying amount 與上述流出一致 |

receipt 共九個 logs；343 為 Router 將 token1 送回 caller，344 為 WETH Withdrawal。LP emitter 與 UNI 合約不同；本交易沒有 UNI Transfer 或 Firepit Released。Underlying 流出屬 caller 贖回，不能當成 TokenJar 已實現收入。

## 源碼解讀與界線

讀取 [固定 Pair 原始碼](https://github.com/Uniswap/v2-core/blob/1136544ac842ff48ae0b1b939701436598d74075/contracts/UniswapV2Pair.sol)、[固定 LP ERC20 原始碼](https://github.com/Uniswap/v2-core/blob/1136544ac842ff48ae0b1b939701436598d74075/contracts/UniswapV2ERC20.sol)；[commit 原始 metadata](https://github.com/Uniswap/v2-core/commit/1136544ac842ff48ae0b1b939701436598d74075) 的 authored／committed 時間均為 2020-03-17T22:05:28Z。重用已保存 Factory／Pair 來源版本，不改既有 retrieved_at。

依此官方源碼，`burn` 在銷毀 caller LP 前呼叫 `_mintFee`；當 feeTo 非零、先前 kLast 非零且 reserve-product 的平方根成長時，按條件鑄造 LP 給 feeTo；ERC20 `_mint` 發出 zero-address Transfer。log 337 與這條費用份額路徑相符，Factory 的 PairCreated 提供獨立身份對照。這是基於源碼與 receipt 的推論，未完成部署 bytecode 等價或區塊固定 storage 查證。

Explorer 合約頁只顯示 **Similar Match**；Uniswap／MHM 標籤不能代替證明。尚未排除捐贈或特殊 token 行為對 reserve-product 的影響，不能宣稱成長全由交易費用造成，也不將 underlying token 提升為研究核心標的。

此次未連接到 2025-12-29 Firepit 五項資產來源、TokenJar 的後續 LP 贖回或 UNI payment；沒有全期間收入／burn、美元估值、全部池／跨鏈現況、totalSupply 減少或淨收益結論。UNI 分配與稀釋仍須納入未來完整經濟評估。

## 保存與驗收

[人工事件資料包](../data/research/uni-v2-fee-accrual-2026-10-04.yaml) 使用新增的 `protocol_fee_accrual` 事件類型，沿用一般來源／日期／節點／重算驗證。沒有數值 updates，四個新來源追加到既存來源版本，唯一寫入為 [source-only journal](../data/events/production/uni-v2-fee-accrual-20261004.json)；完整快照 **729d45b96a313aa128095c53c26d179d75621dc38002ab08ea0b873690ec7135** 的 parent 是 **0abb51bb8a1c41e592d8e9bd9bc55c8ee7c8a2213b07154aad5217d974dd0a4c**。

正式金融仍為 84 指標／25 公式／83 個未知。輸入、公式、假設、情境、graph、估值與 thesis 全部和 parent 相同；八份正式快照仍為同一模型期間，不能增加連續期數。研究目錄仍六份，這份事件目前從本紀錄及原始 journal 查閱。

四項新增回歸涵蓋原始證據／來源日期、來源追加與舊版本、完整重播／未知／同期間不足證據，以及新事件類型沿用來源／未來知識／Fixture 防線。另修正兩項既有測試，以指定歷史快照位置／hash 核對保留內容，使合法新增 journal 不被誤判為歷史改寫。固定昨日時鐘的兩份測試只排除記憶體中未使用的今日發布來源；正式來源與 guard 不改。相關 17 項及日期 32 項通過；全套 **551 項通過、0 失敗**，兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。CI 結果以本次 PR 實際執行為準。

Web 擷取鏈上頁面與 raw GitHub 檔案受限後，兩筆 receipt 在 Chrome 人工閱讀，固定原始碼改由唯讀 GitHub connector、日期由公開 GitHub API 核對。沒有鏈上操作、遠端資料自動採集或 UI 變更。

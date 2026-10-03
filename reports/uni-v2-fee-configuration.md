# UNI v2 歷史 feeTo 執行配置

本子項查證 **2025-12-27** Ethereum mainnet v2 的執行配置，於 **2026-10-03** 回溯審查；不代表完整 fee capture／現行參數 baseline 已完成。

Proposal 93 的成功 receipt 在 block 24106378、UTC 2025-12-27 20:33:11，log 16 記錄對 factory `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f` 的 ExecuteTransaction：calldata `F46901ED` 後的 address word 為 `0xF38521f130FCCF29DB1961597bC5d2B60f995F85`。log 23 為 ProposalExecuted(93)。[鏈上 receipt](https://etherscan.io/tx/0x091f0083242a777d55821c1189e568d6d033d9da501b75087dc736fa143d2c1e#eventlog)

這與最終治理規格的 setFeeTo(TokenJar) 操作相符，提供公告之外的成功執行證據；保留 Agora 顯示的不同執行時間，不以頁面日期取代 receipt。[治理規格](https://vote.uniswapfoundation.org/proposals/93)

固定官方源碼中，Factory setter 寫入 feeTo；Pair 以非零 feeTo 判定 feeOn，並在 mint／burn liquidity 路徑按條件鑄造 LP 份額。據此可解讀這項成功配置的協議作用，不能認定每次交易立刻產生已實現 UNI burn。[Factory](https://github.com/Uniswap/v2-core/blob/1136544ac842ff48ae0b1b939701436598d74075/contracts/UniswapV2Factory.sol)、[Pair](https://github.com/Uniswap/v2-core/blob/1136544ac842ff48ae0b1b939701436598d74075/contracts/UniswapV2Pair.sol)

## 分開保留的證據層

- **已查證**：該歷史 proposal 執行成功、v2 factory call 的目標與參數，以及最終規格／固定源碼的對照。
- **源碼解讀**：非零 feeTo 與 feeOn 的關係是基於官方源碼；本次未做部署 bytecode 等同性審計。
- **仍待查證**：fee-derived TokenJar 流入、Firepit release／UNI burn 的具體交易、可比收入期間、全部 v3 pool 參數及現行跨鏈設定。
- **不推定**：v3 factory owner 更換不等於全部 pool fee activation；100M treasury transfer 不等於年度 fee revenue；設定啟用不等於可直接填入 `uni.crypto_fees` 或 aggregate `uni.fee`。

## 保存與驗收

[手動事件資料包](../data/research/uni-v2-fee-configuration-2025-12-27.yaml) 使用既有 protocol_fee_change journal，updates 為空，明確記錄 effective date 與 Codex review。新增 receipt／governance source v2 以 supersedes 連到 v1，保留所有來源版本及原 budget 血緣；另登錄固定 Factory／Pair 源碼，date 取 commit 日 2020-03-17。

資料只更新來源與事件證據；不新增捕獲數值或 graph edge，不修改公式、假設、情境及市場估值。完整不可變 snapshot 與前版比較會顯示 source change，財務 metrics 不變；兩份 production snapshots 仍屬同一模型期間，不能充當兩期 thesis 證據。

115 tests passed／0 failed；fixture／production validate 84 metrics、25 formulas、0 errors／warnings、unknown 1／83。新增檢查驗證 parent／source supersession、空數值更新、財務／thesis 不變及完整歷史重播。完整捕獲與父 baseline 保持未完成。

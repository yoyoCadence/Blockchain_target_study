# UNI 單筆 Firepit 執行證據

本子項回溯查證 **2025-12-29** Ethereum mainnet 的一筆成功資產交換，保存 receipt、raw logs 與交易前已發布的官方源碼。它補足具體 release／dead-address payment 的執行例子；全期間 fee-origin、年度收入／burn 及現況仍待查證。

## Receipt：已觀察的執行

[成功交易](https://etherscan.io/tx/0x2dc3d8a165fe57ef89cd928f16a1de6d39725729cec85a25c5511906ed50fb08#eventlog) 位於 block **24116850**，UTC **2025-12-29 07:36:47**。caller／recipient 為 `0xCC9B975D07b35A96C1b49bd0D98779E78daE2E0E`，呼叫 Firepit `0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721`。

UNI token `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984` 的 Transfer **log 338** 將 raw uint256 `4000000000000000000000` 從 caller 移到 `0x000000000000000000000000000000000000dEaD`；explorer 顯示 **4,000 UNI**。Firepit **log 345** 的 Released 記錄 nonce **0**、同一 recipient 及五個 asset addresses。

以下是 TokenJar `0xf38521f130fcCF29dB1961597bc5d2B60F995f85` 到同一 recipient 的 OBSERVED raw transfers；保留原始 base-unit 整數，不換算美元或當年度流量：

| Log | Token contract | Explorer 名稱 | Raw uint256 |
| --- | --- | --- | --- |
| 339 | `0xdac17f958d2ee523a2206206994597c13d831ec7` | USDT | `16054642585` |
| 340 | `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` | WETH | `5255598537200314106` |
| 341 | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` | USDC | `4203254992` |
| 342 | `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599` | WBTC | `3448554` |
| 343 | `0x45804880de22913dafe09f4980848ece6ecbaf78` | PAXG | `187841167374250491` |

log 337 是 Approval；log 344 是額外的零值 PAXG fee transfer。兩者不另計 burn。這筆 caller 支付與五項 TokenJar 資產流出在同一成功 receipt 中發生。

## 官方源碼解讀

以 [2025-12-18 07:49:57 UTC 的固定 commit](https://github.com/Uniswap/protocol-fees/commit/8604e4b9aed88bdd6be3a322e19722c40f94be2c) 為版本，未用目前 main 分支推定當時邏輯。以下是源碼的分析解讀，未宣稱已驗證部署 bytecode 等價：

- [ExchangeReleaser](https://github.com/Uniswap/protocol-fees/blob/8604e4b9aed88bdd6be3a322e19722c40f94be2c/src/releasers/ExchangeReleaser.sol) 先取得 resource payment，再呼叫 TokenJar 釋放資產並發出 Released；threshold 是配置值。
- [Firepit](https://github.com/Uniswap/protocol-fees/blob/8604e4b9aed88bdd6be3a322e19722c40f94be2c/src/releasers/Firepit.sol) 將 resource recipient 設為 dead address。
- [TokenJar](https://github.com/Uniswap/protocol-fees/blob/8604e4b9aed88bdd6be3a322e19722c40f94be2c/src/TokenJar.sol) 限制 authorized releaser 提取指定資產餘額。

## 保存、驗收與仍缺證據

[手動事件](../data/research/uni-firepit-release-2025-12-29.yaml) 使用既有 token_burn、completed、來源與 Codex review metadata，updates 為空。五個新來源保留完整 URL／publisher／title／date／retrieved_at／tier／covered_metrics；source-only journal 保存完整金融與證據快照 **c242eeb441c989b608a9520d13e54b9e142ee213a818a88dd76d9db15ed763c9**。原 budget／configuration snapshots 及 source versions 保留，第三份快照仍是同一模型期間，不增加 thesis 期數。

四項新增回歸核對資料包／journal、raw values／source pins、所有原版本與財務結果不變、完整歷史重播及不足證據。完整測試 **271 passed／0 failed**；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。

目前僅證明這筆 caller-funded dead-address transfer 與 TokenJar exchange。尚未逐筆追溯五項資產的 protocol-fee origin，也未查證 totalSupply 是否減少、全期間收入／burn、有效 aggregate fee rate、v3 每池／跨鏈 activation 或 current threshold。與 proposal 93 的 100M treasury transfer 分開，沒有採用 explorer 的即時美元顯示。Canonical `uni.crypto_fees`、net accrual、估值等仍為 null；完整 baseline 不勾選完成。

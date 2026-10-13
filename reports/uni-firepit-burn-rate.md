# UNI 主網 Firepit 近期速率年化（研究層 SCENARIO）

依分析者決策 [D-20261012-02](decision-log.md#d-20261012-02firepit-年化-scenario近期速率短窗口)，用兩個我們自己讀取的固定區塊相減，算出主網 Firepit 的近期燒毀速率。**只在研究層**：不進正式的 `uni.crypto_fees` 或累積收入，不換算 USD，也不是預測。

## 兩個端點

| | 起點 | 終點 |
| --- | --- | --- |
| 資料包 | [10/06](../data/research/uni-firepit-state-2026-10-06-v1.json)（已保存） | [10/13](../data/research/uni-firepit-state-2026-10-13-v1.json)（新擷取，SHA-256 `273e3eec…`） |
| finalized block | 26133926（2026-10-06 14:27:35Z） | 26183367（2026-10-13 11:47:35Z） |
| nonce（累計 release 次數） | 1395 | 1415 |
| 門檻 | 4,000 UNI | 4,000 UNI（相同） |

- **讀取方式**：終點用同一個方法讀取，也就是同樣九個 getter，以 blockHash／requireCanonical 讀取並做同高度 recheck。同一 pinned commit 的五個原始碼文件也重新取得。
- **新的方法檔**：[`spec/uni-firepit-state-method-20261013.yaml`](../spec/uni-firepit-state-method-20261013.yaml) 只改了綁定的資料包、RPC 來源、文件來源 v2，以及含區塊號與日期的紀錄 ID。
  - 唯讀 reader `reviewUniFirepitState` 新增選填的 `methodFile`，並檢查新方法檔在去除這些綁定後與 v1 完全相同。
  - 預設行為不變；10/06 資料包照舊驗證。
- **事件**：source-only `token_burn` 事件 `uni-firepit-state-20261013`（[提案](../data/research/uni-firepit-state-2026-10-13.yaml)）。
  - 追加 RPC 來源與五個文件來源 v2（supersedes v1），快照 `2e9da6b1…`；updates=[]。
  - 金融紀錄沒有改，unknown 仍是 72。**不可再次套用。**

## 結果（SCENARIO `firepit_recent_rate`，短窗口）

[結果檔](../data/research/uni-firepit-burn-rate-2026-10-13-v1.json)由唯讀模組 `engine/research/firepit-burn-rate.js` 以 BigInt 從兩個 digest-bound 資料包重算：

- 窗口 595,200 秒（約 6.89 天，短於 30 天，所以標「短窗口」）。
- release 20 次 × 4,000 UNI，期間燒毀 **80,000 UNI**。
- 年化：80,000 × 31,557,600 ÷ 595,200 ≈ **4,241,612.90 UNI/年**（取整到 raw 單位）。
- **兩端必須相同**：門檻、resource、收款地址、TokenJar、門檻設定者，任一項不同就不計算。終點必須比起點新。

**背景（不歸因）**：同期 dead 地址餘額增加 220,000.002 UNI，其中 140,000.002 UNI 不是來自主網 Firepit，來源未知。這只是觀測，不併入燒毀速率。

## 界線

- 兩端門檻相同，但期間內若曾短暫改變又改回，仍無法排除。
- 只計主網 Firepit，不含 Unichain 橋接版本。
- 燒毀的 UNI 是 release 呼叫者付出的成本，不等於協議手續費收入，也不是代幣持有人價值的直接證明。
- 窗口太短，年化會放大雜訊。建議窗口滿 30 天時（約 2026-11 初）用同一方法追加一版，這一版保留。

## 驗證

- 新增 3 項回歸：
  - 結果檔可從兩個資料包逐字重算；
  - 端點順序與方法綁定的拒絕；
  - source-only 事件與 v2 文件來源、金融不變。
- `npm test` 全套 1239 通過；`npm run validate` 與 `npm run validate -- --production` 都沒有 errors 或 warnings（unknown 1／72）。
- 本次沒有介面變更。

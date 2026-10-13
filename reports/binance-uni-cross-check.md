# Binance 公開封存交叉核對 UNI 同分鐘收盤價

依分析者決策 [D-20261012-03](decision-log.md#d-20261012-03歷史資料存取參考-alphafactorforge-的資料來源)，參考使用者另一個專案 AlphaFactorForge 使用的 Binance 公開封存（`data.binance.vision`），交叉核對正式模型的 UNI 價格。正式模型價格是 `uni.price@2-coinbase-candle-20261007`：Coinbase UNI-USD 同分鐘收盤價 7.9914，時間 2026-10-07 11:02:00→11:03:00 UTC。

## 結果

| 交易對 | Binance 11:02 收盤 | 與 7.9914 的差 | 基點 |
| --- | ---: | ---: | ---: |
| UNIUSDT | 7.99500000 USDT | +0.0036 | 4.50 bp |
| UNIUSDC | 7.99400000 USDC | +0.0026 | 3.25 bp |

- **單位不同**：USDT、USDC 與 USD 是不同單位，差值只是一致性檢查，**不換算、不取代正式價格**。
- **沒有門檻**：檢查沒有通過／不通過門檻（門檻是分析者決策），只記錄差值。
- **時間戳**：Binance 封存的時間戳是微秒，逐值精確換算後，確認參考分鐘與正式價格的時間窗口完全相同。

## 保存

- **資料包** [binance-uni-klines-2026-10-07-v1.json](../data/research/binance-uni-klines-2026-10-07-v1.json)（LF，SHA-256 `e6ffc5c4…`），每個交易對保存：
  - 官方 CHECKSUM 原文（必須指名這個檔案，且等於 zip 的 SHA-256）；
  - zip 的 hash 與長度、CSV 檔名與列數（1440）；
  - 參考分鐘與前後各一分鐘的原始 CSV 行（含列號）。
- **唯讀模組** `engine/research/binance-klines.js`：
  - 解析並檢查 K 線行（12 欄、一分鐘、已收盤）；
  - 用十進位字串計算精確差值（基點四捨五入到 0.01，負值另行處理）；
  - `verifyBinanceDailyZip` 可在重新下載後核對 hash 與原行。
- **事件**：source-only `market_data_review` 事件 `binance-uni-cross-check-20261013`（[提案](../data/research/binance-uni-cross-check-2026-10-13.yaml)）。
  - 追加兩個 tier 1 交易所來源，涵蓋指標是 `uni.price_cross_check_evidence`，刻意不是 `uni.price`。
  - 快照 `a0003005…`；金融紀錄沒有改，unknown 仍是 72。**不可再次套用。**

## 測試調整

正式來源依事件 journal 的檔名排序載入，`binance-…` 排在最前面。三個舊測試原本用 `p.sources[0]` 當「任一舊來源」，現在取到的是日期晚於測試事件的 Binance 來源。所以改成「第一個日期不晚於事件 as-of 的既有來源」，這才是這些測試真正需要的條件。

## 驗證

- 新增 4 項回歸：交叉核對結果、竄改拒絕、時間單位／差值／zip 重驗、事件與金融不變。
- `npm test` 全套 1243 通過；`npm run validate` 與 `npm run validate -- --production` 都沒有 errors 或 warnings（unknown 1／72）。
- 本次沒有介面變更。

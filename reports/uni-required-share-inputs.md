# UNI required-share 輸入：假設與情境 v2

依分析者決策 [D-20261012-01](decision-log.md#d-20261012-01required-share-的輸入假設與情境)，追加六筆 v2 輸入紀錄，讓 required-share 第一次在正式模型算出值。**公式不變**（`f.uni.required_share` v2）；理由欄都引用決策編號。

## 追加的紀錄（全部 `supersedes` 原 v1 null，v1 保留）

| 紀錄 | 值 | 分類 | 說明 |
| --- | --- | --- | --- |
| `uni.required_yield@2` | 0.05 | ASSUMPTION（低） | 原始提示門檻，約 20 倍本益比的倒數 |
| `uni.turnover@2` | 2 次／年 | ASSUMPTION（低） | 期間基礎由年度改為模型，理由見下 |
| `uni.fee@2` | 0.000125（1.25 bps） | ASSUMPTION（低） | 尚未以鏈上協議費設定查證 |
| `market.equity_aum@2` | 4 兆 USD | SCENARIO `tokenized_equity_tam_4t`，範圍 2～6 兆 | TAM 情境，不是資產價值 |
| `uni.onchain_share@2`、`uni.amm_share@2` | 1、1 | SCENARIO `all_onchain_amm_upper_bound` | 刻意最樂觀的分母 |

- 期間參考日都是 2025-12-31，知識日 2026-10-12，所以不推進模型期間。
- **週轉率改用模型基礎**：v1 標的是 2025 年度。若沿用年度基礎，引擎會以「Unaligned accounting periods」拒絕它與 2026-10-07 估值日期混用。
- 「2 次／年」描述的是未來假設狀態，不是 2025 年的實際流量，所以改用模型基礎。將來的 WFE 實際值會另存 OBSERVED 年度紀錄，不冒充這個假設。

## 結果

- **required-share ≈ 51.44%**，算式：

  ```
  (0.05 × 7,090,964,360.31 + 159,828,000) ÷ (4 兆 × 2 × 1 × 1 × 0.000125)
  ```

- 因為分母用的是「全部上鏈且全走 AMM」的上限情境，這是**最低必要市占**，不是預測，也不是合理價值。
- **敏感度**（與決策紀錄的預估一致）：
  - 規模 2 兆：102.9%，觸發「超過 100%、情境不可行」警告。
  - 規模 6 兆：34.3%。
  - 全部排除治理金庫：41.0%。
  - 費率 0.5 bps：128.6%，觸發警告。
  - 費率 2 bps：32.1%。
- **論點規則沒有觸發**：UNI 的 STRESS 規則需要「費率低於 0.5 bp」**且**「required-share 高於 50%」。現在費率是 1.25 bps，所以不觸發。規則門檻是分析者假設，本次不改。論點仍是證據不足。
- `uni.required_share_net`（完整淨經濟）仍是 null，因為 crypto 費用、其他 RWA、Unichain、MEV、其他累積與其他稀釋都未知。
- 正式未知 80 → 72。Fixture 的 required-share 仍是 0.422。

## 快照與驗證

- **快照**：`node cli.js snapshot --production` 追加 `f096f2c3…`，parent 是 SEC source-only 快照 `2c35927c…`。
  - 比較結果：assumption_change 與 scenario_change 為 true，來源、公式、規則沒有變。
- **建立快照時的失誤**：我多執行了一次 snapshot 指令，產生一份理由為「x」、內容相同的多餘快照 `8ece0c66…`。它還沒 commit，我核對後已刪除，沒有進入歷史。
- **測試**：新增 4 項回歸（紀錄欄位、結果與血緣、敏感度與警告、快照只改假設與情境）。
  - 另外更新 6 處舊斷言：required-share 不再是 null、正式未知數、敏感度表單的費率值、freshness 未知輸入 56 → 50，以及最新快照位置。
- `npm test` 全套 1236 通過；`npm run validate` 與 `npm run validate -- --production` 都沒有 errors 或 warnings，unknown 1／72。
- 介面只新增兩個情境名稱的中文標籤，本次沒有做 Chrome 實測。

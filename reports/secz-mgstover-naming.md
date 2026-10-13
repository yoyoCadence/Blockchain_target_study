# SECZ 收購標的 MG Stover 名稱沿革：SEC 原文查證（研究筆記）

依 [D-20261012-04](decision-log.md#d-20261012-04sec-edgar-聯絡資訊)，2026-10-12 使用研究專用信箱作為 SEC User-Agent 聯絡資訊（信箱不寫入本公開 repo），直接取得 EDGAR 原始檔案。這是**研究筆記**：沒有新增事件、快照、來源版本或任何金融數值；SECZ TTM v2 的可比性假設與名稱衝突維持原狀。

## 查詢範圍

EDGAR 全文檢索 `"MG Stover"`，期間 2025-01-01 至 2026-10-12，共 14 份文件。每份都以 HTTP 200 取得原始 bytes，下表是第一次取得的 SHA-256 前 16 碼。第二次重取已核對的文件 hash 都相同。

| 申報日 | 表格 | 文件 | SHA-256 |
| --- | --- | --- | --- |
| 2025-10-28 | 425 | [ea026272001ex99-2_cantor2.htm](https://www.sec.gov/Archives/edgar/data/2034269/000121390025102785/ea026272001ex99-2_cantor2.htm) | `94681c7c6426dc58…` |
| 2025-10-28 | 8-K | [ea026272001ex99-2_cantor2.htm](https://www.sec.gov/Archives/edgar/data/2034269/000121390025102783/ea026272001ex99-2_cantor2.htm) | `94681c7c6426dc58…` |
| 2025-11-12 | DRS | [filename1.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390025108962/filename1.htm) | `10433e1760857ca4…` |
| 2025-11-21 | 425 | [ea0266517-425_cantor2.htm](https://www.sec.gov/Archives/edgar/data/2034269/000121390025113656/ea0266517-425_cantor2.htm) | `a2c8addcd117bb88…` |
| 2026-01-28 | S-4 | [ea0264119-02.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390026008915/ea0264119-02.htm) | `865663a7c790563a…` |
| 2026-04-13 | S-4/A | [ea0264119-04.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390026042685/ea0264119-04.htm) | `e8b171b357e1ce56…` |
| 2026-05-08 | S-4/A | [ea0264119-07.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390026053457/ea0264119-07.htm) | `52d7ceb2b8eb3d92…` |
| 2026-05-20 | S-4/A | [ea0264119-09.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390026059300/ea0264119-09.htm) | `c86a713599d9789d…` |
| 2026-06-05 | 424B3 | [ea0264119-11.htm](https://www.sec.gov/Archives/edgar/data/2094496/000121390026065825/ea0264119-11.htm) | `5db7c20a8c619d87…` |
| 2026-06-05 | DEFM14A | [ea0293597-01.htm](https://www.sec.gov/Archives/edgar/data/2034269/000121390026065822/ea0293597-01.htm) | `c4c8e5e48ccc75b0…` |
| 2026-07-31 | S-1 | [secz-20260731.htm](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm) | `55385c02a53ed42f…` |
| 2026-08-07 | 424B3 | [securitizeholdings-424b3.htm](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm) | `0279b7ec9d4b713b…` |
| 2026-08-13 | 8-K/A 附件 99.1 | [exhibit991securitize-q22026.htm](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm) | `31a8177394b1f05e…` |
| 2026-08-13 | 8-K/A 附件 99.2 | [exhibit992securitizemdaq22.htm](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit992securitizemdaq22.htm) | `026562089a00abc6…` |

## 發現

文件中出現四種名稱，下面的引文都是原文：

1. **「MG Stover, Inc.」**
   - 出現在年度（已審計）財報 Note 3 標題與 MD&A 小標。
   - 2026-01-28 S-4 的期中 Note 3 也是 Inc.。
   - 2026-04-13 與 2026-05-08 兩份 S-4/A 只出現 Inc.。
2. **「MG Stover, LLC」／「MG Stover LLC」**
   - 期中財報 Note 3 標題從 **2026-05-20 S-4/A 起**改為 LLC，之後的 424B3、DEFM14A、S-1、8-K/A 都沿用。
   - 年度 Note 3 仍是 Inc.。
3. **「MG Stover & Co.」**
   - 業務說明寫「the Company completed the acquisition of MG Stover & Co. ("MG Stover")」。
   - 8-K/A 附件 99.1 以定義詞把兩者連成同一標的：「acquisition of all outstanding equity interests of MG Stover LLC ("MG Stover" or "MG Stover & Co.")」。
4. **「Securitize Fund Services, LLC, formerly MG Stover & Co」**
   - 出現在 S-1 與 2026-08-07 424B3 的出售持有人註腳：「…, a wholly owned subsidiary and affiliate of the Company, serves as the fund administrator of certain affiliated funds」。

## 新的來源衝突（保留，不解決）

- **2026-01-28 S-4** 的合併範圍清單寫「Securitize Fund Services, LLC ("Theorem")」，並且另外列出「MG Stover & Co.」，也就是同一個法律名稱被對應到 Theorem。
- **2026-08-07 424B3** 則寫「Securitize Fund Services, LLC, formerly MG Stover & Co」。

兩者對 Securitize Fund Services, LLC 的前身說法不同。可能是期間內有重組（合併、改名），但 14 份文件都沒有寫出改名或合併的經過。依規則兩個說法都保留，不刪除任何一方。

## 結論與界線

- **新增的支持**：發行人自己的定義詞（8-K/A）把「MG Stover LLC」與「MG Stover & Co.」視為同一個收購標的，名稱時間序列也顯示期中財報從 Inc. 改為 LLC。
- **仍未查證**：沒有任何文件寫出「MG Stover, Inc. 轉換為 LLC」。Inc.／LLC 的法律主體等價仍然**未直接查證**，只能從同一收購日、同一配置金額、同一定義詞推論。
- 「全文檢索沒找到轉換說明」是對這 14 份文件的負面結果，不代表轉換說明不存在；州政府公司登記（非 SEC）可能有直接紀錄。
- SECZ TTM v2 的假設 `secz-ttm-20260630-comparability@2`（低信心）**不變**。是否因新證據調整信心，是分析者決策，要另外記錄在[決策紀錄](decision-log.md)。

## 原文保存（2026-10-13 完成）

- **資料包**：[資料包](../data/research/secz-mgstover-naming-2026-10-13-v1.json)，固定 LF，exact bytes SHA-256 `9641cf34…`，約 127 KB。
  - 內容有：全文檢索原回應、14 份文件的身分，以及 43 段原文 bytes 摘錄（位移、長度、SHA-256、正規化文字）。
  - 另有 7 項觀測（每項都引用摘錄）、2 項衝突，以及「Stover 前後 300 字元內無轉換字樣」的範圍檢查（0 筆）。
- **SEC 傳送層會改變整份回應的 hash**：
  - 每次回應都會在 `</BODY>` 前插入一個 `<script src="/隨機路徑">`。Cantor 那份 425 兩次取得就差 7 bytes，`Last-Modified` 仍是 2025-10-28。
  - 所以資料包記兩種 hash：當次完整回應的 `response_sha256`；以及只移除這一個元素後的 `filing_sha256`。插入的元素必須剛好一個，而且緊接 `</BODY>`。
  - 14 份文件 10/12 與 10/13 兩次取得的 `filing_sha256` 全部相同。所有摘錄都在插入點之前，所以位移不受影響。
- **離線重驗**：唯讀模組 `engine/research/sec-excerpts.js` 用固定正規化 `sec-html-text-v1` 重驗每段摘錄與觀測引文，並拒絕任何 email。
  - `verifySecDocument` 可在重新下載後逐 byte 核對位移；這需要連網，不在自動測試內。
- **事件**：source-only `acquisition` 事件 `secz-mgstover-naming-20261013`（[提案](../data/research/secz-mgstover-naming-2026-10-13.yaml)）。
  - 追加 15 個 tier 1 SEC 來源，快照 `2c35927c…`；updates=[]。
  - 金融紀錄、公式、假設、情境都不變，unknown 仍是 80。**不可再次套用。**
- **測試**：5 項新增（重驗、竄改拒絕、傳送層 script 過濾、事件與歷史不變）。全套 1232、兩模式 validate 通過。
- **六類收入對應**：SECZ 只揭露 Tokenization 與 Asset Servicing 兩類收入。如何對應到模型的六類，需要分析者決策。

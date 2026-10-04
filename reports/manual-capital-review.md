# 股本研究的手動唯讀驗證

## 操作

```powershell
node cli.js capital-review data/research/capital-reviews/secz-resale-20261004-v1.json --production
```

只接受正式工作區。輸出包含繁體中文的七項機械核對摘要、原始 DERIVED metadata、未解分類及完整 `full_review`；來源、持有人原文、108 個 OBSERVED、九個 null、原始單位／日期／期間、嵌入公式版本與確切依賴全部保留。沒有寫入或追加事件、快照及金融資料。

## 驗證範圍

`spec/capital-review-schema.yaml` 定義已保存 SECZ 轉售研究的 v1 結構，`engine/research/capital.js` 為共用重播入口。先驗 schema 與 content hash，再驗正式 provenance、唯一來源／紀錄／metric／公式 ID、已保留來源 supersession 與遞增版本、原觀測一手來源及 covered_metrics。來源發布、UTC 取得／review、as-of 和 point 期間分開；未來 review／知識日、來源晚於 review 或晚於觀測知識日均拒絕。

股數需為安全整數；原始 OBSERVED 不能為負，未知值須有 unknown confidence。逐列核對原始文字與 observation，破折號必須對應 null，兩欄保留相同原日期。七條嵌入公式的結構需符合本研究的分類算術：普通股欄全部納入、earnout 明確選取已披露數值列，其餘相加／相減保留方向；受限 AST 不允許程式執行。重播核對公式版本、依賴紀錄 ID、知識日與結果，選取的 unknown 會向下游傳播。調節差額可以為負，不能誤套非負股數限制。

研究公式仍保存於原 artifact，不加入 25 條金融公式 registry。驗證成功代表保存的資料結構與算術一致；不等同重新閱讀 SEC 全文、人工簽核、來源真實性認證或現在股本驗證。直接提供新檔案可有新 hash；固定 catalog 的 hash 釘選另由研究呈現入口處理，本 CLI 不替檔案取得審核資格。

## 實際驗證與限制

相關 41 項測試通過，包括重新計算 hash 後仍拒絕錯誤來源、raw cell、分類、日期、單位、版本、公式與依賴；合法 offset 時間、signed 差額、嵌入升版及 selected-null 傳播亦通過。CLI 成功／失敗前後檔案 bytes 與金融／歷史重播一致。全套 `npm test` 493 通過、0 失敗；`npm run validate` 與 production validate 都為 84 指標／25 金融公式／0 錯誤／0 警告，unknown 1／83。

本次未改已保存 artifact、來源、事件、快照、金融公式、假設或論點；沒有 UI 變更。下一個獨立子項是把此共用驗證接入固定研究目錄／API。Sponsor 重疊、961,384 未解差額、現在及完全稀釋股本、估值與可投資性仍待查證；正式 TTM 仍三項 null，完整 baseline 未完成。

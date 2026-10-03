# 明示審查的原始收入 TTM 銜接

`revenue-ttm` 唯讀使用兩份已驗證研究 artifact 與明示 comparability request。公式 `research.revenue_ttm_bridge` v1 是 `annual − prior_ytd + current_ytd`，保留原始 USD、完整 12 個月區間；不乘四、乘二，不更新六類年度金融模型。

```powershell
node cli.js revenue-ttm data/research/secz-ttm-20260630-review-v1.yaml data/research/revenue-reviews/secz-prospectus-v1.json data/research/revenue-reviews/secz-q22026-v1.json --production
```

Request 明確綁定兩個研究 hash 與選定 FY2025／H1 2025／H1 2026 IDs。先驗證原 artifact 雜湊與 embedded formulas 完整重播，再檢查主體／範圍／GAAP／財年結尾一致、annual／YTD 類型、去年同長度 YTD 及今年區間；拒絕年份錯配、季度冒充 YTD、來源／觀察晚於 cutoff、去年 YTD 超過全年與負結果。原始數值仍各自保留來源／as-of／期間／confidence。

可比性是 versioned **ASSUMPTION**，不是 OBSERVED 事實。五項判斷各附 rationale 及兩份 filing 的 primary statement source IDs：收入定義、停止營業範圍、收購處理、選定 presentation 與審計差異。任一 false／null 時，三個輸出均為 null、COMPARABILITY_UNVERIFIED；條件確認但數字未知時，相應輸出為 UNKNOWN_INPUT。條件允許運算時仍為 DERIVED，保留 formula、全部觀察／假設／statement／period dependencies；不提升未經審計資料，亦不視為額外 thesis 期間。

本次正式 review 保留未解差異：年度 Note 3 標題為 MG Stover, Inc.，季度 Note 3 為 MG Stover LLC。兩份附註均敘述 4/15/2025 收購日起合併，但法律主體等價／名稱差異尚未釐清，acquisition_treatment 保持 null。[prospectus](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)、[quarterly exhibit](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm)

另外已讀兩份收入分類文字與 Note 4 的停止營業披露；quarterly exhibit 的收購 pro forma 表和停止營業收入分開列示。本次僅以披露報表值作為候選輸入，排除 pro forma／停止營業值；這些人工判斷仍是有來源的假設，不宣稱完整歷史更正查證。[prospectus](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)、[quarterly exhibit](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm)

正式結果三項為 null。新 [request](../data/research/secz-ttm-20260630-review-v1.yaml) 與 [完整研究 artifact](../data/research/revenue-ttm-reviews/secz-20260630-v1.json) 以独立 exclusive-create 檔案保存，hash `6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d`。Artifact 包含原研究全文、公式版本、人工判斷與結果，可完整重播；persisted false 表示 CLI 不寫 financial journal，人工保存的研究檔案仍是可審查版本。

驗證：新增 36 項區間／分類／日期／review 綁定／來源／null／版本 replay／unsafe AST／範圍／CLI 回歸。條件全確認的記憶體測試使用明示 test-only 假設驗證算術，不發布成正式 TTM 值；首輪一項測試的錯誤訊息預期已修正，另補獨立 observation-cutoff 檢查。全套 235 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。

工具子項完成，真正可使用的 TTM baseline 仍被名稱差異／可比性查證阻擋。六類收入 mapping、margin／FCF、母公司估值、個人可投資性與完整更正沿革仍未完成；金融公式、假設與 immutable journal 不變。後續須用新 request／版本／檔案記錄查證，不能把本版 null 改寫為 true。

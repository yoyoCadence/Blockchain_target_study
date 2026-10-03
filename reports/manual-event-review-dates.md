# 手動事件 review 日期

2026-10-03 完成手動事件／immutable journal 的 review 時序驗證。原先 research-refresh 才檢查 review，已重現一般 source-only acquisition event 能把 reviewed_at 填為 2099 年而被接受。

共用 `checkEventReview`，當事件提供 research_review 時，要求：

- reviewer 與 rationale 不能只有空白。
- reviewed_at 不晚於目前精確時間；以 UTC instant 比較，保留原 offset 字串。
- review 的 UTC calendar day 不早於 event.as_of_date。
- 引用的 event.source_ids 及所有新增 event.sources 的 retrieval instant 不晚於 review，即使新增 source 未列入引用 IDs 也要檢查。

此檢查用於 prepare/apply 寫入前及 canonical journal 載入。即使 event／snapshot 內容一致且重新計算的 hash 正確，非法 review 時序仍不能經由 direct load／API 被接受。既有 source publication／retrieval／OBSERVED current-time 規則繼續獨立驗證。

晚取得歷史資料後再 review 是合法的：review 可以晚於原 event.as_of，原 effective date、publication 與 retrieval 保留不同意義。附 review 的 planned／announced event 可以保留未來 effective date，不因此變成 live／completed。一般事件若原先沒有 optional review，原 path 保留；research-refresh 仍必須提供 review 與 digest，沒有新增 unattended automation。

新增 19 項回歸涵蓋五種 statuses、blank fields、UTC day／offset／exact instants、既有與未引用的新 sources、回顧式 review、未來 plan、無 review 原 path、failed apply 無 journal、temporary journal direct load／API 400，以及最新 metrics／thesis／history hashes 重播。`npm test` 344 passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。

金融 AST／formula versions、人工 thresholds、資料與所有既存 journal 未修改；已保存合法 reviews 仍全部載入。沒有 UI 修改或額外瀏覽器驗證。Metadata 時序通過不證明來源內容正確或實際 value capture；SECZ TTM／六類映射、估值、UNI capture 與完整 production baseline 仍待驗證。

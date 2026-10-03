# 事件紀錄與來源日期

已重現 completed event 同時填入 2099 年 as-of／effective date 時仍被接受。既有規則只檢查 effective date 不晚於 event as-of，沒有把紀錄 as-of 限制在已到達的日期；source-only event 也未核對來源發布日。

手動 event 現在要求 as-of 不晚於目前 UTC 日，且全部 event.source_ids 的 publication date 不晚於 event as-of。這些檢查在重算或寫入之前執行，涵蓋 source-only events。未知 event source 仍先被拒絕，不會略過缺失證據。

今日記錄、未來才生效的 planned／announced event 仍有效，狀態及未來 effective date 原樣保留；既有流程仍禁止這些狀態產生 OBSERVED 更新。Live／completed 仍需要不晚於 as-of 的 effective date 與可信來源。晚 retrieved 的歷史來源可以支持較早已存在的知識紀錄，retrieval date 不取代 publication date。

驗證：179 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增十項 event 日期檢查，包括五種狀態的 future as-of、合法未來 plan、拒絕 apply 且不寫檔、無數值更新的未來發布證據及回溯取得 receipt。既有研究與財務 snapshot 完整重播、UNI 0.422 與 API 保留。

本次只修正時間驗證，不改來源、觀察、公式、假設、graph 或歷史紀錄；不建立 scheduler／自動事件抓取。來源內容、實際捕獲與投資性仍需研究，完整 baseline 未完成。

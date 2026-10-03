# 觀察與來源發布日期驗證

修正 canonical validator 的已重現漏洞：7 月 as-of 的 OBSERVED 觀察曾可引用 8 月才發布的來源。Research refresh 本來已拒絕此情況，但直接載入 canonical 資料或一般 completed event 未使用同一限制。

共用 `validateProject` 現在要求每個 OBSERVED 引用的 source.date 不晚於 observation.as_of_date。任何一份引用來源違反都會拒絕，含 null 觀察與 fixture；一般 event 在重算／寫入之前也會失敗，不建立 journal。保留所有來源及衝突，不刪掉晚發布的來源來讓錯誤資料通過。

日期含義保留區分：period.end 是金融／觀測期間，as-of 記錄此版可用的觀察知識截止。若需要後發布的財報，另建有正確 as-of 的版本並保留原期間與舊紀錄，不能回填舊版。來源可以日後才 retrieved，供回溯研究；本次沒有新增 `retrieved_at <= observation.as_of_date` 限制。ASSUMPTION／SCENARIO 不會因此被視為 OBSERVED。

驗證：169 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增十項檢查包括直接載入、來源發布邊界、多來源、一般 event、拒絕後未寫檔、fixture、null 及兩類分析者輸入。金融公式、假設、既有來源、收入研究快照與 canonical snapshots 全部保留；UNI 0.422 與 API／完整歷史重播仍通過。

此修正防止未來證據被提前使用，不證明來源內容、現況或投資 thesis 正確。來源可信度、財務 comparability、UNI fee-generated capture、估值與投資管道等父 baseline 工作仍未完成。

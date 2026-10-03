# 事件更新的知識日與 DTCC 狀態

在獨立 temp production 副本重現：已存 UNI budget research event 的 as-of 為 2026-01-01，內部 observation 改為 2026-10-03，同步 event／snapshot input metadata 並重算 hash 後原載入仍接受。Canonical observation 只限制不晚於現在，還不足以限制每個歷史事件當時的知識。

將 prepareEvent 既有兩條規則移到共用 checkEventEvidence：全部 updates.as_of_date 不晚於 event.as_of_date；xlm.dtcc_live／xlm.dtcc_material 值為 1 時 event.status 必須 live 或 completed。新事件與 saved canonical load 同樣使用。原狀態／知識規則與錯誤訊息保留，不新增 thesis thresholds 或 financial formula。

Planned／announced／cancelled 原本就只能新增 ASSUMPTION／SCENARIO；這次亦在 saved loads 保留其 DTCC 狀態限制，避免 scenario 的數值旗標被解讀為已實現。未知 OBSERVED 與假設／情境更新同樣遵守事件知識日。同日 observation、較晚 retrieval 的歷史證據、planned 未來 effective date 搭配 not-live scenario，以及原本的 live/completed 路徑保留。此 guard 檢查 metadata，不證明 DTCC 實際完成。

驗證：21 項新增回歸，46 targeted event 測試通過，完整 `npm test` **403 passed、0 failed**。兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。Matching/recomputed hash 的暫存 journals 仍拒絕兩模式 OBSERVED／null／ASSUMPTION／SCENARIO postdating、未來 scenario 知識日，以及兩個 DTCC flags 在三種非 live 狀態的更新；prepare／load 決策一致。API 回 400，原 journal bytes 不變。

合法 same-day observation、future planned effective date／not-live scenario、live/completed 狀態與全部正式 metrics／thesis／history replay 通過。Temp fixture sources 只在隔離 roots 調整 publication metadata，以獨立檢查知識規則；測試完成清理，沒有正式來源／觀察／金融／graph／formula／threshold／policy／history 或 UI 修改，沒有額外瀏覽器 QA。

此子項不宣告所有 saved transaction business rules 均已重播，亦不解決來源內容、真實 DTCC 上線或外部不可變儲存。四份 production snapshots 仍同模型期、83 金融 unknown；完整 baseline、SECZ legal naming／TTM／mapping、同步估值、個人管道與 UNI 全期間 capture 未完成。

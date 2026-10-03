# 已存研究的主要來源驗證

在獨立 temp production workspace，使用正式 UNI budget journal 的副本，將其全部來源 metadata 改成 Tier 3，同步 event／snapshot sources 並重算 hash；原 loadProject 仍接受。新研究 preparation 已要求每項 observation 至少一個 Tier 1／2，保存後的載入路徑漏用此既有規則。

抽出 checkResearchEvidence，供新事件 preparation 與 canonical saved loads 共用：research_refresh 必須有非空 OBSERVED updates，每筆來源存在、至少一個 Tier 1／2、全部 source IDs 列入 event.source_ids，publication 不晚於 observation as-of。Schema／canonical sources／事件／review chronology 仍先驗證，原錯誤訊息保留。一般 completed 事件維持既有 credible tier <5 規則，不提高其來源門檻。

驗證：14 項新增測試，42 項 targeted research 測試通過，完整 `npm test` **382 passed、0 failed**。两模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。測試以獨立副本修改 metadata／分類／宣告來源、同步內嵌內容並重算 hash，準備與載入均拒絕 Tier 3／4-only、primary 缺失的 null observation、ASSUMPTION／SCENARIO 冒稱 research、空更新與未列入 event 的證據；API 400 且 journal bytes 不變。

合法 Tier 1／2 metadata、混合來源中一個 declared primary、primary-backed null 及 generic Tier 3 completed 路徑仍有效。全部正式兩模式 metrics／thesis／history replay、原 source versions／hashes 保留；既有 reviewed preview／digest apply／supersession／CLI 全套通過。所有 probe 僅在自動清理 temp roots，未改正式來源分級或資料。

此子項只修正既有 metadata 規則的一致性，不憑 Tier 標籤證明內文／真實來源分類、簽章或外部不可變性，也未全面重播所有 persistence business rules。没有 UI 改動／額外瀏覽器驗證、financial AST／threshold／policy／觀察／來源／graph／研究 artifact／history 修改。四份 production snapshots 仍同模型期，完整 baseline、SECZ legal naming／TTM／mapping、同步估值、個人管道與 UNI 全期間 capture 未完成。

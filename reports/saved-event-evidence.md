# 已存事件證據驗證

在獨立暫存 fixture workspace 重現：completed source-only event 與 snapshot 同時改成 2099 年 as-of／effective date，並重算 snapshot hash，原 direct load 仍接受。雜湊只能確認內容一致，不能證明日期、來源或狀態有效。

將既有 prepareEvent 證據規則抽成 checkEventEvidence；準備新事件與 loadProject 讀取已存 journal 均在 schema／來源驗證後呼叫。知識 as-of 不晚於目前 UTC 日，事件 fixture flag 符合 workspace，所有 declared sources 必須存在且 publication 不晚於 as-of；live／completed 要有不晚於 as-of 的 effective date，production 需至少一個原規則允許的 tier <5 來源。Planned／announced／cancelled 更新只能是 SCENARIO 或 ASSUMPTION。

沿用既有規則与錯誤訊息，不更改來源分級政策或金融公式。Saved journal 仍先核對 event／snapshot 與 hash，另保留共用 review chronology。合法 future planned effective date、明示 scenario 更新、歷史 knowledge date 搭配較晚 retrieval，以及未附 optional review 的一般事件保留。

驗證：15 項新增 saved-load／API 回歸；44 項日期相關測試通過，完整 `npm test` **368 passed、0 failed**。Fixture／production `npm run validate` 均 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。測試將無效內容與 snapshot 一起重算 hash，確認兩模式 future knowledge、effective date、publication、來源缺失、provenance、三種計畫狀態與 production completed 證據不足仍被拒絕；API 回 400 且原 bytes 不變。有效計畫／回顧取得及全部 committed metrics／thesis／history replay 保留。

首次針對性測試有兩項 test-only 日期設定失敗：既有 retrieval-review 測試的 publication 太晚、新 retrospective 測試選到較晚發布的第一筆來源。已在暫存資料分開 publication／retrieval 探針，並指定實際歷史 execution receipt ID；最終全套通過。沒有正式資料改動。

此子項修正 canonical 載入驗證，未全面重播新事件寫入所需的全部 business rules，也不把雜湊當成外部不可變儲存。沒有 UI 改動／瀏覽器 UI 驗證、financial AST／threshold／graph／research artifact／原 journal 更新。四份 production snapshots 仍同模型期，完整 baseline、個人 investability、SECZ legal naming／TTM／六類 mapping、同步估值及 UNI 全期間 capture 仍未完成。

# Thesis 條件指標自身期間

2026-10-03 完成連續期證據的獨立驗證修正；真實連續 production 期數與完整 baseline 仍未完成。

原先只檢查 frame／snapshot 的期間。已重現：一筆 `uni.net_burn_yield` 的自身年度為 2024-12-31，把同一筆指標放進標籤為 2025-12-31 的 snapshot，仍能完成二期 WATCH。另一個重算案例中，僅把 unrelated scenario 的 model 日期往後移，也會讓舊 XLM 條件以新模型參考日觸發單期規則。

目前每個已知條件的 metric.period.end 必須等於 frame.period.end。annual／quarterly／TTM 必須與 frame basis 一致；point／model 可於同日参与，但原 OBSERVED／DERIVED／ASSUMPTION／SCENARIO 分類不變。缺失或不相符的 period 不能被 snapshot 標籤補齊。

被拒絕的條件保留 actual、record_id，另提供原 `metric_period`（缺失為 null）與 `period_aligned: false`。所有 rule evaluations 仍保留，該規則為 insufficient；其他独立支持的 triggers 與最高 severity 照常計算。HEALTHY 且 evidence 不足的解讀仍明示不是肯定的健康 thesis。未知值始終 null。

新增 15 項回歸：舊值重複計數、年度／季度／TTM 混用、同日合法 basis、舊 point／model、缺 period、獨立 STRESS 與不受支持的 BREAK、未知、真實 canonical model 日期變動及 immutable replay。原測試 helpers 增加明示 metric periods，取代隱含繼承 frame 標籤。全套 `npm test` 321 passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。

既有 committed metrics／thesis／formula versions 重播一致，保存的來源／輸入／snapshot hashes 未改；沒有金融 formula 或人工 threshold 修改。日期／basis 支持不等於 verified observations、來源時效或經濟可比；正式 TTM、六類映射、估值、投資管道與 UNI 全期間 capture 仍保留未驗證。無 UI 修改或額外瀏覽器驗證。

# 會計期間端點對齊

2026-10-03 完成可獨立驗收的期間驗證修正。完整 production baseline、真實連續期數與季度 ingest 父項仍未完成。

原先只比較年份與月份：2024-12-30 → 2025-12-31 會被接受為 12 個月的可比／連續年度。記憶體重現顯示此錯位歷史甚至可完成 UNI 二期 WATCH 的 evidence window。

共用 `alignedCalendarPeriods` 檢查合法 date-only 日期、精確月份差，再要求同一日或兩端皆為該月最後一天。prior-period growth 與 thesis persistence 共用此檢查：年度／TTM 使用 12 個月、季度使用 3 個月。

| 前期 → 本期 | 結果 |
| --- | --- |
| 2024-12-31 → 2025-12-31 | 可對齊年度 |
| 2024-02-29 → 2025-02-28 | 可對齊閏年雙月末 |
| 2025-03-31 → 2025-06-30 | 可對齊季度双月末 |
| 2025-04-15 → 2025-07-15 | 可對齊季度固定日 |
| 2024-12-30 → 2025-12-31 | 日期錯位，拒絕 |
| 2025-03-31 → 2025-06-29 | 日期錯位，拒絕 |

錯位 growth 保持 DERIVED null、明確 ERROR，不能保存有計算錯誤的 snapshot。錯位 thesis window 保留原 evidence，coverage 為 insufficient，不觸發該連續期規則；有獨立充分證據的其他規則照常保留。HEALTHY 且缺證據仍明示「不是肯定的健康 thesis」。同期間重複 snapshot 不增加期數。

驗證：`npm test` 306 passed、0 failed，其中新增 18 項；`npm run validate` 與 production 模式均為 84 metrics、25 formulas、0 errors/warnings，unknown 分別 1／83。涵蓋固定日／月末／閏年／年界、非法日期、錯誤傳播與 snapshot 屏障、獨立 triggers／最高 severity、兩模式 immutable replay。完整金融 formula AST／版本、人工 thresholds、來源／觀察與已保存歷史保持原內容。

此規則只支援現有 calendar-month 間隔；52／53 週財務曆需要另行明確支援，不能推定為已對齊。日期檢查也不證明收入範圍、會計基礎或跨 filing 經濟可比性。無 UI 修改，未另做瀏覽器驗證。

# Canonical 未來證據日期防線

## 問題與範圍

共用 `validateProject` 原先只檢查 publication ≤ retrieval、period ≤ as-of 及 publication ≤ observation as-of。直接修改記憶體／canonical 檔案仍可把 OBSERVED 的 as-of 或來源 retrieved_at 設成 2099，繞過手動 research review 與 event 的現在時間檢查。

本子項僅補共用驗證。每次驗證擷取一次現在時間，OBSERVED as-of 必須不晚於當前 UTC 日；所有來源的 retrieved_at 必須不晚於當前精確 UTC instant，包含未引用的來源與 fixture。原有 publication ≤ retrieval 也因此阻擋未來發布證據。

## 保留的語意

日期精度分開：date-only OBSERVED 使用 UTC 日，帶 offset 的 retrieval 使用 `Date.parse` 完整時間比較，原始文字保留。過去 observation 可用已完成的回溯 retrieval；取得新副本不更新 observation 日期。

ASSUMPTION／SCENARIO 仍可明示未來模型日期；計畫／公告的未來 effective date 仍合法，不變成 live/completed。來源取得不是預測欄位，不能以未來時間聲稱已取得證據。所有金融公式／假設、canonical 資料、研究 artifact、快照與既有 source history 不變。

## 驗證與限制

13 項新增回歸涵蓋兩模式、已知／null OBSERVED、未引用来源、UTC 日邊界、正負 offset／精確時間边界、假設／情境、隔離檔案直接載入／API 400，以及 source-only event 拒絕且無 journal。既有 event publication 測試改用已取得但晚於事件 as-of 的歷史來源，持續独立驗證該屏障。

完整測試與兩模式 validate 見 [validation](validation.md)。本次沒有 Dashboard 改動，沿用 API／回歸驗證。首輪測試誤引用未儲存的 production price，已改用隔離 fixture；不因測試補入正式值。

驗證依賴執行環境的系統時鐘；不驗證來源內文或提供可信外部時間服務。此修正不完成 production baseline 的估值、TTM／六類映射或投資性研究。

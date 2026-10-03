# 開發交接

## 2026-10-03 — 人工審查研究更新流程

選擇 NEXT 首項的工具子項，因為 canonical schema、事件重算、血緣與不可變快照已具備。功能分支 `feat/reviewed-research-refresh` 從最新 `origin/main` 的 `f50d466` 建立；開始時工作目錄乾淨。

已完成 research-preview／research-apply、研究資料包 schema、來源隨事件新增與重新載入、review metadata 與 digest、舊預覽拒絕套用，以及完整事件內容與快照的一致性檢查。保留所有既有 fixture／歷史、財務公式與 thesis 規則；正式資料仍沒有已匯入觀測。

驗收包含預覽不寫入、第一筆 production journal、重算與 null 傳播、來源與觀測 supersession、來源血緣、快照重播、舊 preview／重複 ID 拒絕，以及 metadata／單位／期間／fixture／tier 等失敗時不寫入。操作詳見 [research-refresh.md](research-refresh.md)。

驗證：`npm test` 62 passed／0 failed；`npm run validate` 與 `npm run validate -- --production` 均為 84 metrics、25 formulas、0 errors、0 warnings，unknown 分別為 1 與 84。UNI required-share 仍為 0.422。既有 Dashboard/API 測試通過；本次沒有 UI 修改，未另作瀏覽器視覺驗證。遠端 CI 結果以 PR 的實際狀態為準。

環境紀錄：sandbox 中測試子程序回報 spawn EPERM，完整測試改於獲准環境執行。Node 24 在此 Windows Unicode 路徑上執行 fs.cpSync 時會原生異常退出，新增測試改以逐檔讀寫準備隔離目錄。CLI 整合測試發現並修正 readYaml 使用絕對路徑時重複拼接目錄的問題。

父任務尚未完成：識別碼與可投資性、一手來源內容、UNI 預算／實際捕獲啟用、同日估值、可比財務期間及首份正式 baseline 仍待研究與審查。review metadata 不提供身份驗證，journal 沿用 single-writer 與中斷需人工修復的限制。後續應繼續首項 NEXT 的研究驗收，不擴張自動採集、排程或新資產模型。

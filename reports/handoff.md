# 開發交接

## 2026-10-03 — 手動來源時效分析

PR #3 CI 全部成功後已合併（`0e079f6`）；分支 `feat/manual-source-freshness` 從該最新 origin/main 建立，工作目錄乾淨。完整 baseline 尚缺年度／季度收入分類與可比期對照、同步估值及現行可投資性查證，因此保留 null，接續獨立的 NEXT 時效子項。

新增 `freshness` 只讀 CLI、versioned ASSUMPTION policy 與 DERIVED 日數 metadata。原始 observation as-of、publication date、retrieved_at 分開；過去 cutoff 不使用未來來源，UNKNOWN／ASSUMPTION／SCENARIO 不變成新鮮事實，全部歷史來源保留。超過窗口只是當前使用前需重查，不否定歷史觀测或修改 thesis。沒有 scheduler、自動採集、通知、API／UI 或財務模型變更。詳見 [操作與限制](source-freshness.md)。

驗證：97 tests passed／0 failed；fixture／production validate 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。2026-10-03 報告：UNI 歷史 budget age 275 天、四來源本日重新取得；58 個 input 未知。14 項新增檢查驗證 UTC／閏日／窗口／未知／未來證據、policy 與 CLI，並確認經濟結果、thesis、project 及快照不變。遠端 CI 以本 PR 的實際結果為準。

來源時效分析子項完成，完整 baseline 仍未完成。下一個有價值且可獨立驗收的工作是 SECZ 收入分類與明確期間處理，或 UNI 以執行後 fee-path 證據查證 activation；不可把 proposal 93 的一次性 treasury burn 當 fee revenue。Identity dossier 的時效與 journal 整合、當前 venue／custody、同步價格／估值與連續期數仍缺。

## 2026-10-03 — 核心識別碼資料包與只讀驗證

PR #2 的 Canonical validation 全部成功後已依最新授權合併（merge `215039e`）；本分支 `research/core-identifiers` 從該最新 origin/main 建立，工作目錄乾淨。GitHub connector 合併權限回報 403，改用已登入 Chrome 完成並以遠端 API／fetch 確認，無須另請使用者確認。

本子項查證 UNI Ethereum token、SECZ 上市母公司 NYSE common stock／CIK、XLM 原生身份。五個完整來源 metadata 與三筆 OBSERVED 身份保存於獨立日期／版本資料包；新增 schema 及只讀 `identity-review` 命令驗證來源、日期與資產類型。保持數字型 refresh、asset registry、graph 及 promotion gates 的界線，沒有財務 journal 或財務公式變更；投資人資格／託管仍為 null，investability 仍 unverified。詳見 [身份研究](core-identifiers.md)。

驗證：83 tests passed／0 failed，fixture／production validate 仍為 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。只讀檢查確認專案、財務結果及快照不變；拒絕錯誤來源／日期、native 偽合約、股票與 wrapper 混淆、自動投資性升級。首輪測試中不存在的 SECZ price 名称已修正為完整財務結果不變的比較。

下一步缺實際 UNI capture 執行後證據、現行通道／資格／託管、可比財務期與估值。SECZ 附件提供季度資料，現有模型流量為 USD/year，尚不能直接匯入；收入分項也需要與目前六類做明確對照。可獨立推進 read-only freshness 分析，避免把 2026 年初的歷史 budget 當成當前證據。識別資料包尚未連接 immutable financial journal；後续修訂須保留原始日期／版本文件。

## 2026-10-03 — UNI 歷史核准預算 baseline 子項

依 NEXT 首項繼續查證 UNI 預算，分支 `research/uni-growth-budget-baseline` 從最新 `origin/main`（`f475d18`，PR #1 已合併）建立；開始時工作目錄乾淨。新增一份可重讀的研究資料包與中文研究紀錄，使用 preview／digest-bound apply 保存第一筆 production journal。

截至 2026-01-01 的觀測為核准額度 20M UNI/year：保留原先 null ASSUMPTION v1，新增明確 supersedes 的 OBSERVED v2、四個有日期的一手來源、完整公式／來源／輸入／thesis 快照。核對 proposal 93 的 successful receipt、40M allowance 與 ProposalExecuted；治理網站與 receipt 的執行日期衝突保留。review 標明 Codex 查證，沒有冒稱人類已簽核。實際支出、新增 mint、當前設定、已實現 fee capture 與估值均未從該額度推定。

驗證：`npm test` 65 passed／0 failed；fixture 與 production validate 均為 84 metrics、25 formulas、0 errors／0 warnings，unknown 分別為 1／83。新增檢查覆蓋來源／資料包一致性、舊假設保留、未知估值／不足 thesis 證據及正式歷史快照重播。沒有公式、分析者假設或 UI 變更。遠端 CI 另以 PR 的實際結果為準。

完整父任務仍未完成。下一項可獨立推進識別碼／投資性與 UNI 實際捕獲啟用；同日估值、可比財務期及足夠連續期數仍缺。DUNI 年終報告未顯示可確認發布日，僅留研究參考，不假造 source.date。所有限制見 [UNI 研究紀錄](uni-growth-budget-baseline.md)。使用者後續已授權逐項提交可審查 PR，驗證成功後合併並繼續；MVP 排除範圍仍維持。

## 2026-10-03 — 人工審查研究更新流程

選擇 NEXT 首項的工具子項，因為 canonical schema、事件重算、血緣與不可變快照已具備。功能分支 `feat/reviewed-research-refresh` 從最新 `origin/main` 的 `f50d466` 建立；開始時工作目錄乾淨。

已完成 research-preview／research-apply、研究資料包 schema、來源隨事件新增與重新載入、review metadata 與 digest、舊預覽拒絕套用，以及完整事件內容與快照的一致性檢查。保留所有既有 fixture／歷史、財務公式與 thesis 規則；正式資料仍沒有已匯入觀測。

驗收包含預覽不寫入、第一筆 production journal、重算與 null 傳播、來源與觀測 supersession、來源血緣、快照重播、舊 preview／重複 ID 拒絕，以及 metadata／單位／期間／fixture／tier 等失敗時不寫入。操作詳見 [research-refresh.md](research-refresh.md)。

驗證：`npm test` 62 passed／0 failed；`npm run validate` 與 `npm run validate -- --production` 均為 84 metrics、25 formulas、0 errors、0 warnings，unknown 分別為 1 與 84。UNI required-share 仍為 0.422。既有 Dashboard/API 測試通過；本次沒有 UI 修改，未另作瀏覽器視覺驗證。遠端 CI 結果以 PR 的實際狀態為準。

環境紀錄：sandbox 中測試子程序回報 spawn EPERM，完整測試改於獲准環境執行。Node 24 在此 Windows Unicode 路徑上執行 fs.cpSync 時會原生異常退出，新增測試改以逐檔讀寫準備隔離目錄。CLI 整合測試發現並修正 readYaml 使用絕對路徑時重複拼接目錄的問題。

父任務尚未完成：識別碼與可投資性、一手來源內容、UNI 預算／實際捕獲啟用、同日估值、可比財務期間及首份正式 baseline 仍待研究與審查。review metadata 不提供身份驗證，journal 沿用 single-writer 與中斷需人工修復的限制。後續應繼續首項 NEXT 的研究驗收，不擴張自動採集、排程或新資產模型。

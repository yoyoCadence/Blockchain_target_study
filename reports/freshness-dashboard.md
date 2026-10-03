# Dashboard 手動來源時效

新增第 08 節 Source freshness，接上已完成的唯讀 API。使用者選擇 workspace、填入 UTC 截止日並按「手動查詢時效」；留空採 engine 當前 UTC 日。初次載入不查詢時效，切換 workspace／輸入日期會清除舊結果與錯誤，要求手動重查。Request revision 防止較早的成功／錯誤回應覆蓋後續查詢。

頁面分開呈現 canonical observation as-of／age／window／state、source publication／retrieval 日期與年齡、研究 review availability 與原始 observation。Fixture 顯示 synthetic provenance，不納入 Production research。Production 的歷史 UNI budget 保留 STALE_FOR_CURRENT_USE 與近期取得來源；三项 DERIVED TTM 保留 Unknown／INSUFFICIENT。Policy 明示 ASSUMPTION 與版本、完整 JSON 報告保留 DERIVED 公式／依賴、sources、原 periods、review／可比性 metadata。

UI 沒有日期計算、政策門檻或金融公式；全部 age／window／state 使用 API payload。窄螢幕表格在各區域內水平捲動，長 IDs／依賴會換行。狀態以 aria-live 回報，錯誤 role=alert；失敗時不保留前次結果，重新查詢按鈕可再次使用。查詢不更新 observation／來源／金融值／thesis／snapshots，不抓取外部資訊、不排程。

驗證環境：Windows Node 24，http://127.0.0.1:4830，獨立 Playwright CLI session；desktop 1280×720、mobile 390×844。先依 frontend-testing-debugging／Browser skill 嘗試 Browser，但多次出現 native pipe closed／Browser unavailable／逾時，無法完成互動。依 AGENTS.md 的 Windows CLI-first 路徑改用 playwright skill；Git Bash 在沙箱 Win32 error 5，原命令提升權限成功，npx 使用已有 cache 的 offline mode。QA scripts／screenshots 位於本次系統 temp 目錄，不提交產品 source 或研究資料。

| 檢查 | 實際結果 |
| --- | --- |
| Page identity／有內容／無 framework overlay | URL／title 正確，實際頁面與 screenshots 正常 |
| Fixture／Production | Synthetic 隔離；Production 5 reviews／30 records、TTM 3 Unknown；budget 舊 observation 與新 retrieval 同時保留 |
| Historical cutoff | 2026-08-13 保留 5 reviews 尚不可用與全部 research evidence INSUFFICIENT |
| Future cutoff／空白 | 2099 回 API 400、頁面顯示失敗／無舊結果；空白回現在 UTC 日 |
| 延遲回應 | 實際延遲 API request，舊 Production 不覆蓋 Fixture，舊 10/03 不覆蓋新 08/13 |
| API 忠實呈現 | 頁面完整 JSON 與相同 API response 完整一致 |
| Desktop／mobile／keyboard | Screenshots 已檢查；390px document width 390，無 page 水平溢出；Enter 可提交查詢 |
| Console／page errors | 無 pageerror／warnings；只有既有 favicon 404 與刻意測試 future cutoff 的 400 |

`node --check dashboard/app.js`、`git diff --check` 通過；完整 `npm test` **368 passed、0 failed**。兩模式 validate 均 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。既有金融／研究／immutable history API 回歸通過，沒有新增鏡像 DOM unit tests。CLI session 已關閉；核對實際 port owner／server.js 後停止背景 QA server，logs 已清理。遠端 CI 以 PR 實際結果為準。

本子項完成手動 UI，未測 Firefox／Safari 或每一手機寬度；Browser 原連線問題未修復。Research records 不等於 thesis periods，窗口符合不代表可比性／可投資性或健康 thesis。四份 production snapshots 仍同模型期，83 金融 unknown；完整 baseline、SECZ legal naming／TTM／mapping、同步估值、個人管道與 UNI 全期間 capture 仍未完成。

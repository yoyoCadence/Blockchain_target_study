# UNI 餘額／供給研究目錄與中文查閱

目錄 v4 新增 `token_state`，釘選 [原資料包](../data/research/uni-token-state-2026-10-04-v1.json) exact bytes SHA-256 `848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d` 與原已存事件 `uni-token-state-20261004`。[目錄 reader](../engine/research/inspection.js)共用手動 token-state reader，驗證原 owner 依賴／同 block／ABI／BigInt 比較後，再核對事件中的 hash／as-of／來源，沿用原審查者及 UTC `2026-10-04T16:10:51.187Z`，沒有另造新審查日期。

`GET /api/research?mode=production` 保留完整 request／response、四筆 OBSERVED raw 字串與一筆 DERIVED 比較，原研究 ID、單位、point 期間、medium confidence、嵌入公式 v1及確切兩個 dependencies 不改。原區塊時間 UTC `2026-10-04T14:53:11.000Z` 與取得時間 `16:06:27.842Z` 分開。來源沿用自己的版本；資料包及 owner 依賴仍保留原 hash。

`GET /api/freshness?mode=production&as_of=2026-10-03` 的四觀測與審查不可用，10 月 4 日才可用。DERIVED 比較在兩個截止日均為 NOT_OBSERVED，不把推導提升成觀測或刷新原金融證據。共八份研究／158 紀錄／24 來源，十四筆已存事件；Fixture 不含正式研究／事件／研究時效。兩個 API 唯讀，POST 拒絕。

中文卡片分開展示觀測 raw 表格與推導旗標表格，保留分類／可信程度／公式版本／完整依賴，以及原三種時間、單點餘額／轉帳／供給／同步估值的限制。兩張窄表格均有焦點與左右捲動提示；原始資料包用 Enter 展開。所有數值／比較均來自研究層，UI 只呈現，不持有金融公式或自行解碼 raw。

八項新增回歸核對原 ID／bytes／review、matching repin 的語意及原事件綁定、截止日／DERIVED 分類、兩 API 的原始資料／寫入拒絕／Fixture 隔離／損壞拒絕，與中文兩表格精確字串／時間／依賴。全套 `npm test` 696 項、Fixture／Production `npm run validate` 通過：84 指標／25 公式、無 errors／warnings、unknown 1／80。原資料包、來源登錄、金融／canonical 公式／假設／情境／論點及十四份正式／三份 Fixture 歷史不改；三項 SECZ TTM null／UNI stale 年率／Fixture 0.422 保留。

Chrome 可用，URL `http://127.0.0.1:4310/?mode=production#research`；桌面 CSS 1536×729，窄 CSS 312×675。驗收：正式頁 Enter 卡片／raw → 窄版兩表格 ArrowRight → Fixture 清空／正式還原 → 10 月 3／4 日各填日期、按手動查詢、Enter 審查可用性。locator 使用 `[data-research="uni-token-state-20261004"] > summary`、其內層 `details > summary`、帶 aria-label 的兩個 `.freshness-table-wrap`；時效列使用 `#freshness-report article > details:first-of-type > summary`。

| 實際檢查 | 結果 |
| --- | --- |
| 頁面身分、八研究／十四事件、非空白、無錯誤覆蓋 | 通過 |
| 四完整 raw 整數、獨立 DERIVED v1／兩依賴、兩安全來源連結 | 通過 |
| 桌面及窄 Enter 展開 raw JSON | 通過 |
| 窄卡片／JSON clientWidth=scrollWidth=266、頁面無水平溢出 | 通過 |
| 兩個表格各自鍵盤 scrollLeft 0→32 | 通過 |
| Fixture 研究／事件為零，Production 還原八／十四 | 通過 |
| 10 月 3 日 NOT_AVAILABLE、10 月 4 日 AVAILABLE 實際審查列 | 通過 |
| console error／warn、服務 stderr | 空 |

本次也實際展開前一份 vesting fixed-block 的 10 月 4 日審查列並確認 AVAILABLE；補足前次工具未能展開的驗收項，不更改前次紀錄。截圖在 TEMP `token-state-research-desktop.png`／`token-state-research-mobile.png`，視窗已還原，驗收服務已停止。沒有驗證其他瀏覽器或真實手機。provider／共識 proof、部署 source 等價、全年實際 capture／分配、流通與完全稀釋分母、同步估值及完整 baseline 仍待查證。

# UNI 主網 Firepit 狀態研究目錄、API 與中文逐列查閱

[目錄 v8](../spec/research-catalog.yaml)新增 `uni-firepit-20261006`（kind `uni_firepit_state`），以原資料包 exact bytes SHA-256 `41c8fcb1…` 與已存事件 `uni-firepit-state-20261006` 綁定。[研究讀取](../engine/research/inspection.js)重用[手動唯讀 reader](manual-uni-firepit-state-review.md)，與 UNI 供給組成共用同一段事件綁定檢查：事件 as-of、事件 reason 內的原 hash、六個來源與當時快照來源 fingerprint 相同，以及 RPC 與五個檔案的取得時間都早於原審查時間 `2026-10-06T14:44:07.673Z`。審查 metadata 沿用已存事件，不另加來源、事件、金融更新或模型期間。

`GET /api/research?mode=production` 保留 12 個 OBSERVED 的完整 raw 字串、4 個 DERIVED 與公式 v1／確切依賴，以及六個來源版本。全目錄十二份審查／230 筆紀錄／39 個研究來源；已存事件仍十八筆。沒有補進任何金融值。

中文研究卡片分開顯示：固定區塊高度／hash、區塊時間與取得時間；12 列觀測（中文 label、完整原始值、單位、ABI 型別或「官方 README 行」、分類／可信程度）；4 列研究推導與公式版本、各自依賴；同一 commit 的五個官方檔案與選定行原文；九項未知（門檻變更歷史、精確累計支付、dead 餘額歸因、L2 橋接銷毀、換出資產 USD 價值、費用來源、年化 burn、同步價格、部署原始碼等價）；限制、來源連結與原始 JSON。卡片明示「次數乘以現行門檻」與「扣除後差額」都不是年度銷毀或收入；旗標 0 顯示為 0。

`GET /api/freshness?mode=production&as_of=2026-10-05` 時這份審查為 NOT_AVAILABLE_AT_CUTOFF，12 個觀測 INSUFFICIENT；10 月 6 日才 AVAILABLE。4 個推導在任何截止日都是 NOT_OBSERVED／INSUFFICIENT。Fixture 不含正式研究／事件／研究時效，兩個 API 拒絕 POST。

## 窄版溢出修正

Chrome 實測發現這張卡片在窄版水平溢出（頁面 312／509、卡片 278／492）：README 行含沒有空白的長網址，而卡片內的清單項目沒有斷行規則。在[樣式](../dashboard/style.css)補上 `.research-card li{overflow-wrap:anywhere}`（與既有 `.hint`／`.event-evidence`／來源段落一致）後，全部 30 張研究與事件卡片在 312 寬度展開都不溢出。新增回歸檢查這四組選擇器的斷行規則；暫時移除規則時該測試會失敗。

## 驗證

七項新增目錄／時效／API 回歸、兩項中文卡片回歸與一項樣式回歸；十三個既有測試檔的目錄數量由 11／214／33 更新為 12／230／39（2026-10-03 截止日另增 12 個尚不可用觀測與 4 個非觀測推導），Firepit production 測試改為核對目錄 artifact hash。`npm test` 全套 1097 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料、來源、金融／公式／假設／情境／論點、十八份正式／三份 Fixture 歷史、三項 TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

Chrome headless 實測 URL `http://127.0.0.1:4321/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：

| 實際檢查 | 結果 |
| --- | --- |
| 十二份研究／十八筆事件 | 通過 |
| Enter 展開卡片；次數、門檻、乘積、差額、README 地址、公式 v1、界線文字、commit 與日期、第 50 行原文、年化 burn／門檻歷史未知、審查時間 | 通過 |
| 兩張表格；六個來源連結 https／`noopener noreferrer`／新分頁 | 通過 |
| 內層 Enter 展開原始 JSON（含 request_json／sub_mul_raw_uint256） | 通過 |
| 桌面無水平溢出；窄版頁面 312／312、卡片 278／278（修正後） | 通過 |
| 兩張表格各 ArrowRight，scrollLeft 0→40 | 通過 |
| Fixture 0／0 → 正式 12／18 | 通過 |
| 時效 10 月 5 日 NOT_AVAILABLE／6 日 AVAILABLE（Enter 展開審查列，12 份／230 筆） | 通過 |
| 全部 30 張研究／事件卡片窄版展開無溢出 | 通過 |
| console warn／error、server stderr | 除瀏覽器自動 `/favicon.ico` 404 外無錯誤；stderr 空 |

截圖在 TEMP `uni-firepit-research-desktop.png`／`uni-firepit-research-mobile.png`。驗收服務 PID 18516 已核對 `node.exe server.js` 後停止；未驗證其他瀏覽器、有頭模式或真實手機。

門檻變更歷史、Unichain Firepit 與橋接、換出資產價值與年化 burn 仍待查證；`uni.market_cap`／`uni.fdv` 模型設計仍待決定。本子項不補任何年度或估值數字。

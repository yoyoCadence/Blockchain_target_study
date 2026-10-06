# UNI 供給組成研究目錄、API 與中文逐列查閱

[目錄 v7](../spec/research-catalog.yaml)新增 `uni-supply-20261006`（kind `uni_supply_composition`），以原資料包 exact bytes SHA-256 `de66eac4…` 與已存事件 `uni-supply-composition-20261006` 綁定。[研究讀取](../engine/research/inspection.js)重用[手動唯讀 reader](manual-uni-supply-composition-review.md)，再核對事件 as-of、事件 reason 內的原 hash、三個來源與當時快照來源 fingerprint 相同，以及 RPC 與兩份文件的取得時間都早於原審查時間 `2026-10-06T13:36:06.327Z`。審查 metadata 沿用已存事件，不另加來源、事件、金融更新或模型期間。

`GET /api/research?mode=production` 保留 13 個 OBSERVED 的完整 raw 字串、5 個 DERIVED 與公式 v1／確切依賴，以及三個來源版本。全目錄十一份審查／214 筆紀錄／33 個研究來源，研究紀錄 ID 全部唯一；已存事件仍十七筆。沒有補進任何金融值。

中文研究卡片分開顯示：固定區塊高度／hash、區塊時間與取得時間；13 列觀測（中文 label、完整原始值、單位、ABI 型別或「官方文件片段」、分類／可信程度）；5 列研究推導與公式版本、各自依賴；官方地址表的 `dateModified`／body hash 與 Uni.sol commit、12 行原文；九項未知（流通供給與定義、dead 餘額歸因、Timelock 承諾／可支用、未來鑄造、同步價格、市值、FDV、部署原始碼等價）；限制、來源連結與原始 JSON。旗標 0 會顯示為 0，不顯示成未知或健康訊號。兩張表格各有鍵盤焦點與左右捲動。

`GET /api/freshness?mode=production&as_of=2026-10-05` 時這份審查為 NOT_AVAILABLE_AT_CUTOFF，13 個觀測 INSUFFICIENT；10 月 6 日才 AVAILABLE。5 個推導在任何截止日都是 NOT_OBSERVED／INSUFFICIENT。Fixture 不含正式研究／事件／研究時效，兩個 API 拒絕 POST。

七項新增目錄／時效／API 回歸與兩項中文卡片回歸；十二個既有測試檔的目錄數量由 10／196／30 更新為 11／214／33（2026-10-03 截止日另增 13 個尚不可用觀測與 5 個非觀測推導），XLM 目錄測試的版本檢查改為不低於 v6。`npm test` 全套 995 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料、來源、金融／公式／假設／情境／論點、十七份正式／三份 Fixture 歷史、三項 TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

Chrome headless 實測 URL `http://127.0.0.1:4319/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：

| 實際檢查 | 結果 |
| --- | --- |
| 十一份研究／十七筆事件 | 通過 |
| Enter 展開卡片；六個關鍵 raw 值、兩個扣除後餘額、文件地址、公式 v1、界線文字、`dateModified`、Uni.sol 第 29 行、市值／FDV 未知、審查時間 | 通過 |
| 兩張表格；三個來源連結 https／`noopener noreferrer`／新分頁 | 通過 |
| 內層 Enter 展開原始 JSON（含 request_json／mul_div_floor_uint256） | 通過 |
| 桌面無水平溢出；窄版頁面 312／312、卡片 278／278 | 通過 |
| 兩張表格各 ArrowRight，scrollLeft 0→40 | 通過 |
| Fixture 0／0 → 正式 11／17 | 通過 |
| 時效 10 月 5 日 NOT_AVAILABLE／6 日 AVAILABLE（Enter 展開審查列，11 份／214 筆） | 通過 |
| console warn／error、server stderr | 除瀏覽器自動 `/favicon.ico` 404 外無錯誤；stderr 空 |

截圖在 TEMP `uni-supply-research-desktop.png`／`uni-supply-research-mobile.png`。驗收服務 PID 5448 已核對 `node.exe server.js` 後停止；未驗證其他瀏覽器、有頭模式或真實手機。

流通供給定義、同步價格、`uni.market_cap`／`uni.fdv` 的模型設計與完整 baseline 仍待決定與查證；本子項不補任何估值。

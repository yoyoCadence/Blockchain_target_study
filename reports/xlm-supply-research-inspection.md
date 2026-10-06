# XLM 供給研究目錄、API 與中文逐列查閱

[目錄 v6](../spec/research-catalog.yaml)新增 `xlm-supply-20261005`（kind `xlm_supply`），以原資料包 exact bytes SHA-256 `790c9763…` 與已存事件 `xlm-reported-supply-20261005` 綁定。[研究讀取](../engine/research/inspection.js)重用[手動唯讀 reader](manual-xlm-supply-review.md)，再核對事件 as-of、事件 reason 內的原 hash、兩份嵌入來源與當時快照來源逐欄相同，以及兩次 capture 都早於原審查時間 `2026-10-05T11:25:20.229Z`。審查 metadata 直接沿用已存事件，不另加來源、事件、金融更新或模型期間。

`GET /api/research?mode=production` 保留九個 provider_reported OBSERVED 的原始十進位字串、兩個 DERIVED 殘差（`0.0000000`）與 signed_decimal_sum v1／確切依賴，以及三個來源版本（含被取代的文件 v1）。全目錄十份審查／196 筆紀錄／30 個研究來源；已存事件仍十六筆。研究 ID 與 canonical 金融輸入分開，沒有補進任何金融值。

中文研究卡片分開顯示：回報欄位（中文 label＋原 field）、完整原始字串、單位、分類／可信程度、量測基礎；供應者更新與收到回應兩個時間；兩條殘差、公式版本與依賴；文件口徑來源、頁面日期、正文不可重播；七項未知（ledger 序號／hash、各組成帳戶、獨立流通、完全稀釋、同步市值／FDV）；限制、來源連結與原始 JSON。兩張表格各有鍵盤焦點與左右捲動。

`GET /api/freshness?mode=production&as_of=2026-10-04` 時這份審查為 NOT_AVAILABLE_AT_CUTOFF，九個觀測 INSUFFICIENT；10 月 5 日才 AVAILABLE。兩個殘差在任何截止日都是 NOT_OBSERVED／INSUFFICIENT，不提升成事實。文件 v2 只支撐公式口徑，沒有被觀測紀錄引用，時效表中標為非使用中來源。Fixture 不含正式研究／事件／研究時效，兩個 API 拒絕 POST。

七項新增目錄／時效／API 回歸：原 bytes／review／事件綁定、替換 bytes 拒絕、repin 後仍拒絕小數／殘差錯配、合法替換仍需原事件 hash／ID、兩截止日、API 唯讀與 Fixture 隔離、竄改證據 400 且不改檔案；另一項中文卡片回歸。十個既有測試檔的目錄數量由 9／185／28 更新為 10／196／30（2026-10-03 截止日新增 9 個尚不可用觀測與 2 個非觀測推導）。`npm test` 全套 852 通過；`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80。原資料、來源、金融／公式／假設／情境／論點、十六份正式／三份 Fixture 歷史、三項 TTM null、UNI 原名目年率 stale 與 Fixture 0.422 不變。

Chrome（headless，本機已安裝版本）實測 URL `http://127.0.0.1:4317/?mode=production#research`，桌面 CSS 1536×729、窄 312×675：

| 實際檢查 | 結果 |
| --- | --- |
| 頁面身分、十份研究／十六筆事件 | 通過 |
| Enter 展開卡片；八個精確字串、兩個時間、審查時間、殘差 v1、supersedes、七項未知 | 通過 |
| 兩張表格；三個來源連結 https／`noopener noreferrer`／新分頁 | 通過 |
| 內層 Enter 展開原始 JSON（含 response_json／signed_decimal_sum） | 通過 |
| 窄版頁面 312／312、卡片 278／278，無水平溢出 | 通過 |
| 兩張表格各 ArrowRight，scrollLeft 0→40 | 通過 |
| Fixture 0／0 → 正式 10／16 | 通過 |
| 時效 10 月 4 日 NOT_AVAILABLE／5 日 AVAILABLE（Enter 展開審查列，10 份／196 筆） | 通過 |
| console warn／error、server stderr | 僅瀏覽器自動請求 `/favicon.ico` 的 404（伺服器原本就未提供 favicon）；無 App 錯誤，stderr 空 |

截圖在 TEMP `xlm-supply-research-desktop.png`／`xlm-supply-research-mobile.png`。驗收服務 PID 33328 已核對 `node.exe server.js` 後停止；未驗證其他瀏覽器、有頭模式或真實手機。同步估值、完整 baseline 與個人資格仍待查證。

# 固定區塊資料包目錄、API 與中文查閱

研究目錄 v3 釘選原 [RPC archive](../data/research/uni-vesting-fixed-block-2026-10-04-v1.json) 的 exact bytes SHA-256 `cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195`。新增 `fixed_block` 類型，要求明示原已存事件 ID；共用手動 reader 驗證 raw request／response／ABI 後，核對原事件的 hash、知識日及來源依賴，使用該事件的原審查者／時間，不另造目前日 review。

`GET /api/research?mode=production` 保留完整原始 artifact，八個 raw 值按字串呈現；技術 ID 加 artifact namespace，避免占用 canonical 金融 ID。period 為 point，block instant 另保留 `2026-10-04T14:53:11.000Z`，取得時間為 `15:08:12.569Z`，原審查為 `15:10:00.682Z`。三份來源沿用自己的原版本／取得時間；confidence=medium、OBSERVED、receipt null 及部署 source 等價 null 保留。

`GET /api/freshness?mode=production&as_of=2026-10-03` 將這八觀測與審查標為 cutoff 尚不可用；10 月 4 日才可用。既有 analyst 窗口不改，原 2026-01-01 核准年率仍 stale；新研究不刷新原金融觀測或增加 thesis 期間。研究共有七份 review／153 筆紀錄／23 份來源，已存事件仍十三筆。Fixture 不包含正式 review／事件／研究時效；兩個 API 均拒絕寫入。

中文卡片分開顯示 block／hash、知識日、區塊／取得／審查時間、精確 raw 字串、ABI 型別、分類與可信程度；明示單點授權及未完成部署等價的限制。窄視窗表格可左右捲動，提供焦點與提示；原始 request／response／查證限制可用 Enter 展開。沒有把金融公式或數值計算移入 UI。

八項新回歸核對 bytes pin、matching replacement digest 的混區塊拒絕、原事件綁定、截止日、兩 API 拒絕損壞 archive／寫入、Fixture 隔離、完整 raw 字串與原三種時間。全套 639 項 `npm test`、兩模式 `npm run validate` 通過；84 指標／25 公式、無錯誤與警告，unknown 1／80。金融、sources registry、原 artifact／source-only journal、十三份正式及三份 Fixture 歷史不改。

Chrome 可用，驗收 URL `http://127.0.0.1:4310/?mode=production#research`；桌面 CSS 1536×684、窄 CSS 312×675。路徑：正式頁 → Enter 開卡片／raw → 窄表格 ArrowRight → Fixture 清空／正式還原 → 分別填入 10 月 3／4 日並手動查詢。頁面身分、七 review／十三事件、無空白／錯誤覆蓋、console error／warn 空、完整資料包／三個安全來源連結通過；窄卡片 clientWidth=scrollWidth=266，表格自己的橫向捲動 scrollLeft 0→32，頁面無水平溢出。截圖保存在 TEMP `fixed-block-research-desktop.png`／`fixed-block-research-mobile.png`，尺寸已還原。

10 月 3 日審查列實際展開並顯示不可用；10 月 4 日查詢完成且無錯誤，其審查可用性由 API 回歸確認，但本次工具在目前日審查列的展開操作超時，未將該操作記為已驗證。未驗證其他瀏覽器或真實手機。原始 archive 僅內部一致性通過，provider／共識 proof／部署等價、owner 餘額、全年分配／捕獲與同步估值仍未完成；完整 baseline 保留。

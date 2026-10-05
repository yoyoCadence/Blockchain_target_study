# 公開市場資料包驗證與逐列中文查閱

[共用 reader](../engine/research/public-venue.js)只讀已保存的 [原資料包](../data/research/uni-xlm-public-venue-2026-10-05-v1.json)，先核對 exact bytes SHA-256，再套用獨立 [schema v1](../spec/public-venue-review-schema.yaml)／[方法 v1](../spec/public-venue-review-method.yaml)。沒有取得 API、寫入、套用事件或提升投資性。

```powershell
node cli.js public-venue-review data/research/uni-xlm-public-venue-2026-10-05-v1.json --production --digest 116eca762bb31dbbe9a30a26539e88df98a5a98503e6e489df7ae795e36ce03c
```

命令必須明示 production 與已審查 hash。核對四個 GET URI／唯一 source ID、HTTP 200／Date／各次開始與收到時間、transport 原封裝 hash、primary source URI／版本／supersedes／原取得時間；重播 26 個欄位的 string／boolean、source／point／UTC／unit／confidence。未知 provider 生效時間維持 null；XLM 空地址原文保持 `""`、研究值 null，不從空欄位推原生身份。合法的 offline／true 旗標仍為觀測，不變成個人存取判斷。

原身份 dossier fingerprint 與嵌入的兩身份／兩來源逐欄一致，重用原身份驗證；地址公式的完整 v1 定義與確切 record／field 依賴須等於方法定義，只執行受限 casefold EVM address 比較。差異回報 0，缺少回報地址傳播 null／unknown；不允許任意 YAML 求值。所有 access 欄位仍 null／unverified。matching replacement digest 仍不能繞過來源、型別、時間、原依賴或公式／版本檢查；這不是平台內部真實狀態或個人資格認證。

[目錄 v5](../spec/research-catalog.yaml)以原 bytes SHA-256 與已存事件 `uni-xlm-public-venue-state-20261005` 綁定共用 reader；原審查 UTC `2026-10-05T00:13:08.875Z`、六個來源版本與原取得時間不變。`GET /api/research?mode=production` 保留 26 OBSERVED／一 DERIVED、原欄位、HTTP JSON、身份依賴及公式 v1；全目錄九份／185 紀錄／28 研究來源，已存事件仍十五筆。原身份依賴在既有身份目錄中可解析，不重複增加觀測。所有資料仍在研究層，沒有補進 canonical 金融輸入。

中文研究卡片分開顯示 typed 原值／研究值、單位／分類／confidence／各次收到時間，以及 DERIVED 旗標與兩依賴。五項未知存取權限獨立列出；兩表格各有鍵盤焦點與左右捲動提示，原 HTTP／身份／完整公式另可展開。時效表也有逐欄中文 label，保留 machine ID、原日期與 point 期間。

`GET /api/freshness?mode=production&as_of=2026-10-04` 不得取得 10 月 5 日審查／25 個已知新欄位；10 月 5 日才可用。XLM null 在兩 cutoff 均 UNKNOWN_DATA／INSUFFICIENT，DERIVED 均 NOT_OBSERVED／INSUFFICIENT，不提升成事實。Fixture 不含正式研究／事件／研究時效，兩 API 拒絕 POST。

56 項 reader／CLI 回歸、七項目錄／時效／API 回歸、兩項中文表格回歸，共 65 項新增。涵蓋 matching hash 下的 semantic 拒絕、合法差異／null 比較、完整依賴解析、原 bytes／review／事件綁定、截止日、損壞拒絕／不寫入與 Fixture 隔離。`npm test` 全套 765 通過，`npm run validate`／`npm run validate -- --production` 無 errors／warnings，84 指標／25 公式，unknown 1／80；原來源／金融／公式／假設／情境／論點、十五正式／三 Fixture 歷史與 model 截止日不改，三項 SECZ TTM null／UNI 原名目率 stale／0.422 保留。

Chrome 可用，URL `http://127.0.0.1:4310/?mode=production#research`；CSS 桌面 1536×729、窄 312×675。驗收流程：Enter 卡片／HTTP JSON → 窄版兩表格各 ArrowRight → Fixture 清空／正式恢復 → 時效入口填 10 月 4／5 日並手動查詢、Enter 審查列。locator 使用 `[data-research="uni-xlm-public-venue-20261005"] > summary`、內層 `details > summary`、兩個 aria-label 表格、`#freshness-report article > details:first-of-type > summary`。

| 實際檢查 | 結果 |
| --- | --- |
| 頁面身分、非空白、九研究／十五事件、無錯誤覆蓋 | 通過 |
| 26 typed 值／各次時間、XLM 空 raw／未知、比較 v1／兩依賴、六安全來源 | 通過 |
| Enter 展開卡片與原 HTTP JSON | 通過 |
| 窄版兩表格各 scrollLeft 0→32；卡片 clientWidth=scrollWidth=266 | 通過 |
| 窄頁面無水平溢出；五項權限未知 | 通過 |
| Fixture 0／0 → 正式 9／15 | 通過 |
| 10 月 4 日 NOT_AVAILABLE／5 日 AVAILABLE 實際審查列 | 通過 |
| console error／warn、server stderr | 空 |

10 月 5 日審查列驗收時瀏覽器連線中斷，重新連接同 Chrome 並補驗通過，未修改金融或 App 來處理連線。兩次驗收服務 PID 26228／22668 已核對命令並停止，尺寸還原。截圖在 TEMP `public-venue-research-desktop.png`／`public-venue-research-mobile.png`；未驗證其他瀏覽器或真實手機。同步估值／全年 capture／託管與個人存取、SECZ 可比 TTM 及完整 baseline 仍待查證。

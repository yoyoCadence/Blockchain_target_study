# 開發交接

## 2026-10-04 — 中文已保存事件查閱

PR #44 的 push／PR／合併後 main CI 均成功（main `1cd4654`）；從最新 origin/main 建立 `feat/reviewed-event-inspection`，開始時工作區乾淨、單一 worktree 且遠端同步。依使用優先與持續中文 PR／驗證後合併授權，讓已保存 UNI／SECZ 人工事件可直接從既有研究頁閱讀。

研究 API 在原六份固定 review 外另傳八筆已審查事件，重用快照 hash／版本連續性、目前資料與最新歷史一致性及事件證據／review／範圍驗證；journal 一致性仍由原 project load 核對。每筆使用當時快照的來源版本，不讀取外部網路或套用事件。中文卡片保留原始理由／審查者、原始 raw 整數、四種日期、保存時間及完整 JSON；完成狀態僅描述已保存範圍。

八項 engine／API 與三項 UI 回歸新增；相關 30 項、全套 npm test 562 項通過，0 失敗。兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。Chrome 實測桌面 CSS 1536×684／窄視窗 312×675（要求 390×844）、事件及原始 JSON 展開、Enter、來源連結、安全屬性、Fixture 清除，以及研究 503／延遲重試恢復八事件／六 review；84 指標與未套用利潤率 0.3 保留。正常服務與 shim 恢復後 error／warn 均為空清單，503 的中文局部錯誤有如實呈現。無整頁 overflow，截圖通過，viewport 已恢復，驗收程序核對後停止。

未修改金融資料／來源／公式／假設／政策／任何既存事件或快照；八份正式快照仍同一模型期間，不增加 thesis 期數，三項 TTM null 與父 baseline 保留。研究時效仍沿用原六份固定 review，沒有擴大時效政策或新增自動查詢。其他瀏覽器／全尺寸、外部來源真實性重認證、全部當前池配置、年度費用／burn、SECZ 可比性／六類收入、現行估值及個人投資管道未完成。詳見[操作與驗收](reviewed-event-inspection.md)；遠端 CI／PR 結果以實際結果為準。

## 2026-10-04 — UNI v2 單筆 LP 費用份額歸集

依持續開發／中文 PR／驗證後合併授權，從最新 origin/main `5a86ca5` 建立 `research/uni-v2-fee-accrual`；開始時 main／遠端一致、單一 worktree 且乾淨。選擇 baseline 的 UNI 捕獲查證子項，以單筆 TokenJar LP 鑄造與原始 Factory 建池 receipt 為明確驗收範圍。

人工逐項核對 2026-10-04 block 26118477／Transfer log 337 與 block 26118333／PairCreated log 413，保留 emitter、raw uint256 字串、UTC、完整地址與 caller LP 贖回順序；固定官方 Pair／ERC20 原始碼和 commit 日期獨立核對。新增 protocol_fee_accrual 手動事件類型，沿用原驗證／重算，追加四來源及完整快照 `729d45b96a313aa128095c53c26d179d75621dc38002ab08ea0b873690ec7135`；parent／既存來源不改。

相關 17 項與日期 32 項、全套 551 項測試通過，0 失敗；兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。全套首輪暴露固定昨日時鐘被今日發布來源遮住；只隔離測試記憶體的未使用今日來源後重跑通過。兩個歷史數量檢查改成指定歷史位置／hash，以保留可合法追加的語意，沒有放寬金融或來源 guard。遠端 CI／PR 以實際結果為準；沒有 UI 修改或新增本機瀏覽器 QA。

LP 不是 UNI，caller underlying 贖回不是 TokenJar 收入；Similar Match 不宣稱部署等價，reserve-product 成長未完成純費用來源歸因。未補年度費用／burn／淨收益、2025-12-29 Firepit 資產來源、跨鏈／全部池現況或估值。八份正式快照仍同一模型期間，金融與三項 TTM null／父 baseline 保留。見[查證與限制](uni-v2-fee-accrual.md)；下一個可獨立工作是讓已存 UNI 事件及證據可從中文研究頁查閱，另仍須查證財務可比性、估值與個人投資管道。

## 2026-10-04 — 研究證據單獨重試

PR #42 的 push／PR／合併後 main CI 均成功（main `2e690df`）；從最新 origin/main 建立 `fix/research-load-retry`，開始時 main／遠端同步、單一 worktree 且工作區乾淨。接續入門的必要恢復流程，不新增金融模型／自動化。

實測只讓研究 API 503，金融 84 指標正常但研究無重試入口；工作區完整重載會丟棄未套用輸入。新增中文研究重試只讀取當前研究，不影響金融／時效或試算輸入；匹配 mode 才呈現，只有最新請求可解除 busy／隱藏重試，舊成功與失敗都不覆蓋最新結果。

四項新增回歸與原 13 項狀態／網址回歸通過，使用實際六份研究 API 輸出；兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。Chrome 實測研究 503、輸入 0.3 未套用利潤率、Enter／延遲重試恢復六份研究，84 指標與輸入保留；桌面 CSS 1536×684／窄視窗 312×675，Fixture 重試仍不混入正式研究，無整頁 overflow／console error-warn，截圖及互動通過、viewport 已恢復。

全套 npm test 547 通過、0 失敗。engine／spec／來源／資料／公式／假設／政策／快照不改；83 個金融未知、三項 TTM null 與父 baseline 保留。遠端 CI／PR 狀態以本次實際結果為準；其他瀏覽器／全尺寸／永不回應網路逾時未驗證，不自動重試。詳見[驗收與限制](research-retry.md)，後續仍需現行股本／估值／個人投資性及可比金融 baseline。

## 2026-10-04 — 中文開始使用與手動啟動

PR #41 的 push／PR／合併後 main CI 均成功（main `2c90238`）；從最新 origin/main 建立 `feat/chinese-getting-started`，開始時 main／遠端同步、單一 worktree 且工作區乾淨。依使用優先授權完善既有 MVP 入口，不把未完成金融 baseline 包裝成已可估值。

新增三個中文用途入口與導航，分別連到明示模式的研究／合成敏感度／手動時效。首次網址決定請求與選單，切換也更新網址並保留 anchor／其他 query；無效、空或重複模式停止載入，等待明確選擇，不悄悄回到 Fixture。Windows 手動啟動 wrapper 核對 Node 與依賴，再啟動原 server.js，只監聽 loopback；沒有自動安裝、網路採集或金融套用。README 修正股本目錄及 refresh 流程的過時說明。

五項新增網址回歸及原八項載入回歸通過。實際 Unicode 路徑的 launcher preflight、缺依賴中文／exit 1 及正常 4310 服務通過。初次 UTF-8 batch／行尾解析不穩定，改為 ASCII wrapper、固定 CRLF 與 Node 中文輸出後重新實測，中文完整／stderr 空。Chrome 三個入口、Production 六份研究／Fixture 隔離、情境重算／還原 0.422、手動時效不自動查詢、無效模式與 URL 恢復通過；桌面 CSS 1536×684／窄視窗 312×675（要求 390×844）無整頁溢出，Enter 入口／console 空清單／截圖通過，viewport 已恢復。

全套 npm test 543 通過、0 失敗；兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。engine／spec／來源／資料／公式／假設／政策／快照不改；83 個金融未知與三項 TTM null 保留。遠端 CI／PR 狀態以實際結果為準；其他瀏覽器／全尺寸、所有 Node minor 與未裝 Node／檔案總管雙擊尚未驗證。詳見[操作與驗收](getting-started.md)，完整父 baseline 仍待現行股本／估值／投資性等研究。

## 2026-10-04 — 工作區載入隔離與中文重試

PR #40 的 push／PR／合併後 main CI 均成功（main `8a99a34`）。使用者新增「能開始使用優先，保留必要防線」授權；從最新 origin/main 建立 `fix/workspace-load-isolation`，開始時 main／遠端同步、單一 worktree 且工作區乾淨。選擇既有 MVP 工作區使用問題，不擴大自動化或金融模型。

Chrome 模擬 Production API 失敗重現：選單已切正式資料，84 張 Fixture 卡片仍保留，失敗後還可計算。切換現在立即清空全部舊金融呈現／情境輸入／血緣；載入失敗保持停用並提供中文基準重試，回應須符合模式與 Fixture flag。原請求 revision 防線保留，舊成功／失敗不能覆蓋最新選擇；同工作區情境重算失敗仍保留上一個成功結果並明示新輸入未套用。

八項真實 app／API 輸出回歸通過；全套 npm test 538 通過、0 失敗；兩模式 validate 84 指標／25 公式／0 錯誤與警告，unknown 1／83。Chrome 實測延遲／503、立即清空、滑鼠及 Enter 重試、快速切換／晚到回應、84 正式卡片／六份研究及 Fixture 隔離；桌面 CSS 1536×684／窄視窗 312×675（要求 390×844）無整頁溢出。身份／非空白／無錯誤畫面／console error-warn 空清單與截圖通過，viewport 已復原；TEMP 測試 shim 首次 BOM 問題修正後重跑，未修改 app 以規避。

engine／spec／來源／資料／公式／假設／政策／快照不變，83 個金融未知與三項 TTM null 保留；不把使用防線視為父 baseline 完成。截圖及模擬伺服器在 TEMP，完整驗收與未驗證項目見[載入與重試](workspace-loading.md)；遠端 CI／PR 狀態以實際結果為準。下一項可獨立完善中文使用入口，仍需現在股本／估值／個人投資性等研究。

## 2026-10-04 — 固定研究目錄假設版本一致性

PR #39 的 push／PR／合併後 main CI 均成功（main `4d07b21`）；從最新 origin/main 建立 `fix/research-assumption-version-consistency`，開始時工作目錄乾淨、單一 worktree／遠端一致。接續原假設改動需升版原則在固定研究集合的載入缺口，未擴充模型或自動化。

隔離目錄重現：同一可比性假設 ID／版本的理由、信心或 acquisition_treatment 判斷可改寫，兩入口仍接受，且原 TTM 結果完全相同、三項仍 null；也可重用 canonical 假設 ID／版本另定可比性。共用入口先保留 canonical ASSUMPTION 指紋，再檢查研究可比性完整定義；合法新舊版並存及正反目錄順序保留，分類不提升為觀測。

十項新增回歸與相關 54 項通過；全套 npm test 530 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，unknown 1／83。理由／信心／判斷／canonical 衝突拒絕，合法升版保留原兩份歷史、來源／分類／null，真實六份研究／金融／全部歷史與 Fixture 隔離通過。

未修改原假設／公式／政策、來源、資料、研究目錄、artifact、事件、快照或 UI，沒有新增瀏覽器 QA。這是集合內版本指紋，非完整修訂沿革或政策歷史監控；83 個金融未知、三項正式 TTM null、股本未解分類與估值／個人投資性等原缺口保留，父 baseline 未完成。詳見[重現與驗證](research-assumption-version-consistency.md)，遠端 CI／PR 狀態以實際結果為準。

## 2026-10-04 — 固定研究目錄公式版本一致性

PR #38 的 push／PR／合併後 main CI 均成功（main `666b24d`）；從最新 origin/main 建立 `fix/research-formula-version-consistency`，開始時工作目錄乾淨、單一 worktree／遠端一致。接續原公式版本約束在固定研究集合的載入缺口，未擴充金融模型或自動化。

隔離資料包重現：同一 YoY v1 的 expression 改寫產生不同值，或改 null_policy，重新 hash／重播後原 inspection／freshness 都接受；單份 TTM 的兩份嵌入收入研究亦可藏同公式版本不同定義。共用入口現在以 ID／版本釘選完整公式指紋，覆蓋 canonical registry、收入／股本與 TTM 本體／兩份嵌入研究。不同版本可並存，目錄順序不被當成最新版本時間序列；各 reader 仍使用保存定義。

八項新增回歸及相關 44 項通過；全套 npm test 520 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，unknown 1／83。合法升版正反順序、同版本式子／null policy 衝突、嵌入 TTM、真實六份研究／金融／全部歷史重播通過。

未改原公式定義、假設／政策、資料、研究目錄、artifact、來源、事件、快照或 UI，沒有新增瀏覽器 QA。這是載入集合內的版本指紋，非完整修訂沿革或來源認證；83 個金融未知、三項正式 TTM null 與股本／估值／個人投資性缺口保留，父 baseline 未完成。詳見[重現與驗證](research-formula-version-consistency.md)，遠端 CI／PR 狀態以實際結果為準。

## 2026-10-04 — 共用研究證據 ID 一致性

PR #37 的 push／PR／合併後 main CI 均成功（main `b7dc54a`）；從最新 origin/main 建立 `fix/research-evidence-id-consistency`，開始時工作目錄乾淨、單一 worktree／遠端一致。接續 baseline 的證據版本防線，未擴充模型或自動化。

隔離目錄重現：有效 hash 的研究讓一般 inspection 接受跨資料包來源／觀測同 ID 改寫與 canonical 來源衝突；既有時效入口已拒絕這三種情況。兩入口都容許研究紀錄重用金融輸入 ID。原時效 guard 集中到共用 inspection，先以完整 canonical 來源／輸入歷史建立指紋，再核對研究來源及原紀錄／解析期間／報表 context；相同證據重用及明確新來源版本／獨立紀錄仍合法，時效移除重複 guard。

13 新增回歸通過，含兩個唯讀 API 對有效 hash 的來源／紀錄／金融 ID 衝突回應 400、檔案 bytes 保留及 Fixture 隔離。全套 npm test 512 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，unknown 1／83。初次正向測試使用身份 schema 不支援的 supersedes 欄位，被 schema 正確拒絕；測試改用該類別支援的獨立新紀錄 ID，未放寬 schema 或修改真實資料。

六份研究／145 紀錄／20 來源與原金融／論點／全部歷史不改；沒有 UI 修改或新增瀏覽器 QA。此項是載入集合內的證據指紋一致性，不替代外部儲存／一手內文／完整修訂沿革查證。83 個金融未知、三項 TTM null、股本未解差異與估值／個人投資性等缺口保留，父 baseline 未完成。詳見[驗證與限制](research-evidence-id-consistency.md)，遠端 CI／PR 狀態以實際結果為準。

## 2026-10-04 — 股本研究目錄、API 與中文 Dashboard

PR #36 的 push／PR／合併後 main CI 均成功（main `a8483cb`）；從最新 origin/main 建立 `feat/capital-research-inspection`，開始時工作目錄乾淨、單一 worktree／遠端一致。依最高優先 baseline 子項接續，把上一項共用股本重播入口用於固定目錄與唯讀呈現。

目錄升至 v2 只追加原股本 hash，原五份條目保留。研究 API／Dashboard 呈現 108 個 OBSERVED／7 個 DERIVED、原來源版本／point 日期／context／未解分類／完整原文；中文核對與原始 115 紀錄分開展開。既有時效讀取此目錄，六份／145 紀錄／20 來源，保留 point 與知識日、九個未知及非觀測推導；10/3 尚不可用的 review 與 10/4 可用分開，政策／公式版本不改。

六項新增回歸與既有目錄／API／時效共 42 項通過；全套 499 通過、0 失敗，兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，unknown 1／83。Chrome 實際桌面 1524×729／窄 CSS 視窗 300×675（viewport 要求 390×844）檢查七項摘要、115 列／九個未知、完整 hash／108 觀測／七公式／50 個首項依賴／兩來源 supersession，手動截止日前後、改日期清空及 Fixture 隔離通過；頁面非空白、無錯誤畫面／主控台 error／warn、無整頁溢出、表格可橫向捲動。Browser 連線曾逾時但恢復後完成，暫時 viewport 已復原；截圖保留 TEMP，未加入儲存庫。詳見[操作與驗收](capital-research-inspection.md)。

金融／來源／原 artifact／事件／七份同模型期快照保留；83 個未知與三項正式 TTM null 不改。現在及完全稀釋股本、961,384 差額原因、現在估值與個人投資性、SECZ 法律名稱／六類收入及 UNI 全期間捕獲仍未查證，父 baseline 未完成。遠端 CI／PR 狀態以實際結果為準。

## 2026-10-04 — 股本研究手動唯讀驗證

PR #35 已合併（main `ca3ffa5`），push／PR／合併後 main CI 均成功。從最新 origin/main 建立 `feat/manual-capital-review`，開始時工作目錄乾淨，單一 worktree／遠端一致。使用者已授權逐項中文 PR、驗證成功後合併並繼續，未擴充自動化或金融模型。

共用 `replayCapitalReview` 與 v1 schema 校驗先前 artifact 的原始表格、來源 coverage／supersession、UTC 日期／review、point count／安全整數／confidence、分類與 Fixture 排除、七條受限 AST 類別算術／嵌入版本／確切依賴／結果。CLI `capital-review FILE --production` 唯讀輸出繁體中文摘要及完整原文；九個破折號保留 null，選取的未知向下游傳播，signed 調節差額合法。未修改已保存 artifact、來源、事件、快照、25 金融公式或論點。

36 新增回歸與既存轉售研究共 41 項通過；全套 npm test 493 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，unknown 1／83。重新計算 hash 的錯誤證據仍拒絕；合法時區／新嵌入版本／null、CLI bytes 不變、金融／歷史重播通過。沒有 UI 修改。遠端 CI／PR 狀態以實際結果為準。

驗證不重新認證原始 SEC 全文／人工簽核，也不建立現在或完全稀釋股本。下一子項可把此共享入口接入 hash-pinned 研究目錄及 API；尚未在本次完成。Sponsor 重疊、961,384 差額、83 個金融未知、三項正式 TTM null、現在估值及個人投資性仍保留，父 baseline 未完成。詳見[操作與限制](manual-capital-review.md)。

## 2026-10-04 — SECZ 轉售登記分類核對

使用者再次授權持續完成。從最新 origin/main `a06d629` 建立 `research/secz-resale-capital-reconciliation`；開始時 main／遠端一致、工作目錄乾淨，單一 worktree 與遠端確認。接續最高優先 baseline 的估值前股本分類子項，未擴充金融模型或自動化。

web reader 對 S-1／424B3 仍回應大於 4 MiB；既有 Chrome 連線此次可用，直接讀取 S-1 第 15 頁、第 49 頁及第 129–135 頁中選定 50 列股數／第 7、8 註腳。舊 indexed-only 證據及限制不改，本次保存新直接閱讀 source。common／earnout 數值合計對上申報費表／Exhibit 5.1；Sponsor 1.8M 已發行條件股重疊及排除後與公司 earnout 上限的 961,384 差額保留，未推導目前股本或判定法律錯誤。

獨立研究 artifact `f3bce741...` 嵌入 108 個 OBSERVED／原始表格、9 個 null、7 條 v1 DERIVED 算術公式與確切依賴、來源版本及未解分類。既有 event source-only review hash 綁定此檔案，追加兩份新 v1 與兩份明示 supersedes 的 coverage v2；唯讀 preparation 確認金融及 journal bytes 不變後，以 CLI exclusive-create 完整 snapshot `0abb51bb...`（parent `ef433299...`）。原六份 hash／來源版本與金融／圖譜／假設／論點全部保留；七份同模型期不增加 thesis 期間。

驗證：5 新增回歸，與既存股本／權證共 13 項通過；全套 npm test 457 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤與警告，未知 1／83。來源 schema／日期／coverage、原始破折號、公式 replay／完整遞迴依賴、null 傳播、journal 綁定與版本保留、全部金融／論點／歷史重播及 Fixture 隔離通過。提交前研究草稿一項跨 filing 知識日被日期回歸拒絕，已改為最晚引用來源 8/13，重算草稿 hash 再通過，才追加正式事件；未改既存歷史。Node 測試 sandbox spawn EPERM 以同一授權命令的正常子程序權限執行。

新增紀錄繁體中文、原持有人名稱／機器代碼保留；未改 engine／spec／UI 或做新的 UI QA。股本 artifact 目前未在固定研究 catalog 顯示，可由報告閱覽及測試重播。完整更正／分配、現在股本／價格／現金負債、SECZ 法律名稱／TTM／六類收入、個人司法管轄區／券商與 UNI 全期間捕獲仍待查證，父 baseline 未完成。詳見[分類研究](secz-resale-capital-reconciliation.md)，遠端 CI／PR 狀態以實際結果為準。

## 2026-10-04 — CI 執行環境維護

PR #33 的 push／PR／合併後 main CI 均通過（main `5aa705f`）。最新 main job 實際 runner 2.337.0／Ubuntu 24.04，平台另提示 v4 actions 的 Node 20 runtime 淘汰與 ubuntu-latest 將換版；不是測試失敗。`chore/current-ci-actions` 從最新 origin/main 建立，開始時工作目錄乾淨，單一 worktree 與遠端確認。

查閱官方 checkout／setup-node README 與 v7 action.yml，確認兩者使用 Node 24；目前 runner 高於官方最低需求。既有兩個 action 更新至 v7，runner label 固定目前 ubuntu-24.04。原 Node 24、npm cache、push／pull_request、contents: read 及四個安裝／驗證步驟保留，未新增 job／排程／通知或業務自動化。官方來源：[checkout](https://github.com/actions/checkout)、[setup-node](https://github.com/actions/setup-node)、[runner 換版公告](https://github.com/actions/runner-images/issues/14748)。

本機 npm test 452 通過、0 失敗；兩模式 validate 84 指標／25 公式／0 錯誤與警告，未知 1／83。YAML 解析、既有步驟與權限核對、diff 檢查通過。實際 action／cache 相容性與平台 annotation 是否消除，以 push／PR／main CI 結果為準；未將本機測試當遠端環境證明。

未修改 engine／金融／來源／快照／介面／CLI，未新增鏡像配置測試或 UI QA。固定 OS 版本仍會接收 hosted image 更新，v7 major tag 亦隨上游修正；不是全環境鎖定。正式 baseline 的原未知／TTM null 與資料缺口保留。

## 2026-10-04 — 相鄰快照版本連續性

PR #32 的 push／PR／合併後 main CI 均通過（main `9077aaf`）。`fix/snapshot-version-continuity` 從最新 origin/main 建立，開始時工作目錄乾淨，單一 worktree 與遠端確認。選擇 baseline 的保存歷史版本缺口：暫存副本中後一快照同 ID 改寫舊 publisher、重算 hash 並維持 parent，既有 assertVersionHistory 拒絕但原 readSnapshots 接受。

歷史讀取在 hash／parent／單一路徑檢查後，逐對相鄰快照重用既有 assertVersionHistory。舊來源／輸入須原封保留，公式／論點規則不能刪除、退版或未升版改寫；合法追加與升版保留，版本規則本身不改。

20 新增回歸與既存血緣共 26 項通過；全套 npm test 452 通過、0 失敗，兩模式 validate 84 指標／25 公式／0 錯誤與警告，未知 1／83，diff 檢查通過。API 即使目前資料與最新快照吻合，仍會因較早來源被改寫而 400；檔案 bytes 不變。真實金融／論點重播與全部歷史 hash 保留，未修改 spec／data／sources／介面／CLI，未新增 UI QA。

本項是內部版本連續性，非外部不可變儲存、來源真實性認證或全部快照 schema／商業規則重播。六份正式快照仍同模型期間，83 個金融未知與三項 TTM null、SECZ 登記／現況股本／法律名稱／估值與 UNI 全期間捕獲等原缺口保留，父 baseline 未完成。詳見[相鄰版本驗證](snapshot-version-continuity.md)，CI／合併狀態以 PR 實際結果為準。

## 2026-10-04 — 繁體中文 CLI 論點報告

PR #31 的兩組 CI 通過後合併（`6122cb8`）。`feat/traditional-chinese-thesis-report` 從最新 origin/main 建立，工作目錄乾淨，單一 worktree 與遠端確認。接續使用者中文版要求，限定修正 CLI report 的呈現文字。

報告沿用既有 dashboard/zh-hant.js 的純呈現詞彙；中文化工作區、模型期間、狀態／代碼、證據覆蓋與解釋，保留每個觸發規則 ID 與標示為原文的說明。保留合成資料標記，HEALTHY 且證據不足時仍明示不能據此認定健康。報告維持原路徑及模式選擇；已存示範報告重生為中文，原 2025-12-31 期間及 XLM WATCH 不變。

在暫存目錄實際執行 Fixture／Production CLI report，逐項與引擎的期間、狀態、證據覆蓋、解釋及全部觸發規則核對，兩模式歷史 hash 完全一致。完整 npm test 432 通過、0 失敗，兩模式 validate 84 指標／25 公式／0 錯誤與警告，未知 1／83；diff 檢查通過。本項是文字呈現，未新增重複字串測試或 UI QA，未修改 Dashboard／engine／spec／data／sources／快照。遠端 CI／合併狀態以 PR 實際結果為準。

原始觸發規則原文不翻寫，機器 JSON 欄位／代碼保留。正式三項 TTM null、六份同模型期快照、83 個金融未知與父 baseline 缺口仍在；本項不新增金融結論或投資訊號。

## 2026-10-04 — 已存事件節點範圍

PR #30 的 push／PR CI 均通過後合併（`22c27a8`）。`fix/saved-event-scope` 從最新 origin/main 建立，開始時工作目錄乾淨，單一 worktree 與遠端確認。選擇手動研究流程的已存事件範圍一致性修正：暫存副本中不存在節點被 preparation 拒絕，但同步 event／snapshot 並重算 hash 後 load 接受，修正前兩模式回歸均失敗。

新事件與已存事件共用登記節點、有效圖譜端點及可到達更新資產檢查。保存的傳播集合須完整、型別正確且不重複；順序不影響判定。載入時用各快照自身資產／圖譜，先檢查既有 schema／唯一 ID／端點，避免目前圖譜新增依賴改寫歷史範圍。原 affectedNodes 匯出與傳播算法保留，不將可到達當作經濟傳輸已驗證。

21 新增回歸與既存事件／血緣共 63 項通過，完整測試與兩模式結果見[驗證](validation.md)。API 400 不改 journal bytes，失敗 apply 不追加；真實金融／論點及兩模式全部歷史 hash 保留。正式 spec／data／sources／介面無變更，未新增 UI QA；六份正式快照仍同模型期間，83 個金融未知與三項 TTM null 保留。

本項不是全部已存商業規則重播或外部真實性認證。SECZ 完整登記／現況股本／法律名稱／TTM／估值、個人管道與 UNI 全期間捕獲仍待查證，父 baseline 未完成。詳見[事件範圍](event-scope.md)，遠端 CI／合併狀態以 PR 實際結果為準。

## 2026-10-04 — SECZ 母公司認股權證歷史條款

PR #29 的兩組 CI 通過後依既有授權合併（`d3d8da9`），繁體中文介面已在 main。`research/secz-warrant-context` 從最新 origin/main 建立，開始時工作目錄乾淨，單一 worktree 與遠端確認。優先接續 baseline 同步估值前的歷史股本核對。

完整 S-1 登記表格／註腳仍受阻：網頁讀取器大小限制、Browser 連線逾時、直接官方下載受到 SEC 自動工具存取限制，未宣稱已核對或清除 6,250,000／7,088,616 差異。可獨立閱讀的 Exhibit 4.1 承接／修訂及原契約選定歸屬／行使條款已完成，保留母公司／舊子公司、歸屬／行使／earnout 的區分。新敘述、來源名稱與交接使用繁體中文。

唯讀準備確認 source change only 與 history bytes 不變，再以既有手動 CLI 追加一份來源及完整快照 `ef433299247e234de2a89d0b151b5be7bb35a5a4439b74e133b65385e9dc6c23`，parent `ba6d00d...`。金融／圖譜／估值／假設／公式／論點不變；原五份快照與來源版本保留，六份同模型期間不能補連續期證據，83 個金融未知與三個正式 TTM null 保留。

驗證：新增四項回歸及既存股本回歸合計八項通過；全套 `npm test` 411 通過、0 失敗，兩模式 validate 84 指標／25 公式／0 錯誤與警告，未知 1／83。diff 檢查通過，engine／spec／Dashboard 無變更，沒有新 UI QA；先前中文介面 QA 保留。CI 與合併狀態以 PR 實際結果為準。

父 baseline 未完成：完整登記類別調節、現行權利履行／母公司股數、同步價格／合併後現金負債、SECZ 法律名稱與 TTM／六類收入／FCF、個人管道及 UNI 全期間捕獲仍待驗證。詳見[認股權證條款](secz-warrant-context.md)。

## 2026-10-04 — 繁體中文介面

PR #28 的 push／PR／合併後 CI 均通過，已合併（`b49c83b`）。使用者再次授權持續完成，並要求中文版；本項優先補齊 MVP 呈現層。`feat/traditional-chinese-dashboard` 從最新 origin/main 建立，開始時工作目錄乾淨，單一 worktree 與 GitHub 遠端確認。

導航、標題、按鈕、狀態、84 個指標、單位、期間、血緣、研究／時效／版本變更皆中文化，使用 zh-TW 數字格式。新增 dashboard/zh-hant.js 僅包含顯示名稱與文字映射；伺服器 allowlist 送出該模組。四種分類與五種論點代碼保留，原始來源／規則／假設理由與完整 JSON 不翻寫；未知代碼保留原文。金融公式、數字、門檻、engine／spec／data／快照未改。證據不足的中文警語仍與 HEALTHY 狀態分開，沒有買賣訊號。

實際 Browser 驗證網址 http://127.0.0.1:4831/：桌面 CSS 1536×729、手機 CSS 390×844（另測更窄 312×675），scrollWidth 均不超過 innerWidth。核對標題／內容、無框架錯誤遮罩、無應用 console error/warn；中文血緣保留紀錄 ID／分類／公式 AST，UNI 情境費率 0.0002 由 API 重算顯示 26.375%，還原 42.2%。正式資料切換、三項 TTM 未知與收購可比性未確認、目前／歷史時效、未來日中文錯誤／清空／重試、Enter 查詢均通過。從 DOM 取得的完整 TTM JSON 與原檔、時效 JSON 與同 cutoff API 完全一致；84 個中文名稱完整覆蓋 dictionary。

Browser 可使用，未切 Playwright。一次 CUA 捲動命令逾時；使用文件支援的正常導航與新驗證 tab 收尾，最終手機／來源時效截圖已核對，未將舊畫面當新結果。圖片與原始 QA 檔案保留系統 temp/blockchain-zh-qa29，未提交。暫時 viewport 已重設，QA tabs 關閉；核對 port owner 8880 的 node server.js 後停止，確認無 listener／process。

驗證：最終 npm test 407 passed、0 failed，兩模式 validate 84 metrics／25 formulas／0 errors/warnings，未知 1／83；syntax／diff checks 通過。既有 API 測試增查中文模組路由與 MIME；初次 406 passed、1 failed 是新檢查誤寫 application/javascript，已對齊專案原有 text/javascript，產品模組原本正常送出。遠端 CI／合併狀態以 PR 實際結果為準。尚未測 Firefox／Safari 或所有手機寬度；正式 baseline、五份同期間快照／TTM null 與原缺口仍保留，子項完成不代表 baseline 完成。

## 2026-10-04 — SECZ 母公司歷史股本範圍

PR #27 push／PR CI 全部通過，已 match-head 合併（`f00b0d9`）。`research/secz-parent-capital-context` 從最新 origin/main 建立，原工作目錄乾淨；收尾前再次 fetch 確認 main 未變。選擇首項 baseline 同步估值前可獨立查證的母公司股本 context，限定 dated source-only evidence。

保存母公司 10-Q cover／explanatory note／合併前 balance sheet／Note 5、S-1 Exhibit 5.1 與兩個 SEC indices，另保留未完整核對的 S-1 indexed offering-table 衝突。區分 dated issued 股數、已包含的 sponsor restrictions、conditional earnout、plan reserve、warrant／option／RSU 與 resale registration。保留 7/30 acceptance／opinion 與 7/31 filing 日期、6,250,000／7,088,616 類別未調節及 indexed 314,834,209 的閱讀限制，不選成現在／FDV denominator。沒有使用 pre-closing USD 1 cash／10,000 shares 估算 combined parent。

既有 governance source-only event 追加五份來源版本及完整 snapshot `ba6d00d12f57a40fb017ffdf6e0b473d05b9e1e60f2abf6c23acf55b46037f49`，前四個 hash 原封保留；五份同模型期不是五期證據。知識日／review 為 UTC 10/3，開發交接日期為台北 10/4。金融／假設／formula／graph／market valuation／thesis 全部相同，83 unknown 與三個 formal TTM null 保留，catalog 不新增股本模型。

四項新增資料綁定／版本／重播／null／Fixture 回歸通過。初次全套 391 passed、16 failed：舊 clock probes 固定 10/3 中午，新增下午 source retrieval 在該人工時鐘下合法被拒；僅將測試記憶體 baseline 的無關 retrieval 限在測試時鐘內，沒有改真實來源、正式 guard 或已存 event。36 targeted tests 重新通過；最終全套／兩模式結果見 [validation](validation.md)，遠端 CI／合併狀態以 PR 實際結果為準。無 UI 修改或新瀏覽器 QA。

完整 baseline 未完成：current share movements／同步價格／post-close consolidated cash-debt、登記與 earnout 類別調節、SECZ legal naming／TTM／六類收入／FCF、個人管道與 UNI fee-origin／全期間 capture 仍待查證。S-1 全文超過 web reader 大小限制，只保留 indexed excerpt 的未驗證範圍；沒有以律師 opinion 替代獨立法律確認。本輪依「告一段落就停」指示在此子項 PR 流程後收尾，不接續下一項。詳見 [股本 context](secz-parent-capital-context.md)。

## 2026-10-03 — 已存更新知識日／DTCC 狀態

PR #26 push／PR CI 全部通過，已 match-head 合併（`23aff08`）。`fix/saved-event-update-knowledge` 從最新 origin/main 建立，原工作目錄乾淨。已在 temp 副本重現 event as-of 1/1 可包含 observation as-of 10/3，matching/recomputed hash 仍可载入；選擇 baseline 的歷史知識／planned 狀態一致性修正。

原 updates.as_of <= event.as_of 與 DTCC flags 1 必須 live/completed 兩規則移至 checkEventEvidence，準備與 saved canonical load 共用。Unknown OBSERVED／假設／情境同受知識日限制；同日觀測、future planned effective/not-live scenario、合法 live/completed 路徑保留。沒有新金融公式／thesis threshold 或真實 DTCC 完成認定。

驗證：403 tests passed、0 failed；46 targeted 通過；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。21 新增回歸含兩模式／known-null／classification、matching hash 及 API 400／bytes 不變、兩 DTCC flags／三種非 live 狀態、合法邊界与金融／thesis／history replay。Temp fixture publication 僅隔離知識探針，沒有正式 data／source／graph／formula／threshold／policy／history／UI 更新或额外瀏覽器 QA。遠端 CI 以 PR 實際結果為準。

不是全面 saved business-rule replay；來源內容、DTCC 真實上線與外部不可變性未由 metadata guard 證明。四份 production snapshots 同模型期，完整 baseline 與原未知項保留。詳見 [知識／狀態規則](event-update-knowledge.md)。

## 2026-10-03 — 已存研究主要來源驗證

PR #25 push／PR CI 全部通過，已 match-head 合併（`1321ab0`）。`fix/saved-research-primary-evidence` 從最新 origin/main 建立，原工作目錄乾淨。已在独立 temp 副本重現，budget research-refresh 的全部來源改成 Tier 3、同步 event／snapshot 並重算 hash 後仍可載入；選擇首項 baseline 所需的既有 primary guard 一致性修正。

共用 checkResearchEvidence，新 preparation／saved canonical loads 均檢查非空 OBSERVED、每筆至少 Tier 1／2、完整 event evidence 宣告及 observation publication cutoff。Schema、一般 event、review、preview digest／supersession 保留；generic completed tier <5 門檻不改，null 仍未知。

驗證：382 tests passed、0 failed；42 targeted 通過；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。14 新增回歸含 matching hash 的 Tier 3／4／null、假設／情境／空更新、未宣告證據，prepare／load 決策一致；合法 Tier 1／2／mixed primary／null／generic Tier 3、API 400／bytes 保留与 committed metrics／thesis／history replay。無正式來源分級／金融／policy／formula／history／UI 更新、無額外瀏覽器驗證；遠端 CI 以 PR 實際結果為準。

Metadata guard 不證明來源內文、簽章或所有 persistence rules 均已重播。四份 production snapshots 同模型期、83 unknown，父 baseline 與原未知項仍未完成。詳見 [主要來源驗證](saved-research-primary-evidence.md)。

## 2026-10-03 — Dashboard 手動來源時效

PR #24 的 push／PR CI 全部通過，已合併（`ed4d8b9`）。瀏覽器曾斷線；CLI 在正常網路確認 auth、精確 head／main base／非 Draft／兩 checks success，以 match-head 合併。`feat/manual-freshness-dashboard` 從最新 origin/main 建立，工作目錄乾淨；選擇已具 API 依賴的手動時效 UI 子項。

Dashboard 第 08 節提供明示 cutoff 查詢、canonical／research 原日期／age／unknown／review availability、policy／formula dependencies 完整報告。初次載入不查詢，workspace／日期變更清除結果，revision 隔離舊成功／錯誤回應；UI 無日期／門檻／金融計算。Fixture synthetic 與 Production 保持分離，敏感度亦不改這份 canonical 報告。

驗證：368 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83，JS syntax／diff checks 通過。Browser 多次斷線／逾時，依 Windows Playwright CLI 規則使用獨立 session 實際驗證 desktop 1280×720／mobile 390×844、Fixture／Production、historical／future／空白、API JSON 一致、刻意延遲的 workspace／date races、Enter 查詢。無 pageerror，手機 document width 390；console 僅既有 favicon 404 與預期 future cutoff 400。Screenshot 已檢查、QA session／已核對 owner 的 server 停止、logs 清理；暫存 QA artifacts 未提交。遠端 CI 以 PR 實際結果為準。

沒有金融／policy／formula／來源／觀察／graph／history 更新。Browser 原連線問題未修復，Firefox／Safari 與全部窄寬未驗證。四份 production snapshots 同模型期，父 baseline 與原未知項未完成。詳見 [Dashboard QA](freshness-dashboard.md)。

## 2026-10-03 — 已存事件證據驗證

PR #23 遠端 CI 全部通過後已合併（`fa5a660`）。`fix/saved-event-evidence` 從最新 origin/main 建立，原工作目錄乾淨。在獨立暫存 fixture journal 重現 future completed event 與 snapshot 一致／重算 hash 後仍可載入，選擇 baseline 所需的既有證據規則一致性修正。

共用 checkEventEvidence，在新事件 preparation 與 saved canonical load 的 schema／source validation 後检查 as-of、mode、declared source publication／存在、live/completed effective／可信證據及 planned/announced/cancelled 更新分類。原規則／訊息沿用；review chronology 仍保留。合法 future plan 與 retrospective retrieval 均有效。

驗證：368 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。15 新增回歸含兩模式、重新計算 hash 的無效 journal、日期／來源／mode／狀態、API 400／bytes 不變、合法計畫／回顧及金融／thesis／history replay。初次兩個 test-only source 日期設定已修正，44 targeted 與最終全套通過。無正式 data／source／snapshot／formula／threshold／UI 更新或瀏覽器 UI 驗證；遠端 CI 以 PR 實際結果為準。

此子項只共用現有證據檢查，不宣告所有 persistence business rules 已全面重播。四份 production snapshots 同模型期、83 unknown；SECZ legal naming／TTM／mapping、同步估值、個人管道與 UNI 全期間 capture 仍未完成。詳見 [已存事件證據](saved-event-evidence.md)。

## 2026-10-03 — 唯讀手動時效 API

PR #22 遠端 CI 全部通過後已合併（`486c4e6`）。`feat/read-only-freshness-api` 從最新 origin/main 建立，原工作目錄乾淨。選擇已具備依賴的手動時效分析 API 子項，限定 reuse 已完成 CLI 的 engine／policy／formula。

GET /api/freshness 支援 mode 與 optional as_of。默认 Fixture 只回 sourceFreshness 的 synthetic canonical 資料；Production 回 researchFreshness 的 canonical 與已 hash/replay catalog 報告。未指定 cutoff 使用當前 UTC 日；空／非法／未來日期與非法 mode 拒絕，所有寫入 methods 405。沿用 canonical load／version-history guards，金融計算／資料／snapshot／policy／formula versions 不變。

驗證：353 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。九 HTTP 回歸涵蓋與 engine 完整回應一致、Fixture 隔離、舊 budget／近期 retrieval 同時呈現、formal TTM null、歷史 cutoff、日期／mode／method 拒絕、現在 UTC default、反覆查詢後 inputs／sources／economics／thesis／policy／history hashes 保留。測試 servers 自動關閉；沒有 Dashboard 改動／瀏覽器 UI 驗證。遠端 CI 以 PR 實際結果為準。

此子項只新增手動查詢 API；Dashboard 時效操作尚未實作，亦無 scheduling／自動抓取。日期窗口不證明可投資性、經濟可比性或健康 thesis。四份 production snapshots 同一模型期；SECZ 名稱／TTM／六類 mapping、FCF／估值、個人管道與 UNI 全期間 capture 仍保留未知，父 baseline 未完成。詳見 [API](freshness-api.md)。

## 2026-10-03 — 共用手動事件 review 日期

PR #21 遠端 CI 全部通過後已合併（`db367ed`）。`fix/manual-event-review-dates` 從最新 origin/main 建立，原工作目錄乾淨。已在記憶體重現一般 acquisition source-only event 能接受 reviewed_at 2099；原日期規則只在 research-refresh 分支生效。

共用 checkEventReview，對有 research_review 的事件要求 reviewer／rationale 非空白、review <= 當前精確時間、review UTC 日 >= event as-of，以及全部 event.source_ids／新 sources 的 retrieval <= review。Prepare／apply 与 canonical saved journal loads 均使用，無 review 的一般手動 path 保留；mandatory research-refresh review／digest／primary OBSERVED 規則不變。原 timestamp文字不改，歴史晚取得後 review、planned future effective date 仍合法。

驗證：344 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。19 新增回歸涵蓋五種狀態、trim／UTC／offset／exact cutoffs、existing／未列入 evidence 的新增 sources、合法回顧與計畫、兩模式無 review path、failed apply 無寫入、重新計算 hash 的 direct journal loads／API 400、最新 metrics／thesis 與歷史 hash 保留。既有 refresh／digest 流程全套通過，無 UI 變更／額外瀏覽器驗證。遠端 CI 以 PR 實際結果為準。

沒有 financial AST／threshold／觀察／來源／graph 或已保存 journal 修改。四份 production snapshots 仍同模型期、83 unknown；原 SECZ acquisition_treatment 與 TTM null 保留。驗證 metadata 時序不代表來源內容、法律名稱、實際捕獲或個人投資性已查證；父 baseline 仍未完成。詳見 [review 日期](manual-event-review-dates.md)。

## 2026-10-03 — SECZ 收購範圍交叉查證

PR #20 遠端 CI 全部通過後已合併（`88b3db9`）。`research/secz-acquisition-context` 從最新 origin/main 建立，原工作目錄乾淨。回到首項 NEXT baseline 的 acquisition_treatment 阻擋，限定保存新增交叉證據而不自行清除名稱差異。

讀 SEC S-1 R30／R90、三份 filing indices、Chrome 所選 424B3 年度 Note 3／pro forma，及 interim Note 3／actual statement／Note 18。S-1 narrative 同時有 LLC／Inc.，allocation 的 MGStoverLLCMember 及三份披露的 4/15/2025／USD 對價與配置一致；這是財務 presentation 交叉證據，仍不是法律名稱等價的直接澄清。實際收入與收購 pro forma 另列，禁止替換／推定 organic growth。

以既有 acquisition source-only event 追加七份完整 sources 與 snapshot `325bb03d8d7b4b2d395623bd03f43da83a0311d363a08ca6e59f8f7b9255dca7`，parent 為原 Firepit snapshot `c242eeb...`。本事件是回顧歷史子公司收購披露，不是新母公司交易；空 updates，graph／registry／金融 inputs／metrics／thesis 不變。四份 production snapshots 仍同一模型期間。原 TTM request／comparability v1／artifact 原 hash 保留，三項 DERIVED null 不變。

驗證：325 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。四新增回歸涵蓋 dossier／journal／source dates/hash、source-only attribution、所有原 financial/history versions、完整 replay／同期間不能補期數、formal TTM null／actual-pro forma 不混用／fixture 隔離。無 UI 修改或 UI 驗證；原始來源 Chrome tab 已關閉。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。已新增 primary context，但 Inc./LLC 直接法律釐清與完整更正沿革仍缺；不能僅憑 XBRL 標籤修改 acquisition_treatment。未來新判斷另存新 request/version，不改寫本版 null。六類 mapping／FCF、同步母公司估值、個人管道與 UNI 全期間 capture 亦待驗證。詳見 [收購範圍](secz-acquisition-context.md)。

## 2026-10-03 — Thesis 條件指標自身期間

PR #19 遠端 CI 全部通過後已合併（`9c012bf`）。`fix/thesis-metric-periods` 從最新 origin/main 建立，原工作目錄乾淨。接續連續期證據前置驗證；在記憶體重現同一筆 2024 年指標放進 2025 snapshot 仍產生二期 WATCH／complete。

已知 condition metric 自身 endpoint 必須與 frame endpoint 相同，annual／quarterly／TTM flow basis 必須一致；同日 point／model 可保留原分類參與規則。錯位／缺失 period 的已知值仍保留 actual／record_id，另外列出 metric_period／period_aligned false，該規則 insufficient，不影響其他充分支持的 triggers／最高 severity。更新 test frame helpers 使原測試有明示 metric periods；沒有修改 fixture／production 的來源或財務觀察。

驗證：321 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。15 新增回歸涵蓋重複計數、basis 混用、支持／舊 point／model、缺 period、独立 STRESS／缺 BREAK、null、真實 canonical recalculation 的 unrelated later scenario date，以及最新 snapshots／formula versions 重播與 history hashes。最初針對性測試因沙箱 spawn EPERM 未執行；相同命令提權後 38 項通過，再跑全套成功。無 UI 修改，未另做瀏覽器驗證；遠端 CI 以 PR 實際結果為準。

本次保留金融 AST／版本、thesis thresholds、分類與已保存歷史；正常 committed output shape／thesis 一致，僅被拒絕的已知條件增加期間診斷。日期相符不提升 ASSUMPTION／SCENARIO 為事實，也不證明來源時效或經濟可比性。真實連續 production 期間及父 baseline 仍待查證。詳見 [條件期間](thesis-metric-periods.md)。

## 2026-10-03 — 會計期間端點對齊

PR #18 遠端 CI 全部通過後已合併（`bcb7fd4`）。`fix/calendar-period-alignment` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 可比期間／連續證據的獨立驗證子項；已在記憶體重現 2024-12-30 與 2025-12-31 被月份差判定為可比年度並觸發二期 WATCH。

共用 calendar helper 檢查合法 date-only 端點、月份差及同日／雙月末。年度／TTM 保留 12 個月、季度 3 個月，閏年與 30／31 日月末可對齊。prior growth 錯位會產生明確 ERROR／null 並阻擋 snapshot；thesis 錯位保留所有證據、標示 insufficient，不觸發該連續期規則，其他有足夠證據的規則與最高 severity 保留。

驗證：306 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。18 項新增回歸涵蓋日期／閏年／季度／年界、錯位與間隔、拒絕非法日期、重算錯誤／snapshot 屏障、獨立 WATCH 與 BREAK 缺證據、兩模式最新 snapshot 重播及原 history hash。無 UI 修改，未另做瀏覽器驗證。遠端 CI 以 PR 實際結果為準。

本次未改金融 formula AST／版本、人工 thresholds、資料與歷史，不新增 thesis 期數。52／53 週或其他可配置財務曆仍待明確支援；calendar 對齊不等於跨 filing 經濟可比。父 baseline 仍缺確認 TTM／六類映射、同步估值、個人投資管道與 UNI fee-origin／全期間 capture，保留 null。詳見 [期間驗證](calendar-period-alignment.md)。

## 2026-10-03 — 手動 cataloged-research 時效

PR #17 遠端 CI 全部通過後已合併（`233d597`）。先前額度限制阻擋最後合併／fetch，恢復後重新核對 exact head／base、CI 與實際 merged 狀態。`feat/research-source-freshness` 從最新 origin/main 建立，原工作目錄乾淨。基線依賴仍缺 fee-origin／TTM 可比性／同步估值，接續 NEXT 的可獨立手動時效子項。

新增 production-only research-freshness CLI，在原 canonical 回應外檢查固定 catalog 的五份已驗證／重播研究。分開 observation／publication／retrieval／review 日期，保留 artifact hash、原始 records／期間／scope／comparability 與完整來源版本／dependencies；未知與非 OBSERVED 不提升為新鮮事實。跨 artifact／canonical source ID 衝突與 observation ID 改寫拒絕。共用原 UTC day helper／來源日期計算，policy／formula v1 與原 freshness 輸出不變，沒有金融或文件來源更新／寫入。

2026-10-03 報告：30 research records／13 sources，27 OBSERVED 在既有窗口，三項 TTM DERIVED 仍 null／COMPARABILITY_UNVERIFIED／INSUFFICIENT。這些是 record counts，不能充當連續期數或 current investability 確認。歷史 cutoff 另外顯示 review 尚不可用，不把本日 review 回填到 filing 時點。

驗證：288 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。17 項新增回歸包含歷史 cutoff／UTC／窗口、metadata／ID／hash、未知與來源版本、CLI／原金融結果／journal 不變；首輪 test-only null confidence 漏同步已修正，完整重跑通過。無 UI 修改，未另做瀏覽器驗證。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成；MVP 範圍排除維持。目錄新增研究需人工版本審查，本子項不自動掃描／抓取來源、不新增 scheduler／notification，亦不解決 fee-origin、SECZ 名稱差異／TTM／six-stream mapping、FCF／margin、同步估值或個人管道。詳見 [研究時效](research-source-freshness.md)。

## 2026-10-03 — UNI 單筆 Firepit 執行證據

PR #16 遠端 CI 全部通過後已合併（`8323fb2`）。`research/uni-firepit-release` 從最新 origin/main 建立，原工作目錄乾淨。回到 NEXT baseline 的捕獲執行證據，範圍限定單筆 release；不依據配置或文件推定已實現年度收入。

Chrome 核對成功 receipt Overview／九個 logs：block 24116850、2025-12-29T07:36:47Z，UNI raw payment 4000000000000000000000 從 caller 到 dead address，五項 TokenJar asset transfers，以及 Firepit Released nonce 0／同一 recipient。讀取交易前官方 commit 8604e4b（2025-12-18）及固定 TokenJar／ExchangeReleaser／Firepit 源碼；源碼解讀不冒稱 deployed-bytecode 等價驗證。未採 explorer 即時 USD 顯示，Approval／零 PAXG transfer 不另計 burn。

使用既有 token_burn source-only event，新增五份完整 dated sources、空 updates、Codex review 與 immutable snapshot `c242eeb441c989b608a9520d13e54b9e142ee213a818a88dd76d9db15ed763c9`。保留先前 budget／configuration snapshot hashes；source change 與不變的 assumption／scenario／formula／values 分開。三份 production snapshots 同一模型期，thesis insufficient、83 unknown 不變。

驗證：271 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。四項新增驗證涵蓋來源／raw receipt identity、append-only old versions、完整重播及不得年化／升級已驗證 capture 的界線；prospectus test 改為核對原兩個 hash 與同模型期間，允许來源事件增量。無 UI 變更；Chrome 僅用于 primary-source 查證。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。這筆執行不證明每項資產的 protocol-fee origin、totalSupply 減少、全期間 burn／fee revenue、現行閾值或所有 pool／chain activation。下一步須追溯 fee-origin 與明確計算期間，不能把單次 4,000 UNI 年化或和 100M treasury transfer 混合。SECZ 名稱差異／TTM、六類 mapping、FCF／margin、同步母公司估值與個人管道亦未完成。詳見 [release 研究](uni-firepit-release.md)。

## 2026-10-03 — Canonical 未來證據日期防線

PR #15 遠端 CI 全部通過後已合併（`0d01067`）。`fix/future-canonical-evidence` 從最新 origin/main 建立，原工作目錄乾淨。以純記憶體重現直接 canonical validation 接受 2099 OBSERVED as-of 與 retrieval；一般 source-only event 也缺精確 retrieval 現在時間防線。優先修復可独立驗收的 baseline 證據屏障。

共用驗證每次擷取一次 now，OBSERVED 使用當前 UTC 日上限，來源取得使用精確 instant 上限，涵蓋 null／fixture／未引用来源與直接 load/API。保留 retrospective retrieval、原始時區文字、分析者假設／情境及 planned/announced 未來 effective date；沒有 financial formula／assumption／data／history/artifact 變更。

驗證：267 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。13 項新增回歸包含直接隔離檔案載入／API 400、source-only apply 無寫入及時區／精度邊界。既有 source-after-event 測試改用歷史來源，獨立維持原屏障 coverage。首輪兩項誤引用未儲存 production price，改為隔離 fixture 後完整重跑；未補造正式值。無 UI 修改，未另做瀏覽器驗證。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成，research 依賴與 83 個金融 Unknown 保留。日期防線依赖環境時鐘，不能代替來源內文查證；尚待 MG Stover 名稱差異／TTM、六類 mapping、margin／FCF、同步母公司估值、UNI realized capture／現況及個人投資管道。詳見 [未來證據日期](future-canonical-evidence.md)。

## 2026-10-03 — 唯讀研究證據 API／Dashboard

PR #14 遠端 CI 全部通過後已合併（`a4793c1`）。`feat/research-inspection` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 的独立審閱子項，把已完成的身份／財報／TTM research artifacts 帶入 Dashboard，以便直接檢查來源、判斷與未知原因；未越過尚未滿足的金融 ingest 依賴。

新增固定本地 catalog／schema、hash 核對與完整 semantic replay、GET-only research API，以及沿用既有風格的研究 section。五份資料保留身份／報表範圍、日期／分類／來源版本及完整內嵌公式／依賴。Fixture 回傳空清單；工作區切換清除舊研究並拒絕遲到回應，canonical refresh 亦加入世代檢查。所有原始資料、金融公式／假設、不可變研究與財務快照不變。

驗證：254 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。九項新增回歸涵蓋唯讀／重播／hash／路徑／篡改／隔離與 API 禁止寫入。Chrome 桌面操作確認五卡片、完整證據／來源連結、TTM 三個 Unknown 與 ASSUMPTION 原因、快速工作區切換後 Fixture 無卡片，1524px body 無橫向溢出；未另驗證手機版。測試伺服器已停止，暫存日誌已移除。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。MG Stover Inc./LLC 名稱差異未澄清，正式 TTM 保持 null，身份 investability 仍 unverified；六類收入映射、margin／FCF、同步母公司估值、UNI realized capture／現況與個人管道仍缺。新增證據必須另存版本并人工更新 catalog，不能覆寫 artifact。詳見 [研究檢視](research-inspection.md)。

## 2026-10-03 — UTC research／source chronology

PR #13 遠端 CI 全部通過後已合併（`02299b4`）。`fix/utc-research-chronology` 從最新 origin/main 建立，原工作目錄乾淨。估值／來源日期檢視發現 `.slice(0,10)` 比較 offset timestamps 會跨 UTC 日誤判，純記憶體重現 canonical source 與 identity review 的錯誤接受。此問題可獨立修正，優先補共用 ingest／研究屏障。

新增 schema 後使用的 utcDay helper，四處改為 UTC 日比較：canonical source publication/retrieval、identity dossier as-of/review、identity publication/retrieval、research review as-of。原始 timestamps／offsets 保留，已正確使用 UTC 的 revenue／TTM／freshness 不改；金融公式、假設及所有資料／artifacts／journal 不變。

驗證：245 tests passed、0 failed；两模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十项新增回歸涵蓋正負時區、閏日、兩模式 source validation、identity、research preview 成敗／無寫入與 metadata 保留。原 UNI 0.422、API、完整歷史與 research replay 通過。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。SECZ 尚缺名稱差異澄清／TTM confirmation、六類收入映射、margin／FCF、同步股本／估值及個人管道。Prospectus 有歷史單日報價但無本次同步 EV 證據，canonical SECZ 模型輸入是 EV；未把不同日期股數／subsidiary shares／浮動股數套用價格。UNI realized capture／current state 亦未完成。只推進独立可驗收工作，詳見 [UTC 日期](utc-research-chronology.md)。

## 2026-10-03 — 明示可比性審查的原始收入 TTM 工具

PR #12 遠端 CI 全部通過後已合併（`ab4d5f3`）。`feat/reviewed-revenue-ttm` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 可比期間的條件式工具子項，驗收完整 review hash 綁定、年／YTD 日期、人工 ASSUMPTION、null 屏障與完整 immutable replay。

新增 schema／受限 AST 公式 v1／production-only revenue-ttm。先核對兩份原研究 hash 與 embedded-formula 重播，檢查 entity／scope／basis／fiscal end；只接受前一全年減去年同長度 YTD 加今年 YTD。五項人工可比性判斷皆保留 ASSUMPTION、rationale、雙 filing primary evidence；未確認則不產生數值。輸出 DERIVED、完整觀察／假設／範圍／來源／期間 dependencies；金融 registry 25 公式与 canonical journal 不變。

已讀年度與季度收入定義、actual-acquisition basis、停止營業與 pro forma 區分；發現年度 MG Stover, Inc.／季度 MG Stover LLC 標題差異，未宣稱等價。正式 request 的 acquisition_treatment 為 null，三個 TTM 結果保持 null／COMPARABILITY_UNVERIFIED。新研究 artifact 完整保存 request／雙 input reviews／formula／results，舊檔與 hash 保留。此阻擋不影响工具與可独立驗收的其他工作；真正 TTM／六類 ingest 父項不能勾選。

驗證：235 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。36 新增檢查包括每項 false／null、分類、日期、hash 綁定、scope、未知、negative／annual limit、重播、unsafe AST、CLI 無寫入；條件全確認只在 test-only 假設的記憶體測試驗算。首輪錯誤訊息預期不符已修正並補独立 observation cutoff coverage，完整重跑通過。遠端 CI 以 PR 實際結果為準。

父 baseline 仍未完成。後續需以 primary clarification 解決名稱差異或保持 null；尚缺完整更正沿革、六類收入映射、FCF／margin、同步母公司估值、UNI realized capture／現況及個人投資管道。不可修改本版 artifact 的判斷；新證據另存新版本。詳見 [TTM review](secz-revenue-ttm.md)。

## 2026-10-03 — SECZ S-1／424B3 年度表查證

PR #11 遠端 CI 全部通過後已合併（`9578304`）。`research/secz-cross-filing-revenue` 從最新 origin/main 建立，原工作目錄乾淨。選擇首項 NEXT baseline 的限定跨 filing 研究，獨立查證 8/7 prospectus 年度表與 7/31 S-1，而非直接推進未驗證 TTM。

核對 424B3 index／cover／營業子公司 KPMG 審計／Note 19 表與分類文字／Note 21 issuance。六個 2025／2024 全年 USD 值與已保存 S-1 相同，entity／scope／GAAP／audit／period context 一致。新資料包六 OBSERVED、兩 tier 1 sources 使用獨立 filing ID 與 8/7 as-of，不 supersede 舊 filing。Schema 只增量允許 424B3；金融及研究公式不變。新研究 snapshot／比較輸出以 exclusive create 保存，舊 quarterly／annual artifacts 原 hash 保留。

驗證：199 tests passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。五項新增回歸核對 exact raw cells、來源／日期、比較 hash 與 semantic replay、舊歷史及 CLI 無 journal 寫入。遠端 CI 以 PR 實際結果為準。大型 SEC 網頁首次讀取逾時後，在相同已載入 tab 重讀成功。

此子項只完成兩份年度表／已讀分類文字的一致性；更早重編沿革、季度／年度 scope 與 recognition comparability、TTM／六類映射仍未完成。重複同期間不增加 thesis evidence，canonical production journal 仍只有兩個同期間 snapshots。下一步需核對季度 exhibit 的收入定義與 presentation／prior-period 說明，再決定是否可提出明示 review 的 TTM bridge。UNI realized capture／現況、估值及個人投資管道仍缺。詳見 [研究](secz-cross-filing-revenue.md)。

## 2026-10-03 — 原始收入研究快照比較

PR #10 遠端 CI 全部通過後已合併（`968b8ec`）。`feat/revenue-review-comparison` 從最新 origin/main 建立，原工作目錄乾淨。選擇 baseline 跨 filing 的唯讀比較前置子項，驗收完整重播、版本／來源區分、範圍／相同區間對齊與無財務寫入。

新增 revenue-compare、spec 方法 v1 與觀察 optional supersedes。比較前驗證雙方雜湊與 embedded formulas 重播，拒絕歷史 ID 改寫／公式無版本變更與倒退／無效宣告取代。不同 filing 的独立觀察保留；已知值衝突明列，不強迫宣告取代或選一方。範圍／會計基礎／審計狀態不同不配對，相同期間才列前後值；null 獨立標 insufficient。所有既有資料包與 artifact 原 hash 保留。

驗證：194 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。15 項新增檢查涵蓋歷史／supersession／完整重播／偽造結果／範圍／期間／衝突／缺值與 CLI；金融公式／假設／journal／thesis 不變。遠端 CI 以 PR 實際結果為準。

父 baseline 未完成。工具不判定經濟可比性／更正沿革、TTM 或六類映射；現有年度對季度報告為 audit_status CONTEXT_MISMATCH。後續可獨立查證 8/7 prospectus 與 7/31 S-1 的同範圍年度表，另保存來源／版本後使用比較；仍需人工核對披露。UNI realized fee burn／現況、估值與個人投資管道仍缺。詳見 [比較工具](revenue-review-comparison.md)。

## 2026-10-03 — 手動事件 as-of 與來源日期

PR #9 遠端 CI 全部通過後已合併（`e85bb73`）。`fix/future-event-as-of` 從最新 origin/main 建立，原工作目錄乾淨。以純記憶體 production project 重現：event.as_of／effective date 都填 2099 年仍被接受為 completed，未寫任何資料。另補齊 source-only event 的 source publication 日期檢查。

在共用 prepareEvent 限制 as-of <= 目前 UTC 日，並要求所有 event.source_ids 的 date <= event.as_of。未知來源先拒絕，日期檢查在重算／journal 寫入之前完成。今日 recorded 的未來 planned／announced effective date 仍保留，既有狀態／OBSERVED 屏障不變；晚取得的歷史 receipt 不會因 retrieval date 而被錯誤排除。

驗證：179 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十項新增驗證涵蓋所有狀態的 future as-of、合法未來 plan、failed apply 無寫入、source-only future publication、歷史來源晚取得。金融公式／假設、所有來源／觀察／snapshot、graph／thesis 保留；遠端 CI 以 PR 實際執行結果為準。

父 baseline 仍未完成。已保存 UNI historical authorization／v2 configuration 與 SECZ 分期／全年原始收入，但 fee-generated burn、現況、跨 filing 更正／comparability、TTM／六類收入 mapping、同步估值及個人投資管道均尚待驗證。只接續可獨立驗收的工作，保留 null 與來源衝突。詳見 [事件日期](event-source-dates.md)。

## 2026-10-03 — 共用觀察／來源日期驗證

PR #8 CI 通過後已合併（`e7fe1f9`）。`fix/observation-source-dates` 從最新 origin/main 建立，原工作目錄乾淨。在 baseline 來源／期間工作中以純記憶體資料重現：canonical validator 接受 7 月觀察引用 8 月發布的來源；一般 event 也能繞過 research-refresh 已有日期檢查。此漏洞可獨立修正，優先補齊 ingest barrier。

在共用 validateProject 增加 OBSERVED 的全部 source.date <= observation.as_of_date 檢查，涵蓋 canonical loads／普通手動事件、null 與 fixture。晚取得來源仍能用於回溯研究；期間與知識 as-of 分開保留，ASSUMPTION／SCENARIO 不提升成事實。未改公式、假設、來源／觀察或 immutable artifacts，未擴大自動化範圍。

驗證：169 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。十項新增驗證涵蓋 boundary、多來源、一般 event／apply 拒絕且不寫入、null、fixture 及分析者輸入；原資料包與 financial snapshots 完整重播保留。遠端 CI 以 PR 實際執行結果為準。

父 baseline 未完成。後續可推進 SECZ 跨 filing presentation／更正沿革比較，才考慮 TTM；8/7 prospectus 的同主體年度收入表已做人工初讀，但本次未建立其正式版本或 comparability 結論。UNI fee-generated burn／現況、同步估值、六類收入 mapping 與個人投資管道仍未完成。詳見 [日期驗證](observation-source-dates.md)。

## 2026-10-03 — SECZ 已審計全年原始收入

PR #7 遠端 CI 全部通過後合併（`44fe516`）。`research/secz-annual-revenue` 從最新 origin/main 建立，原工作目錄乾淨。延續 baseline 的可比期間前置工作，增量保存 2025／2024 已審計全年兩類分項與合計，共六筆 OBSERVED。

核對 S-1 的 Securitize Inc. 審計段落、Note 19、issuance note 及 matching XBRL entity/product duration contexts。Audit／financial issuance 為 2026-04-10，cover 7/30 與 EDGAR index filing date 7/31 並列保留；S-1 無 Period of Report，保存 null。此版使用本 filing availability，不以 audit date 推定已取得同版；不替代 listed-parent 財務／資本結構，也不宣稱已核對所有更正／重編沿革。

Schema／唯讀 review 增量支援完整日曆年度與 S-1、審計來源及報告日期檢查。原研究公式 v1、金融公式／assumptions 均不變。新 dossier／content-hashed snapshot 使用獨立檔案與 exclusive create，保留舊季度 artifact 原 hash 與完整重播；canonical journal／83 個未知 financial metric／thesis 不變。

驗證：159 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增 11 項全年區間、審計證據、日期與新舊 artifact replay；遠端 CI 以 PR 實際執行為準。

子項完成。下一步仍需跨 filing 更正沿革與財務 comparability 才能建立 TTM bridge；兩類收入不足以供應六類年度模型，未知 mapping／margin／FCF／母公司估值與個人投資管道不能補值。UNI fee-generated burn／current state 亦未完成。詳見 [年度原始收入](secz-annual-revenue.md)。

## 2026-10-03 — SECZ 可比較分期收入

PR #6 遠端 CI 全部通過後合併（`fc0f7ea`）。`research/secz-comparable-revenue` 從最新 origin/main 建立，原工作目錄乾淨。UNI 配置子項已完成，其餘 fee-generated burn／current state 仍缺獨立查證，先推進 baseline 可獨立驗收的 SECZ 財務期間子項。

新增 standalone revenue dossier／schema／唯讀 CLI，保存 2026／2025 Q2、半年的 Tokenization、Asset Servicing 與披露合計，共 12 筆 OBSERVED；SEC exhibit、filing index、IR 三份 dated primary sources。區間開始／截止、duration、fiscal year／quarter、GAAP、未經審計、營業子公司範圍與 filing／financial issuance／Period of Report 分開保存。研究公式 v1 使用既有受限 AST，核對合計與同長度去年同期；unknown／zero base 保持 null。

以 exclusive create 保存完整 content-hashed 研究快照，包含所有來源、觀察、報表範圍、review、公式與結果，可用 embedded versions 重播。這是原始財報研究，沒有 canonical annual financial updates；兩個 production financial snapshots 與 fixture 歷史保持原狀，83 個 financial metric 未知值不變。後續更正另建版本檔案，不改此版。

驗證：148 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。33 個新增檢查包括來源／分類／日期／區間／合計拒絕、null／zero base、完整重播、hash tamper rejection 與 CLI 無 financial journal 寫入。遠端 CI 以 PR 實際結果為準。

子項完成，父 baseline 與季度 ingestion 仍未完成。仍缺年度／TTM 銜接、六類收入分配證據、其他財務指標、母公司資本結構／估值與投資管道。不可把半年乘二、季度乘四當 OBSERVED 年度值，或把 operating subsidiary 的股數套用 SECZ parent。詳見 [分期收入研究](secz-comparable-revenue.md)。

## 2026-10-03 — UNI v2 歷史 feeTo 配置

PR #5 CI 全部通過後合併（`a4ebd51`）。`research/uni-v2-fee-configuration` 從最新 origin/main 建立，原工作目錄乾淨。回到 baseline 的最高優先捕獲查證，範圍限定 proposal 93 已執行的 v2 factory setFeeTo(TokenJar) 配置，保存 receipt、治理規格與固定 commit 的官方 Factory／Pair 程式碼。

使用既有手動 protocol_fee_change event 保存 sources 與完整 immutable snapshot；updates 為空。receipt／governance v2 明確 supersedes v1，舊來源及 budget 既有觀察 lineage 原封保留。保留 Agora／receipt 執行時間衝突。非零 feeTo 與 feeOn 的解讀來自公開程式碼，未完成部署 bytecode 等價驗證；不能以配置推定已實現收入或 UNI burn。graph 與全部數值／公式不變，production 仍有 83 個未知 metric。

驗證：115 tests passed、0 failed；fixture／production validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。新增三項驗證：事件與來源一致性、source-only 比較與版本／lineage 保留、歷史重播及同期間不足證據。遠端 CI 以 PR 實際執行結果為準。

子項完成，完整 baseline 未完成。仍待 fee-generated TokenJar／Firepit／UNI burn 的期間與鏈上證據、v3 各 pool 的實際配置、現況查證、估值與個人投資管道；不能把 treasury 的 100M transfer 當 fee revenue。SECZ 季度／年度與收入分類對應仍待處理。詳見 [配置研究](uni-v2-fee-configuration.md)。

## 2026-10-03 — 年率單位與期間防線

PR #4 CI 成功後已合併（`7f09c16`）；分支 `fix/annual-rate-period-validation` 從該最新 origin/main 建立，工作目錄乾淨。接續 baseline 期間障礙，在 synthetic fixture 重現六個季度 SECZ 示範收入可產生 USD/year 加總的錯誤標籤，完成可獨立驗收的輸入防線。

共同 normalize 拒絕已知 `/year` input 使用 quarterly／point；annual／TTM／model 保留，OBSERVED model 年率必須有 rationale。null 與 point 價格／存量仍合法。沒有年化、改寫來源／分類、修改公式或既有 fixture／production history；錯誤 research proposal 會在寫入前拒絕。

驗證：112 tests passed／0 failed；fixture／production validate 84 metrics、25 formulas、0 errors／warnings，unknown 1／83。新增 15 項檢查，涵蓋五個年率單位、合法期間、unknown、model rationale、價格／存量及研究失敗不寫入。原先 mixed-basis 測試調整為輸入提前拒絕，並繼續直接驗證 formula accounting-basis 檢查。UNI 0.422、完整歷史重播與 API 回歸均通過。遠端 CI 另於 PR 確認。

子項完成，父 baseline 與季度 ingestion 尚未完成：仍需原始期間／YoY-QoQ／收入分類對照、同步估值、現行可投資性及 UNI 執行後 fee-path 證據。驗證器不驗證來源內文；不能靠把季度資料改成 TTM metadata 取得正確年度值。詳見 [期間防線](annual-rate-period-validation.md)。

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

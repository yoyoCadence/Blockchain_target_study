# XLM 官方回報供給與口徑

接續上一個 agent 留下的兩份未提交研究檔案，保留原始 bytes、日期與審查紀錄。API 單次回應是在 UTC 2026-10-05T11:22:26.166Z 收到，供應者 `updatedAt` 為 11:14:19.137Z；兩者分開保存。九個 OBSERVED 僅記錄官方回報，`measurement_basis=provider_reported`，不宣稱獨立核對鏈上供給。

[原資料包](../data/research/xlm-supply-2026-10-05-v1.json)保存完整 API JSON 字串、HTTP Date／status／content type、開始與收到時間，以及九個原始精確字串。exact bytes SHA-256 為 `790c9763971cb01bd8712431ea7207eb4f4418e5a17459cf0df661f1ede5ad51`，Git 固定 LF；API body SHA-256 為 `af89e0d5c20390d666920bf8690ccbecc8903e2a5277f4d3f5d6398900007a12`。

供給定義依 [Stellar 官方 Lumens 文件](https://developers.stellar.org/docs/learn/fundamentals/lumens)，頁面標示最後更新 2026-09-28，接手後再次人工核對日期及定義。原文件 capture 只保存正文 hash，`last_updated_marker=null`；日期是人工閱讀證據，沒有保存可離線重播的完整正文。文件中的七月範例與本次 [Dashboard API](https://dashboard.stellar.org/api/v2/lumens/) 回應各有自己的時間，不能互相替換。接手瀏覽工具的 API 結果是 10 月 3 日快取，也沒有拿它刷新或替換原 10 月 5 日回應。

| 回報欄位 | 原始字串（XLM） |
| --- | --- |
| originalSupply | 100000000000 |
| inflationLumens | 5443902087.3472865 |
| burnedLumens | 55442115247.6478151 |
| totalSupply | 50001786839.6994714 |
| upgradeReserve | 258885847.5135978 |
| feePool | 10763671.0740601 |
| sdfMandate | 14674425047.8957122 |
| circulatingSupply | 35057712273.2161013 |

`burnedLumens` 是供應者對無 signer、不可存取帳戶的分類；`feePool` 為非流通的費用池，仍列入 total。`circulatingSupply` 是 total 扣除 SDF mandate、upgrade reserve、fee pool 的供應者分類餘額。這個定義不等於逐地址自由流通、流動性或個人可交易資格；Horizon 的歷史累積 `total_coins` 也不能直接替代扣除後供給。

資料包嵌入兩條研究公式 v1，受限 `signed_decimal_sum`、七位小數與確切 record ID 依賴。以 BigInt 精確核對：`original + inflation - burned - total` 與 `total - upgradeReserve - feePool - sdfMandate - circulating` 都得到 DERIVED `0.0000000 XLM`。零殘差僅支持同一回應內算術一致，不獨立驗證帳戶、ledger 或完整 baseline。ledger sequence／hash、各組成帳戶、獨立流通供給、完全稀釋定義及同步市值／FDV 全為 null。

[人工事件](../data/research/xlm-supply-2026-10-05.yaml)已套用一次，保存完整不可變快照 `8bd9f75a8e5d1ed13584680f93f236608118921730cef10e74f10e81a6d6032b`，parent `f69c8c2d8b4b5f036177b1e482b8c07eb23651849b786eeaa7e0afee44da9941`。**不可再次套用相同事件。** 只追加兩來源，文件 v2 明示 supersedes v1；原身份／價格依賴仍保存原版本。source_change=true、changes=[]，公式／假設／情境／規則未改，金融輸入與論點精確重播相同。正式十六份歷史仍只有兩個模型截止日，最新模型日期仍為 2026-10-04，三份 Fixture 不變。

原 XLM 價格是前一天成交，不能與本次供給拼成同步市值／FDV；沒有建立 XLM 費用 DCF。unknown 80、三項 SECZ TTM null、UNI 原名目年率 stale、投資性未驗證及 Fixture required-share 0.422 保留。

既有研究頁的「已審查事件」可查閱中文摘要、兩份來源與原始事件 JSON。九份 catalog review 保留；供給的九筆觀測／兩個推導尚未接入共用語意 reader、catalog 或逐列研究表格。本次不把研究資料當成 canonical 金融輸入。

五項新增回歸覆蓋原 bytes／body hash、九個回報欄位／時間／來源、受限七位小數公式 v1／全部依賴、source-only 完整重播與中文事件。`npm test` 全套 770 通過；`npm run validate`／`npm run validate -- --production` 均為 84 指標、25 公式、無 errors／warnings，unknown 1／80。Node 測試子程序在沙盒回報 EPERM，依既有方式於獲准環境完成。

Chrome 實測桌面 CSS 1536×684、窄 CSS 312×675：Enter 展開事件與原始 JSON，兩份安全來源連結、精確小數／兩時間／原 hash、Fixture 0／0 與正式 9／16 還原通過。窄頁面 clientWidth=scrollWidth=300，卡片=266；console warn／error 空。背景服務沙盒啟動的 PID 39444 後來確實監聽，但沙盒端口查詢未顯示；另一個隱藏啟動因 EADDRINUSE 結束。已在獲准環境核對真正的 `node.exe server.js` PID 39444，完成驗證後只停止該 PID。視窗尺寸已還原，未驗證其他瀏覽器或真實手機。

後續先建立明示 production／digest 的唯讀供給 reader，核對原 HTTP／來源／精確字串／時間與嵌入公式，再接既有研究目錄。其餘 UNI 全年 capture／分配、SECZ 可比 TTM／六收入、同步估值與完整 production baseline 保留。

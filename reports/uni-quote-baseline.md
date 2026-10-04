# UNI 單筆價格與名目年率模型折算

正式保存已在原始資料包查證的 Coinbase Exchange UNI-USD 最後成交價 **9.0556 USD／1 UNI**，medium confidence、point／2026-10-04、OBSERVED、非 Fixture。原觀測與先前未套用候選逐欄完全相同；沒有重取市場報價，也沒有改價格日期以通過計算。

原始 trade_id 78869651，成交時間 2026-10-04T11:33:36.662371063Z；ticker 取得 2026-10-04T11:34:02.6720093Z，商品 metadata 取得 2026-10-04T11:37:54.1282550Z。兩個 Tier 1 [ticker](https://api.exchange.coinbase.com/products/UNI-USD/ticker)／[product](https://api.exchange.coinbase.com/products/UNI-USD) 來源沿用保存版本與 [raw archive](../data/research/market-quotes-2026-10-04-v1.json)，保留 decimal、nanosecond 與內容 hash。可變 URL 不保證重開仍有相同價格；單筆 tick 不是即時訂閱、收盤價、同步估值或個人交易資格。

正式採用[已合併的期間政策](uni-valuation-period-policy.md)，registry v2 中五條 UNI 公式升至 v2：growth_distribution、net_accrual、net_burn_yield、required_share、required_share_net。原算術表達式完全保留，新增明示政策／角色與說明。舊公式 v1 仍嵌在原快照中，不能以現在的 v2 代替歷史重播。

歷史核准 **20M UNI/year × 9.0556 USD/UNI = 181,112,000 USD/year**，是 DERIVED 模型負擔，`period.basis=model`／`valuation_date=2026-10-04`。原預算的知識日與 schedule 參考日仍是 2026-01-01。此折算沒有驗證 10 月合約額度仍有效，不能解讀為實際年度分配、支出、收入或永久稀釋。日期傳遞至明示選用的下游；已知的跨期實際收入、稀釋、市值或季度流量仍拒絕，缺失資料仍為 null。

先對[新 proposal](../data/research/uni-market-quote-2026-10-04.yaml) 執行唯讀 preview，無 ERROR 後按 digest `193492a5dd22b0a75cb9c35d1ba5bcf57d11ad3738fc1ac581602b366c868483` apply。新增[完整事件與不可變快照](../data/events/production/uni-market-quote-baseline-20261004.json) `98d14672840df6918c47b86e3099f773d406031b6b462d0df38109e9e0b96ad3`，parent 是 XLM 快照 `497cec4e...`。同 ID 已保存，不能再次 apply；原 pending 候選保留歷史意圖，現在已不是待匯入的新觀測。

只有 `uni.price` 與 `uni.growth_distribution` 的數值改變，84 指標中 unknown 82 → 80。來源登錄、原輸入、假設、情境、規則、圖譜與投資性設定完整保留；比較顯示 source_change／formula_change=true，其餘三種變更=false。淨累積／所需市占率／市值與 FDV 仍未知，各論點仍為證據不足、無觸發規則。時效檢查仍將原預算標成 STALE_FOR_CURRENT_USE，較晚報價不能更新它的證據日期。

Fixture 另追加[公式升版快照](../data/snapshots/fixture/8ea6ec685d548a85b99c4d2ae529dc0fa251c8f65fde3475cdaf7e0ddf2908a8.json)，保持全部經濟值與合成來源／輸入。三份 Fixture 歷史仍只有一個年度，0.422 required-share 回歸不變。十一份 production 歷史逐份按自己的輸入、來源、公式及規則精確重播，前九份仍是 2026-01-01；兩個 2026-10-04 修訂不冒充兩個 thesis 期間。

舊 v1 的三項期間拒絕與完整中文 CLI 診斷，現在在隔離 TEMP 工作區載入當時 XLM 快照／嵌入公式重現，preview／apply 都保持 exit 1、stdout 空與不寫入。年代測試只在記憶體隔離新 UNI 觀測；沒有改正式資料或放寬 publication／as-of／supersession 檢查。

介面驗收流程：正式資料 → UNI 模型卡／價格／血緣 → 原預算與價格日期 → 鍵盤展開事件及完整 JSON → Fixture 清除及還原。Browser 可用，使用既有 Chrome 連線；本機 URL `http://127.0.0.1:4310/?mode=production`。桌面 CSS 1536×684，窄視窗實際 CSS 312×675（工具設定 390×844，縮放後的 CSS 尺寸獨立核對）。新增模型標示與折算參考日顯示引擎 metadata，UI 不持有公式或金融數字。

| 檢查 | 結果 |
| --- | --- |
| 頁面身份／非空白 | 中文應用標題與 production URL 正確，84 指標、十一事件與六份研究 review |
| 無錯誤覆蓋 | 模型／血緣正常呈現，無載入或框架錯誤 |
| Console／服務 | error／warn 空，stderr 空；已核對命令列／PID／監聽埠後停止服務 |
| 桌面／窄視窗 | 模型標示可讀，頁面無水平溢出；原長 commit 字串曾使窄對話框溢出，補 lineage 換行後 clientWidth=scrollWidth=248 |
| 互動 | Enter 開啟模型血緣、事件與 raw JSON；兩個來源連結帶 noopener noreferrer；Fixture 顯示 $9 且正式事件清空，還原顯示 $9.0556 |

截圖在 TEMP `uni-quote-model-desktop.png`、`uni-quote-lineage-mobile-after.png`，不進正式資料。未驗證其他瀏覽器、所有手機尺寸或真實裝置。

驗證：`npm test` 588 項通過、0 失敗；`npm run validate` 與 `npm run validate -- --production` 各 84 指標／25 公式、0 錯誤及警告，unknown 1／80。四項新增回歸核對原 tick／digest、五條升版、僅兩項值變動、歷史重播與 Fixture 隔離；現行預算／供給／市值／FDV、實際捕獲、三項正式 TTM、SECZ 財務／股本與個人投資性及完整 baseline 仍需研究。

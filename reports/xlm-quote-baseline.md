# XLM 單筆交易所價格基準

這次完成第一份正式 baseline 中可獨立驗收的 XLM 價格子項。將已保存的 Coinbase Exchange XLM-USD 最後成交價獨立追加為一筆正式 OBSERVED，沒有重新取得市場資料；UNI 尚未匯入，完整父 baseline 仍未完成。

| 證據 | 已保存內容 |
| --- | --- |
| 價格與單位 | 0.216265 USD／1 XLM，point 期間，medium confidence，非 Fixture |
| 最後成交時間 | 2026-10-04T11:33:54.575362751Z，trade_id 169565371 |
| ticker 取得 | 2026-10-04T11:34:02.1193462Z；HTTP Date Sun, 04 Oct 2026 11:34:02 GMT |
| 商品 metadata 取得 | 2026-10-04T11:37:54.0960573Z，base_currency=XLM、quote_currency=USD |
| 人工 review | 2026-10-04T12:10:30.613Z；Codex 公開來源查證，非人類簽核 |
| 保存時間 | 2026-10-04T12:11:27.818Z |

原始 [ticker](https://api.exchange.coinbase.com/products/XLM-USD/ticker) 與 [product](https://api.exchange.coinbase.com/products/XLM-USD) 的兩份 Tier 1 來源版本已在前一來源事件保存。本次 [XLM proposal](../data/research/xlm-market-quote-2026-10-04.yaml) 明示 `sources=[]` 重用，完整回應及原內容 hash `8bc4c51f704a0d4bbe48dd1ec0d7b7279cb2e0643a75d3b5e7ca9ef7b965977b` 仍在 [原始資料包](../data/research/market-quotes-2026-10-04-v1.json)。可變 API URL 不代表重開仍得到此價；原始 decimal／nanosecond 字串保留。

這是單筆最後成交，不是即時訂閱、收盤價、bid／ask 中間價、跨市場同步估值或合理價值。稍後取得的商品 metadata 不能證明先前 tick 的商品狀態、原生提款／託管或個人交易資格。市場價格僅供後續反向估值研究使用。

先依既有 `research-preview` 確認全模型重算沒有 ERROR，再以回傳 digest `fef75169e063a5c47e6d209fb0fab53ae6b7b7a1e1b5e1e59688efde0be989fb` 執行 `research-apply`。一次追加 [不可變事件／完整快照](../data/events/production/xlm-market-quote-baseline-20261004.json) `497cec4e68daf9f87d530145d87044af1383bb9eb3691cbc7559b70deb497a18`，parent 為 `0e4062bd93a2a4d94ca01b2af1bbdc2d38978c89b5169d49bbea6d2a1a99fb14`。保存已完成，不應再次 apply 同一 ID；後續觀測需新 ID／版本與新的 preview。

84 指標／25 公式中只有 `xlm.price` 從 null 成為數值，未知由 83 降為 82；其餘 83 個指標的值逐項相同。舊輸入完整保留再追加一筆，來源登錄、公式、假設、情境、規則、圖譜與投資性設定不變。沒有 fee-only XLM DCF，也沒有將網路採用當成持有人價值。

最新模型參考日依合法 point 輸入推進到 2026-10-04，前九份快照仍為原 2026-01-01。快照的 `annual` 模型參考標籤不是已查證年度收入。比較表只有 XLM 價格有數值改變，部分 null → null 列因生成紀錄的日期／血緣 metadata 改變而出現；不可把它們當新觀測。`source_change=true` 是價格新增引用來源的比較結果，不是來源登錄被改寫；假設／情境／公式／規則變更均為 false。所有論點仍為證據不足，未因研究日期推進而出現觸發規則或足夠連續期間。

UNI 原雙資產候選保留當時研究；XLM 已保存後，它會先遇到重複觀測 ID，不再用於目前匯入。新 [UNI 未套用候選](../data/research/uni-market-quote-pending-2026-10-04.yaml) 獨立保留原 9.0556 USD／1 UNI 的成交與來源，preview／apply 均仍被三項 `Unaligned accounting periods` 拒絕：`uni.net_accrual`、`uni.required_share`、`uni.required_share_net`。實際 CLI 回歸確認完整中文診斷、exit 1、stdout 空與不寫入，未改日期或放寬期間／digest／快照規則。

中文 Dashboard 的價格卡片、血緣與版本比較對價格最多顯示八位小數，本筆完整顯示 `$0.216265`。只調整呈現精度，原始數值及金融計算不變；在正式研究頁展開「XLM 單次交易所價格基準」，可以閱讀一筆已保存更新、兩份來源、原始時間與完整 JSON。切換至合成示範工作區會立即清除正式事件與原價格，重新切回才載入十事件／六 review／84 指標。

驗收環境為 Windows／Node.js 24.14.1／npm 11.12.1／既有 Chrome 連線。本機服務僅監聽 127.0.0.1:4310。完整重載後確認最新價格格式；只改頁內 anchor 的瀏覽器導覽可能仍保留原已載入模組，不能據此驗收新版本。

| 介面驗收 | 實際結果 |
| --- | --- |
| 身份 | 正確中文應用標題、正式 mode 與本機 URL |
| 非空白 | 84 指標、十事件、六份固定研究 review；已觀測價格與舊版本比較可見 |
| 無錯誤覆蓋 | 沒有載入或框架錯誤畫面；資料檢視對話框可正常關閉 |
| Console | 正式載入、Fixture 切換與還原後 error／warn 均為空清單；服務 stderr 空 |
| 截圖／版面 | 桌面 CSS 1536×684，無整頁水平溢出，價格／血緣／事件截圖通過；本次窄視窗未驗證，前次尺寸控制未生效的限制保留 |
| 互動 | 點擊 XLM 價格檢視 point／OBSERVED／兩個正確來源與安全連結屬性；Enter 展開事件及原始 JSON；Fixture 立即清除，還原後正確載入 |

截圖保存於 TEMP `xlm-baseline48-lineage.png`、`xlm-baseline48-research.png`，沒有加入正式資料；核對命令列／PID／埠後已停止本次驗收服務。

四項新增回歸覆蓋精確來源／digest／不可變 parent、只有 XLM 值改變、歷史截止日不能提前取得價格、Fixture／TTM 隔離及最新快照重播。舊測試改為各歷史快照自己的 inputs／sources／formulas／rules／period 重播，保留原始 hash 和數值斷言；固定昨日時鐘的邊界測試只在記憶體使用截至昨日的基準，不放寬實際來源／觀測驗證。CLI 阻擋回歸使用目前未套用 UNI 候選，避免重複套用已保存 XLM。

實際驗證：全套 575 項通過、0 失敗；兩模式 validate 各 84 指標／25 公式／0 錯誤與警告，unknown 分別 1／82。UNI required-share 合成回歸仍為 0.422，十份正式歷史及 Fixture 歷史各自精確重播。命令：

```powershell
npm test
npm run validate
npm run validate -- --production
# 此候選預期仍拒絕且不寫入。
node cli.js research-preview data/research/uni-market-quote-pending-2026-10-04.yaml --production
```

後續優先處理 UNI 年度／point 依賴的明確期間設計，再查證現行供給量、市值／FDV、SECZ 股本與估值。年度捕獲／burn、SECZ 跨申報可比性／六類收入匯入、三項正式 TTM null、個人投資管道與足夠連續 verified 期間仍未完成。其他瀏覽器／窄視窗與全部尺寸未驗證；本子項完成不代表父 baseline 已可做完整估值。

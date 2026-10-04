# UNI／XLM 單次交易所價格資料

這次完成兩筆有原始時間的單一交易所價格查證與保存，正式價格匯入仍被期間防線阻擋。沒有更新金融模型。

| 商品 | 最後成交價 | 交易時間（UTC，原始精度） | trade_id |
| --- | --- | --- | --- |
| UNI-USD | 9.0556 USD／1 UNI | 2026-10-04T11:33:36.662371063Z | 78869651 |
| XLM-USD | 0.216265 USD／1 XLM | 2026-10-04T11:33:54.575362751Z | 169565371 |

來源為 Coinbase Exchange 的公開 [UNI ticker](https://api.exchange.coinbase.com/products/UNI-USD/ticker)、[XLM ticker](https://api.exchange.coinbase.com/products/XLM-USD/ticker)。官方 [ticker 定義](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-ticker)將最後成交與 bid／ask 分開，文件範例未當成資料；官方 [product 定義](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-single-product)用於核對 base／quote 單位。兩筆成交不同瞬間，不是每日收盤、USD 中間價、跨市場綜合價或 fair value。

[完整回應](../data/research/market-quotes-2026-10-04-v1.json)保存四份 HTTP 200 原文、request／retrieval 時間、HTTP Date、URL 及內容 hash `8bc4c51f704a0d4bbe48dd1ec0d7b7279cb2e0643a75d3b5e7ca9ef7b965977b`。URI 是可變公開 API，保存的內容代表本次取得，不宣稱重新開啟仍回傳相同價格。原始 decimal 與 nanosecond 沒有被輸出格式覆寫。ticker 取得約 11:34 UTC，商品 metadata 約 11:37 UTC，兩種時間分開保留；product online／trading_disabled=false 只描述稍後回應，不證明先前 tick 的交易狀態、鏈上合約／原生提款表示或使用者地區／帳戶／託管資格。

兩筆 [OBSERVED 候選](../data/research/market-quotes-2026-10-04.yaml)保留 point 期間、medium confidence、四份 Tier 1 來源 ID 與獨立 provenance。單一來源市場價格的範圍較窄，沒有補 supply／市值／FDV，也不認定個人可交易。候選尚未套用；四來源已由來源事件追加，因此 `sources=[]` 明示重用既有版本，避免重複 ID。

實際 `research-preview` 在重算後被 `makeSnapshot` 拒絕：

| 指標 | 阻擋 |
| --- | --- |
| uni.net_accrual | f.uni.net_accrual：Unaligned accounting periods |
| uni.required_share | f.uni.required_share：Unaligned accounting periods |
| uni.required_share_net | f.uni.required_share_net：Unaligned accounting periods |

新 point 價格會使歷史額度價格換算與舊年度依賴不對齊。沒有執行 financial `research-apply`，沒有將價格日期回填 2026-01-01、偽裝成 model 或更改公式／假設來通過。CLI 目前只報 `Cannot snapshot calculation errors`，未逐項列出計算原因；上表取自唯讀 `calculate` 的實際 issues。同步估值與期間設計尚待獨立驗收。

可獨立保存的 [來源事件](../data/research/market-quotes-source-review-2026-10-04.yaml)使用 `market_data_review`，完成狀態只代表人工閱讀／來源保存；`updates=[]` 不匯入數值。四來源追加及完整快照 `0e4062bd93a2a4d94ca01b2af1bbdc2d38978c89b5169d49bbea6d2a1a99fb14` 保留 parent／舊版本。原金融、25 公式、假設、情境、graph、thesis 與模型日期全部一致，九份同期間快照不增加 thesis 期數。

正式中文研究頁現在有九筆事件；展開「UNI／XLM 單次交易所價格查證」即可閱讀完整成交時間、來源與阻擋，原始 JSON 保留全部證據。正式 UNI／XLM 價格仍為未知，83 個金融未知及三項 TTM null 保留。

驗收環境為 Windows／Node.js 24.14.1／npm 11.12.1／既有 Chrome 連線。API 的 web reader／Chrome 讀取受限有如實記錄；公開 PowerShell GET 無需金鑰或帳戶並成功保存。

| 介面驗收 | 實際結果 |
| --- | --- |
| 身份／非空白 | 正確中文應用及 Production URL；九事件、六 review、84 金融指標 |
| 無框架錯誤／console | 無覆蓋錯誤畫面，error／warn 空清單 |
| 截圖／版面 | 桌面 CSS 1536×684，無整頁水平溢出；要求 390×844 時尺寸控制未生效，DOM 仍為 1536×684，窄視窗實測未驗證 |
| 互動 | 來源卡展開、四個正確外部連結及安全屬性、nanosecond 保留、Enter 展開、原始 JSON、Fixture 清除 |

四項研究與一項 UI 回歸新增，相關 33／全套 567 項通過；兩模式 validate 各 84 指標／25 公式／0 錯誤與警告，unknown 1／83。回歸覆蓋原始內容 hash、商品單位、四來源 chronology、金融／舊來源版本不改、預覽拒絕且不寫入、歷史 replay 與 Fixture 隔離。桌面截圖在 TEMP，尺寸設定已重設，核對命令列及連接埠後停止驗收服務。命令：

```powershell
node --test tests/research/production-market-quotes.test.js tests/research/event-inspection.test.js tests/dashboard-workspace.test.js
npm test
npm run validate
npm run validate -- --production
# 此候選仍被期間檢查拒絕；不會寫入。
node cli.js research-preview data/research/market-quotes-2026-10-04.yaml --production
```

沒有重新認證個人交易資格、交易所提款網路與 custody；其他市場／其他瀏覽器／全尺寸未實測。UNI 年度費用／burn、SECZ 可比性／六類收入與現行股本、supply／同步市值／FDV、足夠連續 verified 期間及完整父 baseline 仍未完成。

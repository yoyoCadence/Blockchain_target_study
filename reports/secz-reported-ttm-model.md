# SECZ 獨立兩類報表收入路徑：附條件 TTM v2

依分析者決策 [D-20261029-01](decision-log.md#d-20261029-01secz-獨立兩類報表收入路徑採附條件-ttm-v2)，新增獨立的報表口徑收入路徑，與原六類模型分開。六欄及 `secz.revenue` 仍為 null；沒有用零值填補未披露細分，也沒有把研究推導存成 OBSERVED。

## 結果與原觀測

| 類別 | FY2025（已審計） | H1 2025（未審計） | H1 2026（未審計） | 附條件 TTM |
| --- | ---: | ---: | ---: | ---: |
| Tokenization | 37,411,171 | 20,136,056 | 18,974,344 | 36,249,459 |
| Asset Servicing | 24,740,969 | 9,160,139 | 14,939,967 | 30,520,797 |
| 兩類合計 | | | | 66,770,256 |

原觀測單位 USD；兩類 TTM 是 2025-07-01 至 2026-06-30 的完整十二個月金額，以 USD/year 表示，沒有季度乘四或半年乘二。輸出 `secz.reported_tokenization_ttm`／`secz.reported_servicing_ttm`／`secz.reported_revenue_ttm` 都是 DERIVED，confidence=low。

原六筆觀測來自已保存 [年度](../data/research/revenue-reviews/secz-prospectus-v1.json)及[期中](../data/research/revenue-reviews/secz-q22026-v1.json)研究，與[附條件 TTM v2](../data/research/revenue-ttm-reviews/secz-20260630-v2.json)逐筆相符。保留原知識日、開始／結束／月數、審計狀態、營運子公司合併 US GAAP 範圍、來源與研究紀錄 ID。

## 公式與可比性

公式 registry v4 新增三條 v1，字典 v2 新增六個金額輸入、一個假設、三個推導，合計 102 指標／31 公式。原有公式與原 92 個指標不改。

- `f.secz.reported_tokenization_ttm`／`f.secz.reported_servicing_ttm`：FY − 前年同期 YTD ＋ 本年同期 YTD，政策 `conditional_ttm_bridge`。AST 仍只使用受限運算，宣告四個依賴角色；不從 YAML 執行程式碼。
- `secz.reported_ttm_comparability@1`：ASSUMPTION，低信心，採用研究 `secz-ttm-20260630-comparability@2`，以研究 hash／ID 連回五項判斷。**只有旗標 1 才計算；0 或 null 直接回到未知，不能乘成零收入。**
- `f.secz.reported_revenue_ttm`：只加同範圍、同完整 TTM 窗口的兩類推導；任一未知即未知。原六欄不參與此加總。

新政策僅支持目前的曆年財報：FY 必須 1/1 至 12/31，YTD 必須從 1/1 到所宣告月數的月底，兩個 YTD 需相隔一年且窗口一致。前期 YTD 不得超過全年；已審計 FY 與未審計 YTD 分開檢查，拒絕擅自提升審計狀態。季度、point、跨主體、不同會計基礎、錯誤單位／日期／月數均拒絕，且不可存快照。

MG Stover Inc.／LLC 名稱衝突維持未解；新旗標代表分析者採用附條件銜接，不代表法律主體已查證。結果不是已審計 TTM、有機成長、pro forma、母公司收入／估值或個人可投資性認證。既有 `secz.required_cagr` 等六類路徑維持未知；EV、FCF 利潤率及估值期間缺口沒有補值。

## 追加歷史

1. 模型版本先保存：Fixture 快照 `fc6d2fd6…`、Production `bb6079b8…`。正式新金額當時仍未知。Fixture 用獨立合成 FY／H1 示範（兩類 TTM 110M，與原六類 100M 分開）；原 UNI 0.422 不變。
2. 重播原研究後產生[提案](../data/research/secz-reported-ttm-baseline-2026-10-29.yaml)，先 `research-preview`，再以 digest `925f1293…` 套用一次，事件 `secz-reported-ttm-baseline-20261029`／快照 `8c216014…`。**不可重跑套用。**
3. 三份原研究來源 v1 首次進入正式來源集合，內容逐字保留；另追加三份 v2、supersedes v1，只擴充 canonical 指標覆蓋。未重新取得或刷新來源日期。

模型變更與資料變更分開比較；公式、假設與來源變更各自可見。原 92 個指標及論點逐欄不變，模型日仍 2026-10-07。正式指標數增加，但 unknown 仍 72；缺值沒有被轉成健康證據。

## 介面與驗證

正式工作區 SECZ 卡片先顯示獨立路徑、三張 TTM 指標、完整窗口、低信心與非已審計提示。血緣包括兩類公式、各三筆原觀測及可比性假設；揭露混合審計、報表主體和研究依據。假設旗標顯示「採用附條件假設」，避免把 1 當成 100% 信心。Fixture 另有合成標記，切換時清空原血緣。

驗證涵蓋原研究精確重算、六筆缺值各自傳播、假設撤回、期間／單位／審計／主體拒絕、兩類窗口不符、所有舊快照重播及 UI 切換／血緣互動。`npm test` 本機全套 1282 項通過（新增 37 項），兩模式 `validate` 無 errors／warnings（unknown 1／72）；此 PR CI 最終狀態以遠端為準。Chrome 實測桌面 CSS 1536×684、窄版 CSS 288×608：原期間／分類／假設血緣與 Enter 展開通過，頁面及 dialog 無水平溢出，console 無 errors／warnings；Fixture 的合成兩類收入與正式結果分開。未驗證其他瀏覽器或真實手機。

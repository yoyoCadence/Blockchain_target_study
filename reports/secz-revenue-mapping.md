# SECZ 兩類披露與六類模型的對應缺口

2026-10-29 查閱 [S-1 年度 Note 19 Revenue](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm) 與 [Q2 Note 18 Revenue](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm)。兩份表均分 Tokenization／Asset Servicing。定義包含多種服務和認列時點，不能直接拆成模型的六個互斥金額。

## 已觀測的定義

Tokenization 含交易、維護及配售；Asset Servicing 含移轉處理與基金會計／行政服務。兩類都包含時點認列及按期間認列，不能把整類當成經常性 SaaS。上述為兩份 SEC 申報的收入附註摘要，分類 OBSERVED；不是由業務行銷推估收入。

[研究資料](../data/research/secz-revenue-definitions-2026-10-29-v1.yaml)保存四項有日期與來源 ID 的摘要。取得方式明示 `web_reader_text`；原始 HTTP bytes／hash 未取得，不能稱逐 byte 原文封存。本執行環境沒有先前提供的 SEC 聯絡環境變數，因此用網頁讀取工具查閱，沒有填造聯絡資訊。

## 六欄逐項界線（分析推論，未核准分配）

| 模型欄位 | 可能相關的報表類別 | 無法直接填值的原因 |
| --- | --- | --- |
| `secz.tokenization` | Tokenization | 若填報表全額，交易及維護等已包含在內，其他欄再填會重複。 |
| `secz.servicing` | Asset Servicing | 若填全額，不能再加同類中的基金行政收入。 |
| `secz.transaction` | Tokenization | 有交易服務定義，未獨立披露同期間金額。 |
| `secz.saas` | Tokenization、Asset Servicing | 兩類都有持續服務；維護不等於整類收入或全部 SaaS。 |
| `secz.administration` | Asset Servicing | 有基金會計／行政服務定義，但獨立金額未知。 |
| `secz.other` | 未確認 | 未單列不代表零，不能用其他欄位的未知值計算剩餘。 |

這張表是分析者待確認的概念對應，不能用作 OBSERVED 分配。`f.secz.revenue` v1 目前將六欄相加；若直接填兩大類再填它們的子服務，會重複計算。六欄及正式總收入繼續 `null`。

## 已備妥的選項

保留六類細分未知，另增明確命名的「報表口徑兩類收入」推導路徑；完整保留原六欄與舊快照。2026-10-29 分析者已選擇採附條件 TTM v2，保留低信心及名稱衝突（D-20261029-01）。接續獨立段落實作模型版本與期間政策，再經預覽／digest 套用數據。不能把未披露四欄填零來湊總額。

上述獨立路徑已完成，[模型／期間政策與資料套用](secz-reported-ttm-model.md)提供三個附條件 TTM 推導。六類細分仍未知，並未取得可量化的互斥拆分。

法律主體名稱衝突、TTM 可比性、母公司與營運子公司範圍、股本／EV／價格及個人可投資性都是獨立缺口。收入定義研究不解除這些阻擋，也不增加論點期間。

## 保存與驗證

source-only `market_data_review` 事件 `secz-revenue-definitions-20261029` 追加兩份 tier 1 來源版本及完整快照，`updates=[]`；不重跑套用。研究檔摘要並非 canonical 金融觀測。既有公式、假設、情境與六欄原 null 均保留；以事件快照和前一快照比較驗證。

`npm test` 1245 項通過；`npm run validate` 與正式模式驗證均無 errors／warnings（unknown 1／72）。新增兩項回歸驗證原日期、分類、來源、取得限制與 source-only 不變性；無介面改動。

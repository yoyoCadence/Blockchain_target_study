# SECZ 轉售登記股數分類核對

本項於 UTC 2026-10-04 案頭審查 closing-date 披露，完成選定表格的直接閱讀與算術對照。正式金融 baseline 尚未完成，目前股本與同步估值仍未知。

先前網頁讀取器的 4 MiB 限制仍存在；本次 Chrome 連線可用，直接讀取原始 [S-1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm) 第 15 頁股數表、第 49 頁款項用途及第 129–135 頁轉售段落的 50 列股數／第 7、8 註腳。這是選定披露審查，未宣稱完整全文、全部持有人歸屬或法律審查。舊 indexed-only source、資料包與閱讀限制原封保留；本次另存直接閱讀來源。

50 列原始 common 與 earnout 欄位逐列保留名稱、頁碼與原文；9 個破折號是 OBSERVED null，不改為零。研究紀錄另有 8 個具來源的類別觀察，共 108 個 OBSERVED；全部有唯一 ID／版本、原知識日、point 期間、count 單位、confidence 與來源版本。count 表示母公司普通股股數。

| 對照 | 披露／算術結果（股） | 判讀限制 |
| --- | ---: | --- |
| 50 列轉售 common 欄合計 | 144,479,908 | 包含 JD6 權證標的，並非全部已發行 |
| earnout 欄已披露數值列合計 | 7,088,616 | 只加總 41 個已知列，9 個 null 仍在 |
| 上述兩欄合計 | 151,568,524 | 與申報費表登記量相同，不是全部增發 |
| common 合計扣除權證標的 3,711,658 | 140,768,250 | 與 Exhibit 5.1 已發行轉售類別相同 |
| earnout 合計扣除 Sponsor 已發行條件股 1,800,000 | 5,288,616 | 類別對照，不選作已驗證新增股數 |
| 公司 earnout 上限 6,250,000 與前列之差 | 961,384 | 原因、完整分配與登記覆蓋未調節 |
| S-1 stated-after 314,834,209 減 before 163,265,685 | 151,568,524 | 算術等於登記總量，仍無法證明全部轉售都是新發行 |

第 7 註腳明示 JD6 common 欄包含 3,711,658 權證標的，927,916 當時可行使，其餘有條件；可行使不代表已行使。[S-1 轉售表／註腳](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm)

原 [Exhibit 5.1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/exhibit51-sx1.htm)把 7,088,616 整體描述為可能發行的 earnout；表格卻包含 Sponsor 1,800,000，而 [10-Q Note 5](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056788/secz-20260630.htm)明示這部分已發行、在 closing-date issued 股數內。這項跨披露分類差異不刪除或靜默選取，扣除後的 961,384 差額亦未獲直接解釋。

[申報費表](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/securitizefilingfees.htm)是登記量及法定計費範圍；原始歷史計費價格不當作目前市場價格或公司募資款。S-1 第 49 頁明示公司不取得 selling-stockholder 轉售款項。轉售、權證行使、條件新發行及已發行 Sponsor 股的重疊必須分開。

7 條研究算術公式皆為 DERIVED v1，使用既有受限 AST（add／sub）、確切觀察 ID 與完整遞迴來源依賴。公式與原始輸入嵌入[不可變研究紀錄](../data/research/capital-reviews/secz-resale-20261004-v1.json)，hash `f3bce7412757bc8e418b2c6b6afc2066886660a7a636ef78b320a44e59e4d693`。已披露 earnout 合計明示選定 41 列，不把未披露列當已知零；選定 common 觀察變未知時，其合計及下游結果傳播 null。

各來源／觀察日期保留：S-1 7/31 filing 與 7/30 acceptance／opinion 不混同；加入 8/13 10-Q 的交叉證據後，相應 observation 知識日為 8/13，不回填到 7/31。DERIVED 對照期末 7/31 僅是登記披露比較基準，非同日完整股本、目前估值或額外論點期間。

[手動事件資料包](../data/research/secz-resale-capital-2026-10-04-v1.yaml)只追加來源，以 research_review 釘選上述研究 hash。新增 S-1／申報費來源 v1，另為 Exhibit 5.1／10-Q 的擴充 metric coverage 保存 v2 並明示 supersedes；原版本不改。唯讀 preparation 確認金融與 journal bytes 不變，再用既有 CLI 保存[完整 journal](../data/events/production/secz-resale-capital-review-20261004.json)，快照 `0abb51bb8a1c41e592d8e9bd9bc55c8ee7c8a2213b07154aad5217d974dd0a4c`，parent `ef433299...`。

全部金融輸入、25 條金融公式、假設、圖譜、市場估值、論點與先前六份快照保留。七份正式快照仍同一模型期；83 個金融未知與三個 TTM null 不變。這份股本研究未加入固定 Dashboard 研究目錄，可由本頁連結閱覽；未修改 UI。

驗證：5 項新回歸與既存股本／權證共 13 項通過；全套 npm test **457 通過、0 失敗**，兩模式 validate **84 指標／25 金融公式／0 錯誤與警告**，未知 1／83。測試驗證 schema、來源日期／coverage、破折號、完整公式與遞迴依賴、null 傳播、事件 hash 綁定、版本追加、全歷史重播及 Fixture 隔離。命令：

```powershell
node --test tests/research/production-secz-resale.test.js
npm test
npm run validate
npm run validate -- --production
```

父 baseline 未完成：登記／earnout 仍有分類衝突、完整歷史分配與現況權利未核對；同步母公司價格／股本／現金負債、SECZ 法律名稱／TTM／六類收入與 UNI 全期間捕獲、個人投資管道仍待查證。

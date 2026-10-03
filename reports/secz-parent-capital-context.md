# SECZ 母公司歷史股本範圍

本子項保存 dated primary-source context，供日後同步估值前核對。研究知識日為 UTC 2026-10-03，review／retrieval 為 2026-10-03T13:25:29Z；開發收尾為台北時間 2026-10-04。沒有目前市值、EV 或 fully diluted 股數結論。

上市母公司 Securitize Corp.（原 Securitize Holdings, Inc.）與營業子公司 Securitize I, Inc.（原 Securitize, Inc.）分開。母公司 10-Q 的六月底報表是合併前 holding company，不能把其中 10,000 股／USD 1 petty cash 與子公司收入或合併後母公司估值混用。[10-Q explanatory note／balance sheet](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056788/secz-20260630.htm)

10-Q cover 的普通股數日期為 8/13；Note 5 的 closing 股數日期為 7/1。兩者均披露 163,265,685 股，但不證明 10/4 現況。以下是 7/1 Note 5 的原始股數分類，單位均為 common shares；不相加成 FDV denominator。

| 類別（中文釋義） | 股數 | 與 closing 已發行股數的關係 |
| --- | ---: | --- |
| 已發行／流通普通股 | 163,265,685 | Closing 合計 |
| Sponsor 限制股份 | 1,800,000 | 已包含；仍有 vesting／forfeiture／transfer 條件 |
| 可能新增 earnout 股份上限 | 6,250,000 | 未包含；須符合條件 |
| Incentive／employee purchase plan 預留 | 16,321,869 | 未包含；容量不是已發行或已授予數 |
| Warrant 對應可能發行股份 | 3,711,658 | 未包含；須行使等條件 |
| Option／RSU 對應可能發行股份 | 3,681,510 | 未包含；須行使／vesting 等條件 |

限制股份不能重加；未完成的條件／行使不能宣稱已發行。現況 vesting、earnout triggers、行使與交易尚未逐項查證。[10-Q cover／Note 5](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056788/secz-20260630.htm)

S-1 Exhibit 5.1 分開列 140,768,250 已發行轉售股、3,711,658 warrant underlying 股，以及最多 7,088,616 earnout-category 股。10-Q 另列 S-1 登記轉售 151,568,524 股；**轉售登記不能全當新增發行**。Opinion 的 7,088,616 與 10-Q 的 6,250,000 所屬範圍差異尚未完成調節，不選一方、不據此計算稀釋。律師 opinion 的條件與假設亦不等於本系統的獨立法律查證或個人投資性認定。[Exhibit 5.1](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/exhibit51-sx1.htm)、[10-Q Note 5](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056788/secz-20260630.htm)

另保留 S-1 搜尋索引 offering-table 所列 314,834,209 的衝突 context。全文超過 web reader 大小限制，本次只讀該索引節錄，**未驗證完整表格／註腳或 current／fully diluted denominator**；不刪除、不採用或以轉售數重算。資料包的該 source title 與 review 明示閱讀限制；Tier 1 表示原始 SEC 發布者，不表示全文已核對。[S-1 原始頁面](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/secz-20260731.htm)

日期衝突保留：Exhibit 5.1 日期／所述 S-1 filed 為 7/30，EDGAR 顯示 accepted 7/30 20:11:36、filing 7/31；來源 availability 保守使用 7/31，沒有替無時區 acceptance 加上 UTC。10-Q index filing／accepted 為 8/13，Period of Report 為 6/30，與 cover 股數日期不同。[S-1 index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/0001628280-26-051182-index.htm)、[10-Q index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056788/0001628280-26-056788-index.htm)

保存於 [資料包 v1](../data/research/secz-parent-capital-context-2026-10-03-v1.yaml)及 [source-only journal](../data/events/production/secz-parent-capital-context-20261003.json)。使用既有 governance event 表示歷史 closing review，並非新發行事件；updates 為空，追加五份來源版本與完整 snapshot `ba6d00d12f57a40fb017ffdf6e0b473d05b9e1e60f2abf6c23acf55b46037f49`。舊四份完整 snapshot hash／來源版本保留；五份仍屬同一模型期，不能當五期 thesis 證據。這是來源敘述資料，尚未新增機器可計算的股本模型／catalog artifact。

驗證：`npm test` 407 passed、0 failed，36 targeted tests 通過；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。四項新增回歸涵蓋資料包／journal 綁定、來源日期與限制、source-only 比較、金融／thesis／history 重播、TTM null 與 Fixture 隔離。初次 clock-probe 失敗與測試副本隔離修正見 [validation](validation.md)。未修改 UI，未新增瀏覽器 QA。

完整 baseline 未完成：現行資本結構與同步價格／合併後現金負債、earnout／登記類別調節、SECZ 法律名稱衝突／TTM／六類收入／FCF、個人投資管道及 UNI fee-origin／全期間 capture 仍待驗證。金融未知維持 83，不補目前估值。

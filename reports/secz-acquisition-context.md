# SECZ 收購範圍交叉查證

2026-10-03 保存 primary-source context 子項。收購日期與配置一致，但名稱差異沒有直接法律澄清；正式 TTM 三項仍為 null，完整 production baseline 未完成。

S-1 的 SEC [XBRL narrative R30](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/R30.htm)同時包含 interim 的 MG Stover, LLC 與 annual 的 MG Stover, Inc. 標題。所選 [8/7 prospectus](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)年度 Note 3 保留 Inc.；[8/13 interim exhibit](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm) Note 3 保留 LLC。三者均敘述自 2025-04-15 收購日起合併營運結果，不是從年初合併。

S-1 [allocation R90](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/R90.htm)的 acquisition member 標示 MG Stover, LLC／`secz_MGStoverLLCMember`，所讀 April 15 欄位與上述年度／季度 Note 3 配置一致。以下是披露的收購日 USD 金額，保留原正負號與 context；未寫入年度收入、目前母公司 debt/cash 或 valuation。

| 披露項目（中文釋義） | 原始 USD |
| --- | ---: |
| 扣除取得現金的對價 | 21,090,525 |
| 客戶關係 | 9,400,000 |
| 預付費用 | 109,538 |
| 可辨認資產合計 | 9,509,538 |
| 應付帳款 | -991,616 |
| 遞延收入 | -462,398 |
| 承接負債合計 | -1,454,014 |
| 可辨認淨資產 | 8,055,524 |
| 商譽 | 13,035,001 |
| 含商譽的取得淨資產 | 21,090,525 |

數值／日期／XBRL tag 一致提供財務 presentation 交叉證據；**不能據此宣稱 Inc.／LLC 法律主體等價已查證**。原 ASSUMPTION comparability v1 的 acquisition_treatment 仍 null。原 [TTM request](../data/research/secz-ttm-20260630-review-v1.yaml)與研究 hash `6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d` 保留，不以新來源靜默改寫。

收購 pro forma 是披露的反事實財務 context，假設收購更早發生；不等於報表 actual revenue 或未來預測。所選 prospectus 年度 Note 3 與 interim Note 3 的 pro forma 欄位，需與既存已驗證報表／收入附註區分：

| 期間／範圍 | 報表 actual USD | 收購 pro forma USD |
| --- | ---: | ---: |
| FY2025／Securitize, Inc. 子公司合併 | 62,152,140 | 68,938,369 |
| FY2024／同範圍 | 18,636,170 | 42,492,286 |
| Q2 2025／interim 比較期 | 15,262,176 | 16,253,221 |
| H1 2025／interim 比較期 | 29,296,195 | 35,365,979 |

年度 pro forma 涵蓋 Theorem 與 MG Stover；interim 所述為 MG Stover，不能混成同一 accounting basis。Actual 含收購日後的營運，不能直接解讀為 organic like-for-like growth。[prospectus](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/securitizeholdings-424b3.htm)、[interim exhibit](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/exhibit991securitize-q22026.htm)

來源 dates 依獨立 index：S-1 7/31、424B3 8/7、8-K/A 8/13。S-1 accepted 7/30 與 filing 7/31 的差異保留；8-K/A 的 report date 7/8 與 exhibit 財務期末 6/30 分開。Review／retrieval 是 2026-10-03T11:40:14Z，不回填到歷史交易日。[S-1 index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026051182/0001628280-26-051182-index.htm)、[424B3 index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026054866/0001628280-26-054866-index.htm)、[8-K/A index](https://www.sec.gov/Archives/edgar/data/2094496/000162828026056811/0001628280-26-056811-index.html)

使用既有 source-only acquisition event 保存 [dossier](../data/research/secz-acquisition-context-2026-10-03-v1.yaml)與 [完整 journal](../data/events/production/secz-acquisition-context-20261003.json)。Snapshot `325bb03d8d7b4b2d395623bd03f43da83a0311d363a08ca6e59f8f7b9255dca7` 保留 inputs／sources／formulas／rules／metrics／thesis／graph／market valuation，空 updates、七份新來源版本；每份舊來源／觀察／snapshot hash 保留。這是歷史子公司披露 review，不是新母公司交易；graph edges 未變。四份同一模型期 snapshot 不增加 thesis 期數。

驗證：新增四項 committed-evidence／來源版本／重播／null 屏障回歸；`npm test` 325 passed、0 failed。兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。Fixture 隔離、正式 TTM null、所有財務值／假設／公式／thesis 未變；Chrome 僅讀原始來源，無 UI 修改或 UI 驗證。

下一步仍需直接釐清法律名稱與完整更正沿革，或保留 unknown。確認 TTM、六類 mapping、FCF／margin、同步母公司估值、個人投資管道及 UNI fee-origin／全期間 capture 均未完成；父項不能勾選。

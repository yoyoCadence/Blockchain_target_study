# 唯讀手動時效 API

`GET /api/freshness?mode=production&as_of=2026-10-03` 沿用已完成的手動時效 engine；沒有新增公式或政策。可在啟動本機 server 後查詢：

```powershell
Invoke-RestMethod 'http://127.0.0.1:4310/api/freshness?mode=production&as_of=2026-10-03'
```

mode 預設 Fixture，僅回 canonical synthetic 時效／完整來源與 fixture flags；Production 另含已驗證／重播的固定身份、收入及 TTM 研究時效。兩者保留 observation／publication／retrieval／review 日期、原 source versions、unknowns、policy ASSUMPTION v1、DERIVED UTC calculation v1 及 dependencies。回應與既有 engine／CLI 同一內容，不將年齡公式或數字移到 UI。

省略 as_of 使用當前 UTC 日。截止日包含整個 UTC 日，不是秒級歷史回放。空值、非法／未來日期、非法 mode 回 400；POST／PUT／PATCH／DELETE 回 405。回應 no-store，查詢不寫資料、不存 snapshot、不改金融值或 thesis；不遠端採集或排程。來源／資料／canonical history 與 research hash／replay 失敗仍由既有 guards 拒絕。

2026-10-03 Production：58 unknown inputs；歷史 approved budget 觀測日期仍 2026-01-01／STALE_FOR_CURRENT_USE，本日重新取得來源不能續新 observation。五份研究／30 records 保留三項 DERIVED TTM null／INSUFFICIENT。窗口符合不代表 current investability、可比性或健康 thesis，records 也不是連續期數。

新增九項 HTTP 回歸涵蓋 engine 回應一致、兩種 workspace、舊觀測／近期來源、未知 TTM、historical cutoff、日期／mode／method errors、UTC default 及 inputs／sources／policy／金融結果／thesis／history hashes 不變。`npm test` 353 passed、0 failed；兩模式 validate 84 metrics、25 formulas、0 errors/warnings，unknown 1／83。測試 servers 關閉；無 Dashboard 修改／瀏覽器 UI 驗證。

API 子項完成；Dashboard freshness controls、完整 production baseline、真實連續期數與原有研究缺口仍未完成。政策修訂需新版本／changelog，新增研究需人工 catalog review；此 route 不自動探索或提升資料。

2026-10-03 後續增量：已另完成 [Dashboard 手動查詢](freshness-dashboard.md)，沿用本 API，包含 workspace／cutoff 切換後清除結果、延遲回應隔離、desktop／mobile QA。API 原驗證結果與版本保留；完整 baseline 仍未完成。

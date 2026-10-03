# 手動研究來源時效

本子項將既有 canonical 時效檢查延伸到固定 catalog 中的身份／原始財報／TTM review。只讀取本地已保存版本，不遠端採集、不定時執行、不補入金融數值。

## 操作與輸出

```powershell
node cli.js research-freshness --production --as-of 2026-10-03
```

未指定 cutoff 時使用當前 UTC 日。`--production` 必填；錯誤／未來日期、缺少 cutoff 參數、catalog hash／重播失敗都會拒絕。

原 `freshness` 命令與 canonical 回應不變。新命令額外提供 `research`：

- 每份 artifact 的固定 hash、review metadata、review age／availability、完整期間、報表範圍及可比性 ASSUMPTION。
- 每筆原 record、分類／confidence／as-of／unit／period／來源及 status，另列 observation age／review window／evidence state。身份的 investability 與 TTM 未確認原因保留。
- 完整來源版本的 publication age、retrieval age、取用 record／artifact 關係及重新查證狀態。相同來源 ID 的相同內容只統計一次；不同版本或獨立 filing 都保留，不依 URL 默默合併。
- 共用 `freshness.utc_calendar_days` v1 的 DERIVED metadata 與 input artifact／record／source／policy dependencies。

OBSERVED as-of、publication、retrieval 與 desk review 可用日期分開。歷史 cutoff 之前尚未完成的 review 不能當時可用；已知舊 observation 可保留日期與 age，evidence 仍標 INSUFFICIENT。cutoff 是整個 UTC 日的日曆精度，不能解讀成當日某一精確時間點已取得資訊。

## 政策與界線

沿用既有 `manual-source-freshness` ASSUMPTION policy v1：一般 observation 90 日、retrieval 30 日，既有金融輸入的個別 overrides 保留。原始研究使用一般窗口，本版沒有新增研究專用 override 或修改閾值／公式。執行者提供的替代 policy 僅在記憶體中分析；正式政策修訂仍須新版本與 changelog。

WITHIN_REVIEW_WINDOW 只表示符合分析者窗口。它不能確認 current investability、報表可比性或 thesis 健康，也不能把 DERIVED、ASSUMPTION、SCENARIO 或 null 當成已查證事實。不同 review 的 record 數量不構成連續 thesis 期間。

讀取先重驗 hash／embedded replay，跨 artifact／canonical 的 source ID 不得重用不同內容；重用 observation ID 卻改原 record／期間／報表範圍也拒絕。獨立觀察與新來源版本保留，沒有自行選擇衝突來源或 financial ingest。

## 實際結果與驗收

2026-10-03 cutoff：五份 research reviews、30 筆紀錄、13 個研究來源版本。27 個 OBSERVED 在既有窗口內；三項 TTM DERIVED 仍為 null／COMPARABILITY_UNVERIFIED、NOT_OBSERVED／INSUFFICIENT。Canonical 輸入仍有 58 個 unknown，歷史 UNI approved-budget observation 不因本日重新取得來源而更新 as-of。

17 項新增回歸涵蓋唯讀／金融結果與 journal 不變、歷史 cutoff、UTC review day、窗口邊界、重新取得時效、未知 metadata、Fixture 拒絕、來源／observation ID 衝突、新版本保留、hash pin 與 CLI。首輪 test-only null 未同步 unknown confidence，已修正；最終結果見 [validation](validation.md)。本次沒有 UI 修改。

目錄範圍仍為既有五份研究；canonical source-only 事件的來源由原 `source_checks` 保留。本命令不自動探索其他資料包、完成 fee-origin／TTM／六類映射／同步估值／個人管道研究，或新增調度／通知。

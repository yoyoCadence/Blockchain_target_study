# 手動來源時效檢查

本項完成 NEXT 的手動時效分析子項。資料包與正式歷史來源已有 metadata，可獨立檢查；沒有採集、排程、通知或自動 PR。

```powershell
node cli.js freshness --production --as-of 2026-10-03
node cli.js freshness --production
```

未指定日期時使用目前 UTC 日期；截止日包含該 UTC 日，不提供秒級回放。可檢查過去截止日；未來或無效日期會拒絕。命令只讀，不存快照、不寫入 observation、不修改任何財務數字或 thesis，並沿用既有歷史版本一致性檢查。Fixture 模式仍明確標示 synthetic provenance。

## 時點與門檻

- **觀測日期**：只對有值的 OBSERVED input 使用原紀錄 as_of，按 UTC 日數計算 age；今日重新閱讀舊文章不會更新 observation。
- **取回日期**：source.retrieved_at 的 UTC 日期用於重新查證窗口，與 publication_age 分開。日期尚未到截止日時 age 為 null，不能供應當時的證據。
- **發布日期**：保留來源原始 date 並顯示 age，作為背景；古老合約或公告不會僅因發布年分就被判錯。
- **未知／假設／情境**：沒有資料的 input 是 UNKNOWN_DATA；已知 ASSUMPTION／SCENARIO 是 NOT_OBSERVED，均保持 INSUFFICIENT，不會被表示成新鮮事實。

[Policy v1](../spec/source-freshness.yaml) 是明示的 **ASSUMPTION**：一般 observation 90 天、取回重新查證 30 天；價格與市場估值 1 天。這些是暫定分析者窗口，不是外部規則。超過窗口為 STALE_FOR_CURRENT_USE 或 RECHECK_DUE，等於需要重查；不否定歷史事實，也不構成 thesis 觸發條件。門檻當日仍在窗口內。

日數計算以 DERIVED metadata 回報公式 `freshness.utc_calendar_days` v1、UTC definition、確切 record/source IDs 及 policy ID／version／digest。Policy 改變需提高版本並更新 changelog；算法改變需提高 formula_version。回傳全部來源版本，active 僅代表現行 OBSERVED input 引用該 ID，不刪除未使用或被 supersede 的歷史來源。

## 2026-10-03 實際結果

正式資料共有 59 個 input：58 個 UNKNOWN_DATA；唯一已知 input 是 2026-01-01 的歷史 UNI budget，age **275 天**，在 90 天假設下需要重新查證才能代表當前額度。其四個來源都是本日取回，證據可追溯；取回新鮮與觀測過期同時呈現。財務總計仍為 84 metrics／25 formulas，83 個數值未知；thesis 仍 independently insufficient。

14 項新增測試涵蓋兩種日期獨立呈現、窗口边界、UTC offset／閏日、過去 cutoff 排除未來來源、未知／假設／情境、歷史來源、非法 policy／CLI 日期以及不改動經濟計算／thesis／快照。完整套件 97 passed；兩種 validate 無 errors 或 warnings。

## 剩餘限制

這是正式數字型 input/source 的時效報告；不檢查獨立 identity dossier、不確認 URL 可用性或來源內文、不自動重查部署狀態或進行季度採集。原有財務未知值不會因這份報告而填入。

優先 baseline 尚有兩個資料障礙：SECZ 季度揭露與目前 USD/year 六類收入未完成明確對照及可比期間處理；三資產尚無同截止日的已查證市場估值／當前通道審查。更大的自動更新、額外資產及底層 TAM 擴張暫不前進。本項與這些缺口獨立，完成它不代表完整 baseline 完成。

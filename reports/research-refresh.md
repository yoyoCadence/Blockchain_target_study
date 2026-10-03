# 人工審查的一手來源研究更新

本流程完成 NEXT 首項的工具子項。首份正式 production baseline 仍需研究與人工審查；目前正式來源與 observations 保持空白，沒有把測試資料帶入 production。

## 準備資料包

依 `spec/research-refresh-schema.yaml` 建立 YAML 或 JSON，填入唯一 `id`、資料截止日 `as_of_date`、更新理由 `reason`、受影響研究節點 `affected_nodes`、新增 `sources`、`observations` 與人工 `review`。下列骨架尚不能套用；請填入實際證據與觀測紀錄。

```yaml
version: 1
id: uni-research-YYYY-MM-DD
as_of_date: YYYY-MM-DD
reason: 填入這次更新的具體理由與範圍
affected_nodes: [UNI]
sources: []
observations: []
review:
  reviewer: 填入實際審查者
  reviewed_at: YYYY-MM-DDTHH:mm:ssZ
  rationale: 說明查證內容、期間可比性及未解決的證據限制
```

來源使用既有 `spec/source-registry.yaml`：必須保留 ID、版本、URL、publisher、title、date、retrieved_at、tier、covered_metrics 與 `fixture: false`。可引用已登錄的來源，也可在同一資料包加入新來源。新增版本使用不同 ID、遞增 version 與明確 supersedes；其他互相衝突的來源也應保留。

觀測使用既有 `spec/canonical-schema.yaml`：每筆須指定 ID、metric_id、asset、value、unit、`classification: OBSERVED`、as_of_date、period、confidence、version、`fixture: false` 與 source_ids。每筆至少有一個 tier 1 或 2 一手來源，所有引用來源都必須宣告涵蓋該指標。沒有可用數值時保留 null；無證據的指標不應新增 OBSERVED 紀錄。ASSUMPTION、SCENARIO 仍走原本的人工事件流程。

更新已有輸入，包括將尚待查證的 ASSUMPTION 換成 OBSERVED 時，必須以新 ID、較高 version 與 supersedes 指向當前紀錄。未解決的平行 observation 衝突會停止計算，不能靠刪除歷史消除。

審查者須自行閱讀來源，確認研究識別碼、可投資性與價值捕獲證據；引擎檢查 metadata 和模型一致性，不會自動驗證來源內文。來源發布日不可晚於觀測的 as-of，取得時間不可晚於審查時間，審查時間不可在未來。公告、規劃及基礎設施採用不構成已啟用的經濟傳導證據。

價格與流量輸入需要可比較的 period.end。annual、quarterly、TTM 不會自動轉換，既有公式會拒絕不相容期間。本流程沿用既有 affected_nodes 與完整重算，不推導新圖譜關係，也不變更資產投資性登錄。

## 預覽、審查、套用

```powershell
node cli.js research-preview path/to/reviewed-research.yaml --production > path/to/research-preview.json
```

預覽不寫入事件或快照。檢查完整 metrics、market_valuation、issues、thesis、affected_nodes 及 comparison；來源／觀測、假設、情境與公式的變更分別呈現。有前一版本才有版本比較。沒有資料的下游仍為 null，insufficient evidence 獨立保留。

資料包包含人工審查紀錄後，預覽的 `review_digest` 綁定資料包、當前模型、來源／輸入及父快照。確認預覽後明確套用：

```powershell
node cli.js research-apply path/to/reviewed-research.yaml --production --digest <review_digest>
```

資料包、模型或歷史有變動時，舊 digest 會被拒絕，必須重新預覽與審查。digest 用於防止誤用舊預覽；reviewer 欄位是本機審查紀錄，不是登入驗證或簽章。

套用會以 exclusive create 寫入 `data/events/production/<id>.json`，同檔保存來源、觀測、審查紀錄、完整公式快照、重算結果、thesis 與更新理由。重新載入後，來源與 observations 都可參與遞迴血緣。重複 event ID 不能覆寫紀錄；`event` 命令不能直接寫入 research_refresh，必須使用 research-apply。

沿用本機 single-writer 的限制：不支援同時寫入，寫檔中斷時可能需要人工修復不完整的 journal。沒有排程、外部 feed 或自動採集。

## 父任務剩餘驗收

- 查證 UNI／SECZ／XLM 的識別碼與可投資性，維持未查證狀態直到證據足夠。
- 查證 UNI 預算、實際價值捕獲啟用與執行紀錄，分開記錄公告與生效。
- 收集同截止日的價格／估值，以及明確對齊的財務期間；不可用值維持 null。
- 審查第一份正式資料包並保存 production baseline，更新研究結論與資料限制。

這些研究工作尚未完成；本次僅交付人工更新流程與隔離測試。

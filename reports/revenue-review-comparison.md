# 原始收入研究快照比較

本子項支援 SECZ 跨 filing 查證的人工檢視。`revenue-compare` 唯讀比較兩份完整研究 JSON，先核對內容雜湊，再用各自保存的公式重播；即使竄改結果後重新計算雜湊，仍會被拒絕。

```powershell
node cli.js revenue-compare data/research/revenue-reviews/secz-annual-v1.json data/research/revenue-reviews/secz-q22026-v1.json --production
```

比較方法 `research.revenue_review_comparison` v1 位於 `spec/revenue-comparison-method.yaml`，報告保存方法、兩份研究 ID、完整來源與前後觀察。source／formula／statement／record／value changes 分開呈現。沿用來源、觀察、期間或 statement ID 卻改寫內容會拒絕；公式變更要求新版本，不能倒退。current 的知識 cutoff 不得早於 previous。

同一主體、範圍、會計基礎、財年結尾與審計狀態下，只配對相同 metric／USD／完整期間 metadata，結果為 `MATCHED_INTERVALS`；同範圍但期間不重合為 `NO_COMMON_INTERVALS`。範圍差異為 `CONTEXT_MISMATCH`，保留全部未配對觀察。現有年度與季度快照的審計狀態不同，因此上例回報 `CONTEXT_MISMATCH`，不強行拼接。

不同 ID 的 filing 觀察可作為 `INDEPENDENT_OBSERVATIONS` 並列；若兩個已知值不同，標記 conflict，不自行選擇哪份正確。宣告 `supersedes` 的新觀察必須指向 previous 中同一 metric／期間的舊觀察，且 version 遞增；來源取代亦檢查對象與版本。同 ID 重複比較不會新增歷史版本。任何一側為 null，evidence_status 為 `INSUFFICIENT`，不把缺值標成數值衝突。獨立 filing 不因並列比較而自動取代先前觀察。

這是機械對齊與版本檢查；來源內文、更正／重編沿革、經濟可比性仍需人工查證。沒有財務 ingest、年化、TTM、六類收入 mapping、thesis period 增加或 source retrieval。兩份既有研究 artifact 原內容與 hash 保留，canonical financial journal／公式／83 個未知 metric 不变。新的更正或 filing 需另建資料包與版本檔案，不能覆寫舊版；本比較輸出不會自行持久化。

驗證：新增 15 項回歸，涵蓋唯讀、完整重播、範圍／區間、獨立衝突、有效／無效 supersession、未知、全部歷史 ID 類型、來源／公式分離、雜湊及 CLI。父 production baseline 與跨 filing comparability 結論仍未完成。

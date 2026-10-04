# 中文計算阻擋診斷

價格候選的預覽原先只有 `Cannot snapshot calculation errors []`，需要另外計算才能找出阻擋。現在原快照防線在拒絕時保留全部 ERROR，CLI 直接輸出中文說明／指標名稱及原始指標 ID／公式原因。

```powershell
node cli.js research-preview data/research/market-quotes-2026-10-04.yaml --production
```

此候選仍被拒絕，stderr 為完整 JSON：`error` 保留原 machine message，`message` 是「無法儲存研究快照：計算仍有錯誤，本次未寫入。」；`details` 有三筆 ERROR，各含 `metric_id`、中文 `metric_label` 及原始 `message`。實際原因如下：

| 指標 | 中文名稱 | 原公式原因 |
| --- | --- | --- |
| uni.net_accrual | UNI 淨價值累積 | Unaligned accounting periods: f.uni.net_accrual |
| uni.required_share | 所需 Uniswap 市占率 | Unaligned accounting periods: f.uni.required_share |
| uni.required_share_net | 完整淨經濟所需市占率 | Unaligned accounting periods: f.uni.required_share_net |

`research-preview` 與 `research-apply` 仍 exit 1，stdout 不回傳成功結果，也不寫入。apply 仍走原預覽／digest 流程；有計算錯誤時先由快照 guard 拒絕，不會取得可套用結果。沒有修改公式、會計期間、日期、未知值、模型或任何資料以清除錯誤。診斷不是期間對齊的完成證明。

共用 ValidationError.details 是原計算 ERROR 的獨立副本，原排序／machine 原因保留；UNKNOWN 與 WARNING 不混入拒絕詳情。呼叫者修改診斷不會修改計算結果或歷史。有效快照內容、其他錯誤及成功 CLI 格式不改。

四項新增回歸使用真實價格候選與實際 CLI 子程序，驗證三原因完整保留、中文欄位、stdout 空／exit 1、proposal／金融／journal 不變及有效／其他失敗快照契約。相關 60 項及全套 571 項通過，0 失敗；兩模式各 84 指標／25 公式／0 錯誤與警告，unknown 1／83。Windows／Node.js 24.14.1／npm 11.12.1 驗證命令：

```powershell
node --test tests/research/preview-diagnostics.test.js tests/research/production-market-quotes.test.js tests/research/refresh.test.js tests/lineage/history.test.js tests/validation/calendar-periods.test.js
npm test
npm run validate
npm run validate -- --production
```

本次沒有 Dashboard 修改或新的 UI 驗收。外部工具若原先解析這類錯誤的 Node inspect stderr 文字，需要改讀完整 JSON 的 `error`／`details`；exit code 與 stdout 不變，其他錯誤格式不改。正式價格／同步估值與年度／point 依賴對齊仍未完成，83 個金融未知及三項 TTM null 保留。

# UNI 餘額與供給資料包手動唯讀驗證

已保存的四個 UNI 固定區塊呼叫可使用獨立命令重新核對；明示 production 與原資料包已審查 SHA-256。命令只讀取本機檔案與來源，不連 RPC，也不寫入金融、來源或歷史。

```powershell
node cli.js token-state-review data/research/uni-token-state-2026-10-04-v1.json --production --digest 848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d
```

輸出 `persisted:false`／`financial_inputs_updated:false`；中文摘要保留 block／hash／UTC 區塊與取得時間、四個精確字串讀值、嵌入比較公式 v1／DERIVED 結果與確切依賴、完整原始 archive。流通及完全稀釋供給明示 null。缺少 production／digest、digest 不匹配或語意失敗時 exit 1，stdout 空，錯誤在 stderr。

[schema](../spec/token-state-review-schema.yaml) 與[方法 v1](../spec/token-state-review-method.yaml)獨立於金融模型。[共用 reader](../engine/research/token-state.js)先檢查原 bytes hash，再以原 fixed-block reader 重驗釘選的 owner／vesting 資料包：新 anchor／owner／token 必須與原已審查區塊一致；allowance 與 decimals 的同區塊讀值亦需相符。ABI selector／owner／spender padding、target／canonical selector、六個 RPC ID／labels／回應、32-byte uint256 與 uint8 位寬、來源 URL／取得時刻、原依賴及 UTC chronology 均須通過。

四觀測仍為 OBSERVED point、medium confidence；`gte_raw_uint256` 只接受嵌入 v1 的確切兩個 raw 依賴，以 BigInt 重播 DERIVED flag。沒有任意 YAML 程式碼求值。array／response／object key 重排不改語意，重複 ID、混區塊、錯誤解碼／分類／單位、source／formula／lineage 改寫、RPC null／error、未來取得或不一致回應均拒絕，即使提供改寫檔案的新匹配 digest。

這只驗證已保存證據的內部一致性，不認證 provider 或共識 proof，也不證明完整可轉帳／未來付款／全年分配。totalSupply getter 仍不等於流通／自由流通／未來完全稀釋定義；原價格與 block 時點不同，不推同步市值／FDV 或合理價值。v1 只支援這份四觀測、原 owner 依賴與 point 比較格式；新鏈／contract／公式須獨立研究與升版。

45 項新增回歸（含 zero、allowance ±1 raw unit、相等、uint256 max）、原 fixed-block 35 項共 80 targeted 通過；全套 `npm test` 688、Fixture／Production `npm run validate` 通過。84 指標／25 公式、無 errors／warnings，unknown 1／80；原年率 stale、三項 TTM null、Fixture 0.422 與十四份正式／三份 Fixture 歷史保留。CLI 成功／五類缺失或錯誤參數實際執行並核對 stdout／exit code／檔案 bytes。沒有新增觀測、來源、快照或 UI，本子項未重做瀏覽器驗收。研究目錄／API／中文精確表格下一子項接入；完整 production baseline 保留。

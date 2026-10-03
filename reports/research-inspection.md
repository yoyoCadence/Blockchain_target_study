# 唯讀研究證據檢視

本子項把已保存的身份、分期／年度收入與條件式 TTM review 提供給本機 Dashboard 審閱。Production financial inputs 與研究證據分開；檢視不填補 canonical Unknown、不增加 thesis 期數。

## 使用

啟動 Dashboard，切換到 Production，開啟 `07 Research evidence`。五份資料可各自展開，檢查原始數值／識別碼、classification、confidence、期間、as-of、報表主體／範圍、來源版本及發布／取得日期。`Full evidence, formulas and dependencies` 保留完整 review 與 recorded fingerprint。

`GET /api/research?mode=production` 提供相同的唯讀內容。預設 Fixture 回傳空研究清單與隔離說明，POST 拒絕為 405。切換工作區立即清除舊研究；延遲到達的舊请求不能覆蓋最新選擇，canonical 計算也套用同一請求世代防線。

## 來源與重播

`spec/research-catalog.yaml` 是人工維護的 versioned 目錄，固定五個本地檔案及其 content hash。讀取限制在 `data/research/`，schema 排除路徑穿越、絕對路徑與其他 reader kind；重複項與 hash 不符會拒絕整份回應，不能默默略過錯誤證據。

身份資料重新驗證 schema／來源／日期。收入與 TTM artifact 先核對完整 hash，再以內嵌公式／輸入重播；TTM 判斷保留原始 ASSUMPTION、rationale 與雙 filing 證據。所有原始版本保留，未作金融 ingest、遠端採集或目錄自動掃描。新增來源／版本仍須另存並人工更新目錄，不能覆寫舊 artifact。

## 驗證與限制

九項新增回歸涵蓋五份研究重播／財務結果與 journal 不變、Fixture 隔離、路徑／kind／hash／重複拒絕、篡改拒絕及 API 唯讀。完整測試與雙模式 validate 結果見 [validation](validation.md)。

實際 Chrome 桌面驗證了資料包展開、TTM 三個 Unknown 與未確認理由、完整公式／假設／依賴、來源連結及快速 Fixture → Production → Fixture 切換；最終 Fixture 無研究卡片，沒有頁面錯誤。1524px 視窗沒有 body 橫向溢出。未另驗證手機版。

身份 investability 仍為 unverified。正式 TTM 的 MG Stover Inc./LLC 名稱差異未解決，三個結果保持 null／COMPARABILITY_UNVERIFIED。完整 production baseline、六類收入映射、同步估值、現行投資管道與 UNI realized capture 仍未完成。

# 中文已保存事件查閱

正式研究工作區原先只呈現六份固定身份／財報／股本 review，已保存的 UNI 配置、Firepit 交換與 LP 歸集只能從報告或檔案閱讀。現在同一研究頁另顯示八筆已審查人工事件，最近保存的事件在前。

開啟 `http://127.0.0.1:4310/?mode=production#research`，向下找到「已保存事件與鏈上證據」，展開中文事件標題即可查看執行證據與限制、查證方式及來源版本。每筆分開標示生效日、知識日、審查時間與原快照模型期間；「完整原始事件與來源版本」保留保存時間、hash／parent、原始更新及完整 JSON。八筆事件包括 UNI 核准預算、v2 歷史配置、單筆 Firepit 交換、SECZ 收購／股本／權證／轉售分類及 v2 單筆 LP 歸集。

只查閱已保存內容，不重新套用數值更新、寫入歷史或取得外部來源。LP raw 整數 `6952494133386631432161` 保持字串，沒有浮點轉換；LP 不是 UNI，caller 贖回不變成 TokenJar 收入。完成狀態也不代表全期間收入、完整現況或投資性已確認。

唯讀 `/api/research?mode=production` 在原六份 `records` 外加入 `events`。資料來自經驗證的不可變快照：重用 hash／parent／版本連續性、最新歷史一致性、來源／日期／review／範圍驗證；原載入路徑仍核對 journal 與 snapshot。每筆引用當時的來源版本，而非今日最新來源。Fixture 的 `events` 為空，不載入正式事件。API 拒絕寫入及無效 mode。

切換工作區或手動重試時先清除事件，只有最新且模式一致的回應能呈現。研究單獨失敗時維持原金融結果，按「重新載入研究證據」可恢復；尚未套用的情境輸入不變。不自動重試或查詢。

驗證環境：Windows／Node.js 24.14.1／npm 11.12.1，既有 Chrome 連線及本機原服務。503 與 1.2 秒延遲由 TEMP 測試 shim 提供，沒有修改 app、API 或已存金融資料來模擬成功。

| 驗收 | 實際結果 |
| --- | --- |
| 應用身份 | 正確中文頁名、Production URL 及既有工作區 |
| 內容非空白 | 六份 review、八筆事件、84 個金融指標 |
| 無框架錯誤覆蓋 | 原服務正常；503 有中文局部錯誤及手動重試入口 |
| Console | 原服務與 shim 恢復後 error／warn 均為空清單；503 的中文局部錯誤有如實呈現 |
| 截圖／版面 | 桌面 CSS 1536×684、窄視窗 312×675（要求 390×844）；沒有整頁水平溢出 |
| 互動 | 展開事件、Enter 再展開、展開原始 JSON、核對六個來源連結、Fixture 清除；503 後 Enter／延遲重試恢復八事件、六 review，84 指標與未套用利潤率 0.3 保留 |

八項 engine／API 回歸包含 raw 精度、日期區分、唯讀／Fixture 隔離、來源版本及 journal／證據拒絕；三項 UI 回歸使用真實 API 輸出，覆蓋切換清除、晚到回應、失敗／重試及金融不變。驗證命令：

```powershell
node --test tests/research/event-inspection.test.js tests/dashboard-workspace.test.js tests/research/inspection.test.js
npm test
npm run validate
npm run validate -- --production
```

相關 30 項及全套 562 項通過，0 失敗；兩模式各 84 指標／25 公式／0 錯誤與警告，unknown 為 1／83。正常原服務與測試 shim 的命令列／連接埠已核對，驗收後停止，視窗尺寸恢復。截圖保存在 TEMP，沒有新增金融、來源或歷史檔案。

其他瀏覽器與全尺寸尚未實測，這次查閱不重新認證外部原始來源或人工簽核。研究時效仍處理原六份固定 review，沒有把八筆事件加入 review 時效政策。正式金融仍有 83 個未知、三項 TTM null，八份快照同一模型期間；年度費用／burn、全部現況配置、財務可比性／六類收入、同步估值及個人投資管道仍待驗證，父 baseline 保持未完成。

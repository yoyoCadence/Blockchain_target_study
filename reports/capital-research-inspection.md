# 股本研究目錄、API 與中文介面

## 範圍與操作

固定研究目錄升至 v2，追加 `secz-resale-capital-20261004`，釘選既存 artifact `f3bce7412757bc8e418b2c6b6afc2066886660a7a636ef78b320a44e59e4d693`。原五份條目／hash 保留。`capital` reader 共用[手動股本驗證器](manual-capital-review.md)，匹配目錄 hash 後仍需重播來源、原始表格、七條嵌入公式、版本及依賴；不接受任意檔案探索、遠端採集或寫入。

`GET /api/research?mode=production` 現在回傳六份研究，股本條目保留 108 個 OBSERVED、七個 DERIVED、全部七來源版本、三種原始 point 日期、context、中文摘要及完整 `full_review`。Fixture 清單仍為空，寫入拒絕。

Dashboard 切換「正式研究資料（Production）」→「研究證據」→「SECZ 轉售登記股本分類／未解差額」。先呈現研究範圍、未解分類及七項中文核對；展開「原始觀測與計算紀錄」查看 115 筆／九筆未知；再展開「完整原始證據、公式與依賴」核對原文與機器代碼。時點直接顯示 end，收入區間仍顯示 start → end，不再把未提供的 start 顯示為 undefined。介面只格式化、標籤與呈現，沒有金融算式。

## 手動時效

既有 `research-freshness` 與 `/api/freshness` 沿用相同政策／公式版本，自固定目錄取得六份研究、145 筆紀錄與 20 個獨立來源 ID。原觀測／發布／取得／審查日期及 point 期間分開，股本 context 與限制保留。七個股本推導值屬於 NOT_OBSERVED，不能作新觀測；九個 null 仍 UNKNOWN_DATA／INSUFFICIENT。

截止日 2026-10-03 的股本 review 尚不可用，已知股本觀測亦顯示證據不足；截至 2026-10-04 才可用。第一列原股數時點仍 7/1、知識日仍 7/31，觀測 age 是 64／65 日，審查日不更新觀測。紀錄數不是 thesis 期間，也不確認現在股本、可比性或投資性。

## 實際驗證

- 六項新增回歸與既有目錄／API／時效共 42 項通過，涵蓋固定 hash、匹配新 hash 但語意錯誤、原資料／版本／金融／歷史保留、截止日前後、Fixture 隔離及禁止寫入。
- 全套 `npm test` 499 通過、0 失敗；兩模式 validate 84 指標／25 金融公式／0 錯誤／0 警告，unknown 1／83。
- Browser 技能連線經一次逾時恢復後，Chrome 實際檢查 `http://127.0.0.1:4310/`：頁面標題正確、非空白、無框架錯誤畫面、主控台無 error／warn。桌面內容視窗 1524×729；手機要求 390×844，該瀏覽器實際 CSS 內容為 300×675。窄視窗無整頁 overflow，表格容器可從 scrollLeft 0 捲至 340，暫時 viewport 已恢復。
- 實際展開核對 115 列／九個未知、原始 hash、108 觀測、七公式、第一項 50 個依賴及兩個 supersedes 來源。10/3 與 10/4 手動查詢、修改日期清空與 Production→Fixture 隔離皆通過。桌面／手機截圖保存在 TEMP，未加入儲存庫；本機伺服器於檢查後清理。

未修改原研究 artifact、來源、金融資料、快照或政策／公式定義。此次使既存證據可檢視，不補現在／完全稀釋股本與估值；Sponsor 重疊、961,384 未解差額、83 個金融未知、三項 TTM null 及完整父 baseline 仍待完成。未驗證其他瀏覽器、全部視窗尺寸或新遠端來源。

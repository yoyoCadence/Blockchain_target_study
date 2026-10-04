# 共用研究證據 ID 一致性

## 問題與修正

隔離的有效、hash-pinned 身份研究可以讓 `inspectResearch` 接受同 ID 的不同來源 metadata、與 canonical 來源同 ID 的不同內容，以及同紀錄 ID 的不同觀測 metadata；既有 `researchFreshness` 已拒絕這三種情況。兩個入口原先都允許研究紀錄重用 canonical 金融輸入 ID。這些測試不修改真實研究或資料。

現在把原時效來源／紀錄 guard 集中到 `inspectResearch`：先從完整 canonical 來源及輸入歷史建立 ID 指紋，再驗證每份目錄研究的來源與紀錄。來源同 ID 須完整 metadata 一致；紀錄同 ID 須原文、解析期間及報表 context 一致。Identity 呈現額外附上的 `sources` 不視為觀測欄位，來源內容另行完整核對。研究仍先通過 schema、目錄 hash 與各類 reader 的語意重播。

`researchFreshness` 共用此入口，移除重複 guard；兩個 API 因此都在回傳研究／時效結果前拒絕衝突，回應 HTTP 400 並保留衝突 ID。相同證據重用、明確新來源 ID／版本及新的獨立觀測 ID 仍可讀取；不把不一致證據覆寫、刪除或自行選擇一份來源。

## 實際驗證與限制

13 項新增測試通過，包括兩個入口的跨研究與 canonical 衝突、觀測 metadata 改寫、金融輸入 ID 重用、合法新來源版本／獨立紀錄；兩個唯讀 API 面對有效 hash 的三種衝突亦拒絕，檔案 bytes 不改，Fixture 仍不讀正式研究。全套 `npm test` 512 通過、0 失敗；兩模式 validate 都為 84 指標／25 金融公式／0 錯誤／0 警告，unknown 1／83。六份研究／145 紀錄／20 來源、全部金融／論點與歷史回歸通過。

未修改 UI、研究目錄、原 artifact、來源、觀測、事件、快照、政策或公式；沒有新增瀏覽器 QA，上一子項的中文呈現驗收保留。本防線只檢查本次載入的 canonical 與固定研究集合，不等於外部不可變儲存、來源真實性或所有研究修訂的完整時間序列審核。個別獨立 CLI 的原資料包驗證不因此變成全目錄比較。

現在／完全稀釋股本、未解分類、同期估值與個人投資性、SECZ 法律名稱／六類收入及 UNI 全期間捕獲仍待查證；83 個金融未知、三項正式 TTM null 與完整父 baseline 保留。

# 年度流量單位與期間驗證

本子項處理 production baseline 的期間防線，不代表已匯入 SECZ 季報或完成收入分類對照。

重現問題（synthetic fixture）：若把六個 SECZ 示範收入輸入全部標為 quarterly，原本加總可產生 `100000000 USD/year`、period quarterly 的結果。這不是實際季報數字，而是期間總額與年率標籤的矛盾；不能靠沒有混合 basis 就認定安全。

現在在共同 normalization 層拒絕有值的 `/year` input 搭配 quarterly 或 point：涵蓋 USD、UNI、XLM、count 與 turns 年率。所有儲存輸入驗證、計算、事件套用及 research preview 都會經過這層，因此錯誤期間會在計算或 journal 寫入前失敗。沒有把季度數字乘四、改寫分類或偷偷換單位。

允許 annual、TTM 及 model 年率。OBSERVED + model 的已知年率必須另有非空 rationale，解釋它代表公開的 nominal annual rate 而非已完成財務期間；既有 UNI 核准預算符合此要求。null 仍保留未知，不宣稱已驗證期間。非年率的 point 價格、存量與 ratio 不受這個限制。

112 tests passed／0 failed；新增 14 個 unit／period 檢查與一個 research 失敗不寫入檢查。既有 mixed-basis 測試仍涵蓋 formula 期間不相容，同時對非法年度單位輸入提前拒絕。兩種 validate 均為 84 metrics／25 formulas、0 errors／warnings、unknown 1／83；UNI required-share 保留 0.422。舊快照及公式 v1 保持不變並可重播。

限制：驗證器無法靠 metadata 判斷來源是否真的涵蓋十二個月，也不驗證來源內文。標示 annual／TTM 前仍需一手查證；季度／半年資料需先保留原始期間與收入類別，再以明示、版本化的轉換流程處理。季度 ingestion、YoY/QoQ 區分及全面會計曆尚未實作。

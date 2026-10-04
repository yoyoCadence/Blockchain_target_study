# UNI 名目年率與單筆價格的期間設計

歷史核准的 `UNI/year` 不是某年度已支付的 UNI。將它乘以某日 `USD/UNI` 價格，可得到該價下的名目 `USD/year` 模型負擔；這個算術不證明該日合約仍維持原額度、當年實際分配或收入。原預算日期、分類及來源，以及價格成交／取得時間，都必須保留。

本次新增可明示選用的兩種公式期間政策，既有公式尚未改用。`annual_rate_valuation` 必須在版本化公式中指定 `rate_input`、`price_input`，且表達式只允許兩者相乘。原生幣年率與 USD 單價、同資產及 point 價格逐項核對；model 名目率可早於報價，但不得用稍後才知道的率估更早價格。已知 annual／TTM 會計量只能與同日價格折算，季度量不得冒充年率。

折算結果維持 DERIVED，帶 `period.basis=model`、報價日 `valuation_date` 與版本化公式說明。原本的 `compatible`／`prior_comparison` 完全保留；若遇到新折算日期，必須明示採 `valuation_compatible`，才能傳遞日期至淨累積／市占率／收益率。不同折算日、已知但不同日期的收入／稀釋／市值，以及季度流量仍拒絕。null 的舊期間占位不構成會計證據，不阻擋模型 null 傳播；未知仍未知。

這不是新增投資模型或自動資料更新。實際使用須另外升版五條 UNI 公式、記錄 changelog、透過唯讀 preview 與 digest-bound apply 保存新觀測及完整不可變快照。原 v1 公式嵌在既有快照中，仍按原規則重播；不能覆寫歷史或把最新計算當舊版本。

測試以記憶體升版驗證既有 UNI 候選可折算為 181,112,000 USD/year；正式檔案及公式未改用。Fixture 每個經濟數值保持一致，required-share 仍為 0.422。新測試涵蓋未知傳播、實際舊年度衝突、後知率／非 point 價格、衝突估值日期、季度混用、明示角色及 schema、唯讀 preview 與原始血緣。

完整 baseline 仍需現行預算／供給／市值／FDV、實際捕獲、SECZ 可比收入與股本，以及個人可投資管道的查證；不能從這個折算補齊。

驗證：全套 `npm test` 584 項通過，0 失敗；`npm run validate` 與 `npm run validate -- --production` 各 84 指標／25 公式、0 錯誤及警告，unknown 1／82。原十份正式快照及 Fixture 歷史逐份用嵌入公式精確重播。

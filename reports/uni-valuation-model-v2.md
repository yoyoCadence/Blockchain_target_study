# UNI 模型市值與 FDV 口徑：模型版本升級（第二階段之一）

分析者 2026-10-07 確認第二階段，並附四個條件與兩項補充：

1. **FDV 口徑名稱要完整**：顯示「現行總供給估值（FDV 口徑，未含未來增發）」。官方 UNI 原始碼保留增發機制，此值不代表所有未來稀釋。
2. **扣除 dead 的供給作為模型估值基準，但要保存口徑假設**：價格 ×（總供給 − dead 餘額）是 DERIVED；「選擇這個供給作為模型基準」另有有理由、有版本的 ASSUMPTION，required-share 等下游繼承這項依賴。畫面標示「模型市值：扣除 dead 口徑」，並保留「流通量尚未完整查證」。
3. **預設不排除治理金庫**：全部排除 Timelock 是具名 SCENARIO；切換時同時重算估值與 required-share，並清楚顯示目前採用哪個情境。
4. **同分鐘收盤價可作為 MVP 對齊政策，但必須是已收盤 K 線**，畫面顯示「同分鐘收盤價」；Coinbase 的 close 是該分鐘最後一筆成交，不保證與供給區塊同一瞬間。
- 估值補齊不代表所有下游都能算出來；更新價格時 UNI 分配負擔也要重新折算，其他缺失或不相容的輸入維持 null。
- 保留舊快照，追加公式／假設版本與 changelog；確認 0.422 回歸、`npm test` 與 `npm run validate`。

本子項完成模型本身的版本升級；正式的同區塊供給與同分鐘價格觀測在下一個子項以 research-refresh 套用。

## 為什麼新增指標，而不是把 `uni.market_cap` 改成推導

`uni.market_cap`／`uni.fdv` 原本是輸入指標，合成示範（Fixture）的歷史快照裡有它們的 OBSERVED 紀錄。版本連續性檢查要求每份舊快照的輸入紀錄在目前專案中原樣存在；若把同一個 ID 改成推導指標，這些舊紀錄就會變成「推導指標的輸入」而被拒絕，等於改寫歷史。因此保留兩個舊輸入（改標為「舊版直接輸入」，正式模式仍為 null），新增推導指標，並以公式升版讓下游改用新指標。現在沒有任何公式讀取舊輸入。

## 資料字典（84 → 92 個指標）

| 指標 | 類型 | 說明 |
| --- | --- | --- |
| `uni.total_supply`、`uni.dead_balance`、`uni.timelock_balance` | 輸入（UNI） | 同一區塊的 totalSupply 與兩個餘額 |
| `uni.supply_basis_excludes_dead` | 輸入（0–1 旗標） | **口徑假設**：1＝扣除 dead |
| `uni.timelock_exclusion` | 輸入（0–1 旗標） | **情境旗標**：預設 0；1＝具名情境 `timelock_excluded` |
| `uni.model_supply` | 推導（UNI） | 模型供給（扣除 dead 口徑），不是已驗證流通量 |
| `uni.model_market_cap` | 推導（USD） | 模型市值：扣除 dead 口徑 |
| `uni.fdv_current_supply` | 推導（USD） | 現行總供給估值（FDV 口徑，未含未來增發） |

## 公式（25 → 28 條；registry 版本 2 → 3）

| 公式 | 版本 | 內容 | 期間政策 |
| --- | --- | --- | --- |
| `f.uni.model_supply` | 新增 v1 | totalSupply − dead × 口徑旗標 − Timelock × 情境旗標 | `same_block_point` |
| `f.uni.model_market_cap` | 新增 v1 | 價格 × 模型供給 | `aligned_price_valuation` |
| `f.uni.fdv_current_supply` | 新增 v1 | 價格 × totalSupply | `aligned_price_valuation` |
| `f.uni.required_accrual` | **v1 → v2** | 模型市值 × 要求收益率（原為舊版直接輸入市值） | `compatible` |
| `f.uni.net_burn_yield` | **v2 → v3** | 淨累積 ÷ 模型市值（原為舊版直接輸入市值） | `valuation_compatible` |

`required_share`、`required_share_net` 經由 `required_accrual` 繼承口徑假設與 Timelock 旗標；公式本身不變。舊版公式完整保存在舊快照中，各自重播。

## 假設與情境

- **`uni.supply_basis_excludes_dead@1`**（ASSUMPTION，值 1，信心 medium，知識日 2026-10-07）：理由說明 UNI 合約沒有 burn 函式、轉入 dead 的代幣仍計入 totalSupply；明示這是口徑選擇，不是已驗證流通量，下游經由模型供給繼承此依賴。
- **`uni.timelock_exclusion@1`**（ASSUMPTION，值 0）：預設不排除治理金庫。
- **具名情境 `timelock_excluded`**（[敏感度設定](../spec/sensitivity.yaml) v2 新增 `named_scenarios`）：把旗標設為 1 時，引擎把該覆寫紀錄的情境名稱標為 `timelock_excluded` 並帶情境理由；其他值仍是「未儲存的敏感度值」。旗標也加入敏感度參數（原本的十個參數不變），所以研究頁的敏感度表單可以直接切換，估值、required-share 一起重算。
- 兩個假設的模型期間沿用其他正式假設的參考日 2025-12-31（知識日是決定日 2026-10-07），避免沒有新資料卻把模型期間往後推、製造新的論點期數。

## 期間政策

- **`same_block_point`**：已知的供給讀值必須都是時點紀錄、同一天；正式（非合成）讀值還必須帶 `observed_at` 且是同一個區塊時間。旗標屬模型期間，不提供時間證據。
- **`aligned_price_valuation`**（同分鐘收盤價政策）：價格與供給都已知時，必須同一天；正式資料另須價格帶 `price_window`（`one_minute_close`、恰好 60 秒）且該分鐘包含供給的區塊時間，否則計算失敗。
- 兩者在任何一側未知時，輸出是 model 期間（未知值不提供期間證據，不會與其他期間衝突）。
- 合成示範資料只按日期對齊，畫面也這樣標示。
- 規格：[正規紀錄](../spec/canonical-schema.yaml)與[事件更新](../spec/event-schema.yaml)新增選填欄位 `observed_at`、`price_window`；[專案規格](../spec/project-schema.yaml)新增兩個政策、`price_input` 規則與 `named_scenarios`。舊紀錄不受影響。

## 合成示範（Fixture）回歸

新增合成 totalSupply 10 億、dead 462,222,222.2222222、Timelock 2.5 億 UNI（來源 `fixture-source@2`，明示 supersedes 原 `fixture-source@1`，原來源不改）。dead 值是刻意選定的：9 美元 ×（10 億 − dead）在浮點數下剛好等於原本的 4,840,000,000，因此：

- 模型市值 4,840,000,000、現行總供給估值 9,000,000,000（與舊版輸入相同）
- required_accrual 242,000,000、growth distribution 180,000,000
- **required-share 仍為 0.422**、required_share_net 0.337、net_burn_yield 不變

切換到 `timelock_excluded` 時：模型供給 287,777,777.78、模型市值約 25.9 億、required-share 0.3095。

## 正式模式

這一步只升級模型，正式的同區塊供給尚未套用：三個供給輸入與三個新推導都是未知（unknown 80 → 86），`uni.price` 仍是 2026-10-04 的 9.0556，growth distribution 仍為 181,112,000，required_accrual／required-share 維持 null（要求收益率等輸入本來就未知）。模型期間仍是 2026-10-04。

## 快照

| 模式 | 新快照 | parent | 比較 |
| --- | --- | --- | --- |
| Fixture | `bb6e3c0769722d86acc936ff6ebfd15c00c617bb653adc0fcc8fe17b91875127` | `8ea6ec68…` | 公式／假設／來源變更；required-share 0.422 → 0.422 |
| 正式 | `c85cf219fd3820276cc0719700c794d17a1fd50781493c2a7ba735c2318379ae` | `92da521b…` | 公式／假設變更；來源未變 |

兩份快照都以目前專案完全重播（指標與論點相同）。舊快照全部保留且各自重播；Fixture 歷史 3 → 4 份，正式 19 → 20 份。

順帶修正兩個比較問題（版本升級才暴露）：

- 新指標在前一份快照不存在時，`compareSnapshots` 原本會在計算 fingerprint 時拋錯；現在視為「由 null 變更」。
- 來源等紀錄清單原本依載入順序比較；CLI 快照依檔名載入、事件鏈依時間追加，同一組來源會被誤判為「來源變更」。現在依 ID 比較內容。

## 介面

- 指標名稱：「模型市值：扣除 dead 口徑」「現行總供給估值（FDV 口徑，未含未來增發）」「模型供給（扣除 dead 口徑）」；舊輸入標為「市值（舊版直接輸入）」「完全稀釋估值（舊版直接輸入）」。
- UNI 模型區塊新增「估值口徑」：價格基礎（有分鐘視窗時顯示「同分鐘收盤價」與該分鐘，並註明 close 不保證與區塊同一瞬間）、模型市值與「流通量尚未完整查證」、FDV 與增發說明、目前情境（預設／`timelock_excluded`／未儲存的其他值）。

## 驗證

新增 8 項模型回歸（字典與公式版本、Fixture 0.422 與市值重建、required-share 等血緣繼承口徑假設與 Timelock 旗標、具名情境同時重算、兩個期間政策的通過與拒絕、專案規格拒絕錯誤的公式與情境、正式模式新指標維持未知）與 2 項介面回歸。既有測試的更新：歷史快照重播一律改用該快照自己的資料字典與敏感度設定；指標數 84 → 92、公式 25 → 28、敏感度參數 10 → 11、Fixture 歷史 3 → 4、正式未知輸入狀態 56 → 59；比較最新快照的測試改為比較最新事件或特定快照。`npm test` 全套 1220 通過；`npm run validate`／`npm run validate -- --production` 均 92 指標／28 公式、無 errors／warnings，unknown 1／86。

Chrome headless（`http://127.0.0.1:4325`）18 項檢查通過：Fixture 估值口徑面板文字、預設 required-share 42.2%；在敏感度表單把治理金庫旗標設為 1 後，面板顯示 `timelock_excluded`、模型市值 $48.4億 → $25.9億、required-share 42.2% → 30.95%，提示列標示未儲存情境；重設後恢復預設；required-share 血緣可看到口徑假設、Timelock 旗標與 `f.uni.required_accrual / v2`；正式模式面板顯示模型市值未知與「不是同分鐘收盤價」，正式價格仍是 $9.0556；窄版 312／312 無溢出；console 只有瀏覽器自動請求 `/favicon.ico` 的 404。服務 PID 41652 已核對後停止。

## 下一步

以 research-refresh 追加正式觀測（不改寫舊紀錄）：2026-10-07 block 26140081 的 totalSupply／dead／Timelock 餘額（帶 `observed_at`）與包含該區塊時間的一分鐘收盤價 7.9914（帶 `price_window`，以 v2 價格紀錄 supersedes 10/4 的 v1），並以新版本來源涵蓋這些正規指標。之後正式模式的模型市值與 FDV 口徑會有值、growth distribution 依新價格重新折算；required-share 仍因要求收益率等輸入未知而維持 null。

# UNI 同區塊供給與同分鐘收盤價：正式套用（第二階段之二）

[模型版本升級](uni-valuation-model-v2.md)之後，以 reviewed research-refresh 把 2026-10-07 的對齊觀測寫入正式模型。所有數值與時間都由已審查、可重播的[研究資料包](uni-aligned-valuation.md)（SHA-256 `227008fc…`）以程式產生，不手抄。

## 追加的正式觀測

| 紀錄 | 值 | 時間 | 來源 |
| --- | --- | --- | --- |
| `uni.total_supply@1-block26140081` | 1,000,000,000 UNI | block 26140081，`observed_at` 2026-10-07T11:02:47Z | RPC v2 |
| `uni.dead_balance@1-block26140081` | 112,675,581.21121952 UNI（精確值 112675581.211219518941995199） | 同上 | RPC v2 |
| `uni.timelock_balance@1-block26140081` | 262,247,996.305835 UNI（精確值 262247996.305835021033106178） | 同上 | RPC v2 |
| `uni.price@2-coinbase-candle-20261007` | 7.9914 USD／1 UNI，**同分鐘收盤價** | `price_window` 11:02:00 → 11:03:00（包含區塊時間） | K 線 v2 |

- 餘額以 18 位小數 raw 整數換算；模型以 IEEE 浮點數儲存，完整 raw 字串與精確小數寫在每筆紀錄的理由裡。
- 價格 v2 **明示 supersedes** 2026-10-04 的單筆成交價 v1（9.0556），舊紀錄原樣保留在歷史中。理由註明 close 是該分鐘最後一筆成交，不保證與區塊同一瞬間，也不是成交量加權或跨交易所價格。
- 研究層的兩個 v1 來源不涵蓋正規指標 ID，且不可改寫，所以追加 `ethereum-uni-valuation-supply-20261007-v2` 與 `coinbase-uni-usd-candle-20261007-v2`（同 URL／日期／取得時間／tier，明示 supersedes v1，只在涵蓋指標加入 `uni.total_supply` 等）。

[提案](../data/research/uni-valuation-baseline-2026-10-07.yaml)先 `research-preview`，以 review digest `89aa3b3d…` `research-apply`，寫入[事件 journal](../data/events/production/uni-valuation-baseline-20261007.json)，快照 `ca4e19d9b64103d887b551f8c0ccde58e5c29c75133694f67cbb4d8182a2f67a`，parent 為模型升級快照 `c85cf219…`。**不可再次套用。**

## 正式模型結果

| 指標 | 之前（`c85cf219`） | 現在 |
| --- | ---: | ---: |
| UNI 價格 | 9.0556（10/04 單筆成交） | 7.9914（10/07 同分鐘收盤價） |
| 模型供給（扣除 dead 口徑） | 未知 | 887,324,418.79 UNI |
| 模型市值：扣除 dead 口徑 | 未知 | **7,090,964,360.31 USD** |
| 現行總供給估值（FDV 口徑，未含未來增發） | 未知 | **7,991,400,000 USD** |
| 成長預算分配負擔（模型） | 181,112,000 USD/年 | **159,828,000 USD/年**（依新價格重新折算，折算日 10/07） |
| required_accrual／required-share／net burn yield | 未知 | **仍未知** |

- 模型市值與 FDV 口徑捨去到美分後，與研究資料包的兩個研究值完全相同；`timelock_excluded` 情境下的模型市值（4,995,235,722.63 USD）也與研究層情境值相同。
- **估值補齊不代表下游都能算**：要求收益率、其他累積來源與稀釋仍未知，required-share 等維持 null；論點仍是證據不足。舊版直接輸入市值／FDV 保持 null。
- 只有來源與觀測改變；公式、假設、情境、規則都沒有變。正式未知 86 → 80，模型期間 2026-10-04 → 2026-10-07（新的資料日期，不是同一期間的重複快照）。
- Fixture 不受影響：required-share 仍為 0.422，歷史仍 4 份。

## 驗證

7 項新增 production 回歸：journal／快照與 digest 綁定、三個供給觀測的精確換算與區塊時間、價格 v2 的分鐘視窗與 supersedes、v2 來源只增加涵蓋、正式值與研究值逐分相符並重新折算負擔、`timelock_excluded` 情境與研究值相符、只有來源與觀測改變且歷史／Fixture 不變。既有測試的更新：目前正式價格 9.0556 → 7.9914、負擔 181,112,000 → 159,828,000（期間 10/07）、正式未知輸入狀態 59 → 56；10/04 年率折算預覽測試改在已有的歷史工作區重播（10/04 報價當時尚未套用）；兩個隔離目錄測試另複製 `data/snapshots`；描述「升級前」狀態的測試改讀模型升級快照。`npm test` 全套 1227 通過；`npm run validate`／`npm run validate -- --production` 均 92 指標／28 公式、無 errors／warnings，unknown 1／80。

Chrome headless（`http://127.0.0.1:4326`）15 項檢查通過：正式模式估值口徑面板顯示「同分鐘收盤價 $7.9914（11:02:00 → 11:03:00）」與「不保證與供給區塊同一瞬間」、模型市值 $70.91億與「流通量尚未完整查證」、FDV 口徑 $79.91億與增發說明、預設情境；模型期間 2026-10-07；required-share 未知、負擔約 $1.6億；在敏感度表單切換 Timelock 旗標後模型市值 $49.95億、required-share 仍未知，重設恢復；模型市值血緣含價格 v2、同區塊 dead 餘額與口徑假設；窄版 312／312 無溢出；Fixture 仍 42.2%；console 只有瀏覽器自動請求 `/favicon.ico` 的 404。服務 PID 44000 已核對後停止。

## 仍未完成

已驗證流通量、要求收益率與其他累積來源（required-share 的必要輸入）、成交量加權或跨交易所價格、Firepit 情境試算（另排）、歷史紀錄的 archive 存取（需使用者提供節點或 key）。價格與供給是單一時點，之後需要新的同分鐘觀測才會更新，舊觀測保留。

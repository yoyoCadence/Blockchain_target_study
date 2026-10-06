# Changelog

## 2026-10-06（台北）— UNI 供給組成資料包 schema／方法 v1

新增 `spec/uni-supply-composition-schema.yaml` 與 `spec/uni-supply-composition-method.yaml`，供後續唯讀 reader 使用：鎖定結構與 null context，釘選地址、getter selector／參數、文件片段、Uni.sol 行與五條研究公式定義。31 項回歸（重現 calldata、文件／公式對應、28 個竄改拒絕）；全套 888、兩模式 validate 通過。見[規格與驗證](uni-supply-composition-specs.md)。尚無 reader／API／UI，原資料與金融不變。

## 2026-10-06（台北）— UNI 固定區塊供給組成與鑄造參數

新 finalized block 26133577 保存十個 canonical 釘選 eth_call（totalSupply、decimals、dead／Timelock／UNIVesting 餘額、授權、minter、mintingAllowedAfter、mintCap、最短間隔）與區塊時間，官方文件地址表及 pinned Uni.sol 選定行支撐 Timelock 身份與鑄造語意。五個研究 DERIVED v1（兩個機械扣除、時間條件、單次上限、minter 地址相符）以 BigInt 重播；不定義流通供給或估值。追加三來源與 source-only 完整快照，金融／論點／unknown 80 不變。五項新增／全套 857、兩模式 validate、Chrome 桌面／窄／Fixture 通過；見[研究與驗收](uni-supply-composition.md)。

## 2026-10-06（台北）— XLM 供給研究目錄、API 與中文逐列查閱

研究目錄 v6 新增 `xlm_supply`，以原 bytes SHA-256／已存事件／原 review 綁定共用唯讀 reader；研究／手動時效 API 保留九個原始十進位字串、兩個殘差 v1／依賴及三個來源版本，十研究／196 紀錄／30 來源。中文卡片分表顯示原值與殘差、兩個時間、口徑文件與七項未知，窄版表格可鍵盤捲動。八新增／全套 852、兩模式 validate、Chrome 桌面／窄／Fixture／兩 cutoff 通過；見[操作與驗收](xlm-supply-research-inspection.md)。原資料、金融／來源／歷史／unknown 80 不變。

## 2026-10-06（台北）— XLM 供給資料包手動唯讀驗證

新增 xlm-supply-review／共用 reader、schema／方法 v1；以明示原 SHA-256 重驗 bytes，核對 API body hash、九個 provider_reported 精確字串、七位小數格式、更新／取得／HTTP 時間、已存來源與 supersedes，並以 BigInt 重播兩條 signed_decimal_sum v1 與確切依賴。研究公式定義由方法檔釘選，同版本改寫拒絕；不新增 canonical 公式。74 新增／全套 844、兩模式 validate 通過；原資料、金融／來源／歷史／unknown 80 不變。見[操作與限制](manual-xlm-supply-review.md)，無 UI 或 API 重採。

## 2026-10-05（台北）— XLM 官方回報供給與口徑

接續原兩份未提交資料，保留原 bytes／取得時間／review；九個 provider_reported OBSERVED、兩個七位精確小數研究殘差 v1 保存，ledger／獨立流通與同步估值維持 null。追加兩來源及完整 source-only 快照，文件 v2 明示 supersedes；正式十六份歷史、模型日期／金融／論點與 unknown 80 保留。五項新增／全套 770、兩模式 validate、Chrome 桌面／窄鍵盤／JSON／兩安全連結／Fixture 隔離通過。見[研究與驗收](xlm-reported-supply.md)；唯讀供給 reader／catalog 與完整 baseline 尚未完成。

## 2026-10-05（台北）— 公開市場資料包驗證、API 與中文逐列查閱

新增 public-venue-review／共用 reader、schema／方法 v1；核對原 HTTP／typed 值／來源／身份 fingerprint 與受限地址公式，保留 null 存取。目錄 v5 綁原 bytes／已存 review，供既有研究／手動時效 API 及中文原值／推導分表，九研究／185 紀錄／28 來源；65 新增／全套 765、兩模式 validate、桌面／窄／鍵盤／Fixture／兩 cutoff 審查列通過。見[操作與驗收](public-venue-research-review.md)。原資料、來源／金融／歷史／unknown 80 不變，沒有 API 重採或投資性提升。

## 2026-10-05（台北）— UNI／XLM 單一公開市場與網路表示

保存四次公開 currency／product 回應與各自 HTTP／取得時間、26 typed OBSERVED、XLM 空合約 raw／null，以及原身份依賴與研究地址比較 v1／DERIVED。追加六來源與 source-only 全快照；產品 v2 明示 supersedes，原價格／金融／投資性與模型期間不變。四新增／全套 700、兩模式 validate、桌面／窄鍵盤／JSON／六安全連結與 Fixture 隔離通過；見[查證與限制](uni-xlm-public-venue.md)。unknown 80／TTM null／原年率 stale 保留。

## 2026-10-05（台北）— UNI 餘額／供給研究目錄與中文表格

目錄 v4 釘選原 token-state bytes／事件，重用唯讀 reader 與原 review；API／時效保留四 raw OBSERVED 與一個 DERIVED point 比較、完整 v1／依賴及原時間。中文兩表格分開顯示，窄版各自鍵盤左右捲動；Fixture 隔離、截止日與原 JSON 保留。八新增／全套 696、兩模式 validate、桌面／窄／工作區及兩個截止日實際審查列通過，補足前次 vesting 目前日展開驗收；見[操作與驗收](token-state-research-inspection.md)。金融／原資料／來源／歷史／unknown 80 不變。

## 2026-10-05（台北）— UNI 餘額／供給手動唯讀驗證

新增 token-state-review／共用 reader、schema／ABI 方法 v1；以明示原 SHA-256 重驗原 bytes，沿用原固定區塊 reader 核對 owner 依賴，再驗同 hash／selector／target／raw 整數／來源日期及嵌入 BigInt 比較 v1。45 新增／80 targeted／全套 688 與兩模式 validate 通過，匹配新 digest 仍拒絕錯配；原資料、金融／canonical 公式、來源、歷史／unknown 80 不變。見[操作與限制](manual-token-state-review.md)，無 UI 或自動採集。

## 2026-10-05（台北）— UNI 固定區塊餘額與供給

沿用 UTC 10 月 4 日 block 26119713／原 hash，新增一次同 hash／canonical RPC capture：owner balance、totalSupply、decimals、allowance 以完整字串保存，明示原 owner getter 依賴。嵌入研究 BigInt 比較公式 v1／DERIVED point flag，不變更 canonical 公式；餘額涵蓋只限該時點，供給／同步估值限制保留。追加一來源與 source-only 完整快照，正式十四份、unknown 80／TTM null／原年率時效不變。四項新增、全套 643、兩模式 validate、桌面／窄鍵盤與 Fixture 隔離通過。見[研究與驗收](uni-token-state.md)。

## 2026-10-04 — 固定區塊研究目錄／唯讀 API／中文介面

研究目錄 v3 釘選原 archive bytes SHA-256，新增 fixed_block／原事件 ID 綁定；重用手動 reader、原審查與來源版本，八個 point raw 字串加入研究／時效 API。中文卡片保留 hash／block、完整值、分類／confidence／時間／限制及原 request／response，窄表格可用鍵盤左右捲動。八項新增／全套 639、兩模式 validate、桌面／窄視窗及工作區隔離通過；目前日審查列工具展開限制明示在[驗收](fixed-block-research-inspection.md)。金融／原資料／歷史／unknown 80 不變。

## 2026-10-04 — 固定區塊資料包手動唯讀驗證

新增 fixed-block-review CLI／共用 reader、v1 schema 與獨立 ABI 方法定義，要求 production／已審查 SHA-256，核對 request／response／同 hash／canonical／完整 calldata／解碼／來源與 chronology。35 項新增回歸確認匹配重算 digest 仍不能繞過語意；全套 631 項與兩模式 validate 通過，原 archive／金融／來源／歷史／unknown 80 保留。見[操作與限制](manual-fixed-block-review.md)，沒有 UI 變更或自動取得。

## 2026-10-04 — UNI 固定區塊參數與剩餘授權

追加一份 PublicNode 主網來源與完整 source-only 快照；所有 state query 固定 finalized block 26119713／相同 hash／requireCanonical=true，核對六 getter、UNI allowance raw 20000000000000000000000000／decimals=18 及 runtime。獨立保留既有 receipt 查詢 null，不改寫 Explorer 或未固定 UI 歷史；bytecode source 等價未驗證。596 項測試、兩模式 validate、桌面／窄視窗／Enter／JSON／工作區隔離通過；unknown 80、原年率時效／金融／公式／論點不變。見[查證與限制](uni-vesting-fixed-block.md)。

## 2026-10-04 — UNI 單筆季度提領與公開參數

追加兩份來源及完整 source-only 快照，核對 10 月 1 日 UNI Approval 406／Transfer 407／Withdrawn 408 與單季 quartersPaid=1，保留全地址／raw 整數。另保存 10 月 4 日公開 getter 回應，未知 block／hash／timestamp 保持 null，保留 Similar Match／部署等價限制。金融數值與公式不變、unknown 80、歷史預算時效與證據不足不變；十二份正式歷史重播、Fixture 0.422、592 項測試與兩模式 validate、桌面／窄視窗／鍵盤／JSON／工作區隔離通過。詳見[研究與限制](uni-vesting-execution.md)，沒有年度化單筆或完成父 baseline。

## 2026-10-04 — UNI 單筆價格與五條公式 v2

formula-registry v2：f.uni.growth_distribution／net_accrual／net_burn_yield／required_share／required_share_net 升至 v2，保留算術，明示 model 折算與下游 valuation_date。重用原 Coinbase 原始回應／兩來源，按 preview digest 保存 UNI point OBSERVED 9.0556 及完整不可變事件；歷史名目率折算為 181112000 USD/year，不代表現行額度或實際支出。source／formula 變更分開，假設／情境／規則不改；正式 unknown 82→80，舊十份快照保留，Fixture 另追加公式快照且所有值不變。中文模型標示與窄血緣長字串換行通過；588 項測試、兩模式驗證、歷史 v1 阻擋診斷與逐份重播通過。完整 baseline 缺口保留。

## 2026-10-04 — UNI 名目年率估值期間政策前置

新增明示 annual_rate_valuation／valuation_compatible：原生幣年率按 point 價格折算為 DERIVED model 負擔，保留原始日期／血緣，將 valuation_date 傳遞到明示選用的下游。已知跨期會計流量、季度及衝突估值日期仍拒絕；未知占位不提供會計期間證據。舊期間政策、正式 v1 公式、金融輸入與不可變歷史不改用；正式升版及 UNI 價格匯入另行驗收。新增九項期間／唯讀／未知／0.422 回歸。

## 2026-10-04 — XLM 單筆交易所價格基準

- 依既有人工 research-refresh／digest-bound apply 追加一筆 XLM point OBSERVED 與完整快照；重用原 Coinbase 來源／raw 回應，保留最後成交時間、decimal、知識日、取得與審查日期。其他金融數值不變，正式 unknown 83 → 82。
- 最新模型研究參考日推進至 2026-10-04，前九份快照與每個原輸入期間保留；參考日改變不證明年度收入或足夠連續 thesis 證據。來源比較旗標反映價格新增來源依賴，來源登錄本身沒有重複追加，公式／假設／情境／規則不變。
- 中文卡片／血緣／版本比較對價格最多顯示八位小數，本筆顯示 $0.216265；新增獨立 UNI 未套用候選，保留三項期間阻擋。原雙資產研究候選與歷史不改寫。
- 四項新增回歸、全套 575 項測試與兩模式 validate 通過；歷史各自的完整快照重播、原始 hash、截止日與不寫入防線保留。Chrome 桌面互動／截圖／console 驗收通過，本次窄視窗未驗證。三項 TTM null、現行估值／個人投資性與父 baseline 未完成。

## 2026-10-04 — 中文計算阻擋診斷

- 共用快照拒絕計算錯誤時保留全部原始 ERROR 的獨立副本；不改計算、公式、期間或寫入拒絕。
- CLI 將此錯誤輸出為完整 stderr JSON，提供中文說明／指標名稱、原始 ID 與公式原因；stdout 空及 exit 1 保留，其他錯誤格式不改。
- 四項新增真實候選／CLI／快照契約回歸、相關 60／全套 571 項與兩模式驗證通過，preview／apply 三個阻擋完整呈現且歷史不變；金融與父 baseline 缺口保留。

## 2026-10-04 — UNI／XLM 單次交易所價格資料

- 保存 Coinbase Exchange UNI/USD 與 XLM/USD 最後成交、四份原始 ticker／product 回應、decimal／nanosecond／HTTP Date 及獨立取得時間；兩筆 OBSERVED 候選不等於同步估值或個人交易資格。
- 新增 market_data_review 手動事件類型，追加四來源與一份 source-only 不可變快照，中文研究頁可查閱九筆事件；金融、公式、假設、圖譜及原模型期間不變。
- 原數值匯入因三項年度／point 依賴未對齊而拒絕保存；記錄原因及尚未套用的候選，不改日期或驗證規則。
- 五項新回歸、相關 33／全套 567 項與兩模式驗證通過，桌面與 Enter／Fixture 隔離驗收通過；本次尺寸控制未生效，價格卡片窄視窗實測保留未驗證。83 個金融未知、三項 TTM null 與父 baseline 保留。

## 2026-10-04 — 中文已保存事件查閱

- 唯讀研究 API 加入已審查事件，從每份不可變快照保留當時來源版本、生效／知識／審查／模型日期及原始內容；重用歷史鏈與事件語意驗證。
- 中文介面顯示八筆事件、執行證據與限制、來源及完整 JSON；raw 整數不轉數值。查閱不套用事件，合成工作區不含正式紀錄。
- 切換／重試立即清除舊事件，沿用最新回應防線；503 後 Enter 重試保留金融及未套用輸入。
- 11 項新增回歸、全套 562 項與兩模式驗證通過，桌面／窄視窗及鍵盤驗收完成；金融、來源、公式、八份同模型期間歷史及父 baseline 缺口保留。

## 2026-10-04 — UNI v2 單筆 LP 費用份額歸集

- 保存原始 Factory PairCreated 與後續 TokenJar LP 鑄造 receipt、raw uint256／UTC／log 順序、固定官方源碼及推論限制。
- 新增 protocol_fee_accrual 手動事件類型，沿用既有來源／日期／範圍與完整重算；四來源追加及一份不可變 source-only journal，金融／公式／假設／情境／圖譜不變。
- 四項新回歸、相關 17／日期 32／全套 551 項與兩模式驗證通過；合法追加不改寫歷史，固定昨日日期測試獨立於未使用的今日來源。
- LP／caller 贖回不當成 UNI burn 或年度收入；83 個金融未知、同模型期間及父 baseline 缺口保留。

## 2026-10-04 — 研究證據單獨重試

- 研究失敗提供中文手動重試，保留金融結果與未套用試算輸入；只讀取目前工作區研究，不重載金融／時效。
- 回應匹配工作區，最新請求獨占 busy／重試狀態，保留原順序防線；無自動重試、採集或資料變更。
- 四項新增回歸、全套 547 項與兩模式驗證通過，實際研究 503／延遲／Enter 重試／Fixture 隔離及桌面／窄視窗驗收通過，金融與父 baseline 缺口不改。

## 2026-10-04 — 中文開始使用

- 加入正式研究、合成試算與手動時效入口；網址保留明示工作區，無效／重複模式先停止載入並要求選擇。
- Windows 手動啟動檔核對 Node／依賴，提供中文網址及缺依賴提示；不自動安裝、採集或套用。ASCII wrapper 固定 CRLF，既有服務／loopback 保留。
- 五項新增網址回歸、全套 543 項與兩模式驗證通過，啟動需求／失敗／實際服務及三個中文入口桌面／窄視窗驗收通過；README 修正過時操作說明，金融與歷史不改。

## 2026-10-04 — 工作區載入隔離與中文重試

- 切換立即清空舊金融呈現與血緣，載入失敗保持計算停用，提供所選工作區的基準重試。
- 拒絕模式／Fixture provenance 不符回應，保留原請求順序防線；同工作區重算失敗明示保留上一個成功結果。
- 八項新增回歸、全套 538 項及兩模式驗證通過，實際桌面／窄視窗與延遲／失敗／鍵盤重試驗收完成；金融與歷史不改。

## 2026-10-04 — 固定研究目錄假設版本一致性

- 已重現有效 hash／重播及相同 TTM null 可藏同可比性假設版本的理由、信心、判斷改寫；共用入口核對完整版本指紋，包含 canonical ASSUMPTION 衝突。
- 保留合法多版本、原歷史／分類／來源及 null；沒有修改保存假設、政策、公式、金融或歷史資料。
- 十項新增回歸、相關 54 項與全套 530 項測試、兩模式驗證通過；83 個金融未知及三項正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — 固定研究目錄公式版本一致性

- 已重現有效 hash／重播可接受同公式 ID／版本的 AST 或 null_policy 改寫；共用 reader 依完整公式定義指紋拒絕，包含 TTM 兩份嵌入收入研究。
- 保留合法多版本、正反目錄順序及原嵌入公式重播；沒有修改公式定義、資料、來源、金融／論點或歷史。
- 八項新增回歸、相關 44 項與全套 520 項測試、兩模式驗證通過；83 個金融未知及三項正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — 共用研究證據 ID 一致性

- 重現一般研究入口接受有效 hash 的來源／紀錄同 ID 改寫，與 canonical 來源／金融輸入 ID 的衝突；移動既有時效 guard 到共用目錄入口並加入完整輸入 ID 檢查。
- 兩個唯讀 API 在回傳前拒絕衝突，同一證據重用／新來源版本／獨立紀錄仍可讀；金融、研究、歷史、政策與公式不改。
- 13 新增回歸、全套 512 項測試及兩模式驗證通過；六份研究／145 紀錄／20 來源保留，正式 baseline 缺口仍未完成。

## 2026-10-04 — 股本研究目錄、API 與中文 Dashboard

- 固定目錄 v2 追加原股本 hash，共用語意重播後回傳觀測／推導／來源版本／context／完整依賴；原五份條目保留，Fixture 排除與唯讀 API 不改。
- 中文介面先呈現七項核對及未解分類，115 筆／九筆未知可獨立展開；point 日期直接顯示 end。手動時效保留原觀測與審查日期、unknown 與 NOT_OBSERVED，政策／公式不改。
- 全套 499 項測試、兩模式驗證及實際桌面／手機、歷史截止日／工作區切換 QA 通過；金融／歷史與父 baseline 的缺口保留。

## 2026-10-04 — 股本研究手動唯讀驗證

- 新增共用 schema／重播與 `capital-review FILE --production`，繁體中文摘要及完整原始研究分開呈現；匹配 hash 仍核對來源、表格、日期、分類、版本、依賴與七條受限 AST 算術。
- 保留九個 null、選取未知的下游傳播與 signed 調節差額；固定目錄／現在股本／估值驗證留待後續，金融／來源／歷史不改。
- 新增 36 回歸、全套 493 項測試及兩模式驗證通過；83 個金融未知、三項 TTM null 與未解分類保留，父 baseline 未完成。

## 2026-10-04 — SECZ 轉售登記分類核對

- 直接閱讀 S-1 選定披露，另存 50 列原始欄位、108 個 OBSERVED（9 個 null）及 7 條 v1 研究算術公式／完整依賴；source-only event 釘選不可變研究 hash。
- 追加 S-1／申報費來源及 opinion／10-Q coverage v2，舊版本保留；對照登記量、權證與已發行類別，保留 Sponsor 重疊及未解 earnout 差額，不建立現在估值。
- 全套 457 項測試、兩模式驗證與全部金融／歷史重播通過；追加一份完整快照，七份同模型期、83 個金融未知及正式 TTM null 保留，父 baseline 未完成。

## 2026-10-04 — CI 執行環境維護

- 核對實際 main 平台淘汰提示及官方 action metadata，將 checkout／setup-node 升至 v7（Node 24），runner 固定目前 Ubuntu 24.04。
- 保留原 Node 24／npm cache／觸發器／讀取權限／安裝與兩模式驗證步驟，未新增工作或業務自動化。
- 本機 452 項測試與兩模式驗證通過；遠端 action／平台提示結果以實際 CI 為準，金融與歷史保留，完整 baseline 仍未完成。

## 2026-10-04 — 相鄰快照版本連續性

- 已重現 matching hash／有效 parent 的舊來源同 ID 改寫可讀取；歷史讀取逐對重用既有來源／輸入及公式／規則版本 guard。
- 拒絕同 ID 改寫／刪除、未升版與退版定義；保留合法追加及升版，未修改真實來源、金融或快照。
- 20 新增回歸、452 項全套測試與兩模式驗證通過，API 檔案保留與真實歷史 hash／金融重播通過；父 baseline 仍未完成。

## 2026-10-04 — 繁體中文 CLI 論點報告

- CLI report 沿用介面中文詞彙，顯示工作區／模型期間／狀態與證據覆蓋；保留論點代碼及全部觸發規則原文。
- 已存示範報告重生為中文，合成標記、原期間／狀態與證據不足警語保留；金融與歷史不變。
- 實際兩模式產生報告並核對引擎輸出／歷史 hash，432 項全套測試與兩模式驗證通過；完整 baseline 仍未完成。

## 2026-10-04 — 已存事件節點範圍

- 已重現未登記節點在同步／重算 hash 後可載入；新事件與 saved load 共用起始節點／圖譜端點／可到達更新資產限制。
- 依各快照保存的資產與圖譜核對完整、無重複傳播集合，保留目前圖譜改版後的歷史判定；原傳播算法與金融資料不改。
- 21 新增回歸、432 項全套測試與兩模式驗證通過，API 不寫入與全部真實歷史 hash 保留；父 baseline 仍未完成。

## 2026-10-04 — SECZ 母公司認股權證歷史條款

- 保存 Exhibit 4.1 修訂後母公司權利，區分舊子公司條款、歸屬／行使與 earnout，防止重複換股或將容量當作已發行。
- 追加一份來源及完整快照，原五份歷史與所有金融／圖譜／估值／論點保留；六份仍同模型期間，未知值與正式 TTM null 不改。
- 四項新增回歸、411 項全套測試與兩模式驗證通過。完整 S-1 讀取／存取阻擋與登記類別差異如實保留，父 baseline 未完成。

## 2026-10-04 — 繁體中文介面

- 導航、操作、84 個指標、單位、血緣與研究／時效／版本狀態中文化；保留原始分類／論點代碼、來源／規則原文及完整 JSON。
- 顯示名稱獨立於 engine／spec／data，數字採 zh-TW 格式；原金融公式／數值／門檻／快照不變，缺值與證據不足維持明示。
- 實際桌面／手機與重算／還原／來源檢視／時效／鍵盤 QA 通過，JSON 與原檔／API 完全一致；407 tests 與兩模式驗證通過。完整 baseline 仍未完成。

## 2026-10-04 — SECZ dated parent capital context

- Preserve parent 10-Q issued-share dates, pre-closing financial scope, included restricted sponsor shares and separate conditional/reserved rights alongside Exhibit 5.1 resale categories.
- Retain filing/opinion dates, unresolved earnout-category difference and indexed-only S-1 offering context; do not infer a current/fully diluted denominator, incremental issuance or market valuation.
- Append five primary-publisher source versions and one source-only full snapshot; keep prior hashes, financial inputs/formulas/thesis/graph and three formal TTM nulls. Five snapshots still represent one model period.
- Four new regressions and test-only isolation of noon clock probes from later research retrievals; final full suite 407 passed and both validate modes pass. Complete production baseline remains pending; this work session stops after the PR flow.

## 2026-10-03 — Shared saved-update knowledge/state guards

- Reproduced saved events accepting observations whose knowledge dates postdated the event despite matching/recomputed hashes.
- Reuse existing update-as-of and DTCC live/material status rules in shared evidence validation for preparation and saved canonical loads.
- Added 21 regressions; full suite 403 passed and both modes validate. Preserve same-day observations, legal future plans, not-live scenarios, live/completed paths and all financial/source/history outputs; complete baseline remains pending.

## 2026-10-03 — Shared saved-research primary evidence

- Reproduced non-primary-only research-refresh journals accepted during canonical loads despite matching/recomputed hashes.
- Reuse existing preparation rules for nonempty OBSERVED updates, a tier 1/2 source per observation, complete declared evidence and observation publication cutoffs.
- Added 14 regressions; full suite 382 passed and both modes validate. Preserve primary-backed null, mixed evidence, generic credible-source behavior and all financial/source/history outputs; complete baseline remains pending.

## 2026-10-03 — Manual Dashboard freshness inspection

- Added an explicit UTC-cutoff query using the existing read-only API; retain canonical/research dates, unknowns, review availability, synthetic provenance and complete policy/formula/source dependencies.
- Clear results when dates/workspaces change and isolate late responses. No initial/automatic freshness queries, date calculations or financial formulas in the UI.
- Full suite 368 passed and both modes validate. Actual Playwright desktop/mobile, historical/error/keyboard and delayed-response QA passes; Browser transport failures and expected console 404/400 are documented. Financial/source/history and policy/formula versions remain unchanged.

## 2026-10-03 — Shared saved-event evidence validation

- Reproduced invalid future completed evidence accepted during direct journal loads despite matching/recomputed event and snapshot hashes.
- Reuse existing preparation rules during canonical loads: knowledge/effective/publication chronology, declared sources, workspace provenance, credible completed evidence and planned-update classifications.
- Added 15 saved-load/API/history regressions; full suite 368 passed and both modes validate. Valid future plans, retrospective retrieval and all financial/research/history outputs remain unchanged; complete baseline remains pending.

## 2026-10-03 — Read-only manual freshness API

- Added GET /api/freshness using existing canonical/research freshness engines, policy/formula v1 and canonical history checks.
- Preserve workspace isolation, synthetic provenance, independent dates, unknown/formal TTM evidence and optional historical UTC cutoffs; reject empty/invalid/future cutoffs and write methods.
- Added nine HTTP regressions; full suite 353 passed and both modes validate. No financial, historical, UI, policy or formula changes; complete production baseline remains pending.

## 2026-10-03 — Shared manual-event review chronology

- Closed generic/source-only events accepting future review timestamps that had only been checked for research-refresh.
- Reuse review validation during preparation and canonical journal loads: nonblank reviewer/rationale, exact current instant, UTC knowledge day and all declared/new source retrieval cutoffs. Reject invalid direct loads/API even when journal hashes agree.
- Added 19 regressions; full suite 344 passed and both modes validate. Retrospective review, planned future effective dates and ordinary manual events remain valid; financial formulas/data and saved history remain unchanged.

## 2026-10-03 — SECZ acquisition-context cross-check

- Preserved seven dated SEC sources: S-1 acquisition narrative/allocation, selected prospectus/interim statements and all three filing indices. Retained both Inc./LLC headings and the XBRL member label.
- Recorded matching acquisition-date allocation separately from actual and acquisition pro forma revenue; appended a source-only full snapshot, retaining every earlier financial/source version and formal TTM null.
- Added four regressions; full suite 325 passed and both modes validate. Four snapshots of one model period do not add thesis evidence. Legal naming equivalence, six-stream ingestion and complete baseline remain unverified.

## 2026-10-03 — Thesis condition-period evidence

- Prevented an old metric from being counted as a new thesis period solely because its snapshot label changed.
- Require known condition endpoints to match the frame and flow bases to match; retain point/model classifications and explicitly report rejected metric periods without discarding actual values or independent triggers.
- Added 15 regressions and period metadata to existing test frames; full suite 321 passed and both modes validate. Committed economics/thesis replay and immutable history remain unchanged; complete production baseline remains pending.

## 2026-10-03 — Calendar period endpoint alignment

- Corrected month-only comparison that accepted shifted annual/quarterly dates for prior-period growth and consecutive thesis evidence.
- Share a date-only calendar check requiring the same day or two actual month ends, retaining leap-year and 30/31-day endpoints. Misalignment produces a calculation error or insufficient thesis evidence; independent triggers remain visible.
- Added 18 regressions; full suite 306 passed and both modes validate. Financial formulas/thresholds, inputs and immutable history remain unchanged. Week-based calendars and the complete production baseline remain pending.

## 2026-10-03 — Manual cataloged-research freshness

- Added a production-only read-only CLI combining existing canonical freshness with hash-verified/replayed identity/revenue/TTM evidence.
- Separated observation/publication/retrieval ages from review availability; retained original classifications, periods, scope, source versions and explicit insufficient evidence. Rejected conflicting source/observation ID content.
- Reused existing analyst policy/formula v1 and preserved canonical output, financial data/history and unknowns. Added 17 regressions; full suite 288 passed and both modes validate. Complete baseline remains pending.

## 2026-10-03 — Single historical UNI Firepit release

- Preserved a successful 2025-12-29 receipt with caller-funded UNI dead-address payment, five TokenJar asset transfers and Released nonce, plus dated immutable official source-code evidence.
- Appended a source-only event/full snapshot while retaining every earlier version and unchanged economics; three snapshots of one model period do not add thesis periods.
- Added four regressions; full suite 271 passed and both modes validate. Annual fees/burn, fee-origin attribution and full baseline remain unverified.

## 2026-10-03 — Canonical current-time evidence guard

- Reject future OBSERVED as-of dates and source retrieval instants in shared canonical validation, covering direct loads/API and generic events as well as fixture/null/unused evidence.
- Preserve explicit analyst forecasts, future planned effective dates, retrospective retrieval and original timestamp precision; no financial or historical evidence changes.
- Added 13 regressions; full suite 267 passed and both modes validate. Complete production baseline remains open.

## 2026-10-03 — Read-only research evidence inspection

- Added an explicit hash-pinned local catalog, schema and complete review replay behind a GET-only research API.
- Added a Dashboard evidence section retaining original periods, classifications, source versions and full review dependencies; unverified TTM and investability remain explicit.
- Kept Production research separate from fixtures and canonical financial inputs; protected workspace switching against stale responses.
- Added nine regressions; full suite 254 passed, both modes validate and actual desktop inspection passed. Full baseline remains incomplete.

## 2026-10-03 — UTC research/source chronology

- Corrected source/review date comparison across UTC midnight by normalizing offset timestamps in shared canonical validation, identity review and research refresh.
- Retained original timestamp metadata, date-only precision, financial formulas/assumptions and every saved artifact/history record.
- Added ten regressions; full suite 245 passed and both modes validate. Full production baseline remains incomplete.

## 2026-10-03 — Explicitly reviewed raw revenue TTM bridge

- Added versioned research formula v1, strict review schema and read-only production TTM CLI with bound immutable inputs, exact annual/YTD intervals and complete lineage.
- Preserved comparability as explicit ASSUMPTION; false/null checks block numerical output. Saved a full review retaining the unresolved MG Stover Inc./LLC name difference and three null TTM values.
- Added 36 regressions; full suite 235 passed and both modes validate. No financial ingestion, canonical formula change, additional thesis periods or automated collection; verified TTM/model mapping and parent baseline remain pending.

## 2026-10-03 — SECZ S-1 / 424B3 annual-table research

- Added an independently sourced August 7 prospectus dossier, six annual raw revenue observations and immutable research/comparison artifacts matching July 31 S-1 cells.
- Preserved filing-specific identities and full evidence without superseding prior observations, financial ingestion or additional thesis periods. Extended standalone schema to allow 424B3 only.
- Added five regressions; full suite 199 passed and both modes validate. Quarterly comparability, earlier correction lineage, TTM and the parent baseline remain pending.

## 2026-10-03 — Read-only raw revenue review comparison

- Added production-only revenue-compare with embedded-formula replay, explicit method v1, separate source/formula/context/record/value changes and full evidence retention.
- Rejected reused historical IDs and invalid declared supersession; retained independent observation conflicts and unknown evidence without selecting a filing or changing financial inputs.
- Added 15 regressions; full suite 194 passed and both modes validate. Cross-filing economic comparability, TTM and the parent production baseline remain incomplete.

## 2026-10-03 — Manual event knowledge/source chronology

- Reject future event as-of dates and event sources published after knowledge as-of, including source-only manual events, before recomputation or journal writes.
- Retain legitimate planned/announced future effective dates and retrospective retrieval; live/completed evidence requirements and observation classification barriers remain in place.
- Added ten event chronology/no-write checks; full suite 179 passed and both modes validate. No canonical evidence, financial formula/assumption or immutable history changes.

## 2026-10-03 — Shared observation/source publication validation

- Fixed direct canonical loads and general events accepting sources published after observed as-of; moved the restriction already used in reviewed research into the shared validator.
- Check all referenced sources, including null/fixture observations, before recomputation/persistence. Retrospective retrieval and explicit assumption/scenario classifications remain valid.
- Preserved financial formulas, assumptions, all canonical evidence and immutable research/financial history.
- Added ten chronology/boundary/no-write checks; full suite 169 passed and both modes validate. Full production baseline remains open.

## 2026-10-03 — SECZ audited annual reported revenue

- Added a separate six-observation full-year revenue dossier and immutable research artifact with primary audit, annual statement, XBRL and filing-index evidence.
- Extended the existing read-only review for full calendar years, S-1, explicit audit evidence and absent Period of Report; retained cover/index date differences and financial issuance separately.
- Preserved the original quarterly artifact, formula v1 ASTs and all canonical financial history/unknowns. No TTM bridge, annualization or six-stream mapping occurs.
- Added 11 full-year/audit/date/replay checks; full suite 159 passed and both modes validate. Earlier correction lineage and full production baseline remain pending.

## 2026-10-03 — SECZ comparable reported revenue

- Added an independent primary-source dossier of 12 disaggregated quarterly/half-year revenue observations with explicit fiscal intervals, filing dates and subsidiary GAAP scope.
- Added strict schema and read-only revenue-review CLI. Two research formulas v1 reconcile categories and compare corresponding prior-year intervals through the existing restricted AST; missing or zero-base evidence stays null.
- Saved a full immutable content-hashed research artifact with embedded observations, source versions, context, review, formulas and results; canonical annual formulas/assumptions and financial snapshot chain are unchanged.
- Added 33 evidence/period/replay/CLI checks; full suite 148 passed and both data modes validate. Annual/TTM conversion, six-stream mapping and full production baseline remain pending.

## 2026-10-03 — Historical UNI v2 fee configuration

- Saved proposal 93's executed v2 feeTo configuration as a source-only manual event and immutable production snapshot, with receipt, governance and pinned official contract sources.
- Explicitly superseded receipt/governance source versions while retaining old records, budget observation lineage and the reported execution timestamp conflict.
- Preserved all financial inputs, formula/assumption versions, graph and thesis. Configuration is separate from realized fee revenue, UNI burns, current state and v3 pool activation.
- Added three production replay/source-only regressions; full suite 115 passed and both modes validate. Full production baseline remains incomplete.

## 2026-10-03 — Annual-rate input period validation

- Reject known annual-rate inputs tagged quarterly/point, preventing quarterly totals from silently entering USD/year or other annual-rate calculations.
- Require rationale for observed model annual rates; retain unknowns, valid annual/TTM/model rates and point prices/inventories.
- Added 15 checks and retained formula accounting-basis coverage. Full suite 112 passed; both modes validate; financial formulas, canonical observations and historical snapshots are unchanged.
- Quarterly raw-data ingestion and revenue-category mapping remain pending; this correction does not annualize data.

## 2026-10-03 — Manual source freshness

- Added read-only freshness CLI and explicit versioned analyst policy, separating observation as-of, publication and retrieval ages.
- Retained source versions and null data; unavailable-at-cutoff evidence cannot appear fresh. Old historical facts are not invalidated by review-window age.
- Included DERIVED UTC-calendar-day formula v1 and policy digest/dependencies in report metadata. No financial calculations or thesis rules changed.
- Added 14 freshness regressions; full suite 97 passed, both modes validate without errors/warnings. Manual NEXT subtask complete; full production baseline remains pending.

## 2026-10-03 — Core identity dossier

- Recorded dated primary-source identities for UNI (Ethereum ERC-20), SECZ (NYSE parent common stock and SEC CIK) and XLM (native Stellar asset); kept personal eligibility/custody unknown.
- Added a strict standalone dossier schema and read-only identity-review CLI with evidence/date/type validation. No asset promotion or numerical research-apply occurs.
- Distinguished announced SECZ trading from later SEC confirmation; retained filing/report/financial dates and native versus wrapped-asset boundaries.
- Added 18 read-only/evidence rejection checks; full suite 83 passed, both data modes validate. Complete production baseline remains open.

## 2026-10-03 — Historical UNI approved budget baseline

- Added a reviewed historical proposal and immutable production journal for the 20M UNI/year approved rate effective 2026-01-01, with four dated primary sources.
- Explicitly superseded null assumption v1 with observed v2 while retaining all history; recorded successful execution, allowance evidence and the governance-page/receipt timestamp conflict.
- Distinguished approved rate from realized distributions, minting, fee accrual and current settings. Remaining 83 metric values are unknown; thesis coverage remains insufficient.
- Added production snapshot replay, evidence identity and null-propagation checks. Full suite: 65 passed; both data modes validate without errors/warnings. Financial formula and analyst-assumption versions remain unchanged.

## 2026-10-03 — Reviewed primary-source refresh workflow

- Added manual production-only research preview and digest-bound apply commands, with recorded reviewer, review time and rationale.
- Persist new sources and observations together in the exclusive event journal, retaining full economics, formula versions, source lineage and historical replay.
- Reject stale previews, missing primary evidence, fixture leakage, incompatible periods, duplicate IDs and invalid supersession before writing.
- Check the entire saved event against its immutable snapshot, including source and review metadata; historical bootstrap journals remain readable.
- Fixed absolute YAML input paths for Windows CLI workflows.
- Added 27 research workflow checks; full suite: 62 passed, 0 failed. Financial formulas and assumptions retain their existing versions. Production research baseline remains pending.

## 0.1.0 — MVP bootstrap

- Created canonical YAML specs, schemas, data dictionary and distinct fixture/production stores.
- Implemented 25 versioned formulas across 84 metrics, including three required models and recursive lineage.
- Preserved the exact UNI standalone required-share equation and added a separately labeled full-net reverse hurdle.
- Added ten-parameter sensitivity recomputation, nine analyst-defined thesis rules, period persistence checks and explicit insufficient-evidence reporting.
- Added typed research graph, gated candidate promotion, validated manual event propagation and append-only observations.
- Added content-hashed immutable snapshots, parent-chain verification and previous/current change attribution.
- Added local Dashboard, input/derived inspector, per-cell sensitivity lineage and snapshot-specific historical lineage.
- Production starts without observed facts. All financial demo values remain synthetic; no listings, integrations or budget facts were asserted as verified.
- Upgraded YAML to 2.9.1 and Ajv to 8.20.0 after npm registry audit identified issues in the initial dependency choices. Registry audit after upgrade reported zero vulnerabilities.

## Fixture material-update demonstration

Initial protocol-fee assumption: 1.70 bp. Revision: 1.25 bp. Required standalone UNI share: approximately 31.03% → 42.2%.

Source change: No. Assumption change: Yes. Formula change: No. Both revisions belong to 2025; they do not constitute two accounting periods. The event is `planned` and synthetic, not a statement that a real protocol fee changed.

The authoritative per-update changelog is each immutable snapshot's `reason`, `parent_id` and embedded event. Append entries here when reviewing further material changes; never alter or delete historical source/input records.

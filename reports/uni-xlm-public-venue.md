# UNI／XLM 單一公開市場與網路表示

UTC 2026-10-05 手動各讀一次 Coinbase Exchange 的 [UNI 貨幣](https://api.exchange.coinbase.com/currencies/UNI)、[XLM 貨幣](https://api.exchange.coinbase.com/currencies/XLM)、[UNI-USD 產品](https://api.exchange.coinbase.com/products/UNI-USD)、[XLM-USD 產品](https://api.exchange.coinbase.com/products/XLM-USD)。[官方端點說明](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/currencies/get-a-currency)與公開回應只提供平台表示，不提供個人資格。沒有刷新 ticker，也沒有查詢帳戶或下單。

[原資料包](../data/research/uni-xlm-public-venue-2026-10-05-v1.json)保存四份完整 JSON 字串、GET URL、HTTP 200／Date，以及每次開始／收到時間；exact bytes SHA-256 `116eca762bb31dbbe9a30a26539e88df98a5a98503e6e489df7ae795e36ce03c`，Git 固定 LF。取得時間分別為 `00:07:10.660Z`、`00:07:10.938Z`、`00:07:11.229Z`、`00:07:12.143Z`。四份回應不是同一瞬間；供應者未報狀態生效時間，`provider_state_timestamp` 保留 null，HTTP Date 不能取代既有成交時間。

26 筆 OBSERVED 各保留來源 ID、point 日期、原值、型別、單位及取得時間。兩 currency／default network 的 status 均回報 online，default network 分別為 ethereum／stellar；兩產品 base_currency 分別為 UNI／XLM，quote_currency=USD、status=online，trading_disabled／cancel_only／limit_only／post_only／auction_mode 均為 boolean false。這只記錄本次公開端點的表示，不證明訂單可成交、流動性、帳戶權限或全球可用性。

UNI 回報合約 `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`。資料包嵌入原身份 dossier fingerprint `831b5b62e0267836a84e5948739f367253b910139134e519282248612988c49c`、兩個原 OBSERVED 身份與原來源版本。研究公式 `research.uni.coinbase_reported_contract_matches_identity` v1、受限 `casefold_evm_address_eq`、兩個確切 record／field 依賴重播為 DERIVED 旗標 1；僅表示回報文字與原官方地址相符，不證明實際託管持倉、鏈上餘額或轉帳可用。XLM 合約 raw_value 為空字串，value=null／confidence=unknown，不從空欄位推原生身份；原 Stellar 官方身份證據獨立保留。

個人／地區／託管／帳戶交易／提款 access_review 均為 null，status=unverified；SECZ 當前 venue 未研究，資產登錄與宇宙階段不提升。使用者未指定個人司法管轄區，本子項依公開全球資訊範圍查閱。

[事件](../data/research/uni-xlm-public-venue-2026-10-05.yaml)已保存為完整快照 `f69c8c2d8b4b5f036177b1e482b8c07eb23651849b786eeaa7e0afee44da9941`，parent `e108e8eb28954ee035b6c2fe009229fb3ed9d1295b765b0bb88bef1f58660cd8`；不可再次套用。追加四份平台來源與兩份原身份來源，產品來源明示 v2／supersedes 昨日 v1，昨日價觀測仍引用原 v1。updates=[]、source_change=true、changes=[]；金融／公式／假設／情境／圖譜／論點不變。模型截止日維持 2026-10-04，十五份正式快照仍只有兩個模型截止日；三份 Fixture 不改。unknown 80、三項 SECZ TTM null、UNI 原年率 stale、Fixture 0.422 保留。

四項新增回歸核對 exact bytes／事件、26 個型別與原 HTTP 時間／XLM null、原身份／公式 v1 與精確依賴、六來源追加／版本／完整重播／不提升投資性，以及中文卡片。舊時效測試的隔離樣本同步 canonical 與研究中的同 ID 來源 metadata，保留來源衝突拒絕。`npm test` 全套 700 通過；`npm run validate`／`npm run validate -- --production` 均無 errors／warnings，84 指標／25 公式，unknown 1／80。

Chrome 可用，URL `http://127.0.0.1:4310/?mode=production#research`，實際 CSS 桌面 1536×729／窄 312×675。用 `[data-event="uni-xlm-public-venue-state-20261005"] > summary` 與內層 `details > summary` 按 Enter 展開卡片／原始事件 JSON；讀取六份來源的版本／取得時間及安全連結。Fixture 研究／事件 0／0，切回正式恢復 8／15；桌面非空白、身分正確、無錯誤覆蓋，窄卡片 clientWidth=scrollWidth=266／頁面無水平溢出，console error／warn 與 server stderr 空。截圖 TEMP `public-venue-desktop.png`／`public-venue-mobile.png`，尺寸已還原，驗收服務 PID 1784 已核對命令並停止。未驗證其他瀏覽器或真實手機。

本資料包目前可從已存中文事件查閱研究摘要與來源；26 筆原始研究資料尚未接入共用資料包 reader／目錄。下一項應重用這次原 bytes／review／來源，不重新取得時間或再次套用事件。同步估值、全年 capture／分配、SECZ 可比期間與完整 baseline 仍待查證。

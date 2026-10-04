# UNI 固定區塊 owner 餘額與供給

沿用原已保存 finalized anchor：Ethereum block `26119713`、hash `0x8c22223f143699fb4d55710934e86114f9a0379136a5b8539a35a068bbdb4d72`，區塊時間為 UTC `2026-10-04T14:53:11.000Z`。本次不是重新選取 finalized tag；以 hash 重新讀取 chain／header，四個 UNI `eth_call` 均使用 `{blockHash, requireCanonical:true}`。單一 PublicNode 回應保留 medium confidence，沒有本地驗證共識 proof。

[原始資料包](../data/research/uni-token-state-2026-10-04-v1.json) 保存 request／response、HTTP Date、原始 hex、uint256 十進位字串、四個 OBSERVED、來源與原 owner getter 的 archive／hash 依賴。取得時間 UTC `2026-10-04T16:06:27.842Z`，審查時間 `16:10:51.187Z`；原 anchor／Coinbase 價格取得時間保留。

| 同一區塊的讀值 | 精確值 | 單位 |
| --- | --- | --- |
| owner balance | 262247996305835021033106178 | UNI raw base units |
| totalSupply | 1000000000000000000000000000 | UNI raw base units |
| decimals | 18 | count |
| owner → UNIVesting allowance | 20000000000000000000000000 | UNI raw base units |

owner `0x1a9c8182c09f50c8318d769245bea52c32be35bc` 來自前一份同 hash 的 getter；token `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`、vesting `0xca046a83edb78f74ae338bb5a291bf6fdac9e1d2`。研究公式 `research.uni.owner_balance_covers_vesting_allowance` v1 使用 `gte_raw_uint256`，以 BigInt 比較同 token／同區塊的兩筆觀測，DERIVED ratio 結果為 1；完整公式與確切 dependencies 嵌入資料包，沒有加入 canonical 金融公式或在 UI 計算。

結果僅支持「該時點 owner 餘額不少於這筆 allowance」。完整可轉帳條件、其他授權競爭、未來設定／餘額、下游支出與全年已分配仍未驗證。totalSupply getter 不提供流通／自由流通供給或未來完全稀釋定義，mint 上限亦未查證；dead-address Transfer 不足以證明合約 totalSupply 減少。原 Coinbase trade 與此 block 是不同時點，不據此計算同步市值／FDV或合理價值。

人工 [proposal](../data/research/uni-token-state-2026-10-04.yaml) 已保存成 [source-only journal](../data/events/production/uni-token-state-20261004.json)，不可再次套用。同一資料包 exact bytes SHA-256 為 `848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d`，Git 固定 LF；快照 `e108e8eb28954ee035b6c2fe009229fb3ed9d1295b765b0bb88bef1f58660cd8`，parent `09d23d841ade51af011527b6bd538a5b37c9a26e1ab81d001e1d83644d730b4e`。僅追加一份來源，數值 changes=[]；所有金融輸入、公式、假設、情境與論點保留。正式十四份快照仍只有兩個不同模型截止日，不增加已驗證論點期間。

四項新增回歸核對 ABI／同 hash、精確整數、owner 依賴、v1 比較重播與金融／歷史／Fixture 隔離。全套 `npm test` 643 項、Fixture／Production `npm run validate` 通過：84 指標／25 公式、無 errors／warnings、unknown 1／80。UNI 原核准年率仍 stale、三個 SECZ 原始 TTM null、Fixture required-share 0.422 保留。這份新 token-state 格式尚未接入 v1 fixed-block-review 命令或研究目錄；本子項使用已存事件卡片查閱，下一項補共用唯讀驗證與精確研究查閱。

Chrome 驗收 URL `http://127.0.0.1:4310/?mode=production#research`，桌面 CSS 1536×729、窄 CSS 312×675。以 `locator('[data-event="uni-token-state-20261004"] > summary').press('Enter')` 展開中文卡片，以其內層 `details > summary`／Enter 展開原始事件；核對所有 raw 整數、block hash、取得／審查時間、兩個 noopener／noreferrer 來源連結。Fixture 切換清空正式事件／研究，Production 還原十四事件。頁面身分正確、非空白、沒有錯誤覆蓋；console error／warn 空。窄卡片 clientWidth=scrollWidth=266，頁面無水平溢出。截圖在 TEMP `uni-token-state-desktop.png`／`uni-token-state-mobile.png`；沒有改既有 layout，未驗證其他瀏覽器或真實手機。完整 baseline 其餘缺口保留。

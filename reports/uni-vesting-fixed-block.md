# UNI 固定區塊參數與剩餘授權

2026-10-04 人工查證 PublicNode 的 Ethereum mainnet 公開 RPC。先取得 chainId `0x1` 與 finalized header，再以 EIP-1898 `{blockHash, requireCanonical: true}` 固定六個 UNIVesting getter、UNI allowance／decimals 與 runtime bytecode。高度重查的 hash 相符；這是單一 provider 回報的狀態，沒有本機共識／proof 驗證。

固定 block **26119713**，hash `0x8c22223f143699fb4d55710934e86114f9a0379136a5b8539a35a068bbdb4d72`；區塊時間 `2026-10-04T14:53:11Z`，取得時間 `2026-10-04T15:08:12.569Z`，人工審查時間 `2026-10-04T15:10:00.682Z`。UTC 日與實際 instants 分開保留；區塊晚於先前 Coinbase trade，不是同步估值。

| 呼叫 | 該區塊解碼值（整數保持字串） |
| --- | --- |
| UNI() | `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984` |
| owner() | `0x1a9c8182c09f50c8318d769245bea52c32be35bc` |
| recipient() | `0xaba63748c4b4def4a3319c3a29fe4829029d926f` |
| quarterlyVestingAmount() | `5000000000000000000000000` raw |
| lastUnlockTimestamp() | `1790812800` Unix seconds |
| quartersPassed() | `0` |
| UNI.allowance(owner,UNIVesting) | `20000000000000000000000000` raw |
| UNI.decimals() | `18` |

allowance 是該區塊剩餘授權；它不能證明 owner 餘額、後續額度不變、未來可付款、實際全年分配或下游支出。raw uint 解碼用 BigInt，完整 ABI word／calldata 保存；不先轉成浮點。六個 getter 與上次 UI 值相同，上次未固定 block／hash／response time 的三個 null 仍保留，沒有修改原來源或取得時間。

runtime bytes 的 SHA-256 為 `724eedb3a53e4d138de0d09ba55b858673b7a846653d92154bf5797da14f2dc5`，只用於檔案核對，不是 Ethereum Keccak codeHash。保存 bytecode 不等於核對官方 source 的部署等價；Explorer Similar Match 限制仍在。

另查既存 10 月 1 日交易 `0x596bab92c2d9e3d1a6183b32da053c4feabab5d58ab61009b4800d84beef683a`，provider 回傳 `result: null`。本次未能 RPC 交叉確認 receipt，也不能據此判定先前交易不存在或失敗；原 Explorer 成功 receipt／三 logs 不改寫，provider 無結果獨立保留。

原始證據 [JSON](../data/research/uni-vesting-fixed-block-2026-10-04-v1.json) 保存逐字 request／response、probe／state 取得時間、HTTP status／Date、回應 ID、anchor、解碼值及限制；SHA-256 `cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195`。`.gitattributes` 固定該 archive 為 LF，避免 Windows checkout 改變已審查 bytes。方法依據 [PublicNode endpoint](https://ethereum.publicnode.com/)、[EIP-1898](https://eips.ethereum.org/EIPS/eip-1898)、[ERC-20](https://eips.ethereum.org/EIPS/eip-20)；getter 解讀沿用既存固定官方 source，未把外部文件抓取時間冒充既存來源取得時間。

人工事件 [proposal](../data/research/uni-vesting-fixed-block-2026-10-04.yaml) 先 `prepareEvent` 記憶體驗證／比較，再 `node cli.js event ... --production` 一次追加 source-only 快照 `09d23d841ade51af011527b6bd538a5b37c9a26e1ab81d001e1d83644d730b4e`，parent `f6580ef3…`。這個 ID 已保存，不可再次 apply。新增一來源；source_change=true、changes=[]，公式／假設／情境／規則／全部金融紀錄不變。

596 項 `npm test` 通過；`npm run validate` 與 `npm run validate -- --production` 均為 84 指標／25 公式、無錯誤及警告。十三份正式與三份 Fixture 歷史保留；本份按自身輸入與公式重播一致，0.422 保留，80 個金融 unknown 與 stale 歷史預算、三項 TTM null 不變。只有兩個不同模型 endpoint，不能把來源快照當成多個 thesis 期間。

Chrome 驗收 `http://127.0.0.1:4310/?mode=production#research`：桌面 CSS 1536×729，窄 CSS 312×675；中文事件標題、Enter 展開卡片與原始 JSON、完整 hash／raw amount／receipt null、兩個安全來源連結與工作區隔離通過。窄卡片 clientWidth=scrollWidth=266、頁面無水平溢出；console error／warn 空，無錯誤覆蓋。截圖在 TEMP `uni-fixed-block-desktop.png`／`uni-fixed-block-mobile.png`；尺寸已還原。未驗證其他瀏覽器、真實手機或多節點共識。

完整 baseline 仍需部署 source 等價、餘額／全年分配及捕獲、供給／同步估值、SECZ 六收入／股本／TTM 可比性與個人投資性；本點狀態不刷新 canonical 年率的觀測日或推出 fair value。

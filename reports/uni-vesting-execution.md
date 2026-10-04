# UNI 季度提領與公開合約參數

保存一筆已執行預算提領，以及稍後公開讀取頁的參數回應。原 2026-01-01 核准名目年率、2026-10-04 單筆價格與 DERIVED 模型折算全部保留；這次新增證據，沒有匯入年度支出或收入。

[成功 receipt](https://etherscan.io/tx/0x596bab92c2d9e3d1a6183b32da053c4feabab5d58ab61009b4800d84beef683a#eventlog) 位於 block 26098816，UTC **2026-10-01T16:59:35Z**。caller `0x2CF8e5b175aa29C1fDf0e9fe572735C78eacCE43` 呼叫 `0xCa046A83EDB78F74aE338bb5A291bF6FdAc9e1D2`。Overview 顯示 **5,000,000 UNI** 由 UNI Timelock 轉給 `0xaBA63748c4b4DeF4a3319C3A29fE4829029D926F`。保留全部三個 logs：

| Log／emitter | 原始事件 | 證據與界線 |
| --- | --- | --- |
| 406／UNI `0x1f9840…1f984` | Approval | owner `0x1a9C8182C09F50C8318d769245beA52c32BE35BC`，spender 為上述提領合約，raw amount `20000000000000000000000000`；不是另外一筆轉帳或最新 allowance |
| 407／同一 UNI | Transfer | 同一 owner → 受款地址，raw amount `5000000000000000000000000` |
| 408／上述提領合約 | Withdrawn | 相同 recipient／raw amount，`quartersPaid=1` |

完整地址、topics、整數與可見原文存入 [raw archive](../data/research/uni-vesting-execution-2026-10-04-v1.json)。SHA-256 為 `7f651374e3553eb5625c605c6990633177fd351442b371bb0402d9eccc586cd6`。沒有使用 explorer 的即時美元估值，也沒有把 Approval 與 Transfer 加總。

[公開 readContract](https://etherscan.io/readContract?m=light&a=0xCa046A83EDB78F74aE338bb5A291bF6FdAc9e1D2&n=mainnet&v=0xf32d53ae98c4d6ab04d4b870ff9a97f37a724f79) 在人工保存時顯示六個 getter：UNI／owner／recipient 與上述地址一致，`quarterlyVestingAmount=5000000000000000000000000`、`lastUnlockTimestamp=1790812800`、`quartersPassed=0`。保存時間為 2026-10-04T14:34:27Z，知識日為 10 月 4 日；source date 在這裡表示人工保存日，並非查明的鏈上區塊日期或文件發布日。

讀取頁沒有固定 block number／hash 或實際回應 timestamp，因此三者保持 null，信心為 low。多個 getter 可能來自不同區塊，不能視為 Coinbase tick 時刻的同步狀態；10 月 1 日 Approval 也不能代替今天的 allowance 讀取。[合約頁](https://etherscan.io/address/0xCa046A83EDB78F74aE338bb5A291bF6FdAc9e1D2#code) 顯示 Similar Match，參考地址 `0xf32d53ae98c4d6ab04d4b870ff9a97f37a724f79`；本次沒有驗證部署 bytecode 等價。

重讀[固定官方 UNIVesting source](https://github.com/Uniswap/protocol-fees/blob/9dbc6717658158c714870170d6f4c55bcdaa4029/src/UNIVesting.sol)，其 withdraw 路徑先判斷 calendar quarters 與 owner allowance，再 transferFrom 並發出 Withdrawn。這是源碼解讀；沿用原 source ID／版本／retrieved_at，不重寫既有證據。單筆季度提領不能年度化成實際分配／下游支出／收入，也不證明 mint、totalSupply 變化、未來足額授權或合理價值。

[人工 source-only event](../data/research/uni-vesting-execution-2026-10-04.yaml) 沿用一般事件驗證，追加兩份 Tier 1 來源與 [完整不可變快照](../data/events/production/uni-vesting-execution-20261004.json) `f6580ef3404008689fffa5895f4a12ed9fb30688f5dc9de8a605593940c55f5d`，parent 是 UNI 價格快照 `98d14672…`。事件生效日 2026-10-01、知識日 2026-10-04、審查時間 2026-10-04T14:35:41Z 與模型參考日 2026-10-04 分開保存；審查者為 Codex 案頭核對，非人類簽核。

比較只有 source_change=true、數值 changes=[]；公式、假設、情境與規則變更=false。所有紀錄按 ID 逐欄相同；loader 依 journal 檔名集合輸入，兩個價格觀測的陣列排列可不同，原快照未改寫。十二份正式歷史各按自己的公式重播；最新三份都是 2026-10-04 修訂，不當成三個 thesis 期間。正式 unknown 80、三項研究 TTM null、論點證據不足、Fixture required-share 0.422 均保留。原預算仍為 STALE_FOR_CURRENT_USE，不能以這次來源更新延長它的時效。

驗證：592 項測試通過，兩模式 validate 各 84 指標／25 公式、0 錯誤／警告、unknown 1／80。新增回歸核對 raw hash／三 logs、未固定讀取的 null、來源追加／舊版本、所有金融紀錄與完整重播、時效／Fixture 隔離及中文卡片。

Browser 驗收 `http://127.0.0.1:4310/?mode=production#research`：桌面 CSS 1536×684，窄視窗實際 CSS 312×675。中文標題／正確 URL／十二事件可見，Enter 展開卡片與原始 JSON；raw hash／amount 保留，三個來源連結帶 `_blank`／`noopener noreferrer`。窄卡片 clientWidth=scrollWidth=266、頁面無水平溢出；Fixture 清除全部正式事件，切回還原十二筆。Console error／warn 與服務 stderr 空，無錯誤覆蓋；已還原尺寸並核對命令列／埠／PID 停止服務。截圖在 TEMP `uni-vesting-desktop-open.png`、`uni-vesting-mobile.png`。未驗證其他瀏覽器或真實手機裝置。

剩餘研究仍是固定區塊合約狀態／allowance 與部署等價、全期間實際分配／fee capture、供給與同步市值／FDV、SECZ 六收入與股本／TTM 可比性及個人投資性；完整 production baseline 尚未完成。

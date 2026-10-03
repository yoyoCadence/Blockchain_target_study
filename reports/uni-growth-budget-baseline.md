# UNI 預算歷史子基線

資料時點為 **2026-01-01**，於 **2026-10-03** 查證。本次只填入 `uni.growth_budget` 的核准名目預算率，不是 10 月最新估值，也不是完整 production baseline。

## 結論與證據

原始公告提出每年 20M UNI 的預算；正式提案保留該名目率並核准兩年、合計 40M UNI 的 vesting allowance。原始公告的提案狀態不能單獨支持完成事實。[原始公告](https://blog.uniswap.org/unification)、[已執行提案 93](https://vote.uniswapfoundation.org/proposals/93)

執行交易狀態為 Success，block 為 24106378。log 17 顯示 UNI Timelock 對 `0xCa046A83EDB78F74aE338bb5A291bF6FdAc9e1D2` 核准 `40000000000000000000000000` base units；log 23 為 `ProposalExecuted(93)`。這是 allowance 授權，不是向 Labs 轉帳 40M UNI。[Ethereum receipt](https://etherscan.io/tx/0x091f0083242a777d55821c1189e568d6d033d9da501b75087dc736fa143d2c1e#eventlog)

固定版本的官方程式碼設定首個 unlock 為 2026-01-01，初始每季 5M UNI；owner 可更新季度額度，撤銷 allowance 也可阻止領取。讀到的程式碼不等於對部署 bytecode 的完整稽核，本次也沒有查驗 10 月合約最新設定。[固定 commit 的 UNIVesting](https://github.com/Uniswap/protocol-fees/blob/9dbc6717658158c714870170d6f4c55bcdaa4029/src/UNIVesting.sol)

## 來源日期及衝突

四筆正式來源的 URL、publisher、title、date、retrieved_at、tier 與 covered_metrics 都保存在資料包及 journal。來源日期的定義如下：公告使用發布日 2025-11-10；治理頁使用正文的 final-spec update 2025-12-18；交易使用 block timestamp 日期 2025-12-27；程式碼使用固定 commit 日期 2025-11-20。retrieved_at 與 review 記錄的是本次查證時間，不是當年取得資料的時間。

交易的 UTC 時間為 **2025-12-27 20:33:11**，台灣時間為 **2025-12-28 04:33:11**；Agora 頁面顯示 UTC **2025-12-28 23:40**／台灣 **2025-12-29 07:40**。兩者差異超出單純時區轉換。本次以直接交易 receipt 作事件時間，保留治理頁與這項衝突，不替它找未經證實的解釋。

另外讀到官方 [DUNI Q4／2025 財務報告](https://vote.uniswapfoundation.org/forums/7/duni-q4-and-year-end-2025-financial-statements-and-tax-update)。publisher 為 Cowrie–Administrator Services／DUNI，title 為 DUNI - Q4 and Year End 2025 Financial Statements and Tax Update；tier 2，retrieved_at 為 2026-10-03；涉及預算與首季 transfer。發布日無法確認，**date 保留 Unknown**，不將報表期末當發布日，這份參考尚未加入正式 source registry。其報告的 12 月 27 日與 receipt 相符，但本文不據此匯入實際 tranche 或支出數字；該報告也不是 audited／GAAP 財報。

## 模型處理

- 新增 OBSERVED v2，以 supersedes 保留原先 null 的 ASSUMPTION v1；數值為正式核准的名目 20M UNI/year。
- 使用 `period.basis: model`、`period.end: 2026-01-01` 表示預算 schedule 參考時點，不冒充已結束年度或 TTM 支出。
- 價格、market cap、FDV、有效費率、實際分配與其他稀釋仍待查證；模型的 USD growth distribution、net accrual 與 required share 維持 null。
- 不匯入一次性 100M treasury burn 到年度 fee accrual；不把 treasury allowance 當新 mint。
- review 明確記錄 Codex 的來源查證，不聲稱已有人工簽核。正式資料包與 full snapshot 經現有 preview／digest-bound apply 保存，仍供 PR 審查。

下一項仍是完整基線的識別碼／可投資性、實際捕獲啟用、同日估值與可比期間查證。Discovery 與 thesis coverage 保持原有規則。

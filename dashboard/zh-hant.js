// Presentation labels only. Financial definitions, formulas and evidence stay
// in the canonical engine; original identifiers/codes remain inspectable.
export const metricLabels={
 'market.equity_aum':'代幣化股票管理資產', 'market.volume':'代幣化股票交易量', 'market.global_equity':'全球股票市場規模', 'market.penetration':'情境滲透率',
 'uni.price':'UNI 價格', 'uni.market_cap':'市值', 'uni.fdv':'完全稀釋估值', 'uni.crypto_fees':'加密資產協議費用', 'uni.other_rwa':'其他實體資產費用',
 'uni.unichain':'Unichain 價值累積', 'uni.mev':'MEV 價值累積', 'uni.other_accrual':'其他協議價值累積', 'uni.activity_growth':'協議活動成長率',
 'uni.supply_growth':'UNI 淨供給成長率', 'uni.turnover':'周轉率', 'uni.onchain_share':'鏈上占比', 'uni.amm_share':'AMM 占比', 'uni.market_share':'Uniswap 市占率',
 'uni.fee':'有效協議費率', 'uni.required_yield':'要求收益率', 'uni.growth_budget':'年度成長預算', 'uni.other_dilution':'其他稀釋價值',
 'uni.growth_distribution':'成長預算分配價值', 'uni.equity_revenue':'代幣化股票協議收入', 'uni.gross_accrual':'UNI 毛價值累積', 'uni.net_accrual':'UNI 淨價值累積',
 'uni.net_burn_yield':'淨銷毀收益率', 'uni.required_accrual':'所需 UNI 價值累積', 'uni.required_share':'所需 Uniswap 市占率', 'uni.required_share_net':'完整淨經濟所需市占率',
 'secz.tokenization':'代幣化收入', 'secz.servicing':'資產服務收入', 'secz.transaction':'交易收入', 'secz.saas':'發行人軟體／維護收入',
 'secz.administration':'基金行政收入', 'secz.other':'其他收入', 'secz.prior_revenue':'前期收入', 'secz.aum':'目前管理資產', 'secz.prior_aum':'前期管理資產',
 'secz.volume':'交易量', 'secz.prior_volume':'前期交易量', 'secz.ebitda':'EBITDA', 'secz.prior_ebitda':'前期 EBITDA', 'secz.ev':'企業價值',
 'secz.multiple':'終值自由現金流倍數', 'secz.fcf_margin':'目標自由現金流利潤率', 'secz.years':'推估年數', 'secz.revenue':'收入合計',
 'secz.revenue_growth':'收入成長率', 'secz.aum_growth':'管理資產成長率', 'secz.volume_growth':'交易量成長率', 'secz.revenue_efficiency':'收入效率',
 'secz.volume_monetization':'交易量變現率', 'secz.operating_leverage':'營運槓桿', 'secz.ebitda_margin':'EBITDA 利潤率', 'secz.margin_change':'EBITDA 利潤率變動',
 'secz.required_fcf':'所需自由現金流', 'secz.required_revenue':'所需收入', 'secz.required_cagr':'所需收入年複合成長率',
 'xlm.price':'XLM 價格', 'xlm.rwa':'網路實體資產價值', 'xlm.stablecoins':'穩定幣供給', 'xlm.transfer_volume':'移轉量', 'xlm.operations':'操作次數',
 'xlm.active_addresses':'活躍地址', 'xlm.issuers':'機構發行人', 'xlm.dtcc_activity':'DTCC 活動', 'xlm.fee_xlm':'每次操作平均費用',
 'xlm.reserves':'帳戶準備金需求', 'xlm.liquidity':'流動性需求', 'xlm.collateral':'抵押品需求', 'xlm.settlement':'清算營運需求', 'xlm.other_locked':'其他鎖定 XLM',
 'xlm.prior_demand':'前期原生 XLM 需求', 'xlm.activity_growth':'網路經濟活動成長率', 'xlm.rwa_growth':'網路實體資產成長率',
 'xlm.institutional_growth':'機構代幣化資產成長率', 'xlm.dtcc_live':'DTCC 上線標記', 'xlm.dtcc_material':'DTCC 重大影響標記',
 'xlm.demand_material':'經濟需求重大變化標記', 'xlm.network_fees':'網路費用價值', 'xlm.native_demand':'原生 XLM 需求', 'xlm.demand_growth':'原生資產需求成長率', 'xlm.capture_ratio':'經濟價值捕獲比率'
};
const terms={
 OBSERVED:'已觀測（OBSERVED）',DERIVED:'推導值（DERIVED）',ASSUMPTION:'假設（ASSUMPTION）',SCENARIO:'情境（SCENARIO）',
 HEALTHY:'健康（HEALTHY）',WATCH:'觀察（WATCH）',STRESS:'承壓（STRESS）',BREAK_CANDIDATE:'論點破壞候選（BREAK_CANDIDATE）',INVALIDATED:'已失效（INVALIDATED）',
 complete:'完整',insufficient:'證據不足',high:'高',medium:'中',low:'低',unknown:'未知',unverified:'尚未查證',
 annual:'年度',quarterly:'季度',TTM:'近十二個月（TTM）',point:'時點',model:'模型期間',
 USD:'美元（USD）','USD/year':'美元／年（USD/year）','UNI/year':'UNI／年','XLM/year':'XLM／年','count/year':'次／年',count:'數量',ratio:'比例',years:'年','turns/year':'次／年',bps:'基點（bps）',
 assumed:'待查證假設（assumed）',announced:'已宣布（announced）',planned:'規劃中（planned）',live:'已上線（live）',completed:'已完成（completed）',cancelled:'已取消（cancelled）',
 research_refresh:'已審查研究更新',protocol_fee_change:'協議費用設定',protocol_fee_accrual:'協議費用歸集',market_data_review:'市場資料查證',token_burn:'代幣銷毀事件',dilution:'股本／稀釋研究',acquisition:'收購研究',
 governance:'治理研究',regulation:'監管事件',issuer_tokenization:'發行人代幣化',permissioned_amm_launch:'許可制 AMM 啟用',partnership:'合作研究',quarterly_results:'季度財報',dtcc_migration:'DTCC 遷移',chain_integration:'鏈整合',competitive_entry:'競爭者進入',
 'uni-growth-budget-baseline-20260101':'UNI 歷史核准成長預算','uni-v2-fee-configuration-20251227':'UNI v2 歷史費用配置','uni-firepit-release-20251229':'UNI 單筆 Firepit 交換','uni-v2-fee-accrual-20261004':'UNI v2 單筆 LP 費用份額歸集',
 'uni-xlm-market-quotes-source-review-20261004':'UNI／XLM 單次交易所價格查證',
 'xlm-market-quote-baseline-20261004':'XLM 單次交易所價格基準',
 'xlm-reported-supply-20261005':'XLM 官方回報供給與口徑',
 'xlm-supply-20261005':'XLM 官方回報供給／精確殘差',provider_reported:'供應者回報（provider_reported）','UTC instant':'UTC 時刻',
 'uni-market-quote-baseline-20261004':'UNI 單次交易所價格與年率折算',
 'uni-vesting-execution-20261004':'UNI 季度提領與公開合約參數',
 'uni-vesting-fixed-block-20261004':'UNI 固定區塊參數與剩餘授權',
 'uni-token-state-20261004':'UNI 固定區塊餘額與供給',
 'uni-xlm-public-venue-state-20261005':'UNI／XLM 公開市場與網路表示',
 'uni-xlm-public-venue-20261005':'UNI／XLM 單一公開市場與網路表示',
 'UNI raw base units':'UNI 原始最小單位',
 'secz-acquisition-context-20261003':'SECZ 收購範圍與名稱衝突','secz-parent-capital-context-20261003':'SECZ 母公司歷史股本','secz-warrant-context-20261003':'SECZ 認股權證歷史條款','secz-resale-capital-review-20261004':'SECZ 轉售登記分類核對',
 direct:'直接',indirect:'間接',none:'無',enables:'支援',supplies:'供應',settles:'清算',tokenizes:'代幣化',provides_liquidity:'提供流動性',provides_oracle:'提供預言機',provides_registry:'提供登記服務',regulates:'監管',increases_addressable_market:'擴大可服務市場',creates_revenue:'產生收入',creates_token_demand:'產生代幣需求',dilutes:'稀釋',competes_with:'競爭',
 UNKNOWN_DATA:'資料未知（UNKNOWN_DATA）',NOT_OBSERVED:'非觀測值（NOT_OBSERVED）',INSUFFICIENT:'證據不足（INSUFFICIENT）',AVAILABLE:'可用（AVAILABLE）',RECHECK_DUE:'需重新查證（RECHECK_DUE）',RECENTLY_RETRIEVED:'近期取得（RECENTLY_RETRIEVED）',NOT_AVAILABLE_AT_CUTOFF:'截止日尚不可用（NOT_AVAILABLE_AT_CUTOFF）',STALE_FOR_CURRENT_USE:'目前使用前需重查（STALE_FOR_CURRENT_USE）',WITHIN_REVIEW_WINDOW:'在查證窗口內（WITHIN_REVIEW_WINDOW）',AVAILABLE_AT_CUTOFF:'截止日可用（AVAILABLE_AT_CUTOFF）',COMPARABILITY_UNVERIFIED:'可比性未查證（COMPARABILITY_UNVERIFIED）',UNKNOWN_INPUT:'輸入未知（UNKNOWN_INPUT）',
 input_states:'輸入狀態',evidence_states:'證據狀態',active_source_states:'使用中來源',review_states:'審查狀態',observation_states:'觀測狀態',source_states:'來源狀態',
 ERROR:'錯誤（ERROR）',WARNING:'警告（WARNING）',UNKNOWN:'未知（UNKNOWN）',
 text:'文字（text）',address:'地址（address）',flag:'旗標（flag）',
 source_change:'來源變更',assumption_change:'假設變更',scenario_change:'情境變更',formula_change:'公式變更',rule_change:'規則變更',
 revenue_definitions:'收入定義',continuing_operations:'持續營業範圍',acquisition_treatment:'收購處理',selected_presentation:'所選披露版本',audit_difference:'審計差異',
 operating_subsidiary:'營業子公司',audited:'已審計',unaudited:'未經審計',erc20:'ERC-20 代幣',common_stock:'普通股',native_asset:'原生資產',
 lt:'小於（lt）',lte:'小於等於（lte）',gt:'大於（gt）',gte:'大於等於（gte）',eq:'等於（eq）',
 'Freshness cutoff cannot be in the future':'時效截止日不能晚於目前 UTC 日',
 'core-identifiers-20261003':'UNI／SECZ／XLM 身份識別', 'secz-quarter-half-2026':'SECZ 季度／半年原始收入', 'secz-annual-s1':'SECZ 已審計年度收入／S-1', 'secz-annual-prospectus':'SECZ 已審計年度收入／公開說明書', 'secz-ttm-20260630':'SECZ 近十二個月審查／可比性未確認',
 'secz-resale-capital-20261004':'SECZ 轉售登記股本分類／未解差額',
 'No confirmed trigger; insufficient evidence. Not an affirmative healthy thesis.':'尚未確認規則觸發；證據不足，不能據此認定投資論點健康。',
 'Rule-based research monitoring; not an investment recommendation.':'依規則監測研究論點；不構成投資建議。',
 'Production research is available in the Production workspace; it is not mixed with synthetic fixtures.':'請切換至正式研究資料檢視來源證據；正式研究不混入合成示範資料。',
 'Original research evidence, separate from canonical financial inputs. Same-period filings do not add thesis periods; unverified values remain unknown.':'原始研究證據與正式金融輸入分開；同期間申報不增加論點期數，未查證數值維持未知。',
 'Review windows are analyst assumptions. Historical facts do not become false when old; retrieval does not renew observation as-of. Insufficient evidence is independent. No financial values or thesis states are changed.':'查證窗口是分析者假設；歷史事實不因日期久遠而失真，重新取得來源不更新觀測日。證據不足獨立標示，金融數值與論點狀態不變。',
 'Record counts are not thesis periods. Review availability is separate from original observation/publication/retrieval dates. Existing analyst review windows apply; freshness does not resolve comparability or investability, renew observations or update financial values.':'紀錄數不是論點期數。審查可用日與原始觀測／發布／取得日分開；時效結果不解決可比性或投資性、不更新觀測或金融數值。'
};
export const term=value=>value===null||value===undefined?'未知':terms[value]??String(value);
const capitalLabels={
 'issued-before':'S-1 披露的原已發行股數','stated-after':'S-1 披露的發售後股數',
 'registered-total':'轉售登記總數','opinion-issued-resale':'法律意見的已發行轉售類別',
 'opinion-warrant-capacity':'法律意見的權證容量','opinion-earmarked-earnout':'法律意見的 earnout 類別',
 'company-earnout-capacity':'公司 earnout 發行上限','sponsor-issued-conditional':'Sponsor 已發行條件股',
 'offered-common-total':'轉售表普通股欄合計（含權證標的）','disclosed-earned-rights-total':'轉售表已披露 earnout 數值合計',
 'combined-offered-total':'兩欄機械合計','common-less-warrant-capacity':'普通股欄扣除權證容量',
 'earnout-less-sponsor':'已披露 earnout 扣除已發行 Sponsor 條件股',
 'unreconciled-company-earnout-gap':'公司 earnout 的未解差額','stated-after-less-before':'S-1 發售後與原已發行差額'
};
export const metricLabel=id=>{
 if(typeof id==='string'&&id.startsWith('research.secz.resale.')) {
  const name=id.slice('research.secz.resale.'.length),row=/^(common|earnout)-row(\d+)$/.exec(name);
  return capitalLabels[name]??(row?`轉售表第 ${Number(row[2])} 列・${row[1]==='common'?'普通股欄（含權證標的）':'earnout 欄'}`:id);
 }
 return metricLabels[id]??id;
};
export const periodLabel=period=>!period?'身份識別':period.basis==='point'?`${term(period.basis)} · ${period.end}`:`${term(period.basis)} · ${period.start} → ${period.end}`;

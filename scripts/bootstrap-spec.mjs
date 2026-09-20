// Deterministic bootstrap authoring tool. Refuses to overwrite canonical files.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive:true }); fs.writeFileSync(file, YAML.stringify(data), { flag:'wx' }); };
const schema = (properties, required = Object.keys(properties)) => ({ type:'object', additionalProperties:false, properties, required });
const str = { type:'string', minLength:1 }, num = { type:'number' }, strs = {type:'array', items:str, uniqueItems:true};
const date = {type:'string', format:'date'};
const units = ['USD','USD/year','UNI','UNI/year','XLM','XLM/year','count/year','count','ratio','years','turns/year','bps'];
const metric = schema({
  id:str, metric_id:str, asset:str, value:{type:['number','null']}, unit:{enum:units}, classification:{enum:['OBSERVED','DERIVED','ASSUMPTION','SCENARIO']},
  as_of_date:date, period:schema({basis:{enum:['annual','quarterly','TTM','point','model']}, end:date}),
  confidence:{enum:['high','medium','low','unknown']}, version:{type:'integer',minimum:1}, fixture:{type:'boolean'},
  source_ids:strs, formula_id:str, formula_version:{type:'integer',minimum:1}, dependencies:strs, rationale:str, scenario:str,
  range:{type:'array',items:num,minItems:2,maxItems:2}, supersedes:str,
}, ['id','metric_id','asset','value','unit','classification','as_of_date','period','confidence','version','fixture']);
metric.allOf = [
  ['OBSERVED',['source_ids']], ['DERIVED',['formula_id','formula_version','dependencies']], ['ASSUMPTION',['rationale']]
].map(([kind,required])=>({if:{properties:{classification:{const:kind}}},then:{required,...(kind==='OBSERVED'?{properties:{source_ids:{minItems:1}}}:kind==='DERIVED'?{properties:{dependencies:{minItems:1}}}:{})}}));
metric.allOf.push({if:{properties:{classification:{const:'SCENARIO'}}},then:{anyOf:[{required:['scenario']},{required:['range']}]}});
write('spec/canonical-schema.yaml',{$schema:'http://json-schema.org/draft-07/schema#',...metric});
write('spec/source-registry.yaml',{$schema:'http://json-schema.org/draft-07/schema#',...schema({id:str,version:{type:'integer',minimum:1},url:{type:'string',format:'uri'},publisher:str,title:str,date,retrieved_at:{type:'string',format:'date-time'},tier:{type:'integer',minimum:1,maximum:5},covered_metrics:strs,fixture:{type:'boolean'},supersedes:str},['id','version','url','publisher','title','date','retrieved_at','tier','covered_metrics','fixture'])});
const eventTypes=['regulation','protocol_fee_change','token_burn','dilution','issuer_tokenization','permissioned_amm_launch','partnership','acquisition','quarterly_results','dtcc_migration','chain_integration','governance','competitive_entry'];
write('spec/event-schema.yaml',{$schema:'http://json-schema.org/draft-07/schema#',...schema({id:str,type:{enum:eventTypes},status:{enum:['planned','announced','live','completed','cancelled']},as_of_date:date,effective_date:date,source_ids:strs,affected_nodes:{...strs,minItems:1},reason:str,fixture:{type:'boolean'},updates:{type:'array',items:metric}},['id','type','status','as_of_date','source_ids','affected_nodes','reason','fixture','updates'])});
const assets=[['UNI','Uniswap','core'],['SECZ','Securitize','core'],['XLM','Stellar Lumens','core'],['GLXY','Galaxy Digital','secondary'],['SUPERSTATE','Superstate','dependency'],['BLSH','Bullish','secondary'],['EQUINITI','Equiniti','dependency'],['SOL','Solana','secondary'],['LINK','Chainlink','secondary'],['DTCC','DTCC','dependency'],['SEC','SEC','dependency'],['NYSE','NYSE','dependency'],['NASDAQ','Nasdaq','dependency'],['STELLAR','Stellar network','dependency']];
write('spec/asset-registry.yaml',{version:1,discovery_enabled:true,promotion_stages:['DISCOVERED','CANDIDATE','PRIMARY_SOURCE_VERIFIED','VALUE_CAPTURE_MAPPED','INVESTABILITY_CHECKED','REVERSE_UNDERWRITING_AVAILABLE','CORE','SECONDARY'],candidate_triggers:['material_dtcc_integration','issuer_native_tokenization','registered_transfer_agent','permissioned_amm','material_tokenized_aum','tokenized_equity_distribution','oracle_interoperability'],assets:assets.map(([id,name,role])=>({id,name,role,investability:'unverified',basis:'User-requested research universe; symbol is not a verified listing.',aliases:id==='EQUINITI'?['EQUIINITI']:[]}))});
const dictionary=[], inputs=[], assumptions=[], formulas=[];
const input=(id,asset,label,unit,value,kind='OBSERVED',extra={})=>{
 dictionary.push({id,asset,label,unit,kind:'input',minimum: id.endsWith('_growth')||(unit==='USD/year'&&id.includes('ebitda'))?null:0,maximum:unit==='ratio'&&!id.includes('growth')?1:null});
 const record={id:`${id}@1`,metric_id:id,asset,value,unit,classification:kind,as_of_date:'2025-12-31',period:{basis:unit.endsWith('/year')?'annual':kind==='OBSERVED'?'point':'model',end:'2025-12-31'},confidence:'low',version:1,fixture:true,...(kind==='OBSERVED'?{source_ids:['fixture-source@1']}:{rationale:'Synthetic analyst input for deterministic MVP demonstration; not verified market data.'}),...extra};
 inputs.push(record);
 if(kind!=='OBSERVED') assumptions.push({...record,value:null,fixture:false,confidence:'unknown',rationale:id==='uni.growth_budget'?'User-supplied 20M UNI/year baseline. Unverified; production value remains null pending primary-source review.':'Analyst input pending research; unknown production value.'});
};
const op=(op,...args)=>({op,args});
const formula=(id,asset,label,unit,expression,extra={})=>{
 dictionary.push({id,asset,label,unit,kind:'derived',minimum:null,maximum:null});
 formulas.push({id:`f.${id}`,version:1,output:id,asset,label,unit,expression,period_policy:'compatible',description:label,...extra});
};
input('market.equity_aum','MARKET','Tokenized Equity AUM','USD',4e12,'SCENARIO',{scenario:'Regression TAM, not observed AUM',range:[1e12,8e12]});
input('market.volume','MARKET','Tokenized Equity Volume','USD/year',8e12);
input('market.global_equity','MARKET','Global Equity Market','USD',120e12);
formula('market.penetration','MARKET','Scenario Penetration','ratio',op('div','market.equity_aum','market.global_equity'));
for(const [id,label,unit,value] of [
 ['price','UNI Price','USD',9],['market_cap','Market Cap','USD',4.84e9],['fdv','Fully Diluted Valuation','USD',9e9],
 ['crypto_fees','Crypto Protocol Fees','USD/year',80e6],['other_rwa','Other RWA Fees','USD/year',0],['unichain','Unichain Accrual','USD/year',5e6],['mev','MEV Accrual','USD/year',0],['other_accrual','Other Protocol Accrual','USD/year',0],['activity_growth','Protocol Activity Growth','ratio',0.2],['supply_growth','Net UNI Supply Growth','ratio',0.01]]) input(`uni.${id}`,'UNI',label,unit,value);
for(const [id,label,unit,value] of [
 ['turnover','Turnover','turns/year',2],['onchain_share','Onchain Share','ratio',1],['amm_share','AMM Share','ratio',1],['market_share','Uniswap Market Share','ratio',0.3],['fee','Effective Protocol Fee','ratio',0.00017],['required_yield','Required Yield','ratio',0.05],['growth_budget','Annual Growth Budget','UNI/year',20e6],['other_dilution','Other Dilution Value','USD/year',0]]) input(`uni.${id}`,'UNI',label,unit,value,'ASSUMPTION');
formula('uni.growth_distribution','UNI','Growth Distribution Value','USD/year',op('mul','uni.growth_budget','uni.price'));
formula('uni.equity_revenue','UNI','Tokenized Equity Protocol Revenue','USD/year',op('mul','market.equity_aum','uni.turnover','uni.onchain_share','uni.amm_share','uni.market_share','uni.fee'));
formula('uni.gross_accrual','UNI','Gross UNI Accrual','USD/year',op('add','uni.crypto_fees','uni.equity_revenue','uni.other_rwa','uni.unichain','uni.mev','uni.other_accrual'));
formula('uni.net_accrual','UNI','Net UNI Accrual','USD/year',op('sub','uni.gross_accrual','uni.growth_distribution','uni.other_dilution'));
formula('uni.net_burn_yield','UNI','Net Burn Yield','ratio',op('div','uni.net_accrual','uni.market_cap'));
formula('uni.required_accrual','UNI','Required UNI Accrual','USD/year',op('mul','uni.market_cap','uni.required_yield'));
formula('uni.required_share','UNI','Required Uniswap Market Share','ratio',op('div',op('add','uni.required_accrual','uni.growth_distribution'),op('mul','market.equity_aum','uni.turnover','uni.onchain_share','uni.amm_share','uni.fee')),{description:'Conservative prompt-specified standalone tokenized-equity hurdle; does not offset other accrual streams or add other dilution. Not a full net-accrual solve.'});
formula('uni.required_share_net','UNI','Required Share: Full Net Economics','ratio',op('div',op('sub',op('add','uni.required_accrual','uni.growth_distribution','uni.other_dilution'),'uni.crypto_fees','uni.other_rwa','uni.unichain','uni.mev','uni.other_accrual'),op('mul','market.equity_aum','uni.turnover','uni.onchain_share','uni.amm_share','uni.fee')));
for(const [id,label,value] of [['tokenization','Tokenization Revenue',20e6],['servicing','Asset Servicing Revenue',30e6],['transaction','Transaction Revenue',15e6],['saas','Issuer SaaS / Maintenance',10e6],['administration','Fund Administration',20e6],['other','Other Revenue',5e6]]) input(`secz.${id}`,'SECZ',label,'USD/year',value);
for(const [id,label,unit,value] of [['prior_revenue','Prior Revenue','USD/year',80e6],['aum','Current AUM','USD',5e9],['prior_aum','Prior AUM','USD',4e9],['volume','Transaction Volume','USD/year',2e9],['prior_volume','Prior Transaction Volume','USD/year',1e9],['ebitda','EBITDA','USD/year',20e6],['prior_ebitda','Prior EBITDA','USD/year',10e6],['ev','Enterprise Value','USD',1e9]]) input(`secz.${id}`,'SECZ',label,unit,value,'OBSERVED',id.startsWith('prior_')?{period:{basis:unit.endsWith('/year')?'annual':'point',end:'2024-12-31'}}:{});
for(const [id,label,unit,value] of [['multiple','Terminal FCF Multiple','years',20],['fcf_margin','Target FCF Margin','ratio',0.25],['years','Projection Horizon','years',5]]) input(`secz.${id}`,'SECZ',label,unit,value,'ASSUMPTION');
formula('secz.revenue','SECZ','Total Revenue','USD/year',op('add',...['tokenization','servicing','transaction','saas','administration','other'].map(k=>`secz.${k}`)));
for(const [id,label,current,prior] of [['revenue_growth','Revenue Growth','revenue','prior_revenue'],['aum_growth','AUM Growth','aum','prior_aum'],['volume_growth','Volume Growth','volume','prior_volume']]) formula(`secz.${id}`,'SECZ',label,'ratio',op('sub',op('div',`secz.${current}`,`secz.${prior}`),1),{period_policy:'prior_comparison'});
formula('secz.revenue_efficiency','SECZ','Revenue Efficiency','ratio',op('div','secz.revenue_growth','secz.aum_growth'));
formula('secz.volume_monetization','SECZ','Volume Monetization','ratio',op('div','secz.revenue','secz.volume'));
formula('secz.operating_leverage','SECZ','Operating Leverage','ratio',op('div',op('sub','secz.ebitda','secz.prior_ebitda'),op('sub','secz.revenue','secz.prior_revenue')),{period_policy:'prior_comparison'});
formula('secz.ebitda_margin','SECZ','EBITDA Margin','ratio',op('div','secz.ebitda','secz.revenue'));
formula('secz.margin_change','SECZ','EBITDA Margin Change','ratio',op('sub','secz.ebitda_margin',op('div','secz.prior_ebitda','secz.prior_revenue')),{period_policy:'prior_comparison'});
formula('secz.required_fcf','SECZ','Required FCF','USD/year',op('div','secz.ev','secz.multiple'));
formula('secz.required_revenue','SECZ','Required Revenue','USD/year',op('div','secz.required_fcf','secz.fcf_margin'));
formula('secz.required_cagr','SECZ','Required Revenue CAGR','ratio',op('sub',op('pow',op('div','secz.required_revenue','secz.revenue'),op('div',1,'secz.years')),1));
for(const [id,label,unit,value] of [
 ['price','XLM Price','USD',0.1],['rwa','Network RWA Value','USD',1e9],['stablecoins','Stablecoin Supply','USD',500e6],['transfer_volume','Transfer Volume','USD/year',10e9],['operations','Operations','count/year',1e9],['active_addresses','Active Addresses','count',1e6],['issuers','Institutional Issuers','count',20],['dtcc_activity','DTCC Activity','count/year',null],['fee_xlm','Average Fee per Operation','XLM',0.00001],
 ['reserves','Account Reserve Demand','XLM',2e6],['liquidity','Liquidity Demand','XLM',10e6],['collateral','Collateral Demand','XLM',5e6],['settlement','Settlement Operational Demand','XLM',1e6],['other_locked','Other Locked XLM','XLM',2e6],['prior_demand','Prior Native XLM Demand','XLM',20e6],['activity_growth','Network Economic Activity Growth','ratio',0.5],['rwa_growth','Network RWA Growth','ratio',0.3],['institutional_growth','Institutional Tokenized Asset Growth','ratio',0.6]]) input(`xlm.${id}`,'XLM',label,unit,value,'OBSERVED',id==='prior_demand'?{period:{basis:'point',end:'2024-12-31'}}:{});
for(const [id,label,value] of [['dtcc_live','DTCC Live Flag',0],['dtcc_material','DTCC Material Flag',0],['demand_material','Economic Demand Material Change Flag',0]]) input(`xlm.${id}`,'XLM',label,'ratio',value,'ASSUMPTION');
formula('xlm.network_fees','XLM','Network Fee Value','USD/year',op('mul','xlm.operations','xlm.fee_xlm','xlm.price'));
formula('xlm.native_demand','XLM','Native XLM Demand','XLM',op('add','xlm.reserves','xlm.liquidity','xlm.collateral','xlm.settlement','xlm.other_locked'),{description:'Disjoint inventory buckets; avoid double counting. Network fees are not capitalized into holder value.'});
formula('xlm.demand_growth','XLM','Native Asset Demand Growth','ratio',op('sub',op('div','xlm.native_demand','xlm.prior_demand'),1),{period_policy:'prior_comparison'});
formula('xlm.capture_ratio','XLM','Economic Capture Ratio','ratio',op('div','xlm.demand_growth','xlm.activity_growth'));
write('spec/data-dictionary.yaml',{version:1,metrics:dictionary});
write('spec/formula-registry.yaml',{version:1,formulas});
write('spec/assumptions.yaml',{version:1,metrics:assumptions.filter(x=>x.classification==='ASSUMPTION')});
write('spec/scenarios.yaml',{version:1,metrics:assumptions.filter(x=>x.classification==='SCENARIO')});
write('data/fixtures/inputs.yaml',{version:1,notice:'SYNTHETIC FIXTURE: no real market observations; financial values are deterministic test inputs.',metrics:inputs});
write('data/observed/observations.yaml',{version:1,metrics:[]});
write('sources/sources.yaml',{version:1,sources:[]});
write('data/fixtures/sources.yaml',{version:1,sources:[{id:'fixture-source@1',version:1,url:'https://example.invalid/synthetic-fixture',publisher:'Local test fixture generator',title:'Synthetic financial inputs — NOT evidence or market data',date:'2025-12-31',retrieved_at:'2026-01-01T00:00:00Z',tier:5,covered_metrics:inputs.filter(x=>x.classification==='OBSERVED').map(x=>x.metric_id),fixture:true}]});
const condition=(metric,operator,value)=>({metric,operator,value});
const rule=(id,asset,state,periods,conditions,why)=>({id,version:1,asset,state,periods,classification:'ASSUMPTION',rationale:'ANALYST-DEFINED ASSUMPTION: provisional monitoring thresholds, not natural laws.',why,conditions});
write('spec/thesis-rules.yaml',{version:1,states:['HEALTHY','WATCH','STRESS','BREAK_CANDIDATE','INVALIDATED'],rules:[
 rule('uni.watch','UNI','WATCH',2,[condition('uni.net_burn_yield','lt',0.02)],'Net burn yield below 2% for two consecutive periods.'),
 rule('uni.stress','UNI','STRESS',1,[condition('uni.fee','lt',0.00005),condition('uni.required_share','gt',0.5)],'Fee below 0.5 bp and required share above 50%.'),
 rule('uni.break','UNI','BREAK_CANDIDATE',4,[condition('uni.activity_growth','gt',0),condition('uni.supply_growth','gt',0)],'Protocol activity and net supply both grow for four periods.'),
 rule('secz.watch','SECZ','WATCH',1,[condition('secz.aum_growth','gt',0),condition('secz.revenue_growth','lte',0)],'AUM growth fails to convert into revenue growth.'),
 rule('secz.stress','SECZ','STRESS',2,[condition('secz.aum_growth','gt',0.15),condition('secz.revenue_growth','lt',0)],'AUM grows above 15% while revenue contracts for two periods.'),
 rule('secz.break','SECZ','BREAK_CANDIDATE',4,[condition('secz.volume_growth','gt',0.5),condition('secz.revenue_growth','lte',0),condition('secz.margin_change','lte',0)],'Volume growth exceeds 50% without revenue or margin improvement for four periods.'),
 rule('xlm.watch','XLM','WATCH',1,[condition('xlm.rwa_growth','gt',0.25),condition('xlm.demand_growth','lte',0)],'Network RWA grows above 25% without native demand growth.'),
 rule('xlm.stress','XLM','STRESS',4,[condition('xlm.institutional_growth','gt',0.5),condition('xlm.capture_ratio','lt',0.1)],'Institutional growth fails to translate into native capture for four periods.'),
 rule('xlm.break','XLM','BREAK_CANDIDATE',4,[condition('xlm.dtcc_live','eq',1),condition('xlm.dtcc_material','eq',1),condition('xlm.demand_material','eq',0)],'Live and material DTCC activity without material XLM demand change for four periods.')
]});
const edges=[['DTCC','STELLAR','settles',false],['STELLAR','XLM','creates_token_demand',true],['SEC','SECZ','regulates',false],['SECZ','UNI','increases_addressable_market',false],['SUPERSTATE','SOL','tokenizes',false],['GLXY','SECZ','provides_liquidity',false],['BLSH','UNI','competes_with',false],['EQUINITI','SECZ','provides_registry',false],['LINK','SOL','provides_oracle',false],['NYSE','SECZ','enables',false],['NASDAQ','SECZ','enables',false]];
write('spec/dependency-graph.yaml',{version:1,edge_types:['enables','supplies','settles','tokenizes','provides_liquidity','provides_oracle','provides_registry','regulates','increases_addressable_market','creates_revenue','creates_token_demand','dilutes','competes_with'],edges:edges.map(([from,to,type,economic],i)=>({id:`edge.${i+1}`,from,to,type,economic,transmission:'indirect',status:'assumed',source_ids:[],rationale:'Research hypothesis only. No verified relationship or automatic economic transmission is asserted.'}))});
write('spec/sensitivity.yaml',{version:1,parameters:['market.equity_aum','uni.turnover','uni.onchain_share','uni.amm_share','uni.fee','uni.market_share','uni.required_yield','uni.growth_budget','secz.fcf_margin','secz.multiple'],matrix:{row:'market.equity_aum',rows:[2e12,4e12,6e12],column:'uni.fee',columns:[0.00005,0.000125,0.0002],output:'uni.required_share'}});
write('data/events/events.yaml',{version:1,events:[]});

import test from 'node:test';
import assert from 'node:assert/strict';
import {project,frame} from '../helpers.js';
import {evaluateTheses} from '../../engine/thesis/index.js';
import {promoteCandidate} from '../../engine/universe.js';
test('UNI simultaneous triggers keep all rules and maximum severity',()=>{
 const p=project(),values={'uni.net_burn_yield':0.01,'uni.fee':0.00001,'uni.required_share':0.9,'uni.activity_growth':0.2,'uni.supply_growth':0.1};
 const history=['2022-12-31','2023-12-31','2024-12-31'].map(d=>frame(d,values)),r=evaluateTheses(p.thesis.rules,frame('2025-12-31',values),history).UNI;
 assert.equal(r.state,'BREAK_CANDIDATE');assert.equal(r.triggered_rules.length,3);assert.equal(r.coverage,'complete');
});
test('SECZ four periods of volume growth without monetization triggers break',()=>{
 const values={'secz.aum_growth':0.2,'secz.revenue_growth':-0.1,'secz.volume_growth':0.6,'secz.margin_change':0};
 const r=evaluateTheses(project().thesis.rules,frame('2025-12-31',values),['2022-12-31','2023-12-31','2024-12-31'].map(d=>frame(d,values))).SECZ;
 assert.equal(r.state,'BREAK_CANDIDATE');assert.equal(r.triggered_rules.length,3);
});
test('XLM network growth cannot alone establish capture or a live DTCC break',()=>{
 const values={'xlm.rwa_growth':0.3,'xlm.demand_growth':0,'xlm.institutional_growth':0.6,'xlm.capture_ratio':0,'xlm.dtcc_live':0,'xlm.dtcc_material':1,'xlm.demand_material':0};
 const history=['2022-12-31','2023-12-31','2024-12-31'].map(d=>frame(d,values));let r=evaluateTheses(project().thesis.rules,frame('2025-12-31',values),history).XLM;assert.equal(r.state,'STRESS');assert.ok(!r.triggered_rules.some(x=>x.id==='xlm.break'));
 values['xlm.dtcc_live']=1;r=evaluateTheses(project().thesis.rules,frame('2025-12-31',values),history.map(h=>({...h,metrics:{...h.metrics,'xlm.dtcc_live':{value:1}}}))).XLM;assert.equal(r.state,'BREAK_CANDIDATE');
});
test('duplicate periods, gaps, basis changes and unknowns never manufacture persistence',()=>{
 const values={'uni.net_burn_yield':0.01},rules=project().thesis.rules.filter(r=>r.id==='uni.watch'),current=frame('2025-12-31',values);
 for(const history of [[current,current,current],[frame('2023-12-31',values)],[frame('2024-12-31',values,'TTM')],[frame('2024-12-31',{'uni.net_burn_yield':null})]]){const r=evaluateTheses(rules,current,history).UNI;assert.equal(r.triggered_rules.length,0);assert.equal(r.coverage,'insufficient');}
 const r=evaluateTheses(rules,current,[frame('2024-12-31',values)]).UNI;assert.equal(r.state,'WATCH');
});
test('open universe requires sequential evidence gates',()=>{
 assert.throws(()=>promoteCandidate({stage:'DISCOVERED'},'CORE'));assert.throws(()=>promoteCandidate({stage:'CANDIDATE'},'PRIMARY_SOURCE_VERIFIED'));
 assert.equal(promoteCandidate({stage:'CANDIDATE',primary_source_ids:['verified-source']},'PRIMARY_SOURCE_VERIFIED').stage,'PRIMARY_SOURCE_VERIFIED');
 assert.throws(()=>promoteCandidate({stage:'REVERSE_UNDERWRITING_AVAILABLE',investability_review:{investable:false}},'CORE'));
});

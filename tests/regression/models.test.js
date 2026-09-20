import test from 'node:test';
import assert from 'node:assert/strict';
import {project,change,checked} from '../helpers.js';
import {calculate,lineage} from '../../engine/index.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('UNI prompt regression: 242M required + 180M distribution / 1B = 42.2%',()=>{
 const p=project();change(p,'uni.fee',0.000125);const r=calculate(checked(p));
 near(r.metrics['uni.required_accrual'].value,242e6);near(r.metrics['uni.growth_distribution'].value,180e6);near(r.metrics['uni.required_share'].value,0.422);
 near(r.metrics['uni.gross_accrual'].value,385e6);near(r.metrics['uni.net_accrual'].value,205e6);near(r.metrics['uni.net_burn_yield'].value,205e6/4.84e9);
 near(r.metrics['uni.required_share_net'].value,0.337);
});
test('SECZ disaggregated revenue and reverse FCF regression',()=>{
 const p=project(),r=calculate(p),m=r.metrics;
 near(m['secz.revenue'].value,100e6);near(m['secz.revenue_growth'].value,0.25);near(m['secz.aum_growth'].value,0.25);near(m['secz.volume_growth'].value,1);
 near(m['secz.revenue_efficiency'].value,1);near(m['secz.volume_monetization'].value,0.05);near(m['secz.operating_leverage'].value,0.5);
 near(m['secz.required_fcf'].value,50e6);near(m['secz.required_revenue'].value,200e6);near(m['secz.required_cagr'].value,2**0.2-1);
 assert.equal(lineage(p,r,'secz.revenue').inputs.length,6);
});
test('XLM fees and inventory demand are separate; no fee-only valuation',()=>{
 const r=calculate(project()),m=r.metrics;near(m['xlm.network_fees'].value,1000);near(m['xlm.native_demand'].value,20e6);near(m['xlm.demand_growth'].value,0);near(m['xlm.capture_ratio'].value,0);
 assert.equal(m['xlm.dtcc_activity'].value,null);assert.ok(!Object.keys(m).some(id=>id.includes('fair_value')));
});

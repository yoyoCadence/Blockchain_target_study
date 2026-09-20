import {assert} from './validation/index.js';
export function promoteCandidate(candidate,target) {
 const stages=['DISCOVERED','CANDIDATE','PRIMARY_SOURCE_VERIFIED','VALUE_CAPTURE_MAPPED','INVESTABILITY_CHECKED','REVERSE_UNDERWRITING_AVAILABLE'];
 const from=stages.indexOf(candidate.stage),to=stages.indexOf(target);
 assert(from>=0&&(to===from+1||(from===5&&['CORE','SECONDARY'].includes(target))),'Universe promotion must follow verification gates');
 const requirements={PRIMARY_SOURCE_VERIFIED:'primary_source_ids',VALUE_CAPTURE_MAPPED:'value_capture',INVESTABILITY_CHECKED:'investability_review',REVERSE_UNDERWRITING_AVAILABLE:'reverse_underwriting'};
 const key=requirements[target];if(key) assert(candidate[key]&&(!Array.isArray(candidate[key])||candidate[key].length>0),`Promotion requires ${key}`);
 if(target==='CORE') assert(candidate.investability_review?.investable===true,'Core promotion requires verified investability');
 return {...candidate,stage:target};
}

import {loadProject,selectInputs,validateProject} from '../engine/index.js';
export function project() {return loadProject('fixture');}
export function change(p,id,value,extra={}) {const current=selectInputs(p.inputs)[id];Object.assign(p.inputs.find(r=>r.id===current.id),{value,...extra});return p;}
export function checked(p){validateProject(p);return p;}
export function frame(end,values,basis='annual') {return {period:{basis,end},metrics:Object.fromEntries(Object.entries(values).map(([id,value])=>[id,{id:`${id}@${end}`,value,period:{basis,end}}]))};}

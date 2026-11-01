const fs=require('fs'),path=require('path');
require('../src/engine.js'); const E=globalThis.Engine;
for(const f of ['topics1.js','topics2.js','topics3.js','theory.js']) require('../src/'+f);

const KATEX=require('/opt/npm-tools/node_modules/katex');
const OK_CMDS=new Set(['frac','sqrt','int','left','right','cdot','operatorname','ln','cos','sin','tan','pi','to','Rightarrow','quad','qquad','arccos','exp','dots','ldots','times','leq','geq','neq','approx','infty','sum','lim','text','mathrm','bigg','Big','big','displaystyle','mathbb','Delta','theta','alpha','le','ge','Longrightarrow','Leftrightarrow','pm','div','in','cup','cap','subset','partial','forall','exists','cos','log','min','max']);
function checkTex(s){ // devuelve null si es válido, o un mensaje
  let depth=0,l=0,r=0; const re=/\\([a-zA-Z]+|.)|([{}^_])/g; let m,prev='';
  const brace=[];
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(ch==='\\'){ const mm=/^\\([a-zA-Z]+)/.exec(s.slice(i)); if(mm){const c=mm[1]; if(!OK_CMDS.has(c))return 'comando no permitido \\'+c; if(c==='left'){l++; if(!/^[(\[|.]|^\\\{/.test(s.slice(i+5)))return 'left sin delimitador';} if(c==='right'){r++; if(r>l)return 'right sin left'; if(!/^[)\]|.]|^\\\}/.test(s.slice(i+6)))return 'right sin delimitador';}
        if(c==='frac'){ // dos grupos
          let j=i+5, g=0; while(g<2){ if(s[j]!=='{')return 'frac sin dos grupos'; let d=0; do{ if(s[j]==='{')d++; else if(s[j]==='}')d--; j++; }while(d>0&&j<=s.length); if(d>0)return 'frac sin cerrar'; g++; } }
        if(c==='sqrt'&&s[i+5]!=='{')return 'sqrt sin llaves'; i+=c.length; continue;} i++; continue; }
    if(ch==='{')depth++; if(ch==='}'){depth--; if(depth<0)return 'llave de más';}
    if((ch==='^'||ch==='_')&&(i===s.length-1||s[i+1]==='}'||s[i+1]==='^'||s[i+1]==='_'))return 'sub/superíndice vacío';
  }
  if(depth!==0)return 'llaves sin cerrar'; if(l!==r)return 'left/right desparejados'; return null;
}
const N=+process.argv[2]||300; let fails=0; const seen={};
const bad=(t,m,ex)=>{fails++; const k=t+m; seen[k]=(seen[k]||0)+1; if(seen[k]<=2) console.log('FALLO',t,m,ex?JSON.stringify({f:ex.f,sol:ex.sol,value:ex.value,base:ex.base,qtex:ex.qtex}):''); };
function tex(t,s,ctx){ const e=checkTex(s); if(e)bad(t,'LaTeX '+ctx+': '+e,{qtex:s}); try{KATEX.renderToString(s,{throwOnError:true,strict:'ignore'});}catch(er){bad(t,'KaTeX '+ctx+': '+String(er.message).slice(0,90),{qtex:s});} }
function mixed(t,s,ctx){ (s.match(/\$([^$]+)\$/g)||[]).forEach(m=>tex(t,m.slice(1,-1),ctx)); const stripped=s.replace(/\$[^$]+\$/g,'').replace(/«[^»]*»/g,''); if(/\\[a-z]|[_^]/.test(stripped)) bad(t,'LaTeX fuera de $: '+ctx+' '+stripped.slice(0,50)); }
const num=(x)=>typeof x==='number'&&isFinite(x);
for(const T of Topics){
  for(let i=0;i<N;i++){
    const d=(i%8)/7; let ex; try{ex=T.gen(d);}catch(e){bad(T.id,'gen lanza: '+e.message);continue;}
    try{
      tex(T.id,ex.qtex,'qtex'); mixed(T.id,ex.prompt,'prompt'); mixed(T.id,ex.hint||'','hint'); ex.steps.forEach(s=>mixed(T.id,s,'step'));
      const solTex=E.LATEX(ex.sol||ex.f); tex(T.id,solTex,'sol');
      if(ex.kind==='anti'){
        const f=E.fn(ex.f),F=E.fn(ex.sol); let ok=true;
        for(const x of E.samplePts(ex.dom)){const dv=E.deriv(F,x),fx=f(x); if(!num(dv)||!num(fx)||Math.abs(dv-fx)>3e-5*Math.max(1,Math.abs(fx))){ok=false;}}
        if(!ok) bad(T.id,"F'≠f",ex);
        if(!E.check(ex,ex.sol).ok) bad(T.id,'check rechaza la solución',ex);
        if(!E.check(ex,ex.sol+'+C').ok) bad(T.id,'check rechaza +C',ex);
        if(E.check(ex,'('+ex.sol+')+x').ok) bad(T.id,'check acepta algo mal',ex);
      } else if(ex.kind==='func'){
        const b=E.fn(ex.base),f=E.fn(ex.f); let ok=true;
        for(const x of E.samplePts(ex.dom)){const dv=E.deriv(b,x),fx=f(x); if(!num(dv)||Math.abs(dv-fx)>3e-5*Math.max(1,Math.abs(fx))) ok=false;}
        if(!ok) bad(T.id,"base'≠f",ex);
        if(!E.check(ex,ex.f).ok) bad(T.id,'check rechaza la solución',ex);
        if(E.check(ex,'('+ex.f+')+1').ok) bad(T.id,'check acepta algo mal',ex);
      } else if(ex.kind==='num'){
        const v=E.fn(ex.value)(0); if(!num(v)) bad(T.id,'valor no finito',ex);
        if(ex.quad){const qa=E.fn(ex.quad.a)(0),qb=E.fn(ex.quad.b)(0);const q=E.quad(E.fn(ex.quad.f),qa,qb,ex.quad.n||4000); if(!num(q)||Math.abs(q-v)>1e-5*Math.max(1,Math.abs(v))) bad(T.id,'quad '+q+' ≠ valor '+v,ex);}
        else bad(T.id,'num sin quad',ex);
        if(ex.F&&ex.quad){const qa=E.fn(ex.quad.a)(0),qb=E.fn(ex.quad.b)(0),Fn=E.fn(ex.F),fn=E.fn(ex.quad.f);
          const bv=Fn(qb)-Fn(qa); if(!num(bv)||Math.abs(bv-v)>1e-7*Math.max(1,Math.abs(v))) bad(T.id,'F(b)-F(a)='+bv+' ≠ valor '+v,ex);
          for(const x of E.samplePts([qa+0.05*(qb-qa),qb-0.05*(qb-qa)])){const dv=E.deriv(Fn,x),fx=fn(x); if(!num(dv)||Math.abs(dv-fx)>3e-5*Math.max(1,Math.abs(fx))){bad(T.id,"F'≠f en num",ex);break;}} }
        if(!E.check(ex,ex.value).ok) bad(T.id,'check rechaza valor',ex);
        if(!E.check(ex,v.toFixed(3)).ok) bad(T.id,'check rechaza decimal',ex);
        if(E.check(ex,'('+ex.value+')+1').ok) bad(T.id,'check acepta algo mal',ex);
      }
    }catch(e){bad(T.id,'excepción: '+e.message,ex);}
  }
  console.log('tema',T.id.padEnd(8),'ok');
}
// teoría
if(globalThis.Theory){ for(const [id,pages] of Object.entries(Theory)) pages.forEach((p,i)=>{ mixed(id,(p.h||'')+' '+(p.body||''),'teoría'+i); (p.fx||[]).forEach(s=>tex(id,s,'fx'+i)); if(p.ex){tex(id,p.ex.q,'ex.q');p.ex.steps.forEach(s=>mixed(id,s,'ex.step'));} }); console.log('teoría revisada'); }
console.log(fails?('TOTAL FALLOS: '+fails):'TODO CORRECTO ('+N+' ejercicios por tema)');
process.exit(fails?1:0);

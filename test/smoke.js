require('../src/engine.js'); const E=globalThis.Engine;
const cases=['3x^2+2x','(1/3)*x^3-2*x','e^(2x)/2','sen^2(x)','sin 2x','xe^x','x*ln(x)-x','2/(x^2+1)','ln|x|','-(3/4)*x^3','sqrt(x)','x^(3/2)','1/(2*x^2)','atan(x/2)/2','(x+1)(x-1)','-3*x/(x^2+1)','cos(x)^2','2^x/ln(2)','pi*(e^2-1)/2','ln(abs(x-2))','5/(x-1)*(x+2)'];
for(const c of cases){try{console.log(c.padEnd(22),'=>',E.LATEX(c),' | f(1.7)=',E.fn(c)(1.7).toFixed(5));}catch(e){console.log(c,'ERR',e.message);}}
console.log(E.terms([[3,'x^2'],[-1,'x'],[[1,2],''],[0,'x']]), E.terms([[[-3,4],'x^3'],[1,'x']]), E.ov(-3,'x^2'), E.ov([2,3],'x'));
console.log(E.intTex('3*x^2+2*x'), E.intTex('x*e^x','0','1'), E.intTex('cos(x)','0','pi/2'));
const ex={kind:'anti',f:'2*x*cos(x^2)',dom:[0.3,2]};
for(const a of ['sin(x^2)','sin(x^2)+C','sen(x^2)+5','sin(x^2)+x','2*sin(x^2)','-cos(x)']) console.log(a, JSON.stringify(E.check(ex,a)));
const n={kind:'num',value:'2/3'};
for(const a of ['2/3','0.667','0.67','0,7','0.6','-2/3','x']) console.log(a, JSON.stringify(E.check(n,a)));
console.log(JSON.stringify(E.check(ex,'sin(')), JSON.stringify(E.preview('3x^2+')),JSON.stringify(E.preview('e^2x')));

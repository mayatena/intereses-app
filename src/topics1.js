/* Temas 1-4: derivadas, potencias, inmediatas, composición lineal */
(function (root) {
'use strict';
const E = root.Engine;
const { ri, pick, nz, fr, xp, kx, ek, terms, ov, lin, byLevel, L, LATEX: T } = E;

const Kit = {
  anti: (f, F, o) => Object.assign({ kind: 'anti', f, sol: F, dom: [0.4, 3], prompt: 'Calcula la integral indefinida.',
    qtex: E.intTex(f), label: 'F(x) =', hint: '', steps: [] }, o),
  func: (base, f, o) => Object.assign({ kind: 'func', base, f, sol: f, dom: [0.3, 2.5], prompt: 'Calcula la derivada de la función.',
    qtex: 'f(x)=' + T(base), label: "f′(x) =", hint: '', steps: [] }, o),
  num: (value, qtex, o) => Object.assign({ kind: 'num', value, sol: value, prompt: 'Calcula el valor exacto.',
    qtex, label: 'Resultado =', hint: '', steps: [] }, o),
};
root.Kit = Kit;
root.Topics = root.Topics || [];

/* ---------- 1. Derivadas ---------- */
const D = [
  () => {
    const n = ri(3, 5), m = ri(1, n - 1), a = nz(-5, 5), b = nz(-6, 6), c = ri(-5, 5);
    const base = terms([[a, xp(n)], [b, xp(m)], [c, '']]);
    const f = terms([[a * n, xp(n - 1)], [b * m, xp(m - 1)]]);
    return Kit.func(base, f, { hint: 'Cada término $ax^n$ pasa a $n\\,a\\,x^{n-1}$ y la constante desaparece.',
      steps: ['Derivamos término a término: se baja el exponente multiplicando y se resta 1.', 'Resultado: ' + L(f)] });
  },
  () => {
    const k = pick([1, 2, 3, -1, -2]), a = nz(-4, 4);
    const base = terms([[a, ek(k)]]), f = terms([[a * k, ek(k)]]);
    return Kit.func(base, f, { hint: 'La derivada de $e^{kx}$ es $k\\,e^{kx}$.',
      steps: ['La exponencial se queda igual y se multiplica por la derivada del exponente, que es $' + k + '$.', 'Resultado: ' + L(f)] });
  },
  () => {
    const a = nz(-4, 4), b = nz(-3, 3), n = ri(2, 4);
    const base = terms([[a, 'ln(x)'], [b, xp(n)]]);
    const f = terms([ov(a, 'x'), [b * n, xp(n - 1)]]);
    return Kit.func(base, f, { hint: 'La derivada de $\\ln x$ es $\\frac{1}{x}$.',
      steps: ['$(\\ln x)\'=\\frac{1}{x}$ y $(x^n)\'=nx^{n-1}$.', 'Resultado: ' + L(f)] });
  },
  () => {
    const k = ri(1, 4), a = nz(-4, 4), b = nz(-4, 4);
    const base = terms([[a, `sin(${kx(k)})`], [b, `cos(${kx(k)})`]]);
    const f = terms([[a * k, `cos(${kx(k)})`], [-b * k, `sin(${kx(k)})`]]);
    return Kit.func(base, f, { hint: '$(\\operatorname{sen}u)\'=u\'\\cos u$ y $(\\cos u)\'=-u\'\\operatorname{sen}u$.',
      steps: ['Regla de la cadena: derivada de fuera por derivada de dentro (que vale $' + k + '$).', 'Resultado: ' + L(f)] });
  },
  () => {
    const n = ri(3, 5), a = nz(-3, 3), b = nz(-4, 4), l = lin(a, b);
    const base = `(${l})^${n}`, f = `${n * a}*(${l})^${n - 1}`;
    return Kit.func(base, f, { hint: 'Regla de la cadena: $n\\,u^{n-1}\\cdot u\'$ con $u=' + T(l) + '$.',
      steps: ['Aquí $u=' + T(l) + '$ y $u\'=' + a + '$.', '$n\\,u^{n-1}u\'$ da: ' + L(f)] });
  },
  () => {
    const t = ri(0, 3); let base, f, why;
    if (t === 0) { const m = ri(2, 3); base = `e^(x^${m})`; f = `${m}*${xp(m - 1)}*e^(x^${m})`; why = 'La exponencial se repite y se multiplica por la derivada del exponente.'; }
    else if (t === 1) { const c = ri(1, 5); base = `ln(x^2+${c})`; f = `2*x/(x^2+${c})`; why = '$(\\ln u)\'=\\frac{u\'}{u}$.'; }
    else if (t === 2) { base = 'sin(x^2)'; f = '2*x*cos(x^2)'; why = 'Derivada de fuera, $\\cos(x^2)$, por derivada de dentro, $2x$.'; }
    else { const c = ri(1, 5); base = `sqrt(x^2+${c})`; f = `x/sqrt(x^2+${c})`; why = '$(\\sqrt{u})\'=\\frac{u\'}{2\\sqrt{u}}$.'; }
    return Kit.func(base, f, { hint: 'Regla de la cadena.', steps: [why, 'Resultado: ' + L(f)] });
  },
  () => {
    const t = ri(0, 2); let base, f;
    if (t === 0) { const k = pick([1, 2, -1]); base = `x*${ek(k)}`; f = `(${terms([[k, 'x'], [1, '']])})*${ek(k)}`; }
    else if (t === 1) { base = 'x*sin(x)'; f = 'sin(x)+x*cos(x)'; }
    else { const n = ri(2, 3); base = `${xp(n)}*ln(x)`; f = `${n}*${xp(n - 1)}*ln(x)+${xp(n - 1)}`; }
    return Kit.func(base, f, { hint: 'Producto: $(uv)\'=u\'v+uv\'$.',
      steps: ['Aplicamos $(uv)\'=u\'v+uv\'$.', 'Resultado: ' + L(f)] });
  },
  () => {
    const t = ri(0, 2); let base, f;
    if (t === 0) { const k = ri(1, 4); base = `x/(x+${k})`; f = `${k}/(x+${k})^2`; }
    else if (t === 1) { const k = ri(1, 4); base = `x^2/(x+${k})`; f = `(x^2+${2 * k}*x)/(x+${k})^2`; }
    else { base = 'e^x/x'; f = 'e^x*(x-1)/x^2'; }
    return Kit.func(base, f, { hint: 'Cociente: $\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}$.',
      steps: ['Aplicamos la regla del cociente.', 'Resultado: ' + L(f)] });
  },
];

/* ---------- 2. Primitivas de potencias ---------- */
const PW = {
  pow: (a, n) => ({ f: [a, xp(n)], F: [fr(a, n + 1), xp(n + 1)] }),
  neg: (a, n) => ({ f: ov(a, 'x^' + n), F: ov(fr(-a, n - 1), xp(n - 1)) }),
  sqrt: (a) => ({ f: [a, 'sqrt(x)'], F: [fr(2 * a, 3), 'x^(3/2)'] }),
  isq: (a) => ({ f: ov(a, 'sqrt(x)'), F: [2 * a, 'sqrt(x)'] }),
  cbrt: (a) => ({ f: [a, 'x^(1/3)'], F: [fr(3 * a, 4), 'x^(4/3)'] }),
  cte: (c) => ({ f: [c, ''], F: [c, 'x'] }),
};
function potEx(pieces, extra) {
  const f = terms(pieces.map((p) => p.f)), F = terms(pieces.map((p) => p.F));
  return Kit.anti(f, F, Object.assign({
    hint: 'Reescribe raíces y fracciones como potencias de $x$ y aplica $\\int x^n dx=\\frac{x^{n+1}}{n+1}$.',
    steps: ['Pasamos todo a potencias: $\\sqrt{x}=x^{1/2}$, $\\frac{1}{x^n}=x^{-n}$.',
      'Sumamos 1 al exponente y dividimos entre el exponente nuevo, en cada término.', 'Resultado: ' + L(F) + ' $+C$'] }, extra));
}
const POT = [
  () => potEx([PW.pow(nz(-6, 6), ri(2, 5))]),
  () => potEx([PW.pow(nz(-6, 6), ri(3, 5)), PW.pow(nz(-6, 6), ri(1, 2)), PW.cte(nz(-5, 5))]),
  () => potEx([PW.neg(nz(-6, 6), ri(2, 4))]),
  () => potEx([pick([PW.sqrt, PW.isq, PW.cbrt])(nz(-6, 6))]),
  () => potEx([PW.pow(nz(-4, 4), ri(2, 4)), PW.neg(nz(-5, 5), ri(2, 3)), pick([PW.sqrt, PW.isq])(nz(-4, 4))]),
  () => potEx([PW.pow(nz(-4, 4), ri(2, 3)), PW.neg(nz(-5, 5), ri(2, 4)), PW.isq(nz(-4, 4)), PW.cte(nz(-4, 4))]),
];

/* ---------- 3. Inmediatas ---------- */
const EL = [
  (a) => ({ f: [a, 'e^x'], F: [a, 'e^x'] }),
  (a) => ({ f: [a, 'sin(x)'], F: [-a, 'cos(x)'] }),
  (a) => ({ f: [a, 'cos(x)'], F: [a, 'sin(x)'] }),
  (a) => ({ f: ov(a, 'x'), F: [a, 'ln(abs(x))'] }),
  (a) => ({ f: ov(a, 'cos(x)^2'), F: [a, 'tan(x)'] }),
  (a) => ({ f: ov(a, '(1+x^2)'), F: [a, 'atan(x)'] }),
  (a) => ({ f: [a, '2^x'], F: [a, '2^x/ln(2)'] }),
  (a) => ({ f: ov(a, 'sqrt(1-x^2)'), F: [a, 'asin(x)'] }),
];
function elemEx(idx) {
  const ps = idx.map((i) => EL[i](nz(-5, 5)));
  const f = terms(ps.map((p) => p.f)), F = terms(ps.map((p) => p.F));
  return Kit.anti(f, F, { dom: [0.15, 0.9],
    hint: 'Usa la tabla de primitivas inmediatas, término a término. Recuerda el signo de $\\int\\operatorname{sen}x\\,dx$.',
    steps: ['Cada término es una integral de la tabla; los coeficientes salen fuera.', 'Resultado: ' + L(F) + ' $+C$'] });
}
const sample = (arr, n) => { const a = arr.slice(), o = []; while (o.length < n) o.push(a.splice(ri(0, a.length - 1), 1)[0]); return o; };
const ELEM = [
  () => elemEx([pick([0, 1, 2, 3])]),
  () => elemEx(sample([0, 1, 2, 3], 2)),
  () => elemEx(sample([0, 1, 2, 3, 4, 5, 6, 7], 2)),
  () => elemEx(sample([0, 1, 2, 3, 4, 5, 6, 7], 3)),
];

/* ---------- 4. Composición lineal ---------- */
function linEx(f, F, a, l, what) {
  return Kit.anti(f, F, { dom: [0.2, 2],
    hint: 'Integra como si dentro hubiera solo $x$ y divide entre la derivada de lo de dentro, que es $' + a + '$.',
    steps: ['Dentro hay $u=' + T(l) + '$, con $u\'=' + a + '$.', what, 'Resultado: ' + L(F) + ' $+C$'] });
}
const LIN = [
  () => { const a = pick([2, 3, 4, 5, -1, -2, -3]), b = nz(-3, 4), c = pick([1, 1, 2, -1]), l = lin(a, b);
    return linEx(terms([[c, `e^(${l})`]]), terms([[fr(c, a), `e^(${l})`]]), a, l, 'La exponencial se integra igual, pero hay que dividir entre $' + a + '$.'); },
  () => { const a = pick([2, 3, 4, 5, -1, -2, -3]), b = nz(-3, 4), c = pick([1, 1, 2, 3, -1]), l = lin(a, b);
    return pick([0, 1]) ? linEx(terms([[c, `sin(${l})`]]), terms([[fr(-c, a), `cos(${l})`]]), a, l, '$\\int\\operatorname{sen}u\\,du=-\\cos u$; dividimos entre $' + a + '$.')
      : linEx(terms([[c, `cos(${l})`]]), terms([[fr(c, a), `sin(${l})`]]), a, l, '$\\int\\cos u\\,du=\\operatorname{sen}u$; dividimos entre $' + a + '$.'); },
  () => { const a = pick([2, 3, 4, -1, -2, -3]), b = nz(-3, 4), n = ri(2, 5), c = pick([1, 1, 2, -1]), l = lin(a, b);
    return linEx(terms([[c, `(${l})^${n}`]]), terms([[fr(c, a * (n + 1)), `(${l})^${n + 1}`]]), a, l, 'Subimos el exponente a $' + (n + 1) + '$ y dividimos entre $' + (n + 1) + '\\cdot' + (a < 0 ? '(' + a + ')' : a) + '$.'); },
  () => { const a = ri(2, 5), b = ri(1, 4), c = pick([1, 2, 3, -1]), l = lin(a, b);
    return linEx(terms([ov(c, `(${l})`)]), terms([[fr(c, a), `ln(abs(${l}))`]]), a, l, '$\\int\\frac{du}{u}=\\ln|u|$; dividimos entre $' + a + '$.'); },
  () => { const a = ri(2, 4), b = ri(1, 4), n = ri(2, 3), c = pick([1, 2, 3, -1]), l = lin(a, b);
    const den = n - 1 === 1 ? `(${l})` : `(${l})^${n - 1}`;
    return linEx(terms([ov(c, `(${l})^${n}`)]), terms([ov(fr(-c, a * (n - 1)), den)]), a, l, 'Es $u^{-' + n + '}$: subimos a $u^{-' + (n - 1) + '}$ y dividimos entre $-' + (n - 1) + '\\cdot' + a + '$.'); },
  () => { const a = ri(1, 4), b = ri(1, 5), c = pick([1, 2, 3]), l = lin(a, b);
    return linEx(terms([[c, `sqrt(${l})`]]), terms([[fr(2 * c, 3 * a), `(${l})^(3/2)`]]), a, l, '$\\sqrt{u}=u^{1/2}$ se integra a $\\frac{2}{3}u^{3/2}$; dividimos entre $' + a + '$.'); },
];

root.Topics.push(
  { id: 'deriv', island: 'Repaso', title: 'Derivadas', sub: 'La base para integrar', gen: (d) => byLevel(D, d)() },
  { id: 'pot', island: 'Primitivas', title: 'Potencias', sub: 'Polinomios, raíces y fracciones', gen: (d) => byLevel(POT, d)() },
  { id: 'elem', island: 'Primitivas', title: 'Inmediatas', sub: 'Exponencial, trigonométricas y más', gen: (d) => byLevel(ELEM, d)() },
  { id: 'lin', island: 'Primitivas', title: 'Función de ax+b', sub: 'Dividir entre lo de dentro', gen: (d) => byLevel(LIN, d)() },
);
})(typeof window !== 'undefined' ? window : globalThis);

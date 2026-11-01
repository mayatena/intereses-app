/* Utilidades para los generadores de geometría: álgebra de vectores enteros, escritura en LaTeX
   y en texto de puntos, rectas y planos, y raíces simplificadas. */
(function (root) {
'use strict';
const E = root.Engine;
const { ri, pick, nz, fr, fmul, fstr } = E;

/* ---------- vectores enteros ---------- */
const g2 = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
const V = {
  add: (a, b) => a.map((x, i) => x + b[i]),
  sub: (a, b) => a.map((x, i) => x - b[i]),
  mul: (k, a) => a.map((x) => k * x),
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  zero: (a) => a.every((x) => x === 0),
  eq: (a, b) => a.every((x, i) => x === b[i]),
};
V.n2 = (a) => V.dot(a, a);
V.par = (a, b) => V.zero(V.cross(a, b));
V.det = (a, b, c) => V.dot(a, V.cross(b, c));
V.prim = (v) => { const g = v.reduce(g2, 0); return g ? v.map((c) => c / g) : v.slice(); };
const rvec = (lo, hi, nonzero = true) => { let v; do { v = [ri(lo, hi), ri(lo, hi), ri(lo, hi)]; } while (nonzero && V.zero(v)); return v; };
const until = (gen, ok, tries = 400) => { for (let i = 0; i < tries; i++) { const v = gen(); if (ok(v)) return v; } throw new Error('sin candidato'); };
const hasZero = (v) => v.some((c) => c === 0);
// plano [a,b,c,d] primitivo y con el primer coeficiente no nulo positivo
function primPlane(p) {
  const g = p.reduce(g2, 0) || 1; let q = p.map((c) => c / g);
  const first = q.find((c, i) => i < 3 && c !== 0);
  if (first < 0) q = q.map((c) => -c);
  return q.map((c) => (c === 0 ? 0 : c));
}
const planeFrom = (n, P) => primPlane([n[0], n[1], n[2], -V.dot(n, P)]);
const rawPlane = (n, P) => [n[0], n[1], n[2], -V.dot(n, P)];

/* ---------- LaTeX ---------- */
const ft = (x) => Array.isArray(x) ? (x[1] === 1 ? String(x[0]) : (x[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(x[0]) + '}{' + x[1] + '}') : String(x);
const tup = (v) => '\\left(' + v.map(ft).join(',\\,') + '\\right)';
const pt = (name, v) => name + tup(v);
const vecT = (name, v) => '\\vec{' + name + '}=' + tup(v);
const m = (tex) => '$' + tex + '$';
const pn = (x) => (x < 0 ? '(' + x + ')' : String(x));
// suma de términos [coef, símbolo]; coef número o texto (p. ej. 'm'); símbolo '' = constante
function lx(list) {
  let s = '';
  for (const [c, sym] of list) {
    if (c === 0) continue;
    let neg = false, body;
    if (typeof c === 'string') body = c + sym;
    else { neg = c < 0; const a = Math.abs(c); body = sym === '' ? String(a) : (a === 1 ? sym : a + sym); }
    s += s === '' ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
  }
  return s || '0';
}
const planeTex = (p) => lx([[p[0], 'x'], [p[1], 'y'], [p[2], 'z'], [p[3], '']]) + '=0';
const planeStr = (p) => lx([[p[0], 'x'], [p[1], 'y'], [p[2], 'z'], [p[3], '']]).replace(/(\d)([xyz])/g, '$1$2') + ' = 0';

/* planos que definen una recta (formas implícitas) */
function implPlanes(P, d) {
  const cs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e) => V.prim(V.cross(d, e))).filter((n) => !V.zero(n));
  let best = null, bs = 1e9;
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    if (V.par(cs[i], cs[j])) continue;
    const s = V.n2(cs[i]) + V.n2(cs[j]); if (s < bs) { bs = s; best = [cs[i], cs[j]]; }
  }
  return best.map((n) => primPlane([n[0], n[1], n[2], -V.dot(n, P)]));
}
const comp = (p, d, par) => lx([[p, ''], [d, par || '\\lambda']]);
function lineTex(name, P, d, form, par) {
  const lab = name ? name + ':\\ ' : '', L = par || '\\lambda';
  const ax = ['x', 'y', 'z'];
  if (form === 'vec') return lab + '(x,y,z)=' + tup(P) + '+' + L + tup(d);
  if (form === 'param') return lab + '\\begin{cases}' + ax.map((v, i) => v + '=' + comp(P[i], d[i], L)).join('\\\\') + '\\end{cases}';
  if (form === 'cont') return lab + ax.map((v, i) => '\\dfrac{' + lx([[1, v], [-P[i], '']]) + '}{' + d[i] + '}').join('=');
  if (form === 'impl') return lab + '\\begin{cases}' + implPlanes(P, d).map(planeTex).join('\\\\') + '\\end{cases}';
  throw new Error('forma desconocida');
}
const lineStr = (P, d, form) => {
  const ax = ['x', 'y', 'z'];
  if (form === 'param') return ax.map((v, i) => v + '=' + P[i] + '+' + d[i] + 't').join('; ');
  if (form === 'cont') return ax.map((v, i) => '(' + v + '-(' + P[i] + '))/(' + d[i] + ')').join('=');
  if (form === 'impl') return implPlanes(P, d).map(planeStr).join('; ');
  return '(x,y,z)=(' + P.join(',') + ')+t(' + d.join(',') + ')';
};
function pickForm(d, lvl) {
  const f = ['param', 'vec']; if (!hasZero(d)) f.push('cont'); if (lvl > 0.4) f.push('impl');
  return pick(f);
}
const FORM_NAME = { vec: 'vectorial', param: 'paramétrica', cont: 'continua', impl: 'implícita' };
// varios objetos en una sola fórmula, uno por línea
const block = (lines) => (lines.length === 1 ? lines[0] : '\\begin{array}{l}' + lines.join('\\\\[8pt]') + '\\end{array}');

/* ---------- raíces ---------- */
function sqf(N) { let s = 1, r = N; for (let p = 2; p * p <= r; p++) while (r % (p * p) === 0) { r /= p * p; s *= p; } return [s, r]; }
// (a/b)·√N simplificado, como texto para el analizador
function rad(a, b, N) {
  const [s, r] = sqf(N); let num = a * s, den = b; const g = g2(num, den) || 1; num /= g; den /= g;
  if (num === 0) return '0';
  if (r === 1) return fstr([num, den]);
  const sg = num < 0 ? '-' : '', an = Math.abs(num), core = an === 1 ? 'sqrt(' + r + ')' : an + '*sqrt(' + r + ')';
  return sg + (den === 1 ? core : core + '/' + den);
}
const radv = (str) => E.fn(str)(0);
const approx = (v, d = 2) => String(+v.toFixed(d)).replace('.', '{,}');

/* ---------- constructores de ejercicio ---------- */
const frNum = (f) => f[0] / f[1];
const Kit = {
  vec: (fv, o) => {
    const v = fv.map((x) => (Array.isArray(x) ? frNum(x) : x));
    return Object.assign({ geo: 1, kind: 'vec', mode: 'exact', value: v, label: 'Vector =', ph: '(a, b, c)', keys: 'vec', sol: '(' + fv.map((x) => (Array.isArray(x) ? fstr(x) : x)).join(', ') + ')',
      ansTex: tup(fv), hint: '', steps: [], qtex: '' }, o);
  },
  plane: (p0, o) => { const p = primPlane(p0), same = p0.every((c, i) => c === p[i]), steps = ((o && o.steps) || []).slice();
    if (!same) steps.push('Simplificamos (dividiendo entre un factor común y/o cambiando el signo de toda la ecuación): $\\pi:\\ ' + planeTex(p) + '$.');
    return Object.assign({ geo: 1, kind: 'plane', plane: p, label: 'π:', ph: 'ax + by + cz = d', keys: 'plane', sol: planeStr(p), ansTex: '\\pi:\\ ' + planeTex(p), hint: '', qtex: '' }, o, { steps }); },
  line: (P, d, o) => Object.assign({ geo: 1, kind: 'line', P, d, label: 'r:', ph: '(x,y,z) = (…) + λ(…)', keys: 'line', sol: lineStr(P, d),
    ansTex: lineTex('r', P, d, 'vec'), hint: '', steps: [], qtex: '' }, o),
  num: (value, o) => Object.assign({ geo: 1, kind: 'num', value, sol: value, label: 'Resultado =', keys: 'gnum', hint: '', steps: [], qtex: '' }, o),
};

root.G = { V, g2, rvec, until, hasZero, primPlane, planeFrom, rawPlane, ft, tup, pt, vecT, m, pn, lx, planeTex, planeStr, implPlanes, lineTex, lineStr, pickForm, FORM_NAME,
  block, sqf, rad, radv, approx, Kit, frNum };
})(typeof window !== 'undefined' ? window : globalThis);

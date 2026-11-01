/* Verificación de los ejercicios de geometría: respuesta propia aceptada, formas equivalentes aceptadas,
   respuestas erróneas rechazadas, restricciones del enunciado cumplidas, valores numéricos recalculados
   con métodos independientes (búsquedas numéricas) y LaTeX válido. Uso: node verify-geo.js [N] */
const path = require('path');
const SRC = path.join(__dirname, '../src/');
for (const f of ['engine', 'geo', 'geolib', 'topics4', 'topics5', 'theory2']) { try { require(SRC + f + '.js'); } catch (e) { if (f !== 'theory2') throw e; } }
const E = Engine, G = globalThis.G, Geo = E.Geo, V = G.V;
const KATEX = require('/opt/npm-tools/node_modules/katex');
const N = +process.argv[2] || 200; let fails = 0; const seen = {};
const bad = (t, msg, extra) => { fails++; const k = t + msg; seen[k] = (seen[k] || 0) + 1; if (seen[k] <= 2) console.log('FALLO', t, msg, extra ? JSON.stringify(extra).slice(0, 400) : ''); };

/* ---- LaTeX ---- */
function checkTex(s) {
  let depth = 0, l = 0, r = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') { const mm = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (mm) { const c = mm[1];
        if (c === 'left') { l++; } if (c === 'right') { r++; if (r > l) return 'right sin left'; }
        if (c === 'frac' || c === 'dfrac') { let j = i + c.length + 1, g = 0; while (g < 2) { if (s[j] !== '{') return 'frac sin dos grupos'; let d = 0; do { if (s[j] === '{') d++; else if (s[j] === '}') d--; j++; } while (d > 0 && j <= s.length); if (d > 0) return 'frac sin cerrar'; g++; } }
        if (c === 'sqrt' && s[i + 5] !== '{') return 'sqrt sin llaves';
        i += c.length; continue; } i++; continue; }
    if (ch === '{') depth++; if (ch === '}') { depth--; if (depth < 0) return 'llave de más'; }
    if ((ch === '^' || ch === '_') && (i === s.length - 1 || s[i + 1] === '}')) return 'sub/superíndice vacío';
  }
  return depth ? 'llaves sin cerrar' : l !== r ? 'left/right desparejados' : null;
}
function tex(t, s, ctx) { const e = checkTex(s); if (e) bad(t, 'LaTeX ' + ctx + ': ' + e, { s }); try { KATEX.renderToString(s, { throwOnError: true, strict: 'ignore' }); } catch (er) { bad(t, 'KaTeX ' + ctx + ': ' + String(er.message).slice(0, 80), { s }); } }
function mixed(t, s, ctx) {
  (String(s).match(/\$([^$]+)\$/g) || []).forEach((q) => tex(t, q.slice(1, -1), ctx));
  const stripped = String(s).replace(/\$[^$]+\$/g, '').replace(/«[^»]*»/g, '');
  if (/\\[a-z]|[_^]/.test(stripped)) bad(t, 'LaTeX fuera de $: ' + ctx, { s: stripped.slice(0, 60) });
  if ((String(s).match(/\$/g) || []).length % 2) bad(t, '$ impar en ' + ctx, { s });
}

/* ---- conversión TeX -> texto para comprobar los constructores ---- */
function t2a(s) {
  s = s.replace(/^[A-Za-z]\w*:\\ /, '').replace(/\\left|\\right/g, '').replace(/\\,|\\ /g, '').replace(/\\lambda|\\mu/g, 't').replace(/\\cdot/g, '*');
  for (;;) { const i = s.search(/\\d?frac\{/); if (i < 0) break; const c = s.indexOf('{', i); const grab = (j) => { let d = 0, k = j; do { if (s[k] === '{') d++; if (s[k] === '}') d--; k++; } while (d > 0); return k; }; const e1 = grab(c), e2 = grab(e1); s = s.slice(0, i) + '((' + s.slice(c + 1, e1 - 1) + ')/(' + s.slice(e1 + 1, e2 - 1) + '))' + s.slice(e2); }
  return s.replace(/\\begin\{cases\}|\\end\{cases\}/g, '').replace(/\\\\(\[\w+\])?/g, ';');
}
const sameLine = (r, P, d) => !r.err && Geo.isPar(r.d, d) && Geo.nrm(Geo.cross(Geo.sub(r.P, P), d)) < 1e-7 * (Geo.nrm(d) * (Geo.nrm(Geo.sub(r.P, P)) + 1));
/* constructores: lineTex y planeTex deben decir exactamente lo que dicen los datos */
for (let i = 0; i < 3000; i++) {
  const P = G.rvec(-5, 5, false), d = G.rvec(-4, 4), form = ['vec', 'param', 'impl', G.hasZero(d) ? 'vec' : 'cont'][i % 4], par = i % 2 ? '\\mu' : undefined;
  const r = Geo.parseLine(t2a(G.lineTex('r', P, d, form, par)));
  if (!sameLine(r, P, d)) bad('constructor', 'lineTex ' + form, { P, d, tex: G.lineTex('r', P, d, form), r });
  if (r.form !== form && !(form === 'cont' && r.form === 'cont')) bad('constructor', 'forma detectada ' + form + ' -> ' + r.form, { tex: G.lineTex('r', P, d, form) });
  const p = G.primPlane([...G.rvec(-5, 5), ri5()]); const q = Geo.parsePlane(t2a(G.planeTex(p)));
  if (q.err || !Geo.isPar(q.n, [p[0], p[1], p[2]]) || Math.abs(q.D - (q.n[0] / p[0] || q.n[1] / p[1] || q.n[2] / p[2]) * p[3]) > 1e-9 && false) bad('constructor', 'planeTex', { p, q });
  if (!q.err) { const k = [0, 1, 2].find((c) => p[c] !== 0); const kk = q.n[k] / p[k]; if (Math.abs(q.D - kk * p[3]) > 1e-9 || Math.abs(q.n[0] - kk * p[0]) + Math.abs(q.n[1] - kk * p[1]) + Math.abs(q.n[2] - kk * p[2]) > 1e-9) bad('constructor', 'planeTex valores', { p, q }); }
  // implPlanes: los dos planos contienen a la recta
  for (const pl of G.implPlanes(P, d)) if (V.dot(pl.slice(0, 3), d) !== 0 || V.dot(pl.slice(0, 3), P) + pl[3] !== 0) bad('constructor', 'implPlanes no contiene la recta', { P, d, pl });
}
function ri5() { return Math.floor(Math.random() * 11) - 5; }

/* ---- métodos numéricos independientes ---- */
const norm = (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]), sub = (a, b) => a.map((x, i) => x - b[i]), add = (a, b) => a.map((x, i) => x + b[i]), mul = (k, a) => a.map((x) => k * x);
const dist = (a, b) => norm(sub(a, b));
function tern(f, lo, hi) { for (let i = 0; i < 100; i++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (f(a) < f(b)) hi = b; else lo = a; } const x = (lo + hi) / 2; return { x, v: f(x) }; }
function nearestOnLine(A, P0, d) { return tern((t) => dist(A, add(P0, mul(t, d))), -200, 200); }
function planeBasis(n) { const e = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].reduce((b, c) => (norm(V.cross(n, c)) > norm(V.cross(n, b)) ? c : b)), u = V.cross(n, e), v = V.cross(n, u); return [u, v]; }
function nearestOnPlane(A, n, D) { // pie de la perpendicular, buscado minimizando
  const n2 = V.n2(n), X0 = mul(-D / n2, n), [u, v] = planeBasis(n); let best = null;
  const outer = tern((s) => { const r = tern((t) => dist(A, add(X0, add(mul(s, u), mul(t, v)))), -300, 300); best = { s, t: r.x }; return r.v; }, -300, 300);
  const s = outer.x, r = tern((t) => dist(A, add(X0, add(mul(s, u), mul(t, v)))), -300, 300);
  return { X: add(X0, add(mul(s, u), mul(r.x, v))), v: outer.v };
}
function distLL(P1, d1, P2, d2) { const o = tern((s) => tern((t) => dist(add(P1, mul(s, d1)), add(P2, mul(t, d2))), -300, 300).v, -300, 300); return o.v; }
const DEG = 180 / Math.PI;
function vdValue(vd) {
  switch (vd.t) {
    case 'pp': return nearestOnPlane(vd.P, vd.n, vd.D).v;
    case 'ppl': { const n2 = V.n2(vd.n), X2 = mul((-vd.D2 / vd.k) / n2, vd.n); return nearestOnPlane(X2, vd.n, vd.D1).v; }
    case 'pl': return nearestOnLine(vd.P, vd.P0, vd.d).v;
    case 'll': return distLL(vd.P1, vd.d1, vd.P2, vd.d2);
    case 'ang-ll': { const a = Math.atan2(norm(V.cross(vd.d1, vd.d2)), Math.abs(V.dot(vd.d1, vd.d2))); return vd.cos ? Math.cos(a) : a * DEG; }
    case 'ang-lp': return Math.atan2(Math.abs(V.dot(vd.d, vd.n)), norm(V.cross(vd.d, vd.n))) * DEG;
    case 'ang-v': return Math.atan2(norm(V.cross(vd.u, vd.v)), V.dot(vd.u, vd.v)) * DEG;
    case 'sym-p': return sub(mul(2, vd.M), vd.A);
    case 'proj-pl': return nearestOnPlane(vd.A, vd.n, vd.D).X;
    case 'sym-pl': return sub(mul(2, nearestOnPlane(vd.A, vd.n, vd.D).X), vd.A);
    case 'proj-l': { const t = nearestOnLine(vd.A, vd.P0, vd.d).x; return add(vd.P0, mul(t, vd.d)); }
    case 'sym-l': { const t = nearestOnLine(vd.A, vd.P0, vd.d).x; return sub(mul(2, add(vd.P0, mul(t, vd.d))), vd.A); }
  }
  throw new Error('vd desconocido ' + vd.t);
}
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const closeV = (a, b, tol = 1e-6) => Array.isArray(a) && a.length === b.length && a.every((x, i) => close(x, b[i], tol));

/* ---- respuestas alternativas ---- */
const ax = ['x', 'y', 'z'];
const fmtC = (c, s) => (c === 0 ? '' : (c > 0 ? '+' : '-') + (Math.abs(c) === 1 && s ? '' : Math.abs(c)) + s);
const planeAs = (p, k) => (p.slice(0, 3).map((c, i) => fmtC(k * c, ax[i])).join('') + fmtC(k * p[3], '') + '=0').replace(/^\+/, '');
const linesAlt = (P, d) => {
  const out = [];
  out.push('(x,y,z)=(' + P.join(',') + ')+t(' + d.join(',') + ')');
  const P2 = P.map((c, i) => c + 2 * d[i]), d2 = d.map((c) => -3 * c);
  out.push('x=' + P2[0] + '+' + d2[0] + 't; y=' + P2[1] + '+' + d2[1] + 't; z=' + P2[2] + '+' + d2[2] + 't');
  out.push('(' + P2.join(',') + ')+λ(' + d2.join(',') + ')');
  if (!G.hasZero(d)) out.push(ax.map((v, i) => '(' + v + '-(' + P[i] + '))/(' + d[i] + ')').join('='));
  out.push(G.implPlanes(P, d).map((p) => planeAs(p, 1)).join('; '));
  return out;
};

const perturb = (v) => { for (const e of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1]]) { const w = v.map((c, i) => c + e[i]); if (!V.zero(V.cross(w.map((c) => c * 1), v)) || V.zero(v)) return w; } return v.map((c) => c + 1); };
let totalPerTopic = {};
const topics = Topics.filter((t) => t.subj === 'geo');
for (const T of topics) {
  for (let i = 0; i < N; i++) {
    const d = (i % 8) / 7; let ex;
    try { ex = T.gen(d); } catch (e) { bad(T.id, 'gen lanza: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); continue; }
    try {
      if (!ex.geo) bad(T.id, 'sin marca geo');
      if (typeof ex.prompt !== 'string' || !ex.prompt) bad(T.id, 'sin prompt');
      if (!Array.isArray(ex.steps) || !ex.steps.length) bad(T.id, 'sin pasos');
      if (!ex.hint) bad(T.id, 'sin pista');
      if (!ex.ansTex) bad(T.id, 'sin ansTex');
      if (ex.qtex) tex(T.id, ex.qtex, 'qtex'); else if (T.id !== 'gx') bad(T.id, 'sin qtex (datos del enunciado)');
      if (ex.ansTex) tex(T.id, ex.ansTex, 'ansTex');
      mixed(T.id, ex.prompt, 'prompt'); mixed(T.id, ex.hint, 'hint'); ex.steps.forEach((s) => mixed(T.id, s, 'step'));
      const sol = ex.sol;
      let r = E.check(ex, sol);
      if (!r.ok) bad(T.id, 'check rechaza la solución propia (' + ex.kind + ')', { sol, r, ex: { value: ex.value, plane: ex.plane, P: ex.P, d: ex.d } });
      const pv = E.preview(sol, ex); if (!pv.ok) bad(T.id, 'preview falla con la solución: ' + pv.msg, { sol });
      else if (pv.tex) tex(T.id, pv.tex, 'preview');

      if (ex.res && Math.abs(ex.res()) > 1e-9) bad(T.id, 'residuo ≠ 0: ' + ex.res());
      if (ex.kind === 'plane') {
        const p = ex.plane;
        for (const k of [-2, 3]) if (!E.check(ex, planeAs(p, k)).ok) bad(T.id, 'rechaza plano múltiplo ' + k, { s: planeAs(p, k) });
        if (!E.check(ex, p.slice(0, 3).map((c, i) => fmtC(c, ax[i])).join('').replace(/^\+/, '') + '=' + (-p[3])).ok) bad(T.id, 'rechaza forma ax+by+cz=d');
        if (E.check(ex, planeAs([p[0], p[1], p[2], p[3] + 1], 1)).ok) bad(T.id, 'acepta plano con d distinto');
        { const w = perturb([p[0], p[1], p[2]]); if (E.check(ex, planeAs([w[0], w[1], w[2], p[3]], 1)).ok) bad(T.id, 'acepta plano con otro normal', { p, w }); }
        if (Geo.planeViolation([p[0], p[1], p[2]], p[3], ex.cons)) bad(T.id, 'la solución viola las condiciones: ' + Geo.planeViolation([p[0], p[1], p[2]], p[3], ex.cons), { cons: ex.cons, p });
        if (!(ex.cons && ex.cons.length)) bad(T.id, 'plano sin restricciones');
        // una respuesta mala debe dar pista concreta cuando hay restricciones y viola alguna
        const w = [p[0], p[1], p[2], p[3] + 3]; const rr = E.check(ex, planeAs(w, 1)); if (rr.ok) bad(T.id, 'acepta d+3');
      } else if (ex.kind === 'line') {
        const P = ex.P, dd = ex.d;
        for (const s of linesAlt(P, dd)) if (!E.check(Object.assign({}, ex, { form: undefined }), s).ok) bad(T.id, 'rechaza forma equivalente', { s, r: E.check(Object.assign({}, ex, { form: undefined }), s) });
        const nz = [0, 1, 2].find((q) => dd[q] !== 0), off = [0, 1, 2].map((q) => (q === nz ? 0 : 0)); let bad1 = P.slice(); bad1[(nz + 1) % 3] += 1; bad1[(nz + 2) % 3] -= 2;
        // desplazar el punto fuera de la recta (perpendicularmente en alguna dirección)
        const sh = V.cross(dd, [1, 0, 0]); const shift = V.zero(sh) ? V.cross(dd, [0, 1, 0]) : sh;
        if (E.check(ex, '(x,y,z)=(' + add(P, shift).join(',') + ')+t(' + dd.join(',') + ')').ok) bad(T.id, 'acepta recta desplazada');
        if (E.check(ex, '(x,y,z)=(' + P.join(',') + ')+t(' + add(dd, shift).join(',') + ')').ok) bad(T.id, 'acepta otra dirección');
        if (Geo.lineViolation(P, dd, ex.cons)) bad(T.id, 'la solución viola las condiciones: ' + Geo.lineViolation(P, dd, ex.cons), { cons: ex.cons });
        if (ex.cons !== undefined && !ex.cons.length) bad(T.id, 'recta con restricciones vacías');
        if (ex.form) { const okf = Array.isArray(ex.form) ? ex.form : [ex.form]; const mine = { vec: '(x,y,z)=(' + P.join(',') + ')+t(' + dd.join(',') + ')', param: 'x=' + P[0] + '+' + dd[0] + 't; y=' + P[1] + '+' + dd[1] + 't; z=' + P[2] + '+' + dd[2] + 't' };
          const wrongForm = ['vec', 'param'].find((f) => !okf.includes(f)); if (wrongForm && E.check(ex, mine[wrongForm]).ok) bad(T.id, 'acepta una forma no pedida'); }
        if (/^(gcrit2)$/.test(T.id) && !ex.cons) bad(T.id, 'sin cons en recta de problema tipo');
      } else if (ex.kind === 'vec') {
        const v = ex.value;
        if (ex.mode === 'prop') {
          for (const k of [-2, 3]) if (!E.check(ex, '(' + v.map((c) => k * c).join(',') + ')').ok) bad(T.id, 'rechaza múltiplo en prop');
          { const w = perturb(v); if (E.check(ex, '(' + w.join(',') + ')').ok) bad(T.id, 'acepta vector mal en prop', { v, w }); }
          if (E.check(ex, '(0,0,0)').ok) bad(T.id, 'acepta vector nulo en prop');
        } else {
          if (E.check(ex, '(' + [v[0] + 1, v[1], v[2]].join(',') + ')').ok) bad(T.id, 'acepta vector mal');
          if (E.check(ex, '(' + v.map((c) => -c).join(',') + ')').ok && v.some((c) => c !== 0)) bad(T.id, 'acepta el opuesto');
          const dec = '(' + v.map((c) => String(+c.toFixed(4))).join(',') + ')'; if (!E.check(ex, dec).ok) bad(T.id, 'rechaza decimales redondeados', { dec, v });
        }
        if (ex.ver && !closeV(ex.ver(), v)) bad(T.id, 'ver() ≠ value: ' + JSON.stringify(ex.ver()) + ' vs ' + JSON.stringify(v));
        if (ex.vd && !closeV(vdValue(ex.vd), v, 1e-5)) bad(T.id, 'vd ≠ value ' + ex.vd.t + ': ' + JSON.stringify(vdValue(ex.vd)) + ' vs ' + JSON.stringify(v));
      } else if (ex.kind === 'num') {
        const val = E.fn(ex.value)(0);
        if (!isFinite(val)) bad(T.id, 'valor no finito', { v: ex.value });
        if (E.check(ex, '(' + ex.value + ')+1').ok) bad(T.id, 'acepta valor mal');
        if (!E.check(ex, String(+val.toFixed(3))).ok && Math.abs(val) < 1e3) bad(T.id, 'rechaza decimal 3 cifras', { v: ex.value, val });
        if (ex.ver) { const q = ex.ver(); if (!close(q, val, 1e-6)) bad(T.id, 'ver() ≠ valor: ' + q + ' vs ' + val + ' (' + ex.value + ')'); }
        if (ex.vd) { const q = vdValue(ex.vd); if (!close(q, val, 1e-5)) bad(T.id, 'vd ≠ valor ' + ex.vd.t + ': ' + q + ' vs ' + val + ' (' + ex.value + ')', ex.vd); }
        if (!ex.ver && !ex.vd && !ex.res) bad(T.id, 'num sin verificación independiente');
      }
    } catch (e) { bad(T.id, 'excepción: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  }
  console.log('tema', T.id.padEnd(8), 'ok');
}
if (globalThis.Theory) { for (const t of topics) { const pages = Theory[t.id]; if (!pages) { bad(t.id, 'sin teoría'); continue; } pages.forEach((p, i) => { mixed(t.id, (p.h || '') + ' ' + (p.body || ''), 'teoría' + i); (p.fx || []).forEach((s) => tex(t.id, s, 'fx' + i)); if (p.ex) { tex(t.id, p.ex.q, 'ex.q'); p.ex.steps.forEach((s) => mixed(t.id, s, 'ex.step')); } }); } console.log('teoría revisada'); }
console.log(fails ? 'TOTAL FALLOS: ' + fails : 'TODO CORRECTO (' + N + ' ejercicios por tema)');
process.exit(fails ? 1 : 0);

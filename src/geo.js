/* Geometría: analizador de expresiones lineales (x, y, z y un parámetro) y comprobación de
   respuestas de tipo vector/punto, plano y recta. Se apoya en Engine. */
(function (root) {
'use strict';
const E = root.Engine;
const Z = 1e-9;

/* ---------- aritmética de vectores (decimales) ---------- */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const nrm = (a) => Math.sqrt(dot(a, a));
const isPar = (a, b) => nrm(cross(a, b)) <= Z * Math.max(1e-12, nrm(a) * nrm(b));
const isZero = (a) => nrm(a) <= 1e-12;

/* ---------- formas lineales: {x, y, z, t, c} ---------- */
const lf = (o) => Object.assign({ x: 0, y: 0, z: 0, t: 0, c: 0 }, o);
const lfAdd = (a, b, s) => ({ x: a.x + s * b.x, y: a.y + s * b.y, z: a.z + s * b.z, t: a.t + s * b.t, c: a.c + s * b.c });
const lfScale = (a, k) => ({ x: a.x * k, y: a.y * k, z: a.z * k, t: a.t * k, c: a.c * k });
const isConst = (a) => Math.abs(a.x) < 1e-12 && Math.abs(a.y) < 1e-12 && Math.abs(a.z) < 1e-12 && Math.abs(a.t) < 1e-12;
const hasXYZ = (a) => Math.abs(a.x) > 1e-12 || Math.abs(a.y) > 1e-12 || Math.abs(a.z) > 1e-12;
const hasT = (a) => Math.abs(a.t) > 1e-12;

function tokenize(src) {
  const s = String(src).replace(/[−–—]/g, '-').replace(/[·×⋅]/g, '*').replace(/÷/g, '/').toLowerCase();
  const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const t = s.slice(i, j);
      if ((t.match(/\./g) || []).length > 1 || t === '.') throw new Error('Número mal escrito');
      out.push({ t: 'n', v: parseFloat(t) }); i = j; continue;
    }
    if ('+-*/(),='.includes(ch)) { out.push({ t: ch }); i++; continue; }
    if (ch === '[') { out.push({ t: '(' }); i++; continue; }
    if (ch === ']') { out.push({ t: ')' }); i++; continue; }
    if (ch === 'x' || ch === 'y' || ch === 'z') { out.push({ t: 'v', v: ch }); i++; continue; }
    if ('tλμsl'.includes(ch)) { out.push({ t: 'v', v: 't' }); i++; continue; }
    if (ch === '^') throw new Error('Aquí solo hay expresiones de primer grado (sin potencias).');
    throw new Error('No entiendo «' + ch + '»');
  }
  return out;
}

const showTok = (t) => (t.t === 'n' ? String(t.v) : t.t === 'v' ? (t.v === 't' ? 'λ' : t.v) : t.t);
const LIN_ERR = 'Aquí solo hay expresiones de primer grado (sin productos entre x, y, z).';

/* evalúa una lista de tokens: devuelve {k:'s', l} (escalar lineal) o {k:'v', v:[l,l,l]} (vector) */
function evalTokens(tk) {
  let p = 0;
  const peek = () => tk[p], next = () => tk[p++];
  const S = (l) => ({ k: 's', l }), Vv = (v) => ({ k: 'v', v });
  const mulS = (a, b) => { if (isConst(a)) return lfScale(b, a.c); if (isConst(b)) return lfScale(a, b.c); throw new Error(LIN_ERR); };
  const mul = (A, B) => {
    if (A.k === 's' && B.k === 's') return S(mulS(A.l, B.l));
    if (A.k === 's') return Vv(B.v.map((c) => mulS(A.l, c)));
    if (B.k === 's') return Vv(A.v.map((c) => mulS(c, B.l)));
    throw new Error('No se pueden multiplicar dos vectores así.');
  };
  const div = (A, B) => {
    if (B.k !== 's' || !isConst(B.l)) throw new Error('Solo se puede dividir entre un número.');
    if (Math.abs(B.l.c) < 1e-12) throw new Error('No se puede dividir entre 0.');
    return mul(A, S(lf({ c: 1 / B.l.c })));
  };
  const add = (A, B, sg) => {
    if (A.k !== B.k) throw new Error('No se puede sumar un número con un vector.');
    return A.k === 's' ? S(lfAdd(A.l, B.l, sg)) : Vv(A.v.map((c, i) => lfAdd(c, B.v[i], sg)));
  };
  const startsFactor = (t) => t && (t.t === 'n' || t.t === 'v' || t.t === '(');
  function expr() {
    let a = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) { const o = next().t; const b = term(); a = add(a, b, o === '+' ? 1 : -1); }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t && (t.t === '*' || t.t === '/')) { next(); const b = unary(); a = t.t === '*' ? mul(a, b) : div(a, b); }
      else if (startsFactor(t)) a = mul(a, factor());
      else break;
    }
    return a;
  }
  function unary() {
    const t = peek();
    if (t && t.t === '-') { next(); return mul(S(lf({ c: -1 })), unary()); }
    if (t && t.t === '+') { next(); return unary(); }
    return factor();
  }
  function factor() {
    const t = next();
    if (!t) throw new Error('Falta algo al final.');
    if (t.t === 'n') return S(lf({ c: t.v }));
    if (t.t === 'v') return S(lf({ [t.v]: 1 }));
    if (t.t === '(') {
      const items = [expr()];
      while (peek() && peek().t === ',') { next(); items.push(expr()); }
      if (!peek() || peek().t !== ')') throw new Error('Falta cerrar un paréntesis.');
      next();
      if (items.length === 1) return items[0];
      if (items.length !== 3 || items.some((q) => q.k !== 's')) throw new Error('Un vector lleva tres componentes: (a, b, c).');
      return Vv(items.map((q) => q.l));
    }
    if (t.t === ',') throw new Error('Aquí los decimales se escriben con punto (0.5) o como fracción (1/2).');
    throw new Error('Expresión mal formada.');
  }
  if (!tk.length) throw new Error('Falta una expresión.');
  const r = expr();
  if (p < tk.length) throw new Error('Sobra «' + showTok(tk[p]) + '».');
  return r;
}

/* parte los tokens por '=' */
function splitEq(tk) {
  const parts = [[]];
  for (const t of tk) { if (t.t === '=') parts.push([]); else parts[parts.length - 1].push(t); }
  return parts;
}
const asScalar = (v) => { if (v.k !== 's') throw new Error('Aquí falta una expresión con x, y, z, no un vector.'); return v.l; };

/* ---------- vectores / puntos (componentes con el analizador del cálculo) ---------- */
function splitTop(s, sep) {
  const out = []; let d = 0, cur = '';
  for (const ch of s) {
    if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--;
    if (ch === sep && d === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur); return out;
}
function parseVec(input) {
  let s = String(input).trim().replace(/[−–—]/g, '-');
  const eq = s.indexOf('='); if (eq >= 0) s = s.slice(eq + 1).trim();
  const m = /^[A-Za-zπ_\\]*\s*([(\[])(.*)([)\]])$/.exec(s);
  if (m && splitTop(m[2], ',').length >= 1) {
    // solo quitamos el paréntesis exterior si abarca toda la cadena
    let d = 0, whole = true; const inner = m[2];
    for (const ch of inner) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') { d--; if (d < 0) { whole = false; break; } } }
    if (whole && d === 0) s = inner;
  }
  const pieces = (s.includes(';') ? splitTop(s, ';') : splitTop(s, ',')).map((q) => q.trim());
  if (pieces.length !== 3 || pieces.some((q) => !q)) return { err: 'Escribe las tres componentes separadas por comas: (a, b, c). Los decimales, con punto.' };
  const v = [], dec = [];
  for (const q of pieces) {
    let ast;
    try { ast = E.parse(q); } catch (e) { return { err: e.message }; }
    if (E.hasVar(ast)) return { err: 'Las componentes son números: sin x, y, z.' };
    const val = E.ev(ast, 0);
    if (!isFinite(val)) return { err: 'Una de las componentes no se puede calcular.' };
    v.push(val);
    const ds = [...q.matchAll(/[.,](\d+)/g)].map((mm) => mm[1].length);
    dec.push(ds.length ? Math.max(...ds) : -1);
  }
  return { v, dec, pieces };
}

/* ---------- planos ---------- */
function parsePlane(input) {
  let parts; try { parts = splitEq(tokenize(input)); } catch (e) { return { err: e.message }; }
  if (parts.length === 1) return { err: 'Falta el signo =. Por ejemplo: 2x - y + z = 5' };
  if (parts.length > 2) return { err: 'Una ecuación de plano lleva un solo signo =.' };
  let L, R;
  try { L = asScalar(evalTokens(parts[0])); R = asScalar(evalTokens(parts[1])); } catch (e) { return { err: e.message }; }
  if (hasT(L) || hasT(R)) return { err: 'En la ecuación de un plano solo van x, y, z (sin parámetros).' };
  const f = lfAdd(L, R, -1);
  if (!hasXYZ(f)) return { err: 'Eso no es la ecuación de un plano: faltan x, y, z.' };
  return { n: [f.x, f.y, f.z], D: f.c, L, R };
}

/* ---------- rectas ---------- */
const E_SEP = /[;\n]|,(?=\s*[xyz]\s*=)/;
function pointOnPlanes(n1, D1, n2, D2) {
  const d = cross(n1, n2), det = dot(n1, cross(n2, d));
  const a = cross(n2, d), b = cross(d, n1), c = cross(n1, n2);
  return [0, 1, 2].map((i) => (-D1 * a[i] - D2 * b[i]) / det);
}
function parseLine(input) {
  const eqs = String(input).split(E_SEP).map((q) => q.trim()).filter(Boolean);
  if (!eqs.length) return { err: 'Escribe la ecuación de la recta.' };
  const parsed = [];
  for (const q of eqs) {
    let tk; try { tk = tokenize(q); } catch (e) { return { err: e.message }; }
    parsed.push(tk);
  }
  const AX = ['x', 'y', 'z'];
  const isUnit = (c, k) => AX.every((a) => Math.abs(c[a] - (a === k ? 1 : 0)) < 1e-12) && Math.abs(c.t) < 1e-12 && Math.abs(c.c) < 1e-12;
  const unitVec = (v) => v.k === 'v' && v.v.every((c, i) => isUnit(c, AX[i]));
  try {
    if (eqs.length === 1) {
      const parts = splitEq(parsed[0]);
      if (parts.length === 1) { // solo el segundo miembro: punto + λ·vector
        const v = evalTokens(parsed[0]); if (v.k !== 'v') throw new Error('Falta el signo =.');
        return vecForm(v);
      }
      if (parts.length === 2) {
        const A = evalTokens(parts[0]), B = evalTokens(parts[1]);
        if (A.k === 'v' && unitVec(A) && B.k === 'v') return vecForm(B);
        throw new Error('Con una sola igualdad, escribe (x, y, z) = (punto) + λ(vector) o la forma continua con dos signos =.');
      }
      // continua: a = b = c
      const vals = parts.map((q) => asScalar(evalTokens(q)));
      if (vals.some(hasT)) throw new Error('En la forma continua no hay parámetro.');
      const ps = [];
      for (let i = 0; i < vals.length - 1; i++) ps.push(lfAdd(vals[i], vals[i + 1], -1));
      if (ps.length !== 2) throw new Error('La forma continua lleva dos signos =: (x−a)/p = (y−b)/q = (z−c)/r.');
      return implForm(ps, 'cont', vals);
    }
    if (eqs.length === 3) {
      const P = [0, 0, 0], d = [0, 0, 0], seen = {};
      for (const tk of parsed) {
        const parts = splitEq(tk);
        if (parts.length !== 2) throw new Error('Cada ecuación paramétrica lleva un signo =: x = …');
        const L = asScalar(evalTokens(parts[0])), R = asScalar(evalTokens(parts[1]));
        // L debe ser una sola variable
        const vs = ['x', 'y', 'z'].filter((k) => Math.abs(L[k]) > 1e-12);
        if (vs.length !== 1 || hasT(L) || Math.abs(L.c) > 1e-12) throw new Error('A la izquierda de cada ecuación paramétrica va solo x, y o z.');
        if (hasXYZ(R)) throw new Error('A la derecha de las paramétricas solo va el parámetro (λ) y números.');
        const k = vs[0], i = ['x', 'y', 'z'].indexOf(k);
        if (seen[k]) throw new Error('Has repetido la variable ' + k + '.');
        seen[k] = 1;
        P[i] = R.c / L[k]; d[i] = R.t / L[k];
      }
      if (Object.keys(seen).length !== 3) throw new Error('Faltan ecuaciones: x, y y z.');
      if (isZero(d)) throw new Error('Con esas ecuaciones no sale una recta (el vector director es nulo).');
      return { form: 'param', P, d };
    }
    if (eqs.length === 2) {
      const ps = [];
      for (const tk of parsed) {
        const parts = splitEq(tk);
        if (parts.length !== 2) throw new Error('Cada ecuación lleva un signo =.');
        const L = asScalar(evalTokens(parts[0])), R = asScalar(evalTokens(parts[1]));
        if (hasT(L) || hasT(R)) throw new Error('En las ecuaciones implícitas solo van x, y, z.');
        ps.push(lfAdd(L, R, -1));
      }
      return implForm(ps, 'impl');
    }
    throw new Error('Una recta se escribe con una igualdad vectorial, tres ecuaciones paramétricas o dos ecuaciones de planos.');
  } catch (e) { return { err: e.message }; }
}
function vecForm(v) {
  if (v.v.some(hasXYZ)) throw new Error('A la derecha solo van números y el parámetro λ.');
  const P = v.v.map((c) => c.c), d = v.v.map((c) => c.t);
  if (isZero(d)) throw new Error('Falta el parámetro λ multiplicando al vector director.');
  return { form: 'vec', P, d };
}
function implForm(ps, form) {
  const n1 = [ps[0].x, ps[0].y, ps[0].z], n2 = [ps[1].x, ps[1].y, ps[1].z];
  if (isZero(n1) || isZero(n2)) throw new Error('Cada ecuación debe llevar alguna de las variables x, y, z.');
  const d = cross(n1, n2);
  if (isZero(d) || nrm(d) <= Z * nrm(n1) * nrm(n2)) throw new Error('Esas dos ecuaciones son paralelas o iguales: no definen una recta.');
  return { form, P: pointOnPlanes(n1, ps[0].c, n2, ps[1].c), d, planes: [[n1, ps[0].c], [n2, ps[1].c]] };
}

/* ---------- restricciones (para dar pistas concretas) ---------- */
const aN = (n) => (/^el /.test(n) ? 'al ' + n.slice(3) : 'a ' + n);
function planeViolation(n, D, cons) {
  const nn = nrm(n);
  for (const c of cons || []) {
    const tolP = 1e-7 * (nn * (c.P ? nrm(c.P) + 1 : 1) + Math.abs(D) + 1);
    switch (c.t) {
      case 'pass': if (Math.abs(dot(n, c.P) + D) > tolP) return 'Tu plano no pasa por ' + c.n + '.'; break;
      case 'containsLine':
        if (Math.abs(dot(n, c.P) + D) > tolP || Math.abs(dot(n, c.d)) > 1e-7 * nn * nrm(c.d)) return 'Tu plano no contiene ' + aN(c.n) + '.'; break;
      case 'parallelLine': if (Math.abs(dot(n, c.d)) > 1e-7 * nn * nrm(c.d)) return 'Tu plano no es paralelo ' + aN(c.n) + '.'; break;
      case 'perpLine': if (!isPar(n, c.d)) return 'Tu plano no es perpendicular ' + aN(c.n) + '.'; break;
      case 'parallelPlane': if (!isPar(n, c.nv)) return 'Tu plano no es paralelo ' + aN(c.n) + '.'; break;
      case 'perpPlane': if (Math.abs(dot(n, c.nv)) > 1e-7 * nn * nrm(c.nv)) return 'Tu plano no es perpendicular ' + aN(c.n) + '.'; break;
    }
  }
  return null;
}
function lineViolation(P, d, cons) {
  const nd = nrm(d);
  for (const c of cons || []) {
    switch (c.t) {
      case 'pass': if (nrm(cross(sub(c.P, P), d)) > 1e-7 * nd * (nrm(sub(c.P, P)) + 1)) return 'Tu recta no pasa por ' + c.n + '.'; break;
      case 'parallelLine': if (!isPar(d, c.d)) return 'Tu recta no es paralela ' + aN(c.n) + '.'; break;
      case 'perpLine': if (Math.abs(dot(d, c.d)) > 1e-7 * nd * nrm(c.d)) return 'Tu recta no es perpendicular ' + aN(c.n) + '.'; break;
      case 'parallelPlane': if (Math.abs(dot(d, c.nv)) > 1e-7 * nd * nrm(c.nv)) return 'Tu recta no es paralela ' + aN(c.n) + '.'; break;
      case 'perpPlane': if (!isPar(d, c.nv)) return 'Tu recta no es perpendicular ' + aN(c.n) + '.'; break;
      case 'meetsLine': {
        const w = sub(c.P, P), cr = cross(d, c.d);
        if (isZero(cr) || Math.abs(dot(w, cr)) > 1e-7 * nrm(cr) * (nrm(w) + 1)) return 'Tu recta no corta ' + aN(c.n) + '.';
        break;
      }
    }
  }
  return null;
}

/* ---------- comprobación ---------- */
const FORMS = {
  vec: 'vectorial «(x, y, z) = (punto) + λ(vector)»',
  param: 'paramétrica «x = …; y = …; z = …»',
  cont: 'continua «(x−a)/p = (y−b)/q = (z−c)/r»',
  impl: 'implícita (dos ecuaciones de planos separadas por «;»)',
};
function checkVec(ex, input) {
  input = String(input || '').trim();
  if (!input) return { ok: false, empty: true, msg: 'Escribe tu respuesta.' };
  const r = parseVec(input);
  if (r.err) return { ok: false, err: true, msg: r.err };
  const u = r.v, w = ex.value;
  if (ex.mode === 'prop') {
    if (isZero(u)) return { ok: false, msg: 'El vector nulo no sirve.' };
    if (isPar(u, w)) return { ok: true };
    return { ok: false, msg: ex.failMsg || 'No es el vector pedido. Revisa los cálculos.' };
  }
  const tolOf = (i) => (r.dec[i] >= 0 ? 0.5 * Math.pow(10, -r.dec[i]) + 1e-9 : Z * Math.max(1, Math.abs(w[i])));
  if (u.every((x, i) => Math.abs(x - w[i]) <= tolOf(i))) {
    const approx = r.dec.some((q, i) => q >= 0 && Math.abs(u[i] - w[i]) > Z * Math.max(1, Math.abs(w[i])));
    return approx ? { ok: true, approx: true } : { ok: true };
  }
  if (u.every((x, i) => Math.abs(x + w[i]) <= tolOf(i))) return { ok: false, msg: ex.negMsg || 'Casi: tienes el opuesto. Revisa los signos (¿final − inicio?).' };
  if (!isZero(u) && !isZero(w) && isPar(u, w)) return { ok: false, msg: 'Va en la dirección correcta, pero el tamaño no coincide.' };
  return { ok: false, msg: ex.failMsg || 'No coincide. Revisa los cálculos.' };
}
function checkPlane(ex, input) {
  input = String(input || '').trim();
  if (!input) return { ok: false, empty: true, msg: 'Escribe tu respuesta.' };
  const r = parsePlane(input);
  if (r.err) return { ok: false, err: true, msg: r.err };
  const e = ex.plane, en = [e[0], e[1], e[2]];
  const parallel = isPar(r.n, en);
  if (parallel) {
    let i = 0; for (let k = 1; k < 3; k++) if (Math.abs(en[k]) > Math.abs(en[i])) i = k;
    const k = r.n[i] / en[i];
    if (Math.abs(r.D - k * e[3]) <= Z * Math.max(1, Math.abs(r.D), Math.abs(k * e[3])) * 10) return { ok: true };
    return { ok: false, msg: 'Casi: el vector normal es correcto, pero el término independiente no. ' + (planeViolation(r.n, r.D, ex.cons) || 'Tu plano no pasa por donde debe.') };
  }
  return { ok: false, msg: planeViolation(r.n, r.D, ex.cons) || 'No coincide. Comprueba el vector normal del plano.' };
}
function checkLine(ex, input) {
  input = String(input || '').trim();
  if (!input) return { ok: false, empty: true, msg: 'Escribe tu respuesta.' };
  const r = parseLine(input);
  if (r.err) return { ok: false, err: true, msg: r.err };
  const forms = ex.form ? [].concat(ex.form) : null;
  if (forms && !forms.includes(r.form)) return { ok: false, err: true, msg: 'Pide la forma ' + forms.map((f) => FORMS[f]).join(' o ') + '.' };
  const dirOk = isPar(r.d, ex.d), onLine = nrm(cross(sub(r.P, ex.P), ex.d)) <= 1e-7 * nrm(ex.d) * (nrm(sub(r.P, ex.P)) + 1);
  if (dirOk && onLine) return { ok: true };
  const v = lineViolation(r.P, r.d, ex.cons);
  if (dirOk) return { ok: false, msg: 'La dirección es correcta, pero la recta no pasa por el punto que toca.' + (v ? ' ' + v : '') };
  if (onLine) return { ok: false, msg: 'Pasa por el punto correcto, pero el vector director no es el pedido.' + (v ? ' ' + v : '') };
  return { ok: false, msg: v || 'No coincide. Revisa el punto y el vector director.' };
}

/* ---------- vista previa ---------- */
function rat(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return [Math.round(v), 1];
  for (let d = 2; d <= 1000; d++) { const n = Math.round(v * d); if (Math.abs(v - n / d) < 1e-9) return [n, d]; }
  return null;
}
function qTex(v) {
  if (Math.abs(v) < 1e-12) return '0';
  const r = rat(v);
  if (!r) return String(+v.toFixed(4)).replace('.', '{,}');
  return r[1] === 1 ? String(r[0]) : (r[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(r[0]) + '}{' + r[1] + '}';
}
function lfTex(a) {
  let s = '';
  for (const [k, sym] of [['x', 'x'], ['y', 'y'], ['z', 'z'], ['t', '\\lambda'], ['c', '']]) {
    const v = a[k]; if (Math.abs(v) < 1e-12) continue;
    const neg = v < 0, av = Math.abs(v);
    const body = sym === '' ? qTex(av) : Math.abs(av - 1) < 1e-12 ? sym : qTex(av) + sym;
    s += s === '' ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
  }
  return s || '0';
}
const tupTex = (v) => '\\left(' + v.map(qTex).join(',\\,') + '\\right)';
function previewVec(input) {
  if (!String(input).trim()) return { ok: true, tex: '' };
  const r = parseVec(input); if (r.err) return { ok: false, msg: r.err };
  return { ok: true, tex: tupTex(r.v) };
}
function previewPlane(input) {
  if (!String(input).trim()) return { ok: true, tex: '' };
  let parts; try { parts = splitEq(tokenize(input)); } catch (e) { return { ok: false, msg: e.message }; }
  if (parts.length === 1) { try { const a = asScalar(evalTokens(parts[0])); return { ok: true, tex: lfTex(a) + ' = \\;?' }; } catch (e) { return { ok: false, msg: e.message }; } }
  const r = parsePlane(input); if (r.err) return { ok: false, msg: r.err };
  return { ok: true, tex: lfTex(r.L) + ' = ' + lfTex(r.R) };
}
function previewLine(input) {
  if (!String(input).trim()) return { ok: true, tex: '' };
  const r = parseLine(input); if (r.err) return { ok: false, msg: r.err };
  return { ok: true, tex: 'P' + tupTex(r.P) + ',\\ \\ \\vec{v}=' + tupTex(r.d) };
}

const baseCheck = E.check, basePreview = E.preview;
E.check = (ex, input) => (ex.kind === 'vec' ? checkVec(ex, input) : ex.kind === 'plane' ? checkPlane(ex, input) : ex.kind === 'line' ? checkLine(ex, input) : baseCheck(ex, input));
E.preview = (input, ex) => (ex && ex.kind === 'vec' ? previewVec(input) : ex && ex.kind === 'plane' ? previewPlane(input) : ex && ex.kind === 'line' ? previewLine(input) : basePreview(input));
E.Geo = { parseVec, parsePlane, parseLine, planeViolation, lineViolation, qTex, lfTex, tupTex, cross, dot, isPar, nrm, sub };
})(typeof window !== 'undefined' ? window : globalThis);

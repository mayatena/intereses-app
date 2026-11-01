/* Motor matemático: analizador de expresiones, evaluación numérica,
   conversión a LaTeX y comprobación de respuestas. Sin dependencias. */
(function (root) {
'use strict';

/* ---------- utilidades para generadores ---------- */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const asFr = (c) => Array.isArray(c) ? fr(c[0], c[1]) : fr(c, 1);
const fadd = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const fneg = (a) => [-a[0], a[1]];
const fsub = (a, b) => fadd(a, fneg(b));
const fstr = (a) => a[1] === 1 ? String(a[0]) : (a[0] < 0 ? '-' : '') + Math.abs(a[0]) + '/' + a[1];
const sgn = (v) => v < 0 ? -1 : 1;

// x, x^n (n=0 -> constante)
const xp = (n) => n === 0 ? '' : n === 1 ? 'x' : 'x^' + n;
const kx = (k) => k === 1 ? 'x' : k === -1 ? '-x' : k + '*x';
const ek = (k) => k === 1 ? 'e^x' : k === -1 ? 'e^(-x)' : 'e^(' + k + '*x)';
const xm = (a) => a === 0 ? 'x' : a > 0 ? 'x-' + a : 'x+' + (-a);
// coeficiente delante de un cuerpo
const cx = (a, body) => a === 1 ? body : a === -1 ? '-' + body : a + '*' + body;
// suma de términos [coef, cuerpo]; coef número o [n,d]; cuerpo '' = constante
function terms(list) {
  let out = '';
  for (const [c0, body] of list) {
    const c = asFr(c0);
    if (c[0] === 0) continue;
    const neg = c[0] < 0, n = Math.abs(c[0]), d = c[1];
    let s;
    if (body === '') s = d === 1 ? String(n) : '(' + n + '/' + d + ')';
    else if (n === 1 && d === 1) s = body;
    else if (d === 1) s = n + '*' + body;
    else s = '(' + n + '/' + d + ')*' + body;
    out += (out === '' ? (neg ? '-' : '') : (neg ? '-' : '+')) + s;
  }
  return out || '0';
}
// término "coef / den" (numerador c, denominador den); coef número o fracción
function ov(c0, den) {
  const c = asFr(c0);
  const d = c[1] === 1 ? den : '(' + c[1] + '*' + den + ')';
  return [sgn(c[0]), Math.abs(c[0]) + '/' + d];
}
const lin = (a, b) => terms([[a, 'x'], [b, '']]);
// elige un generador según el nivel d (0..1), de fácil a difícil
function byLevel(subs, d) {
  const i = Math.min(subs.length - 1, Math.floor((d * 0.75 + Math.random() * 0.4) * subs.length));
  return subs[Math.max(0, i)];
}

/* ---------- analizador ---------- */
const NAMES = ['arcsin', 'arccos', 'arctan', 'arcsen', 'arctg', 'asin', 'acos', 'atan', 'sqrt', 'raiz',
  'sin', 'sen', 'cos', 'tan', 'exp', 'log', 'abs', 'ln', 'tg', 'pi', 'x', 'e', 'c', 'k'];
const FUNCS = { sin: 'sin', sen: 'sin', cos: 'cos', tan: 'tan', tg: 'tan', ln: 'ln', log: 'ln', exp: 'exp',
  sqrt: 'sqrt', raiz: 'sqrt', abs: 'abs', arctan: 'atan', arctg: 'atan', atan: 'atan',
  arcsin: 'asin', arcsen: 'asin', asin: 'asin', arccos: 'acos', acos: 'acos' };

function tokenize(src) {
  const s = String(src).replace(/²/g, '^2').replace(/³/g, '^3').replace(/[·×]/g, '*').replace(/[−–]/g, '-')
    .replace(/÷/g, '/').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/,/g, '.').toLowerCase();
  const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const t = s.slice(i, j);
      if ((t.match(/\./g) || []).length > 1 || t === '.') throw new Error('Número mal escrito');
      out.push({ t: 'num', v: parseFloat(t) }); i = j; continue;
    }
    if ('+-*/^()|'.includes(ch)) { out.push({ t: ch }); i++; continue; }
    if (/[a-z]/.test(ch)) {
      const f = NAMES.find((n) => s.startsWith(n, i));
      if (!f) throw new Error('No entiendo «' + ch + '»');
      out.push({ t: 'id', v: f }); i += f.length; continue;
    }
    throw new Error('Símbolo no válido «' + ch + '»');
  }
  return out;
}

function parse(src) {
  const tk = tokenize(src); let p = 0, absDepth = 0;
  const peek = () => tk[p], next = () => tk[p++];
  const isStart = (t) => t && (t.t === 'num' || t.t === 'id' || t.t === '(' || (t.t === '|' && absDepth === 0));
  const closeParen = () => { if (!peek() || peek().t !== ')') throw new Error('Falta cerrar un paréntesis'); next(); };
  function expr() {
    let a = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const o = next().t; const b = term(); a = { k: o === '+' ? 'add' : 'sub', a, b };
    }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t && (t.t === '*' || t.t === '/')) { next(); const b = unary(); a = { k: t.t === '*' ? 'mul' : 'div', a, b }; }
      else if (isStart(t)) { const b = power(); a = { k: 'mul', a, b, imp: true }; }
      else break;
    }
    return a;
  }
  function unary() {
    const t = peek();
    if (t && t.t === '-') { next(); return { k: 'neg', a: unary() }; }
    if (t && t.t === '+') { next(); return unary(); }
    return power();
  }
  function power() {
    const a = atom();
    if (peek() && peek().t === '^') { next(); return { k: 'pow', a, b: unary() }; }
    return a;
  }
  function bare() {
    const t = peek();
    if (!t || !(t.t === 'num' || t.t === 'id' || t.t === '|')) throw new Error('Falta el argumento de la función');
    let a = power();
    for (;;) {
      const q = peek();
      if (q && (q.t === 'num' || (q.t === 'id' && !FUNCS[q.v]))) a = { k: 'mul', a, b: power(), imp: true };
      else break;
    }
    return a;
  }
  function atom() {
    const t = next();
    if (!t) throw new Error('Falta algo al final');
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === '(') { const e = expr(); closeParen(); return e; }
    if (t.t === '|') {
      absDepth++; const e = expr();
      if (!peek() || peek().t !== '|') throw new Error('Falta cerrar |…|');
      next(); absDepth--; return { k: 'fn', name: 'abs', a: e };
    }
    if (t.t === 'id') {
      if (t.v === 'x') return { k: 'var' };
      if (t.v === 'pi' || t.v === 'e') return { k: 'const', name: t.v };
      if (t.v === 'c' || t.v === 'k') return { k: 'const', name: 'c' };
      let ex = null;
      if (peek() && peek().t === '^') {
        next(); const q = next();
        if (!q || q.t !== 'num') throw new Error('Exponente no válido tras la función');
        ex = q.v;
      }
      let arg;
      if (peek() && peek().t === '(') { next(); arg = expr(); closeParen(); } else arg = bare();
      const node = { k: 'fn', name: FUNCS[t.v], a: arg };
      return ex !== null ? { k: 'pow', a: node, b: { k: 'num', v: ex } } : node;
    }
    throw new Error('Expresión mal formada');
  }
  const ast = expr();
  if (p < tk.length) throw new Error('Sobra «' + (tk[p].v !== undefined ? tk[p].v : tk[p].t) + '»');
  return ast;
}

/* ---------- evaluación ---------- */
function ev(n, x) {
  switch (n.k) {
    case 'num': return n.v;
    case 'var': return x;
    case 'const': return n.name === 'pi' ? Math.PI : n.name === 'e' ? Math.E : 0.7123;
    case 'neg': return -ev(n.a, x);
    case 'add': return ev(n.a, x) + ev(n.b, x);
    case 'sub': return ev(n.a, x) - ev(n.b, x);
    case 'mul': return ev(n.a, x) * ev(n.b, x);
    case 'div': return ev(n.a, x) / ev(n.b, x);
    case 'pow': return Math.pow(ev(n.a, x), ev(n.b, x));
    case 'fn': {
      const v = ev(n.a, x);
      switch (n.name) {
        case 'sin': return Math.sin(v); case 'cos': return Math.cos(v); case 'tan': return Math.tan(v);
        case 'ln': return v > 0 ? Math.log(v) : NaN; case 'exp': return Math.exp(v);
        case 'sqrt': return v >= 0 ? Math.sqrt(v) : NaN; case 'abs': return Math.abs(v);
        case 'atan': return Math.atan(v); case 'asin': return Math.asin(v); case 'acos': return Math.acos(v);
      }
    }
  }
  return NaN;
}
const fn = (src) => { const ast = typeof src === 'string' ? parse(src) : src; return (x) => ev(ast, x); };
function hasVar(n) {
  if (n.k === 'var') return true;
  return ['a', 'b'].some((q) => n[q] && hasVar(n[q]));
}
const deriv = (u, x) => { const h = 1e-5 * Math.max(1, Math.abs(x)); return (u(x + h) - u(x - h)) / (2 * h); };
function quad(f, a, b, n = 4000) {
  const h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
const samplePts = (dom) => [0.07, 0.19, 0.33, 0.47, 0.61, 0.78, 0.93].map((t) => dom[0] + (dom[1] - dom[0]) * t);

/* ---------- LaTeX ---------- */
const FN_TEX = { sin: '\\operatorname{sen}', cos: '\\cos', tan: '\\operatorname{tg}', ln: '\\ln',
  atan: '\\operatorname{arctg}', asin: '\\operatorname{arcsen}', acos: '\\arccos' };
const numTex = (v) => Number.isInteger(v) ? String(v) : String(+v.toFixed(6)).replace('.', '{,}');
function isNeg(n) {
  switch (n.k) { case 'neg': return true; case 'num': return n.v < 0; case 'mul': case 'div': return isNeg(n.a); default: return false; }
}
function stripNeg(n) {
  switch (n.k) {
    case 'neg': return n.a; case 'num': return { k: 'num', v: -n.v };
    case 'mul': case 'div': return Object.assign({}, n, { a: stripNeg(n.a) });
    default: return n;
  }
}
function prec(n) {
  switch (n.k) { case 'add': case 'sub': return 1; case 'neg': return 2; case 'mul': case 'div': return 3; case 'pow': case 'fn': return 4; default: return 5; }
}
const wrap = (n, need) => prec(n) < need ? '\\left(' + tx(n) + '\\right)' : tx(n);
const startsNum = (n) => n.k === 'num' || n.k === 'div' || ((n.k === 'pow' || n.k === 'mul') && startsNum(n.a));
function fnTex(n, sup) {
  const a = n.a;
  if (n.name === 'sqrt') return '\\sqrt{' + tx(a) + '}';
  if (n.name === 'abs') return '\\left|' + tx(a) + '\\right|';
  if (n.name === 'exp') return 'e^{' + tx(a) + '}';
  const nm = FN_TEX[n.name] + (sup || '');
  if (a.k === 'fn' && a.name === 'abs') return nm + tx(a);
  const atom = a.k === 'var' || a.k === 'num' || a.k === 'const';
  return nm + (atom ? '(' + tx(a) + ')' : '\\left(' + tx(a) + '\\right)');
}
function tx(n) {
  switch (n.k) {
    case 'num': return numTex(n.v);
    case 'var': return 'x';
    case 'const': return n.name === 'pi' ? '\\pi' : n.name === 'e' ? 'e' : 'C';
    case 'neg': return '-' + wrap(n.a, 3);
    case 'add': return tx(n.a) + (isNeg(n.b) ? ' - ' + wrap(stripNeg(n.b), 3) : ' + ' + tx(n.b));
    case 'sub': return tx(n.a) + ' - ' + wrap(n.b, 3);
    case 'mul':
      if (isNeg(n)) return '-' + wrap(stripNeg(n), 3);
      return wrap(n.a, 3) + (startsNum(n.b) ? '\\cdot ' : '') + wrap(n.b, 3);
    case 'div':
      if (isNeg(n)) return '-' + tx(stripNeg(n));
      return '\\frac{' + tx(n.a) + '}{' + tx(n.b) + '}';
    case 'pow': {
      const b = n.a;
      if (b.k === 'fn' && !['sqrt', 'abs', 'exp'].includes(b.name)) return fnTex(b, '^{' + tx(n.b) + '}');
      return wrap(b, 5) + '^{' + tx(n.b) + '}';
    }
    case 'fn': return fnTex(n);
  }
  return '';
}
const LATEX = (src) => tx(typeof src === 'string' ? parse(src) : src);
const L = (src) => '$' + LATEX(src) + '$';
function intTex(f, a, b) {
  const ast = parse(f);
  const sum = ast.k === 'add' || ast.k === 'sub' || (ast.k === 'neg' && (ast.a.k === 'add' || ast.a.k === 'sub'));
  const body = sum ? '\\left(' + tx(ast) + '\\right)' : tx(ast);
  const lim = a != null ? '_{' + LATEX(a) + '}^{' + LATEX(b) + '}' : '';
  return '\\int' + lim + ' ' + body + '\\,dx';
}

/* ---------- comprobación de respuestas ---------- */
function preview(input) {
  if (!String(input).trim()) return { ok: true, tex: '' };
  try { return { ok: true, tex: LATEX(parse(input)) }; } catch (e) { return { ok: false, msg: e.message }; }
}

function check(ex, input) {
  input = String(input || '').trim();
  if (!input) return { ok: false, empty: true, msg: 'Escribe tu respuesta.' };
  let ast; try { ast = parse(input); } catch (e) { return { ok: false, err: true, msg: e.message }; }
  const u = (x) => ev(ast, x);

  if (ex.kind === 'num') {
    if (hasVar(ast)) return { ok: false, err: true, msg: 'Aquí la respuesta es un número, sin x.' };
    const t = fn(ex.value)(0), uv = u(0);
    if (!isFinite(uv)) return { ok: false, err: true, msg: 'Esa expresión no se puede calcular.' };
    if (Math.abs(uv - t) <= 1e-9 * Math.max(1, Math.abs(t))) return { ok: true };
    const ds = [...input.matchAll(/[.,](\d+)/g)].map((m) => m[1].length);
    if (ds.length) {
      const d = Math.max(...ds);
      if (Math.abs(uv - t) <= 0.5 * Math.pow(10, -d) + 1e-9) return { ok: true, approx: true };
    }
    if (Math.abs(uv + t) <= 1e-9 * Math.max(1, Math.abs(t))) return { ok: false, msg: 'Casi: revisa el signo.' };
    return { ok: false, msg: 'No coincide. Revisa los cálculos.' };
  }

  const f = fn(ex.f), pts = samplePts(ex.dom || [0.3, 2.5]);
  if (ex.kind === 'func') {
    for (const x of pts) {
      const a = u(x), b = f(x);
      if (!isFinite(a)) return { ok: false, msg: 'Tu expresión no está definida en parte del dominio.' };
      if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return { ok: false, msg: 'No es la derivada correcta.' };
    }
    return { ok: true };
  }
  // kind === 'anti': comprobar que F' = f
  const ratios = []; let bad = false;
  for (const x of pts) {
    const dv = deriv(u, x), fx = f(x);
    if (!isFinite(dv)) return { ok: false, msg: 'Tu expresión no está definida en parte del dominio (¿logaritmo de algo negativo?).' };
    const tol = 2e-5 * Math.max(1, Math.abs(fx), Math.abs(u(x)) * 1e-2);
    if (Math.abs(dv - fx) > tol) bad = true;
    if (Math.abs(fx) > 1e-6) ratios.push(dv / fx);
  }
  if (!bad) return { ok: true };
  if (ratios.length > 3) {
    const m = ratios.reduce((s, r) => s + r, 0) / ratios.length;
    if (ratios.every((r) => Math.abs(r - m) < 1e-4 * Math.abs(m)) && Math.abs(m - 1) > 1e-3) {
      return { ok: false, msg: 'Casi: al derivar tu resultado sale ' + (+m.toFixed(4)).toString().replace('.', ',') +
        ' veces el integrando. Revisa los coeficientes.' };
    }
  }
  return { ok: false, msg: 'No es una primitiva: al derivar tu resultado no sale el integrando.' };
}

root.Engine = { ri, pick, nz, gcd, fr, fadd, fmul, fneg, fsub, fstr, sgn, xp, kx, ek, xm, cx, terms, ov, lin, byLevel,
  parse, ev, fn, hasVar, deriv, quad, samplePts, LATEX, L, intTex, preview, check, tx };
})(typeof window !== 'undefined' ? window : globalThis);

/* Geometría I: vectores, producto vectorial y mixto, recta, plano, posiciones relativas */
(function (root) {
'use strict';
const E = root.Engine, G = root.G;
root.Topics = root.Topics || [];
const { ri, pick, nz, fr, fstr, byLevel } = E;
const { V, rvec, until, hasZero, primPlane, rawPlane, ft, tup, pt, vecT, m, pn, lx, planeTex, lineTex, pickForm, FORM_NAME, rad, radv, approx, block, Kit: K } = G;
const T = E.LATEX;
const crossTex = (u, v) => '\\left(' + [[1, 2], [2, 0], [0, 1]].map(([i, j]) => pn(u[i]) + '\\cdot' + pn(v[j]) + '-' + pn(u[j]) + '\\cdot' + pn(v[i])).join(',\\ ') + '\\right)';
const dotTex = (u, v) => [0, 1, 2].map((i) => pn(u[i]) + '\\cdot' + pn(v[i])).join('+');
const vmat = (a, b, c) => '\\begin{vmatrix}' + [a, b, c].map((r) => r.map(ft).join('&')).join('\\\\') + '\\end{vmatrix}';
const sarrus = (a, b, c) => a[0] * b[1] * c[2] + a[1] * b[2] * c[0] + a[2] * b[0] * c[1] - a[2] * b[1] * c[0] - a[0] * b[2] * c[1] - a[1] * b[0] * c[2];
const uv = (u, v) => block([vecT('u', u) + '\\qquad ' + vecT('v', v)]);
const R = (lvl) => (lvl < 0.4 ? 3 : lvl < 0.75 ? 4 : 5);
const gl = (subs) => (d) => byLevel(subs, d)(d);
const closeEnough = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/* ================= 1. Vectores y producto escalar ================= */
const VE = [
  (l) => { // componentes de AB
    const r = R(l), A = rvec(-r, r, false), B = until(() => rvec(-r, r, false), (b) => !V.eq(b, A)), u = V.sub(B, A);
    return K.vec(u, { prompt: 'Calcula las componentes del vector ' + m('\\vec{AB}') + '.', qtex: pt('A', A) + '\\qquad ' + pt('B', B), label: 'AB =',
      negMsg: 'Casi: ese es el vector BA, el opuesto. Se calcula extremo − origen.',
      hint: 'Se resta el origen al extremo: $\\vec{AB}=B-A$.',
      steps: ['$\\vec{AB}=B-A=' + tup(B) + '-' + tup(A) + '=' + tup(u) + '$'],
      ver: () => u.map((_, i) => B[i] - A[i]) });
  },
  (l) => { // punto medio
    const r = R(l) + 1, A = rvec(-r, r, false), B = until(() => rvec(-r, r, false), (b) => !V.eq(b, A));
    const M = A.map((a, i) => fr(a + B[i], 2));
    return K.vec(M, { prompt: 'Halla el punto medio del segmento ' + m('AB') + '.', qtex: pt('A', A) + '\\qquad ' + pt('B', B), label: 'M =',
      hint: 'Cada coordenada del punto medio es la media de las coordenadas de $A$ y $B$.',
      steps: ['$M=\\dfrac{A+B}{2}=\\left(' + A.map((a, i) => '\\dfrac{' + a + '+' + pn(B[i]) + '}{2}').join(',\\,') + '\\right)$'],
      ver: () => A.map((a, i) => (a + B[i]) / 2) });
  },
  (l) => { // producto escalar
    const r = R(l), u = rvec(-r, r), v = rvec(-r, r), dt = V.dot(u, v);
    return K.num(String(dt), { prompt: 'Calcula el producto escalar ' + m('\\vec u\\cdot\\vec v') + '.', qtex: vecT('u', u) + '\\qquad ' + vecT('v', v), label: 'u · v =',
      hint: 'Se multiplican las componentes una a una y se suman: $u_1v_1+u_2v_2+u_3v_3$.',
      steps: ['$\\vec u\\cdot\\vec v=' + dotTex(u, v) + '=' + dt + '$'], ansTex: '\\vec u\\cdot\\vec v=' + dt,
      ver: () => u[0] * v[0] + u[1] * v[1] + u[2] * v[2] });
  },
  (l) => { // módulo
    const r = R(l), u = rvec(-r - 1, r + 1), N = V.n2(u), val = rad(1, 1, N), sq = G.sqf(N)[0] > 1 || G.sqf(N)[1] === 1;
    return K.num(val, { prompt: 'Calcula el módulo del vector ' + m('\\vec u') + '. Puedes dejar la raíz.', qtex: vecT('u', u), label: '|u| =',
      hint: 'El módulo es $\\sqrt{u_1^2+u_2^2+u_3^2}$.',
      steps: ['$|\\vec u|=\\sqrt{' + u.map((c) => pn(c) + '^2').join('+') + '}=\\sqrt{' + N + '}' + (sq ? '=' + T(val) : '') + '$'],
      ansTex: '|\\vec u|=\\sqrt{' + N + '}' + (sq && T(val) !== '\\sqrt{' + N + '}' ? '=' + T(val) : ''),
      ver: () => Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]) });
  },
  () => { // vector unitario
    const Q = pick([[1, 2, 2], [2, 3, 6], [2, 4, 4], [1, 4, 8], [4, 4, 7], [2, 6, 9], [6, 6, 7], [3, 4, 12], [2, 10, 11]]);
    const mod = Math.round(Math.sqrt(V.n2(Q))), perm = [0, 1, 2].sort(() => Math.random() - 0.5);
    const u = perm.map((i) => Q[i] * pick([1, -1]));
    return K.vec(u.map((c) => fr(c, mod)), { prompt: 'Halla el vector unitario con la misma dirección y sentido que ' + m('\\vec u') + '.', qtex: vecT('u', u), label: 'û =',
      negMsg: 'Casi: tienes el de sentido contrario. Revisa los signos.', hint: 'Divide el vector entre su módulo: $\\hat u=\\dfrac{\\vec u}{|\\vec u|}$.',
      steps: ['$|\\vec u|=\\sqrt{' + u.map((c) => pn(c) + '^2').join('+') + '}=\\sqrt{' + V.n2(u) + '}=' + mod + '$', '$\\hat u=\\dfrac{\\vec u}{' + mod + '}=' + tup(u.map((c) => fr(c, mod))) + '$'],
      ver: () => { const n = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]); return u.map((c) => c / n); } });
  },
  (l) => { // perpendiculares: valor de k
    const j = ri(0, 2), r = R(l), u = rvec(-r, r, false), uj = pick(l < 0.5 ? [1, -1, 2, -2] : [1, -1, 2, -2, 3]);
    u[j] = uj; const v = rvec(-r, r, false);
    const s = [0, 1, 2].filter((i) => i !== j).reduce((a, i) => a + u[i] * v[i], 0), kf = fr(-s, uj), vk = v.map((c, i) => (i === j ? 'k' : c));
    const prod = [0, 1, 2].map((i) => pn(u[i]) + '\\cdot ' + (i === j ? 'k' : pn(v[i]))).join('+');
    return K.num(fstr(kf), { prompt: 'Halla el valor de ' + m('k') + ' para que ' + m('\\vec u') + ' y ' + m('\\vec v') + ' sean perpendiculares. Si no sale entero, da una fracción.',
      qtex: vecT('u', u) + '\\qquad ' + vecT('v', vk), label: 'k =',
      hint: 'Son perpendiculares cuando su producto escalar vale $0$.',
      steps: ['$\\vec u\\perp\\vec v\\iff\\vec u\\cdot\\vec v=0$', '$' + prod + '=' + lx([[uj, 'k'], [s, '']]) + '=0\\ \\Rightarrow\\ k=' + ft(kf) + '$'], ansTex: 'k=' + ft(kf),
      ver: () => { const w = v.slice(); w[j] = -s / uj; return u[0] * w[0] + u[1] * w[1] + u[2] * w[2] === 0 ? -s / uj : NaN; } });
  },
  (l) => { // ángulo entre vectores
    const r = R(l), [u, v] = until(() => [rvec(-r, r), rvec(-r, r)], ([a, b]) => !V.par(a, b) && V.dot(a, b) !== 0), dt = V.dot(u, v), n1 = V.n2(u), n2 = V.n2(v);
    const val = 'arccos(' + dt + '/sqrt(' + (n1 * n2) + '))*180/pi', deg = radv(val);
    return K.num(val, { prompt: 'Calcula el ángulo que forman ' + m('\\vec u') + ' y ' + m('\\vec v') + ', en grados y con dos decimales.', qtex: vecT('u', u) + '\\qquad ' + vecT('v', v), label: 'α (°) =',
      hint: 'Usa $\\cos\\alpha=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\,|\\vec v|}$ y después el arcocoseno.',
      steps: ['$\\vec u\\cdot\\vec v=' + dt + '$, $|\\vec u|=\\sqrt{' + n1 + '}$, $|\\vec v|=\\sqrt{' + n2 + '}$', '$\\cos\\alpha=\\dfrac{' + dt + '}{\\sqrt{' + n1 + '}\\sqrt{' + n2 + '}}\\ \\Rightarrow\\ \\alpha\\approx' + approx(deg) + '^\\circ$'],
      ansTex: '\\alpha\\approx' + approx(deg) + '^\\circ',
      ver: () => { const cr = V.cross(u, v); return Math.atan2(Math.sqrt(V.n2(cr)), V.dot(u, v)) * 180 / Math.PI; } });
  },
  (l) => { // cuarto vértice del paralelogramo
    const r = R(l), [A, B, C] = until(() => [rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false)], ([a, b, c]) => !V.par(V.sub(b, a), V.sub(c, a))), Dp = V.sub(V.add(A, C), B);
    return K.vec(Dp, { prompt: 'Los puntos ' + m('A') + ', ' + m('B') + ' y ' + m('C') + ' son tres vértices consecutivos de un paralelogramo ' + m('ABCD') + '. Halla ' + m('D') + '.',
      qtex: pt('A', A) + '\\quad ' + pt('B', B) + '\\quad ' + pt('C', C), label: 'D =',
      hint: 'En un paralelogramo $\\vec{AD}=\\vec{BC}$, luego $D=A+\\vec{BC}$.',
      steps: ['$\\vec{BC}=C-B=' + tup(V.sub(C, B)) + '$', '$D=A+\\vec{BC}=' + tup(A) + '+' + tup(V.sub(C, B)) + '=' + tup(Dp) + '$'],
      ver: () => A.map((a, i) => 2 * ((a + C[i]) / 2) - B[i]) });
  },
];

/* ================= 2. Producto vectorial y mixto ================= */
const PR = [
  (l) => { const r = R(l), [u, v] = until(() => [rvec(-r, r), rvec(-r, r)], ([a, b]) => !V.par(a, b)), w = V.cross(u, v);
    return K.vec(w, { prompt: 'Calcula el producto vectorial ' + m('\\vec u\\times\\vec v') + '.', qtex: vecT('u', u) + '\\qquad ' + vecT('v', v), label: 'u × v =',
      negMsg: 'Casi: tienes v × u, que es el opuesto. El orden importa.',
      hint: 'Desarrolla el determinante: $\\begin{vmatrix}\\vec i&\\vec j&\\vec k\\\\u_1&u_2&u_3\\\\v_1&v_2&v_3\\end{vmatrix}$.',
      steps: ['$\\vec u\\times\\vec v=' + vmat(['\\vec i', '\\vec j', '\\vec k'], u, v) + '$', '$=' + crossTex(u, v) + '=' + tup(w) + '$'],
      ver: () => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]] });
  },
  (l) => { const r = R(l), [u, v] = until(() => [rvec(-r, r), rvec(-r, r)], ([a, b]) => !V.par(a, b)), w = V.cross(u, v);
    return K.vec(V.prim(w), { mode: 'prop', failMsg: 'Ese vector no es perpendicular a los dos a la vez. Pista: producto vectorial.', prompt: 'Halla un vector perpendicular a ' + m('\\vec u') + ' y a ' + m('\\vec v') + '. Vale cualquier múltiplo.',
      qtex: vecT('u', u) + '\\qquad ' + vecT('v', v), label: 'w =',
      hint: 'El producto vectorial $\\vec u\\times\\vec v$ es perpendicular a ambos.',
      steps: ['$\\vec u\\times\\vec v=' + crossTex(u, v) + '=' + tup(w) + '$', 'Cualquier múltiplo suyo también vale; por ejemplo ' + m(tup(V.prim(w))) + '.'],
      res: () => V.dot(w, u) + V.dot(w, v) });
  },
  (l) => { const r = R(l), [u, v] = until(() => [rvec(-r, r), rvec(-r, r)], ([a, b]) => !V.par(a, b)), w = V.cross(u, v), N = V.n2(w), val = rad(1, 1, N);
    return K.num(val, { prompt: 'Calcula el área del paralelogramo que forman ' + m('\\vec u') + ' y ' + m('\\vec v') + '. Puedes dejar la raíz.', qtex: vecT('u', u) + '\\qquad ' + vecT('v', v), label: 'Área =',
      hint: 'El área es el módulo del producto vectorial: $|\\vec u\\times\\vec v|$.',
      steps: ['$\\vec u\\times\\vec v=' + tup(w) + '$', '$\\text{Área}=|\\vec u\\times\\vec v|=\\sqrt{' + N + '}' + (T(val) !== '\\sqrt{' + N + '}' ? '=' + T(val) : '') + '$'],
      ansTex: '\\text{Área}=' + T(val), ver: () => { const a = Math.sqrt(V.n2(u)), b = Math.sqrt(V.n2(v)), c = V.dot(u, v) / (a * b); return a * b * Math.sqrt(1 - c * c); } });
  },
  (l) => { const r = R(l), [u, v, w] = until(() => [rvec(-r, r), rvec(-r, r), rvec(-r, r)], ([a, b, c]) => sarrus(a, b, c) !== 0), dt = sarrus(u, v, w);
    return K.num(String(dt), { prompt: 'Calcula el producto mixto ' + m('[\\vec u,\\vec v,\\vec w]') + '.', qtex: vecT('u', u) + '\\quad ' + vecT('v', v) + '\\quad ' + vecT('w', w), label: '[u, v, w] =',
      hint: 'Es el determinante de las tres filas: $[\\vec u,\\vec v,\\vec w]=\\vec u\\cdot(\\vec v\\times\\vec w)$.',
      steps: ['$[\\vec u,\\vec v,\\vec w]=' + vmat(u, v, w) + '=' + dt + '$'], ansTex: '[\\vec u,\\vec v,\\vec w]=' + dt, ver: () => sarrus(u, v, w) });
  },
  (l) => { const r = R(l), [A, B, C] = until(() => [rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false)], ([a, b, c]) => !V.par(V.sub(b, a), V.sub(c, a))),
      u = V.sub(B, A), v = V.sub(C, A), w = V.cross(u, v), N = V.n2(w), val = rad(1, 2, N);
    return K.num(val, { prompt: 'Calcula el área del triángulo de vértices ' + m('A') + ', ' + m('B') + ' y ' + m('C') + '. Puedes dejar la raíz.', qtex: pt('A', A) + '\\quad ' + pt('B', B) + '\\quad ' + pt('C', C), label: 'Área =',
      hint: 'El área del triángulo es la mitad del módulo de $\\vec{AB}\\times\\vec{AC}$.',
      steps: ['$\\vec{AB}=' + tup(u) + '$, $\\vec{AC}=' + tup(v) + '$', '$\\vec{AB}\\times\\vec{AC}=' + tup(w) + '$', '$\\text{Área}=\\dfrac{1}{2}\\sqrt{' + N + '}=' + T(val) + '$'], ansTex: '\\text{Área}=' + T(val),
      ver: () => { const a = Math.sqrt(V.n2(u)), b = Math.sqrt(V.n2(v)), c = Math.sqrt(V.n2(V.sub(C, B))), s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); } });
  },
  (l) => { const r = R(l), [A, B, C, D] = until(() => [rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false)], ([a, b, c, d]) => sarrus(V.sub(b, a), V.sub(c, a), V.sub(d, a)) !== 0),
      u = V.sub(B, A), v = V.sub(C, A), w = V.sub(D, A), dt = sarrus(u, v, w), val = fstr(fr(Math.abs(dt), 6));
    return K.num(val, { prompt: 'Calcula el volumen del tetraedro de vértices ' + m('A') + ', ' + m('B') + ', ' + m('C') + ' y ' + m('D') + '. Si no sale entero, da una fracción.',
      qtex: pt('A', A) + '\\quad ' + pt('B', B) + '\\quad ' + pt('C', C) + '\\quad ' + pt('D', D), label: 'Volumen =',
      hint: 'El volumen del tetraedro es $\\frac{1}{6}\\left|[\\vec{AB},\\vec{AC},\\vec{AD}]\\right|$.',
      steps: ['$\\vec{AB}=' + tup(u) + '$, $\\vec{AC}=' + tup(v) + '$, $\\vec{AD}=' + tup(w) + '$', '$[\\vec{AB},\\vec{AC},\\vec{AD}]=' + vmat(u, v, w) + '=' + dt + '$', '$V=\\dfrac{|' + dt + '|}{6}=' + ft(fr(Math.abs(dt), 6)) + '$'],
      ansTex: 'V=' + ft(fr(Math.abs(dt), 6)), ver: () => Math.abs(sarrus(u, v, w)) / 6 });
  },
  (l) => { // vectores coplanarios
    const r = R(l), [u, v] = until(() => [rvec(-r, r), rvec(-r, r)], ([a, b]) => !V.par(a, b)), c = V.cross(u, v), i = until(() => ri(0, 2), (q) => c[q] !== 0);
    const al = pick([-2, -1, 1, 2]), be = pick([-2, -1, 1, 2]), w = u.map((x, q) => al * x + be * v[q]), k = w[i], wk = w.map((x, q) => (q === i ? 'k' : x));
    const rest = [0, 1, 2].filter((q) => q !== i).reduce((s, q) => s + c[q] * w[q], 0);
    return K.num(String(k), { prompt: 'Halla ' + m('k') + ' para que los vectores ' + m('\\vec u') + ', ' + m('\\vec v') + ' y ' + m('\\vec w') + ' sean coplanarios.',
      qtex: vecT('u', u) + '\\quad ' + vecT('v', v) + '\\quad ' + vecT('w', wk), label: 'k =',
      hint: 'Son coplanarios cuando su producto mixto vale $0$: el determinante de los tres vectores.',
      steps: ['$' + vmat(u, v, wk) + '=0$', 'Desarrollando: $' + lx([[c[i], 'k'], [rest, '']]) + '=0\\ \\Rightarrow\\ k=' + k + '$'], ansTex: 'k=' + k,
      res: () => { const ww = w.slice(); ww[i] = k; return sarrus(u, v, ww); } });
  },
];

/* ================= 3. Ecuaciones de la recta ================= */
const PH = { vec: '(x,y,z) = (…) + λ(…)', param: 'x = …; y = …; z = …', cont: '(x−a)/p = (y−b)/q = (z−c)/r', impl: 'ax+by+cz+d = 0; …' };
const lineData = (l, dirOk) => { const r = R(l); return { P: rvec(-r, r, false), d: until(() => rvec(-r + 1, r - 1 || 1), dirOk || (() => true)) }; };
const RE = [
  (l) => { // recta por dos puntos
    const r = R(l), A = rvec(-r, r, false), B = until(() => rvec(-r, r, false), (b) => !V.eq(b, A)), d = V.sub(B, A);
    return K.line(A, d, { prompt: 'Escribe una ecuación de la recta ' + m('r') + ' que pasa por ' + m('A') + ' y ' + m('B') + ', en la forma que prefieras.', qtex: pt('A', A) + '\\qquad ' + pt('B', B),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'pass', P: B, n: 'B' }],
      hint: 'Un vector director es $\\vec{AB}=B-A$. Con él y un punto ya tienes la recta.',
      steps: ['Vector director: $\\vec{AB}=B-A=' + tup(d) + '$', 'Con el punto $A$: $r:\\ (x,y,z)=' + tup(A) + '+\\lambda' + tup(d) + '$'] });
  },
  (l) => { // pertenencia de un punto: hallar a
    const { P, d } = lineData(l), form = pick(hasZero(d) ? ['param', 'vec'] : ['param', 'vec', 'cont']);
    const [j, i] = until(() => [ri(0, 2), ri(0, 2)], ([a, b]) => a !== b && d[b] !== 0), t0 = nz(-2, 2), Q = V.add(P, V.mul(t0, d)), nm = 'xyz';
    const Qm = Q.map((c, q) => (q === j ? 'a' : c));
    return K.num(String(Q[j]), { prompt: 'Halla el valor de ' + m('a') + ' para que el punto ' + m('Q') + ' pertenezca a la recta ' + m('r') + '.', qtex: block([lineTex('r', P, d, form), pt('Q', Qm)]), label: 'a =',
      hint: 'Con una coordenada que ya conozcas, calcula el valor de $\\lambda$; después úsalo en la coordenada que falta.',
      steps: ['Pasamos $r$ a paramétricas: $' + nm.split('').map((v, q) => v + '=' + lx([[P[q], ''], [d[q], '\\lambda']])).join(',\\ ') + '$',
        'Con la coordenada ' + nm[i] + ': $' + Q[i] + '=' + lx([[P[i], ''], [d[i], '\\lambda']]) + '\\ \\Rightarrow\\ \\lambda=' + t0 + '$',
        'Entonces $' + nm[j] + '=' + P[j] + (d[j] < 0 ? '-' : '+') + Math.abs(d[j]) + '\\cdot' + pn(t0) + '=' + Q[j] + '$, es decir, $a=' + Q[j] + '$.'], ansTex: 'a=' + Q[j],
      ver: () => { const t = (Q[i] - P[i]) / d[i]; return P[j] + t * d[j]; } });
  },
  (l) => { // vector director a partir de las ecuaciones implícitas
    const { P, d } = lineData(l), [n1, n2] = G.implPlanes(P, d), w = V.cross(n1.slice(0, 3), n2.slice(0, 3));
    return K.vec(V.prim(w), { mode: 'prop', failMsg: 'Ese vector no es un vector director. Pista: es perpendicular a los dos vectores normales de los planos.', prompt: 'Halla un vector director de la recta ' + m('r') + '. Vale cualquier múltiplo.',
      qtex: lineTex('r', P, d, 'impl'), label: 'v =',
      hint: 'La recta está en los dos planos, así que su dirección es perpendicular a ambos vectores normales: $\\vec n_1\\times\\vec n_2$.',
      steps: ['Normales: $\\vec n_1=' + tup(n1.slice(0, 3)) + '$, $\\vec n_2=' + tup(n2.slice(0, 3)) + '$', '$\\vec v=\\vec n_1\\times\\vec n_2=' + crossTex(n1.slice(0, 3), n2.slice(0, 3)) + '=' + tup(w) + '$'],
      res: () => V.dot(w, n1.slice(0, 3)) + V.dot(w, n2.slice(0, 3)) });
  },
  (l) => { // cambio de forma
    const forms = ['vec', 'param', 'cont', 'impl'], src = pick(forms), dst = pick(forms.filter((f) => f !== src)), needNZ = src === 'cont' || dst === 'cont';
    const { P, d: d0 } = lineData(l, (v) => !needNZ || !hasZero(v));
    let d = d0, st = [];
    const ax = 'xyz';
    if (src === 'impl') {
      const [n1, n2] = G.implPlanes(P, d0), w = V.prim(V.cross(n1.slice(0, 3), n2.slice(0, 3))); d = w;
      st = ['Vector director: $\\vec d=\\vec n_1\\times\\vec n_2=' + crossTex(n1.slice(0, 3), n2.slice(0, 3)) + '=' + tup(V.cross(n1.slice(0, 3), n2.slice(0, 3))) + '$', 'Un punto de la recta (que cumple las dos ecuaciones): $P' + tup(P) + '$'];
    } else if (src === 'cont') st = ['Cada fracción es $\\dfrac{x-a}{p}$: el punto es $P' + tup(P) + '$ (los números que se restan) y el vector es $\\vec d=' + tup(d) + '$ (los denominadores).'];
    else st = ['Leemos un punto $P' + tup(P) + '$ y el vector director $\\vec d=' + tup(d) + '$ (los coeficientes de $\\lambda$).'];
    const how = { vec: '$(x,y,z)=P+\\lambda\\vec d$', param: '$x=p_1+\\lambda d_1,\\ y=p_2+\\lambda d_2,\\ z=p_3+\\lambda d_3$', cont: '$\\dfrac{x-p_1}{d_1}=\\dfrac{y-p_2}{d_2}=\\dfrac{z-p_3}{d_3}$',
      impl: 'dos ecuaciones de planos que contengan la recta (eliminando $\\lambda$ o con dos vectores normales perpendiculares a $\\vec d$)' };
    st.push('Escribimos en forma ' + FORM_NAME[dst] + ': ' + how[dst] + '.');
    const o = K.line(P, d, { form: dst, sol: G.lineStr(P, d, dst), ph: PH[dst], prompt: 'Escribe la recta ' + m('r') + ' en forma ' + FORM_NAME[dst] + '.', qtex: lineTex('r', P, d0, src), ansTex: lineTex('r', P, d, dst),
      hint: 'Primero identifica un punto y el vector director; con ellos puedes escribir cualquier forma.', steps: st });
    return o;
  },
];

/* ================= 4. Ecuación del plano ================= */
const PA = [
  (l) => { const r = R(l), P = rvec(-r, r, false), n = rvec(-r, r), p = rawPlane(n, P);
    return K.plane(p, { prompt: 'Escribe la ecuación general del plano ' + m('\\pi') + ' que pasa por ' + m('A') + ' y tiene vector normal ' + m('\\vec n') + '.', qtex: pt('A', P) + '\\qquad ' + vecT('n', n),
      cons: [{ t: 'pass', P, n: 'A' }, { t: 'perpLine', d: n, n: 'el vector n' }],
      hint: 'Si $\\vec n=(a,b,c)$, el plano es $ax+by+cz+d=0$. Para hallar $d$, sustituye el punto $A$.',
      steps: ['El vector normal da los coeficientes: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$', 'Imponemos que pasa por $A$: $' + [0, 1, 2].map((i) => pn(n[i]) + '\\cdot' + pn(P[i])).join('+') + '+d=0$', 'Luego $d=' + (-V.dot(n, P)) + '$.'] });
  },
  (l) => { // valor de k para que pase por un punto
    const r = R(l), P = rvec(-r, r, false), n = rvec(-r, r), k = -V.dot(n, P);
    return K.num(String(k), { prompt: 'Halla el valor de ' + m('k') + ' para que el plano pase por el punto ' + m('A') + '.', qtex: block(['\\pi:\\ ' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['k', '']]) + '=0', pt('A', P)]), label: 'k =',
      hint: 'Si el punto está en el plano, sus coordenadas cumplen la ecuación.',
      steps: ['Sustituimos $A$: $' + [0, 1, 2].map((i) => pn(n[i]) + '\\cdot' + pn(P[i])).join('+') + '+k=0$', '$' + V.dot(n, P) + '+k=0\\ \\Rightarrow\\ k=' + k + '$'], ansTex: 'k=' + k,
      res: () => k + n[0] * P[0] + n[1] * P[1] + n[2] * P[2] });
  },
  (l) => { const r = R(l), [A, B, C] = until(() => [rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false)], ([a, b, c]) => !V.par(V.sub(b, a), V.sub(c, a))),
      u = V.sub(B, A), v = V.sub(C, A), n = V.cross(u, v), p = rawPlane(n, A);
    return K.plane(p, { prompt: 'Halla la ecuación general del plano que pasa por los puntos ' + m('A') + ', ' + m('B') + ' y ' + m('C') + '.', qtex: pt('A', A) + '\\quad ' + pt('B', B) + '\\quad ' + pt('C', C),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'pass', P: B, n: 'B' }, { t: 'pass', P: C, n: 'C' }],
      hint: 'Dos vectores del plano son $\\vec{AB}$ y $\\vec{AC}$; su producto vectorial es un vector normal.',
      steps: ['$\\vec{AB}=' + tup(u) + '$, $\\vec{AC}=' + tup(v) + '$', 'Normal: $\\vec n=\\vec{AB}\\times\\vec{AC}=' + tup(n) + '$', 'Plano: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$ y, como pasa por $A$, $d=' + (-V.dot(n, A)) + '$.'] });
  },
  (l) => { const r = R(l), P = rvec(-r, r, false), [u, v] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), n = V.cross(u, v), p = rawPlane(n, P);
    return K.plane(p, { prompt: 'Halla la ecuación general del plano que pasa por ' + m('A') + ' y contiene a las direcciones ' + m('\\vec u') + ' y ' + m('\\vec v') + '.', qtex: pt('A', P) + '\\quad ' + vecT('u', u) + '\\quad ' + vecT('v', v),
      cons: [{ t: 'pass', P, n: 'A' }, { t: 'parallelLine', d: u, n: 'el vector u' }, { t: 'parallelLine', d: v, n: 'el vector v' }],
      hint: 'El vector normal es perpendicular a $\\vec u$ y a $\\vec v$: $\\vec n=\\vec u\\times\\vec v$.',
      steps: ['$\\vec n=\\vec u\\times\\vec v=' + crossTex(u, v) + '=' + tup(n) + '$', 'Plano: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$ y, como pasa por $A$, $d=' + (-V.dot(n, P)) + '$.'] });
  },
  (l) => { // paramétricas -> general
    const r = R(l), P = rvec(-r, r, false), [u, v] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), n = V.cross(u, v), p = rawPlane(n, P);
    const eqs = ['x', 'y', 'z'].map((q, i) => q + '=' + lx([[P[i], ''], [u[i], '\\lambda'], [v[i], '\\mu']]));
    return K.plane(p, { prompt: 'Escribe en forma general la ecuación del plano ' + m('\\pi') + '.', qtex: '\\pi:\\ \\begin{cases}' + eqs.join('\\\\') + '\\end{cases}',
      cons: [{ t: 'pass', P, n: 'el punto (' + P.join(', ') + ')' }, { t: 'parallelLine', d: u, n: 'el vector (' + u.join(', ') + ')' }, { t: 'parallelLine', d: v, n: 'el vector (' + v.join(', ') + ')' }],
      hint: 'Lee un punto y los dos vectores (coeficientes de $\\lambda$ y de $\\mu$). El normal es su producto vectorial.',
      steps: ['Punto: $A' + tup(P) + '$. Vectores: $\\vec u=' + tup(u) + '$, $\\vec v=' + tup(v) + '$.', '$\\vec n=\\vec u\\times\\vec v=' + tup(n) + '$', 'Plano: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$ con $d=' + (-V.dot(n, P)) + '$.'] });
  },
  (l) => { // corte con un eje
    const r = R(l), ax = ri(0, 2), n = until(() => rvec(-r, r), (q) => q[ax] !== 0), D = nz(-8, 8), nmAx = ['OX', 'OY', 'OZ'][ax];
    const pt3 = [0, 0, 0].map((_, i) => (i === ax ? fr(-D, n[ax]) : 0));
    return K.vec(pt3, { prompt: 'Halla el punto en que el plano ' + m('\\pi') + ' corta al eje ' + m(nmAx) + '.', qtex: '\\pi:\\ ' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [D, '']]) + '=0', label: 'Punto =',
      hint: 'Los puntos del eje ' + nmAx + ' tienen las otras dos coordenadas iguales a $0$.',
      steps: ['En el eje ' + nmAx + ': ' + m(['y=z=0', 'x=z=0', 'x=y=0'][ax]), 'Queda $' + lx([[n[ax], 'xyz'[ax]], [D, '']]) + '=0\\ \\Rightarrow\\ ' + 'xyz'[ax] + '=' + ft(fr(-D, n[ax])) + '$'],
      ver: () => { const q = [0, 0, 0]; q[ax] = -D / n[ax]; return Math.abs(n[0] * q[0] + n[1] * q[1] + n[2] * q[2] + D) < 1e-9 ? q : [NaN, NaN, NaN]; } });
  },
];

/* ================= 5. Posiciones relativas y puntos de corte ================= */
const stepsParam = (P, d, par, name) => '$' + name + ':\\ ' + 'xyz'.split('').map((q, i) => q + '=' + lx([[P[i], ''], [d[i], par]])).join(',\\ ') + '$';
const PO = [
  (l) => { // recta y plano: punto de corte
    const r = R(l) - 1 || 2, Q = rvec(-r, r, false), d = rvec(-2, 2), t0 = nz(-2, 2), P = V.sub(Q, V.mul(t0, d)), n = until(() => rvec(-3, 3), (q) => V.dot(q, d) !== 0), p = primPlane([n[0], n[1], n[2], -V.dot(n, Q)]);
    const form = pickForm(d, l), nn = [p[0], p[1], p[2]], nd = V.dot(nn, d), c0 = V.dot(nn, P) + p[3];
    return K.vec(Q, { prompt: 'Halla el punto de corte de la recta ' + m('r') + ' con el plano ' + m('\\pi') + '.', qtex: block([lineTex('r', P, d, form), '\\pi:\\ ' + planeTex(p)]), label: 'Punto =',
      hint: 'Escribe la recta en paramétricas y sustituye $x,y,z$ en la ecuación del plano: te queda una ecuación en $\\lambda$.',
      steps: [(form === 'param' ? 'Recta en paramétricas: ' : 'Pasamos la recta a paramétricas: ') + stepsParam(P, d, '\\lambda', 'r'), 'Sustituimos en el plano: $' + lx([[nd, '\\lambda'], [c0, '']]) + '=0\\ \\Rightarrow\\ \\lambda=' + t0 + '$', 'Volvemos a la recta con $\\lambda=' + t0 + '$: $' + tup(Q) + '$.'],
      ver: () => { const t = -c0 / nd; const q = P.map((a, i) => a + t * d[i]); return Math.abs(p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3]) < 1e-9 ? q : [NaN, NaN, NaN]; } });
  },
  (l) => { // dos rectas secantes: punto de corte
    const r = R(l) - 1 || 2, Q = rvec(-r, r, false), [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), a = nz(-2, 2), b = nz(-2, 2);
    const P1 = V.sub(Q, V.mul(a, d1)), P2 = V.sub(Q, V.mul(b, d2)), f1 = pickForm(d1, l), f2 = pickForm(d2, l);
    const eqs = [0, 1, 2].map((i) => lx([[P1[i], ''], [d1[i], '\\lambda']]) + '=' + lx([[P2[i], ''], [d2[i], '\\mu']]));
    return K.vec(Q, { prompt: 'Las rectas ' + m('r') + ' y ' + m('s') + ' se cortan. Halla el punto de corte.', qtex: block([lineTex('r', P1, d1, f1), lineTex('s', P2, d2, f2, '\\mu')]), label: 'Punto =',
      hint: 'Pasa las dos a paramétricas, con parámetros distintos ($\\lambda$ y $\\mu$), e iguala coordenada a coordenada.',
      steps: ['Paramétricas: ' + stepsParam(P1, d1, '\\lambda', 'r') + ' y ' + stepsParam(P2, d2, '\\mu', 's'), 'Igualamos coordenadas: $\\begin{cases}' + eqs.join('\\\\') + '\\end{cases}$', 'Resolviendo el sistema: $\\lambda=' + a + '$, $\\mu=' + b + '$.', 'Punto: $' + tup(Q) + '$.'],
      ver: () => { const p1 = P1.map((c, i) => c + a * d1[i]), p2 = P2.map((c, i) => c + b * d2[i]); return p1.every((c, i) => c === p2[i]) ? p1 : [NaN, NaN, NaN]; } });
  },
  (l) => { // tres planos: punto común
    const r = R(l) - 1 || 2, Q = rvec(-r, r, false), M = until(() => [rvec(-2, 3), rvec(-2, 3), rvec(-2, 3)], (q) => { const dd = sarrus(q[0], q[1], q[2]); return dd !== 0 && Math.abs(dd) <= 12; });
    const D = M.map((n) => -V.dot(n, Q)), b = D.map((x) => -x), det = sarrus(M[0], M[1], M[2]);
    const col = (c) => M.map((n, i) => n.map((x, k) => (k === c ? b[i] : x)));
    const dets = [0, 1, 2].map((c) => { const q = col(c); return sarrus(q[0], q[1], q[2]); });
    return K.vec(Q, { prompt: 'Halla el punto común a los tres planos.', qtex: '\\begin{cases}' + M.map((n, i) => lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z']]) + '=' + b[i]).join('\\\\') + '\\end{cases}', label: 'Punto =',
      hint: 'Es un sistema de tres ecuaciones con tres incógnitas: resuélvelo por reducción o con la regla de Cramer.',
      steps: ['Determinante del sistema: $\\Delta=' + vmat(M[0], M[1], M[2]) + '=' + det + '\\neq0$ (sistema compatible determinado).', 'Regla de Cramer: $x=\\dfrac{' + dets[0] + '}{' + det + '}=' + Q[0] + '$, $y=\\dfrac{' + dets[1] + '}{' + det + '}=' + Q[1] + '$, $z=\\dfrac{' + dets[2] + '}{' + det + '}=' + Q[2] + '$.'],
      ver: () => M.every((n, i) => n[0] * Q[0] + n[1] * Q[1] + n[2] * Q[2] === b[i]) ? Q : [NaN, NaN, NaN] });
  },
  (l) => { // posición relativa de dos rectas (código)
    const r = R(l) - 1 || 2, kind = pick([1, 1, 2, 3, 4, 4]); let P1 = rvec(-r, r, false), P2, d1 = rvec(-2, 2), d2;
    if (kind === 1) { const Q = rvec(-r, r, false); d2 = until(() => rvec(-2, 2), (q) => !V.par(q, d1)); P1 = V.sub(Q, V.mul(nz(-2, 2), d1)); P2 = V.sub(Q, V.mul(nz(-2, 2), d2)); }
    else if (kind === 2) { d2 = V.mul(pick([-2, -1, 2, 3]), d1); P2 = until(() => rvec(-r, r, false), (q) => !V.par(V.sub(q, P1), d1)); }
    else if (kind === 3) { d2 = V.mul(pick([-2, -1, 2, 3]), d1); P2 = V.add(P1, V.mul(nz(-2, 2), d1)); }
    else { d2 = until(() => rvec(-2, 2), (q) => !V.par(q, d1)); P2 = until(() => rvec(-r, r, false), (q) => sarrus(V.sub(q, P1), d1, d2) !== 0); }
    const f1 = pickForm(d1, l), f2 = pickForm(d2, l), w = V.sub(P2, P1), dt = sarrus(w, d1, d2);
    const ix = d1.findIndex((c) => c !== 0), kk = d2[ix] / d1[ix];
    const sol = { 1: ['Los vectores directores ' + m(tup(d1)) + ' y ' + m(tup(d2)) + ' no son proporcionales.', 'Comprobamos si son coplanarias: $[\\vec{P_1P_2},\\vec d_1,\\vec d_2]=' + dt + '=0$.', 'Son coplanarias y no paralelas: **se cortan**.'],
      2: ['Los vectores directores son proporcionales: $\\vec d_2=' + kk + '\\,\\vec d_1$.', 'El punto $P_2$ no está en $r$ ($\\vec{P_1P_2}$ no es paralelo a $\\vec d_1$): **paralelas**.'],
      3: ['Los vectores directores son proporcionales.', '$P_2$ pertenece a $r$: **coincidentes**.'],
      4: ['Los vectores directores no son proporcionales.', 'El producto mixto $[\\vec{P_1P_2},\\vec d_1,\\vec d_2]=' + dt + '\\neq0$: no son coplanarias, **se cruzan**.'] }[kind];
    return K.num(String(kind), { prompt: 'Estudia la posición relativa de ' + m('r') + ' y ' + m('s') + '. Escribe **1** si se cortan, **2** si son paralelas, **3** si coinciden y **4** si se cruzan.', qtex: block([lineTex('r', P1, d1, f1), lineTex('s', P2, d2, f2, '\\mu')]), label: 'Código =',
      hint: 'Compara los vectores directores. Si no son proporcionales, mira si las rectas son coplanarias con el producto mixto.', steps: sol, ansTex: '\\text{código }' + kind,
      ver: () => { // distancia mínima entre las rectas con búsqueda numérica
        const cr = V.cross(d1, d2); if (V.zero(cr)) { const c = V.cross(V.sub(P2, P1), d1); return V.zero(c) ? 3 : 2; }
        return Math.abs(V.dot(V.sub(P2, P1), cr)) / Math.sqrt(V.n2(cr)) < 1e-9 ? 1 : 4; } });
  },
  (l) => { // recta/plano y plano/plano: código
    const r = R(l) - 1 || 2, which = pick(['rp', 'rp', 'pp']);
    if (which === 'rp') {
      const kind = pick([1, 2, 3]), n = rvec(-3, 3); let P = rvec(-r, r, false), d, D;
      if (kind === 1) { d = until(() => rvec(-3, 3), (q) => V.dot(q, n) !== 0); D = nz(-6, 6); }
      else { d = V.cross(n, until(() => rvec(-2, 2), (q) => !V.par(q, n))); D = kind === 3 ? -V.dot(n, P) : until(() => nz(-6, 6), (q) => q !== -V.dot(n, P)); }
      const p = [n[0], n[1], n[2], D], form = pickForm(d, l), nd = V.dot(n, d), c0 = V.dot(n, P) + D;
      const sol = kind === 1 ? ['$\\vec n\\cdot\\vec d=' + dotTex(n, d) + '=' + nd + '\\neq0$: la recta no es paralela al plano.', '**Secantes**.']
        : ['$\\vec n\\cdot\\vec d=' + dotTex(n, d) + '=0$: la recta es paralela al plano (o está contenida).', 'Sustituimos un punto de la recta, $P' + tup(P) + '$, en el plano: $' + c0 + (kind === 3 ? '=0$: **contenida**.' : '\\neq0$: no está en el plano, **paralela**.')];
      return K.num(String(kind), { prompt: 'Estudia la posición relativa de la recta ' + m('r') + ' y el plano ' + m('\\pi') + '. Escribe **1** si son secantes, **2** si la recta es paralela al plano y **3** si está contenida en él.', qtex: block([lineTex('r', P, d, form), '\\pi:\\ ' + planeTex(p)]), label: 'Código =',
        hint: 'Mira el producto escalar del vector director con el normal del plano.', steps: sol, ansTex: '\\text{código }' + kind,
        ver: () => (V.dot(n, d) !== 0 ? 1 : (V.dot(n, P) + D === 0 ? 3 : 2)) });
    }
    const kind = pick([1, 2, 3]), n1 = rvec(-3, 3), D1 = nz(-6, 6); let n2, D2; const k = pick([-2, 2, 3, -1]);
    if (kind === 1) { n2 = until(() => rvec(-3, 3), (q) => !V.par(q, n1)); D2 = nz(-6, 6); } else { n2 = V.mul(k, n1); D2 = kind === 3 ? k * D1 : until(() => nz(-9, 9), (q) => q !== k * D1); }
    return K.num(String(kind), { prompt: 'Estudia la posición relativa de los planos ' + m('\\pi_1') + ' y ' + m('\\pi_2') + '. Escribe **1** si son secantes, **2** si son paralelos y **3** si coinciden.', qtex: block(['\\pi_1:\\ ' + planeTex([n1[0], n1[1], n1[2], D1]), '\\pi_2:\\ ' + planeTex([n2[0], n2[1], n2[2], D2])]), label: 'Código =',
      hint: 'Compara los coeficientes de $x$, $y$, $z$ y después los términos independientes.',
      steps: kind === 1 ? ['Los coeficientes de $x,y,z$ no son proporcionales: los vectores normales no son paralelos.', '**Secantes**.'] : ['Los coeficientes de $x,y,z$ son proporcionales: $\\vec n_2=' + k + '\\,\\vec n_1$.', kind === 3 ? 'El término independiente guarda la misma proporción: **coinciden**.' : 'El término independiente NO guarda la proporción: **paralelos**.'], ansTex: '\\text{código }' + kind,
      ver: () => { if (!V.par(n1, n2)) return 1; const q = [0, 1, 2].find((c) => n1[c] !== 0); return D2 * n1[q] === D1 * n2[q] ? 3 : 2; } });
  },
  (l) => { // parámetro m
    const r = R(l) - 1 || 2, kind = pick(['rp-par', 'rp-per', 'rr-par', 'pp-per']);
    if (kind === 'rp-par') {
      const d = rvec(-2, 2), n = V.cross(d, until(() => rvec(-2, 2), (q) => !V.par(q, d))), j = until(() => ri(0, 2), (q) => d[q] !== 0), P = rvec(-r, r, false), D = until(() => nz(-6, 6), (q) => V.dot(n, P) + q !== 0);
      const nm = n.map((c, i) => (i === j ? 'm' : c)), form = pick(['vec', 'vec', 'param']);
      return K.num(String(n[j]), { prompt: 'Halla ' + m('m') + ' para que la recta ' + m('r') + ' y el plano ' + m('\\pi') + ' sean paralelos.', qtex: block([lineTex('r', P, d, form), '\\pi:\\ ' + lx([[nm[0], 'x'], [nm[1], 'y'], [nm[2], 'z'], [D, '']]) + '=0']), label: 'm =',
        hint: 'Recta y plano son paralelos cuando el vector director es perpendicular al normal: $\\vec d\\cdot\\vec n=0$.',
        steps: ['$\\vec d=' + tup(d) + '$ y $\\vec n=' + tup(nm) + '$.', '$\\vec d\\cdot\\vec n=0\\ \\Rightarrow\\ ' + [0, 1, 2].map((i) => pn(d[i]) + '\\cdot ' + (i === j ? 'm' : pn(n[i]))).join('+') + '=0\\ \\Rightarrow\\ m=' + n[j] + '$'], ansTex: 'm=' + n[j],
        res: () => V.dot(d, n) });
    }
    if (kind === 'rp-per') {
      const [d, j, i] = until(() => { const dd = rvec(-2, 2), jj = ri(0, 2), ii = ri(0, 2); return [dd, jj, ii]; }, ([dd, jj, ii]) => jj !== ii && dd[jj] !== 0 && dd[ii] !== 0), k = pick([-2, -1, 1, 2]), n = V.mul(k, d), P = rvec(-r, r, false);
      const nm = n.map((c, q) => (q === j ? 'm' : c)), D = nz(-6, 6);
      return K.num(String(n[j]), { prompt: 'Halla ' + m('m') + ' para que la recta ' + m('r') + ' sea perpendicular al plano ' + m('\\pi') + '.', qtex: block([lineTex('r', P, d, 'vec'), '\\pi:\\ ' + lx([[nm[0], 'x'], [nm[1], 'y'], [nm[2], 'z'], [D, '']]) + '=0']), label: 'm =',
        hint: 'Son perpendiculares cuando el vector director y el normal son paralelos (proporcionales).',
        steps: ['$\\vec d=' + tup(d) + '$ y $\\vec n=' + tup(nm) + '$ deben ser proporcionales.', 'Con las coordenadas conocidas: $\\dfrac{' + n[i] + '}{' + d[i] + '}=' + k + '$, luego $m=' + k + '\\cdot' + pn(d[j]) + '=' + n[j] + '$.'], ansTex: 'm=' + n[j],
        ver: () => { const w = V.mul(k, d); return V.par(w, d) ? w[j] : NaN; } });
    }
    if (kind === 'rr-par') {
      const [d1, j, i] = until(() => [rvec(-2, 2), ri(0, 2), ri(0, 2)], ([dd, jj, ii]) => jj !== ii && dd[jj] !== 0 && dd[ii] !== 0), k = pick([-2, -1, 2, 3]), d2 = V.mul(k, d1), P1 = rvec(-r, r, false), P2 = rvec(-r, r, false);
      const d2m = d2.map((c, q) => (q === j ? 'm' : c));
      return K.num(String(d2[j]), { prompt: 'Halla ' + m('m') + ' para que las rectas ' + m('r') + ' y ' + m('s') + ' sean paralelas.', qtex: block([lineTex('r', P1, d1, 'vec'), lineTex('s', P2, d2m, 'vec', '\\mu')]), label: 'm =',
        hint: 'Son paralelas si sus vectores directores son proporcionales.',
        steps: ['$\\vec d_1=' + tup(d1) + '$ y $\\vec d_2=' + tup(d2m) + '$ deben ser proporcionales.', '$\\dfrac{' + d2[i] + '}{' + d1[i] + '}=' + k + '$, luego $m=' + k + '\\cdot' + pn(d1[j]) + '=' + d2[j] + '$.'], ansTex: 'm=' + d2[j],
        ver: () => { const w = V.mul(k, d1); return V.par(w, d1) ? w[j] : NaN; } });
    }
    const n1 = rvec(-3, 3), n2 = V.cross(n1, until(() => rvec(-2, 2), (q) => !V.par(q, n1))), j = until(() => ri(0, 2), (q) => n1[q] !== 0), n2m = n2.map((c, q) => (q === j ? 'm' : c));
    return K.num(String(n2[j]), { prompt: 'Halla ' + m('m') + ' para que los planos ' + m('\\pi_1') + ' y ' + m('\\pi_2') + ' sean perpendiculares.', qtex: block(['\\pi_1:\\ ' + planeTex([n1[0], n1[1], n1[2], nz(-5, 5)]), '\\pi_2:\\ ' + lx([[n2m[0], 'x'], [n2m[1], 'y'], [n2m[2], 'z'], [nz(-5, 5), '']]) + '=0']), label: 'm =',
      hint: 'Dos planos son perpendiculares si sus vectores normales lo son: $\\vec n_1\\cdot\\vec n_2=0$.',
      steps: ['$\\vec n_1=' + tup(n1) + '$ y $\\vec n_2=' + tup(n2m) + '$.', '$\\vec n_1\\cdot\\vec n_2=' + [0, 1, 2].map((i) => pn(n1[i]) + '\\cdot ' + (i === j ? 'm' : pn(n2[i]))).join('+') + '=0\\ \\Rightarrow\\ m=' + n2[j] + '$'], ansTex: 'm=' + n2[j],
      res: () => V.dot(n1, n2) });
  },
];

Object.assign(G, { crossTex, dotTex, vmat, sarrus, R, gl, stepsParam, PH });

root.Topics.push(
  { id: 'gvec', subj: 'geo', island: 'Vectores', title: 'Vectores y producto escalar', sub: 'Módulo, ángulo y perpendicularidad', gen: gl(VE) },
  { id: 'gprod', subj: 'geo', island: 'Vectores', title: 'Producto vectorial y mixto', sub: 'Áreas, volúmenes y coplanarios', gen: gl(PR) },
  { id: 'grecta', subj: 'geo', island: 'Rectas y planos', title: 'La recta en el espacio', sub: 'Todas sus ecuaciones', gen: gl(RE) },
  { id: 'gplano', subj: 'geo', island: 'Rectas y planos', title: 'El plano', sub: 'Ecuación general y paramétrica', gen: gl(PA) },
  { id: 'gpos', subj: 'geo', island: 'Rectas y planos', title: 'Posiciones y cortes', sub: 'Puntos comunes y parámetros', gen: gl(PO) },
);
})(typeof window !== 'undefined' ? window : globalThis);

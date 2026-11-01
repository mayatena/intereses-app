/* Geometría II: problemas tipo (planos y rectas por condiciones), distancias, ángulos y simétricos */
(function (root) {
'use strict';
const E = root.Engine, G = root.G;
const { ri, pick, nz, fr, fstr, byLevel } = E;
const { V, rvec, until, hasZero, primPlane, rawPlane, ft, tup, pt, vecT, m, pn, lx, planeTex, lineTex, pickForm, rad, radv, approx, block, Kit: K, crossTex, dotTex, vmat, sarrus, R, gl, stepsParam } = G;
const T = E.LATEX;
const PL = (name, p) => name + ':\\ ' + planeTex(p);
const rndPlane = (r) => { const n = rvec(-3, 3), P = rvec(-r, r, false); return { n, p: [n[0], n[1], n[2], nz(-6, 6)] }; };
const nOf = (p) => [p[0], p[1], p[2]];
const onLine = (X, P, d) => V.zero(V.cross(V.sub(X, P), d));
const planeEq = (n, d) => lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [d, '']]) + '=0';
const tailPlane = (n, P, nm) => 'Plano: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$. Como pasa por ' + m(nm + tup(P)) + ', $d=' + (-V.dot(n, P)) + '$.';

/* ================= 6. Problemas tipo I: planos ================= */
const C1 = [
  (l) => { // paralelo a otro plano por un punto
    const r = R(l), A = rvec(-r, r, false), { n, p } = rndPlane(r), q = rawPlane(n, A);
    return K.plane(q, { prompt: 'Halla el plano que pasa por ' + m('A') + ' y es paralelo al plano ' + m('\\pi') + '.', qtex: block([pt('A', A), PL('\\pi', p)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'parallelPlane', nv: n, n: 'el plano π' }],
      hint: 'Planos paralelos tienen el mismo vector normal; solo cambia el término independiente.',
      steps: ['Mismo normal que $\\pi$: $\\vec n=' + tup(n) + '$.', tailPlane(n, A, 'A')] });
  },
  (l) => { // perpendicular a una recta por un punto
    const r = R(l), A = rvec(-r, r, false), { P, d } = { P: rvec(-r, r, false), d: rvec(-3, 3) }, q = rawPlane(d, A), form = pickForm(d, 0);
    return K.plane(q, { prompt: 'Halla el plano que pasa por ' + m('A') + ' y es perpendicular a la recta ' + m('r') + '.', qtex: block([pt('A', A), lineTex('r', P, d, form)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'perpLine', d, n: 'la recta r' }],
      hint: 'Si el plano es perpendicular a la recta, el vector director de la recta es un vector normal del plano.',
      steps: ['El vector director de $r$ es normal al plano: $\\vec n=\\vec d=' + tup(d) + '$.', tailPlane(d, A, 'A')] });
  },
  (l) => { // plano mediador
    const r = R(l), [A, B] = until(() => [rvec(-r, r, false), rvec(-r, r, false)], ([a, b]) => !V.eq(a, b)), n = V.sub(B, A), S = V.add(A, B), M2 = S.map((c) => c / 2);
    const q = [2 * n[0], 2 * n[1], 2 * n[2], -V.dot(n, S)];
    return K.plane(q, { prompt: 'Halla el plano mediador del segmento ' + m('AB') + ': el plano perpendicular al segmento por su punto medio.', qtex: pt('A', A) + '\\qquad ' + pt('B', B),
      cons: [{ t: 'pass', P: M2, n: 'el punto medio de AB' }, { t: 'perpLine', d: n, n: 'el segmento AB' }],
      hint: 'El normal es $\\vec{AB}$ y el plano pasa por el punto medio $M=\\frac{A+B}{2}$.',
      steps: ['$\\vec n=\\vec{AB}=' + tup(n) + '$ y $M=' + tup(M2.map((c, i) => fr(S[i], 2))) + '$.', 'Plano: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], ['d', '']]) + '=0$ y, con $M$: $d=' + ft(fr(-V.dot(n, S), 2)) + '$.', 'Multiplicando por $2$ para quitar denominadores: $' + planeTex(q) + '$.'] });
  },
  (l) => { // contiene a una recta y a un punto
    const r = R(l), P0 = rvec(-r, r, false), d = rvec(-2, 2), A = until(() => rvec(-r, r, false), (a) => !onLine(a, P0, d)), w = V.sub(A, P0), n = V.cross(d, w), form = pickForm(d, 0);
    return K.plane(rawPlane(n, A), { prompt: 'Halla el plano que contiene a la recta ' + m('r') + ' y al punto ' + m('A') + '.', qtex: block([lineTex('r', P0, d, form), pt('A', A)]),
      cons: [{ t: 'containsLine', P: P0, d, n: 'la recta r' }, { t: 'pass', P: A, n: 'A' }],
      hint: 'Dos vectores del plano: el director de $r$ y el que va de un punto de $r$ hasta $A$.',
      steps: ['Punto de $r$: $P' + tup(P0) + '$; vector director: $\\vec d=' + tup(d) + '$.', '$\\vec{PA}=A-P=' + tup(w) + '$', '$\\vec n=\\vec d\\times\\vec{PA}=' + tup(n) + '$', tailPlane(n, A, 'A')] });
  },
  (l) => { // paralelo a dos rectas por un punto
    const r = R(l), A = rvec(-r, r, false), [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), n = V.cross(d1, d2), P1 = rvec(-r, r, false), P2 = rvec(-r, r, false);
    return K.plane(rawPlane(n, A), { prompt: 'Halla el plano que pasa por ' + m('A') + ' y es paralelo a las rectas ' + m('r') + ' y ' + m('s') + '.', qtex: block([pt('A', A), lineTex('r', P1, d1, pickForm(d1, 0)), lineTex('s', P2, d2, pickForm(d2, 0), '\\mu')]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'parallelLine', d: d1, n: 'la recta r' }, { t: 'parallelLine', d: d2, n: 'la recta s' }],
      hint: 'Los vectores directores de $r$ y $s$ son dos vectores del plano; su producto vectorial es el normal.',
      steps: ['$\\vec d_r=' + tup(d1) + '$ y $\\vec d_s=' + tup(d2) + '$.', '$\\vec n=\\vec d_r\\times\\vec d_s=' + tup(n) + '$', tailPlane(n, A, 'A')] });
  },
  (l) => { // contiene a dos rectas (secantes o paralelas)
    const r = R(l) - 1 || 2, secant = pick([true, true, false]);
    let P1, P2, d1, d2, n, A;
    if (secant) { const Q = rvec(-r, r, false); [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)); P1 = V.sub(Q, V.mul(nz(-2, 2), d1)); P2 = V.sub(Q, V.mul(nz(-2, 2), d2)); n = V.cross(d1, d2); A = P1; }
    else { d1 = rvec(-2, 2); d2 = V.mul(pick([-2, -1, 2, 3]), d1); P1 = rvec(-r, r, false); P2 = until(() => rvec(-r, r, false), (q) => !onLine(q, P1, d1)); n = V.cross(d1, V.sub(P2, P1)); A = P1; }
    const st = secant ? ['Son secantes (se cortan): su plano tiene como vectores $\\vec d_r=' + tup(d1) + '$ y $\\vec d_s=' + tup(d2) + '$.', '$\\vec n=\\vec d_r\\times\\vec d_s=' + tup(n) + '$']
      : ['Son paralelas: el plano contiene a $\\vec d=' + tup(d1) + '$ y a $\\vec{P_rP_s}=' + tup(V.sub(P2, P1)) + '$.', '$\\vec n=\\vec d\\times\\vec{P_rP_s}=' + tup(n) + '$'];
    return K.plane(rawPlane(n, A), { prompt: 'Las rectas ' + m('r') + ' y ' + m('s') + ' ' + (secant ? 'se cortan' : 'son paralelas') + '. Halla el plano que las contiene.', qtex: block([lineTex('r', P1, d1, pickForm(d1, 0)), lineTex('s', P2, d2, pickForm(d2, 0), '\\mu')]),
      cons: [{ t: 'containsLine', P: P1, d: d1, n: 'la recta r' }, { t: 'containsLine', P: P2, d: d2, n: 'la recta s' }],
      hint: secant ? 'Los dos vectores directores están en el plano.' : 'Un vector es el director común; el otro va de un punto de $r$ a un punto de $s$.',
      steps: st.concat([tailPlane(n, A, 'P_r')]) });
  },
  (l) => { // por A y B, perpendicular a otro plano
    const r = R(l), [A, B] = until(() => [rvec(-r, r, false), rvec(-r, r, false)], ([a, b]) => !V.eq(a, b)), u = V.sub(B, A), { n: np, p } = rndPlane(r);
    const n = V.cross(u, np); if (V.zero(n)) return C1[6](l);
    return K.plane(rawPlane(n, A), { prompt: 'Halla el plano que pasa por ' + m('A') + ' y ' + m('B') + ' y es perpendicular al plano ' + m('\\pi') + '.', qtex: block([pt('A', A) + '\\qquad ' + pt('B', B), PL('\\pi', p)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'pass', P: B, n: 'B' }, { t: 'perpPlane', nv: np, n: 'el plano π' }],
      hint: 'El plano contiene al vector $\\vec{AB}$ y, al ser perpendicular a $\\pi$, también al normal de $\\pi$.',
      steps: ['$\\vec{AB}=' + tup(u) + '$ y $\\vec n_\\pi=' + tup(np) + '$ están en el plano.', '$\\vec n=\\vec{AB}\\times\\vec n_\\pi=' + tup(n) + '$', tailPlane(n, A, 'A')] });
  },
  (l) => { // contiene a una recta y es perpendicular a un plano
    const r = R(l), P0 = rvec(-r, r, false), d = rvec(-2, 2), { n: np, p } = rndPlane(r), n = V.cross(d, np);
    if (V.zero(n)) return C1[7](l);
    return K.plane(rawPlane(n, P0), { prompt: 'Halla el plano que contiene a la recta ' + m('r') + ' y es perpendicular al plano ' + m('\\pi') + '.', qtex: block([lineTex('r', P0, d, pickForm(d, 0)), PL('\\pi', p)]),
      cons: [{ t: 'containsLine', P: P0, d, n: 'la recta r' }, { t: 'perpPlane', nv: np, n: 'el plano π' }],
      hint: 'El plano contiene al vector director de $r$ y al normal de $\\pi$; el normal buscado es su producto vectorial.',
      steps: ['$\\vec d=' + tup(d) + '$ y $\\vec n_\\pi=' + tup(np) + '$ están en el plano.', '$\\vec n=\\vec d\\times\\vec n_\\pi=' + tup(n) + '$', tailPlane(n, P0, 'P')] });
  },
];

/* ================= 7. Problemas tipo II: rectas ================= */
const rLine = (name, P, d, l, par) => lineTex(name, P, d, pickForm(d, 0), par);
const lineSteps = (P, d) => 'Recta: $(x,y,z)=' + tup(P) + '+\\lambda' + tup(d) + '$.';
const C2 = [
  (l) => { const r = R(l), A = rvec(-r, r, false), P0 = rvec(-r, r, false), d = rvec(-3, 3);
    return K.line(A, d, { prompt: 'Halla la recta que pasa por ' + m('A') + ' y es paralela a la recta ' + m('s') + '.', qtex: block([pt('A', A), rLine('s', P0, d, l)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'parallelLine', d, n: 'la recta s' }],
      hint: 'Rectas paralelas comparten vector director.', steps: ['Vector director de $s$: $\\vec d=' + tup(d) + '$; es también el de la recta buscada.', lineSteps(A, d)] });
  },
  (l) => { const r = R(l), A = rvec(-r, r, false), { n, p } = rndPlane(r);
    return K.line(A, nOf(p), { prompt: 'Halla la recta que pasa por ' + m('A') + ' y es perpendicular al plano ' + m('\\pi') + '.', qtex: block([pt('A', A), PL('\\pi', p)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'perpPlane', nv: nOf(p), n: 'el plano π' }],
      hint: 'El vector normal del plano es un vector director de la recta.', steps: ['Vector normal de $\\pi$: $\\vec n=' + tup(nOf(p)) + '$; será el director de la recta.', lineSteps(A, nOf(p))] });
  },
  (l) => { const r = R(l), A = rvec(-r, r, false), [p1, p2] = until(() => [rndPlane(r).p, rndPlane(r).p], ([a, b]) => !V.par(nOf(a), nOf(b))), d = V.prim(V.cross(nOf(p1), nOf(p2)));
    return K.line(A, d, { prompt: 'Halla la recta que pasa por ' + m('A') + ' y es paralela a los planos ' + m('\\pi_1') + ' y ' + m('\\pi_2') + '.', qtex: block([pt('A', A), PL('\\pi_1', p1), PL('\\pi_2', p2)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'parallelPlane', nv: nOf(p1), n: 'el plano π₁' }, { t: 'parallelPlane', nv: nOf(p2), n: 'el plano π₂' }],
      hint: 'El director es perpendicular a los dos normales: su producto vectorial.',
      steps: ['$\\vec n_1=' + tup(nOf(p1)) + '$, $\\vec n_2=' + tup(nOf(p2)) + '$.', '$\\vec d=\\vec n_1\\times\\vec n_2=' + tup(V.cross(nOf(p1), nOf(p2))) + '$', lineSteps(A, d)] });
  },
  (l) => { const r = R(l), A = rvec(-r, r, false), [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), d = V.prim(V.cross(d1, d2)), P1 = rvec(-r, r, false), P2 = rvec(-r, r, false);
    return K.line(A, d, { prompt: 'Halla la recta que pasa por ' + m('A') + ' y es perpendicular a las rectas ' + m('r') + ' y ' + m('s') + '.', qtex: block([pt('A', A), rLine('r', P1, d1, l), rLine('s', P2, d2, l, '\\mu')]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'perpLine', d: d1, n: 'la recta r' }, { t: 'perpLine', d: d2, n: 'la recta s' }],
      hint: 'El director es perpendicular a $\\vec d_r$ y a $\\vec d_s$: su producto vectorial.',
      steps: ['$\\vec d_r=' + tup(d1) + '$, $\\vec d_s=' + tup(d2) + '$.', '$\\vec d=\\vec d_r\\times\\vec d_s=' + tup(V.cross(d1, d2)) + '$', lineSteps(A, d)] });
  },
  (l) => { // corta perpendicularmente a r
    const r = R(l) - 1 || 2, P0 = rvec(-r, r, false), d = rvec(-2, 2), s0 = nz(-2, 2), t0 = ri(-2, 2), Q = V.add(P0, V.mul(t0, d));
    const w = V.cross(d, until(() => rvec(-2, 2), (q) => !V.par(q, d))), A = V.add(Q, w), dir = V.prim(w);
    const np = V.dot(d, A), nn = [d[0], d[1], d[2], -V.dot(d, A)], lam = fr(-(V.dot(d, P0) + nn[3]), V.n2(d));
    return K.line(A, dir, { prompt: 'Halla la recta que pasa por ' + m('A') + ' y corta perpendicularmente a la recta ' + m('r') + '.', qtex: block([pt('A', A), rLine('r', P0, d, l)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'perpLine', d, n: 'la recta r' }, { t: 'meetsLine', P: P0, d, n: 'la recta r' }],
      hint: 'Halla el punto $Q$ de $r$ tal que $\\vec{AQ}$ sea perpendicular a $\\vec d_r$ (el plano perpendicular a $r$ por $A$ corta a $r$ en $Q$). La recta pedida es $AQ$.',
      steps: ['Plano perpendicular a $r$ por $A$: $' + lx([[d[0], 'x'], [d[1], 'y'], [d[2], 'z'], [nn[3], '']]) + '=0$.', 'Sustituimos $r$ ($' + 'xyz'.split('').map((q, i) => q + '=' + lx([[P0[i], ''], [d[i], '\\lambda']])).join(',\\ ') + '$): $\\lambda=' + ft(lam) + '$, luego $Q=' + tup(Q) + '$.', '$\\vec{AQ}=Q-A=' + tup(V.sub(Q, A)) + '$', lineSteps(A, dir)] });
  },
  (l) => { // paralela a un plano y corta a una recta
    const r = R(l) - 1 || 2, [n, d] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => V.dot(a, b) !== 0), P0 = rvec(-r, r, false), t0 = ri(-2, 2), Q = V.add(P0, V.mul(t0, d)), w = V.cross(n, until(() => rvec(-2, 2), (q) => !V.par(q, n)));
    const A = V.add(Q, w);
    if (onLine(A, P0, d)) return C2[5](l);
    const dir = V.prim(V.sub(Q, A)), p = [n[0], n[1], n[2], nz(-6, 6)], np = [n[0], n[1], n[2], -V.dot(n, A)];
    const lam = fr(-(V.dot(n, P0) + np[3]), V.dot(n, d));
    return K.line(A, dir, { prompt: 'Halla la recta que pasa por ' + m('A') + ', es paralela al plano ' + m('\\pi') + ' y corta a la recta ' + m('r') + '.', qtex: block([pt('A', A), PL('\\pi', p), rLine('r', P0, d, l)]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'parallelPlane', nv: n, n: 'el plano π' }, { t: 'meetsLine', P: P0, d, n: 'la recta r' }],
      hint: 'Construye el plano paralelo a $\\pi$ por $A$; su punto de corte $Q$ con $r$ está en la recta buscada, que es $AQ$.',
      steps: ['Plano paralelo a $\\pi$ por $A$: $' + lx([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [np[3], '']]) + '=0$.', 'Corte con $r$ ($' + 'xyz'.split('').map((q, i) => q + '=' + lx([[P0[i], ''], [d[i], '\\lambda']])).join(',\\ ') + '$): $\\lambda=' + ft(lam) + '$, luego $Q=' + tup(Q) + '$.', '$\\vec{AQ}=' + tup(V.sub(Q, A)) + '$', lineSteps(A, dir)] });
  },
  (l) => { // corta a dos rectas
    const r = R(l) - 1 || 2, A = rvec(-r, r, false), dir = rvec(-2, 2), a = nz(-2, 2), b = until(() => nz(-2, 2), (q) => q !== a);
    const Q1 = V.add(A, V.mul(a, dir)), Q2 = V.add(A, V.mul(b, dir)), [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([x, y]) => !V.par(x, dir) && !V.par(y, dir) && !V.par(V.cross(x, V.sub(Q1, A)), V.cross(y, V.sub(Q2, A))));
    const P1 = V.sub(Q1, V.mul(nz(-2, 2), d1)), P2 = V.sub(Q2, V.mul(nz(-2, 2), d2));
    const n1 = V.cross(d1, V.sub(P1, A)), n2 = V.cross(d2, V.sub(P2, A)), dd = V.cross(n1, n2), dp = V.prim(dir);
    return K.line(A, dp, { prompt: 'Halla la recta que pasa por ' + m('A') + ' y corta a las rectas ' + m('r') + ' y ' + m('s') + '.', qtex: block([pt('A', A), rLine('r', P1, d1, l), rLine('s', P2, d2, l, '\\mu')]),
      cons: [{ t: 'pass', P: A, n: 'A' }, { t: 'meetsLine', P: P1, d: d1, n: 'la recta r' }, { t: 'meetsLine', P: P2, d: d2, n: 'la recta s' }],
      hint: 'La recta está en el plano que contiene a $A$ y a $r$, y también en el plano que contiene a $A$ y a $s$: es su intersección.',
      steps: ['Plano $\\pi_r$ por $A$ y $r$: $\\vec n_r=\\vec d_r\\times\\vec{AP_r}=' + tup(n1) + '$.', 'Plano $\\pi_s$ por $A$ y $s$: $\\vec n_s=\\vec d_s\\times\\vec{AP_s}=' + tup(n2) + '$.', 'La recta es $\\pi_r\\cap\\pi_s$: $\\vec d=\\vec n_r\\times\\vec n_s=' + tup(dd) + '$ (múltiplo de ' + m(tup(dp)) + ').', lineSteps(A, dp)] });
  },
];

/* ================= 8. Distancias ================= */
const dForm = (n, N) => '\\dfrac{|' + n + '|}{\\sqrt{' + N + '}}';
const DI = [
  (l) => { // punto a plano
    const r = R(l), A = rvec(-r, r, false), { n, p } = rndPlane(r), N = V.n2(n), num = Math.abs(V.dot(n, A) + p[3]), val = rad(num, N, N);
    return K.num(val, { prompt: 'Calcula la distancia del punto ' + m('A') + ' al plano ' + m('\\pi') + '. Puedes dejar la raíz.', qtex: block([pt('A', A), PL('\\pi', p)]), label: 'd =',
      vd: { t: 'pp', P: A, n, D: p[3] }, hint: 'Usa $d(A,\\pi)=\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}$.',
      steps: ['$d=\\dfrac{|' + [0, 1, 2].map((i) => pn(n[i]) + '\\cdot' + pn(A[i])).join('+') + '+' + pn(p[3]) + '|}{\\sqrt{' + n.map((c) => pn(c) + '^2').join('+') + '}}=' + dForm(V.dot(n, A) + p[3], N) + '=' + T(val) + '$'], ansTex: 'd=' + T(val) });
  },
  (l) => { // recta paralela a plano / planos paralelos
    const r = R(l);
    if (Math.random() < 0.5) { // recta y plano paralelos
      const { n, p } = rndPlane(r), d = V.cross(n, until(() => rvec(-2, 2), (q) => !V.par(q, n))), P0 = rvec(-r, r, false), D = until(() => nz(-8, 8), (q) => V.dot(n, P0) + q !== 0), N = V.n2(n), num = Math.abs(V.dot(n, P0) + D), val = rad(num, N, N);
      return K.num(val, { prompt: 'La recta ' + m('r') + ' es paralela al plano ' + m('\\pi') + '. Calcula la distancia entre ambos. Puedes dejar la raíz.', qtex: block([rLine('r', P0, d, l), PL('\\pi', [n[0], n[1], n[2], D])]), label: 'd =',
        vd: { t: 'pp', P: P0, n, D }, hint: 'La distancia entre la recta y el plano es la de cualquier punto de la recta al plano.',
        steps: ['Un punto de $r$: $P' + tup(P0) + '$.', '$d=d(P,\\pi)=' + dForm(V.dot(n, P0) + D, N) + '=' + T(val) + '$'], ansTex: 'd=' + T(val) });
    }
    const n = rvec(-3, 3), k = pick([-2, 2, 3]), D1 = nz(-6, 6), D2 = until(() => nz(-9, 9), (q) => q !== k * D1), N = V.n2(n), num = Math.abs(k * D1 - D2), val = rad(num, Math.abs(k) * N, N);
    return K.num(val, { prompt: 'Los planos ' + m('\\pi_1') + ' y ' + m('\\pi_2') + ' son paralelos. Calcula la distancia entre ellos. Puedes dejar la raíz.', qtex: block([PL('\\pi_1', [n[0], n[1], n[2], D1]), PL('\\pi_2', [k * n[0], k * n[1], k * n[2], D2])]), label: 'd =',
      vd: { t: 'ppl', n, D1, k, D2 }, hint: 'Escribe los dos planos con los mismos coeficientes de $x,y,z$ y aplica $\\dfrac{|d_1-d_2|}{\\sqrt{a^2+b^2+c^2}}$; o toma un punto de uno y mídelo al otro.',
      steps: ['Multiplicamos $\\pi_1$ por $' + k + '$ para que tenga los mismos coeficientes que $\\pi_2$: $' + planeEq(V.mul(k, n), k * D1) + '$.', '$d=\\dfrac{|d_1-d_2|}{\\sqrt{a^2+b^2+c^2}}=\\dfrac{|' + (k * D1) + '-' + pn(D2) + '|}{\\sqrt{' + V.n2(V.mul(k, n)) + '}}=' + T(val) + '$'], ansTex: 'd=' + T(val) });
  },
  (l) => { // punto a recta
    const r = R(l), A = rvec(-r, r, false), P0 = rvec(-r, r, false), d = until(() => rvec(-3, 3), (q) => true), w = V.sub(A, P0), c = V.cross(w, d);
    if (V.zero(c)) return DI[2](l);
    const N1 = V.n2(c), N2 = V.n2(d), val = rad(1, N2, N1 * N2);
    return K.num(val, { prompt: 'Calcula la distancia del punto ' + m('A') + ' a la recta ' + m('r') + '. Puedes dejar la raíz.', qtex: block([pt('A', A), rLine('r', P0, d, l)]), label: 'd =',
      vd: { t: 'pl', P: A, P0, d }, hint: 'Usa $d(A,r)=\\dfrac{|\\vec{PA}\\times\\vec d|}{|\\vec d|}$ con $P$ un punto de la recta.',
      steps: ['$P' + tup(P0) + '$, $\\vec d=' + tup(d) + '$, $\\vec{PA}=' + tup(w) + '$', '$\\vec{PA}\\times\\vec d=' + tup(c) + '$', '$d=\\dfrac{\\sqrt{' + N1 + '}}{\\sqrt{' + N2 + '}}=' + T(val) + '$'], ansTex: 'd=' + T(val) });
  },
  (l) => { // rectas paralelas
    const r = R(l), d1 = rvec(-2, 2), d2 = V.mul(pick([-2, -1, 2, 3]), d1), P1 = rvec(-r, r, false), P2 = until(() => rvec(-r, r, false), (q) => !onLine(q, P1, d1)), w = V.sub(P2, P1), c = V.cross(w, d1), N1 = V.n2(c), N2 = V.n2(d1), val = rad(1, N2, N1 * N2);
    return K.num(val, { prompt: 'Las rectas ' + m('r') + ' y ' + m('s') + ' son paralelas. Calcula la distancia entre ellas. Puedes dejar la raíz.', qtex: block([rLine('r', P1, d1, l), rLine('s', P2, d2, l, '\\mu')]), label: 'd =',
      vd: { t: 'pl', P: P2, P0: P1, d: d1 }, hint: 'Es la distancia de un punto de $s$ a la recta $r$.',
      steps: ['Punto de $s$: $Q' + tup(P2) + '$. Punto de $r$: $P' + tup(P1) + '$; $\\vec d_r=' + tup(d1) + '$.', '$\\vec{PQ}\\times\\vec d_r=' + tup(c) + '$', '$d=\\dfrac{|\\vec{PQ}\\times\\vec d_r|}{|\\vec d_r|}=\\dfrac{\\sqrt{' + N1 + '}}{\\sqrt{' + N2 + '}}=' + T(val) + '$'], ansTex: 'd=' + T(val) });
  },
  (l) => { // rectas que se cruzan
    const r = R(l) - 1 || 2, [d1, d2] = until(() => [rvec(-2, 2), rvec(-2, 2)], ([a, b]) => !V.par(a, b)), P1 = rvec(-r, r, false), P2 = until(() => rvec(-r, r, false), (q) => sarrus(V.sub(q, P1), d1, d2) !== 0), w = V.sub(P2, P1), c = V.cross(d1, d2), N = V.n2(c), dt = sarrus(w, d1, d2), val = rad(Math.abs(dt), N, N);
    return K.num(val, { prompt: 'Las rectas ' + m('r') + ' y ' + m('s') + ' se cruzan. Calcula la distancia entre ellas. Puedes dejar la raíz.', qtex: block([rLine('r', P1, d1, l), rLine('s', P2, d2, l, '\\mu')]), label: 'd =',
      vd: { t: 'll', P1, d1, P2, d2 }, hint: 'Usa $d(r,s)=\\dfrac{\\left|[\\vec{P_1P_2},\\vec d_1,\\vec d_2]\\right|}{|\\vec d_1\\times\\vec d_2|}$.',
      steps: ['$\\vec{P_1P_2}=' + tup(w) + '$, $\\vec d_1\\times\\vec d_2=' + tup(c) + '$', '$[\\vec{P_1P_2},\\vec d_1,\\vec d_2]=' + dt + '$', '$d=\\dfrac{|' + dt + '|}{\\sqrt{' + N + '}}=' + T(val) + '$'], ansTex: 'd=' + T(val) });
  },
];

/* ================= 9. Ángulos ================= */
const deg = (v) => 'arccos(' + v + ')*180/pi';
const AN = [
  (l) => { // coseno exacto entre dos rectas
    const r = R(l), [d1, d2] = until(() => [rvec(-3, 3), rvec(-3, 3)], ([a, b]) => !V.par(a, b) && V.dot(a, b) !== 0), dt = Math.abs(V.dot(d1, d2)), N = V.n2(d1) * V.n2(d2), val = rad(dt, N, N);
    return K.num(val, { prompt: 'Calcula el coseno del ángulo que forman las rectas ' + m('r') + ' y ' + m('s') + ' (el ángulo agudo). Puedes dejar la raíz.', qtex: block([rLine('r', rvec(-r, r, false), d1, l), rLine('s', rvec(-r, r, false), d2, l, '\\mu')]), label: 'cos α =',
      vd: { t: 'ang-ll', d1, d2, cos: 1 }, hint: 'El ángulo entre rectas es el de sus vectores directores, y se toma en valor absoluto: $\\cos\\alpha=\\dfrac{|\\vec d_1\\cdot\\vec d_2|}{|\\vec d_1||\\vec d_2|}$.',
      steps: ['$\\vec d_1=' + tup(d1) + '$, $\\vec d_2=' + tup(d2) + '$', '$\\cos\\alpha=\\dfrac{|' + dotTex(d1, d2) + '|}{\\sqrt{' + V.n2(d1) + '}\\sqrt{' + V.n2(d2) + '}}=' + T(val) + '$'], ansTex: '\\cos\\alpha=' + T(val) });
  },
  (l) => { // ángulo entre rectas, grados
    const r = R(l), [d1, d2] = until(() => [rvec(-3, 3), rvec(-3, 3)], ([a, b]) => !V.par(a, b)), dt = Math.abs(V.dot(d1, d2)), N = V.n2(d1) * V.n2(d2), val = deg(dt + '/sqrt(' + N + ')'), a = radv(val);
    return K.num(val, { prompt: 'Calcula el ángulo que forman las rectas ' + m('r') + ' y ' + m('s') + ', en grados y con dos decimales.', qtex: block([rLine('r', rvec(-r, r, false), d1, l), rLine('s', rvec(-r, r, false), d2, l, '\\mu')]), label: 'α (°) =',
      vd: { t: 'ang-ll', d1, d2 }, hint: 'Ángulo entre los vectores directores, con valor absoluto en el producto escalar para quedarte con el agudo.',
      steps: ['$\\vec d_1=' + tup(d1) + '$, $\\vec d_2=' + tup(d2) + '$', '$\\cos\\alpha=\\dfrac{|' + dotTex(d1, d2) + '|}{\\sqrt{' + V.n2(d1) + '}\\sqrt{' + V.n2(d2) + '}}=\\dfrac{' + dt + '}{\\sqrt{' + N + '}}\\ \\Rightarrow\\ \\alpha\\approx' + approx(a) + '^\\circ$'], ansTex: '\\alpha\\approx' + approx(a) + '^\\circ' });
  },
  (l) => { // ángulo entre planos
    const r = R(l), [p1, p2] = until(() => [rndPlane(r).p, rndPlane(r).p], ([a, b]) => !V.par(nOf(a), nOf(b))), n1 = nOf(p1), n2 = nOf(p2), dt = Math.abs(V.dot(n1, n2)), N = V.n2(n1) * V.n2(n2), val = deg(dt + '/sqrt(' + N + ')'), a = radv(val);
    return K.num(val, { prompt: 'Calcula el ángulo que forman los planos ' + m('\\pi_1') + ' y ' + m('\\pi_2') + ', en grados y con dos decimales.', qtex: block([PL('\\pi_1', p1), PL('\\pi_2', p2)]), label: 'α (°) =',
      vd: { t: 'ang-ll', d1: n1, d2: n2 }, hint: 'El ángulo entre planos es el de sus vectores normales (en valor absoluto).',
      steps: ['$\\vec n_1=' + tup(n1) + '$, $\\vec n_2=' + tup(n2) + '$', '$\\cos\\alpha=\\dfrac{|' + dotTex(n1, n2) + '|}{\\sqrt{' + V.n2(n1) + '}\\sqrt{' + V.n2(n2) + '}}=\\dfrac{' + dt + '}{\\sqrt{' + N + '}}\\ \\Rightarrow\\ \\alpha\\approx' + approx(a) + '^\\circ$'], ansTex: '\\alpha\\approx' + approx(a) + '^\\circ' });
  },
  (l) => { // recta y plano
    const r = R(l), d = rvec(-3, 3), { n, p } = rndPlane(r), cr = V.cross(d, n);
    if (V.zero(cr) || V.dot(d, n) === 0) return AN[3](l);
    const dt = Math.abs(V.dot(d, n)), N = V.n2(d) * V.n2(n), val = 'arcsin(' + dt + '/sqrt(' + N + '))*180/pi', a = radv(val);
    return K.num(val, { prompt: 'Calcula el ángulo que forman la recta ' + m('r') + ' y el plano ' + m('\\pi') + ', en grados y con dos decimales.', qtex: block([rLine('r', rvec(-r, r, false), d, l), PL('\\pi', p)]), label: 'α (°) =',
      vd: { t: 'ang-lp', d, n }, hint: 'El ángulo entre recta y plano cumple $\\operatorname{sen}\\alpha=\\dfrac{|\\vec d\\cdot\\vec n|}{|\\vec d||\\vec n|}$ (con el normal, no con el plano).',
      steps: ['$\\vec d=' + tup(d) + '$, $\\vec n=' + tup(n) + '$', '$\\operatorname{sen}\\alpha=\\dfrac{|' + dotTex(d, n) + '|}{\\sqrt{' + V.n2(d) + '}\\sqrt{' + V.n2(n) + '}}=\\dfrac{' + dt + '}{\\sqrt{' + N + '}}\\ \\Rightarrow\\ \\alpha\\approx' + approx(a) + '^\\circ$'], ansTex: '\\alpha\\approx' + approx(a) + '^\\circ' });
  },
  (l) => { // ángulo en un vértice
    const r = R(l), [A, B, C] = until(() => [rvec(-r, r, false), rvec(-r, r, false), rvec(-r, r, false)], ([a, b, c]) => !V.par(V.sub(b, a), V.sub(c, a)) && V.dot(V.sub(b, a), V.sub(c, a)) !== 0), u = V.sub(B, A), v = V.sub(C, A), dt = V.dot(u, v), N = V.n2(u) * V.n2(v), val = deg(dt + '/sqrt(' + N + ')'), a = radv(val);
    return K.num(val, { prompt: 'Calcula el ángulo del triángulo ' + m('ABC') + ' en el vértice ' + m('A') + ', en grados y con dos decimales.', qtex: pt('A', A) + '\\quad ' + pt('B', B) + '\\quad ' + pt('C', C), label: 'Â (°) =',
      vd: { t: 'ang-v', u, v }, hint: 'Es el ángulo entre $\\vec{AB}$ y $\\vec{AC}$.',
      steps: ['$\\vec{AB}=' + tup(u) + '$, $\\vec{AC}=' + tup(v) + '$', '$\\cos\\hat A=\\dfrac{' + dotTex(u, v) + '}{\\sqrt{' + V.n2(u) + '}\\sqrt{' + V.n2(v) + '}}=\\dfrac{' + dt + '}{\\sqrt{' + N + '}}\\ \\Rightarrow\\ \\hat A\\approx' + approx(a) + '^\\circ$'], ansTex: '\\hat A\\approx' + approx(a) + '^\\circ' });
  },
];

/* ================= 10. Proyecciones y simétricos ================= */
const SI = [
  (l) => { // simétrico respecto de un punto
    const r = R(l) + 1, A = rvec(-r, r, false), M = rvec(-r, r, false), S = V.sub(V.mul(2, M), A);
    return K.vec(S, { prompt: 'Halla el simétrico de ' + m('A') + ' respecto del punto ' + m('M') + '.', qtex: pt('A', A) + '\\qquad ' + pt('M', M), label: "A' =",
      vd: { t: 'sym-p', A, M }, hint: '$M$ es el punto medio entre $A$ y su simétrico $A\'$: $A\'=2M-A$.',
      steps: ['$M=\\dfrac{A+A\'}{2}\\ \\Rightarrow\\ A\'=2M-A=2' + tup(M) + '-' + tup(A) + '=' + tup(S) + '$'] });
  },
  (l) => { // proyección sobre un plano / simétrico respecto de un plano
    const r = R(l) - 1 || 2, sym = Math.random() < 0.5, Q = rvec(-r, r, false), n = rvec(-2, 2), t = nz(-2, 2), A = V.add(Q, V.mul(t, n)), p = primPlane([n[0], n[1], n[2], -V.dot(n, Q)]), np = nOf(p);
    const lam = fr(-(V.dot(np, A) + p[3]), V.n2(np)), S = V.sub(V.mul(2, Q), A);
    return K.vec(sym ? S : Q, { prompt: 'Halla ' + (sym ? 'el simétrico del punto ' + m('A') + ' respecto del plano ' + m('\\pi') : 'la proyección ortogonal del punto ' + m('A') + ' sobre el plano ' + m('\\pi')) + '.', qtex: block([pt('A', A), PL('\\pi', p)]), label: sym ? "A' =" : 'A₀ =',
      vd: { t: sym ? 'sym-pl' : 'proj-pl', A, n: np, D: p[3] }, hint: 'Traza la recta perpendicular al plano por $A$ y halla dónde corta al plano: ese es el pie de la perpendicular' + (sym ? ', y el simétrico es $2A_0-A$.' : '.'),
      steps: ['Recta perpendicular a $\\pi$ por $A$: $' + 'xyz'.split('').map((q, i) => q + '=' + lx([[A[i], ''], [np[i], '\\lambda']])).join(',\\ ') + '$.', 'Sustituimos en $\\pi$: $\\lambda=' + ft(lam) + '$, y el pie de la perpendicular es $A_0=' + tup(Q) + '$.'].concat(sym ? ["$A'=2A_0-A=" + tup(S) + '$'] : []) });
  },
  (l) => { // proyección sobre una recta / simétrico respecto de una recta
    const r = R(l) - 1 || 2, sym = Math.random() < 0.5, d = rvec(-2, 2), P0 = rvec(-r, r, false), t0 = ri(-2, 2), Q = V.add(P0, V.mul(t0, d)), w = V.cross(d, until(() => rvec(-2, 2), (q) => !V.par(q, d))), A = V.add(Q, w), S = V.sub(V.mul(2, Q), A);
    const lam = fr(-(V.dot(d, V.sub(P0, A))), V.n2(d));
    return K.vec(sym ? S : Q, { prompt: 'Halla ' + (sym ? 'el simétrico del punto ' + m('A') + ' respecto de la recta ' + m('r') : 'la proyección ortogonal del punto ' + m('A') + ' sobre la recta ' + m('r')) + '.', qtex: block([pt('A', A), rLine('r', P0, d, l)]), label: sym ? "A' =" : 'A₀ =',
      vd: { t: sym ? 'sym-l' : 'proj-l', A, P0, d }, hint: 'Busca el plano perpendicular a $r$ por $A$ y su punto de corte con $r$: es el pie de la perpendicular' + (sym ? ', y el simétrico es $2A_0-A$.' : '.'),
      steps: ['Plano perpendicular a $r$ por $A$: $' + lx([[d[0], 'x'], [d[1], 'y'], [d[2], 'z'], [-V.dot(d, A), '']]) + '=0$.', 'Sustituimos $r$ ($' + 'xyz'.split('').map((q, i) => q + '=' + lx([[P0[i], ''], [d[i], '\\lambda']])).join(',\\ ') + '$): $\\lambda=' + ft(lam) + '$, y el pie es $A_0=' + tup(Q) + '$.'].concat(sym ? ["$A'=2A_0-A=" + tup(S) + '$'] : []) });
  },
];

root.Topics.push(
  { id: 'gcrit1', subj: 'geo', island: 'Problemas tipo', title: 'Planos que cumplen condiciones', sub: 'Paralelos, perpendiculares, que contienen…', gen: gl(C1) },
  { id: 'gcrit2', subj: 'geo', island: 'Problemas tipo', title: 'Rectas que cumplen condiciones', sub: 'Por un punto, corte, perpendicular…', gen: gl(C2) },
  { id: 'gdist', subj: 'geo', island: 'Métrica', title: 'Distancias', sub: 'Punto, recta y plano', gen: gl(DI) },
  { id: 'gang', subj: 'geo', island: 'Métrica', title: 'Ángulos', sub: 'Entre rectas, planos y recta-plano', gen: gl(AN) },
  { id: 'gsim', subj: 'geo', island: 'Métrica', title: 'Proyecciones y simétricos', sub: 'Respecto de punto, recta y plano', gen: gl(SI) },
);
})(typeof window !== 'undefined' ? window : globalThis);

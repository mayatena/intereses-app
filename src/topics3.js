/* Temas 8-10: integral definida, áreas, volúmenes de revolución */
(function (root) {
'use strict';
const E = root.Engine, Kit = root.Kit;
const { ri, pick, nz, fr, fadd, fmul, fstr, xp, ek, terms, ov, byLevel, L, LATEX: T } = E;
const eP = (m) => m === 1 ? 'e' : `e^(${m})`;
const par = (v) => v < 0 ? '(' + v + ')' : String(v);
const intN = (f, a, b) => E.intTex(f, String(a), String(b));

// polinomio [[coef, grado]...] -> {f, F, value (fracción) en [a,b]}
function polyInt(list, a, b) {
  const f = terms(list.map(([c, n]) => [c, xp(n)]));
  const F = terms(list.map(([c, n]) => [fr(c, n + 1), xp(n + 1)]));
  let v = [0, 1];
  for (const [c, n] of list) v = fadd(v, fmul(fr(c, n + 1), fr(Math.pow(b, n + 1) - Math.pow(a, n + 1), 1)));
  return { f, F, v };
}
const barrowSteps = (F, a, b, val) => ['Una primitiva es $F(x)=' + T(F) + '$.',
  'Regla de Barrow: $F(' + T(String(b)) + ')-F(' + T(String(a)) + ')$.', 'Resultado: ' + L(val)];

/* ---------- 8. Integral definida ---------- */
const BA = [
  () => { // polinomio
    const a = ri(0, 2), b = a + ri(1, 3), n1 = ri(2, 3), n2 = ri(1, n1 - 1), p = polyInt([[nz(-4, 5), n1], [nz(-4, 5), n2], [ri(-3, 4), 0]], a, b);
    return Kit.num(fstr(p.v), intN(p.f, a, b), { prompt: 'Calcula la integral definida. Puedes dar una fracción o un decimal.', F: p.F, quad: { f: p.f, a: String(a), b: String(b) },
      hint: 'Calcula la primitiva y evalúa en los dos límites: $F(b)-F(a)$.', steps: barrowSteps(p.F, a, b, fstr(p.v)) });
  },
  () => { // 1/x
    const c = pick([1, 2, 3, -1]), b = pick([2, 3, 4, 'e']), f = terms([ov(c, 'x')]), val = b === 'e' ? String(c) : terms([[c, `ln(${b})`]]);
    return Kit.num(val, intN(f, 1, b), { F: terms([[c, 'ln(x)']]), quad: { f, a: '1', b: String(b) }, hint: 'Primitiva: $' + c + '\\ln x$. Recuerda $\\ln1=0$' + (b === 'e' ? ' y $\\ln e=1$.' : '.'),
      steps: barrowSteps(terms([[c, 'ln(x)']]), 1, b, val) });
  },
  () => { // exponencial
    const c = pick([1, 2, 3, -1]), k = pick([1, 2, -1]), b = pick([1, 2]), f = terms([[c, ek(k)]]), F = terms([[fr(c, k), ek(k)]]);
    const val = terms([[fr(c, k), eP(k * b)], [fr(-c, k), '']]);
    return Kit.num(val, intN(f, 0, b), { F, quad: { f, a: '0', b: String(b) }, hint: 'Primitiva: ' + L(F) + '. Recuerda $e^0=1$.', steps: barrowSteps(F, 0, b, val) });
  },
  () => { // raíz
    const c = pick([1, 2, 3, -1]), m1 = ri(0, 1), m2 = ri(2, 3), f = terms([[c, 'sqrt(x)']]), F = terms([[fr(2 * c, 3), 'x^(3/2)']]);
    const val = fstr(fmul(fr(2 * c, 3), fr(m2 * m2 * m2 - m1 * m1 * m1, 1)));
    return Kit.num(val, intN(f, m1 * m1, m2 * m2), { prompt: 'Calcula la integral definida. Puedes dar una fracción o un decimal.', F, quad: { f, a: String(m1 * m1), b: String(m2 * m2), n: 100000 },
      hint: 'Escribe $\\sqrt{x}=x^{1/2}$. Los límites son cuadrados perfectos.', steps: barrowSteps(F, m1 * m1, m2 * m2, val) });
  },
  () => { // trigonométricas
    const a = nz(-4, 4), b = nz(-4, 4), t = ri(0, 2); let f, F, lo, hi, val;
    if (t === 0) { f = terms([[a, 'sin(x)'], [b, 'cos(x)']]); F = terms([[-a, 'cos(x)'], [b, 'sin(x)']]); lo = '0'; hi = 'pi/2'; val = String(a + b); }
    else if (t === 1) { f = terms([[a, 'sin(x)']]); F = terms([[-a, 'cos(x)']]); lo = '0'; hi = 'pi'; val = String(2 * a); }
    else { f = terms([[a, 'sin(x)'], [b, 'cos(x)']]); F = terms([[-a, 'cos(x)'], [b, 'sin(x)']]); lo = 'pi/2'; hi = 'pi'; val = String(a - b); }
    return Kit.num(val, E.intTex(f, lo, hi), { F, quad: { f, a: lo, b: hi }, hint: 'Valores útiles: $\\operatorname{sen}0=0$, $\\operatorname{sen}\\frac{\\pi}{2}=1$, $\\cos\\pi=-1$.',
      steps: ['Una primitiva es $F(x)=' + T(F) + '$.', 'Evaluamos $F(' + T(hi) + ')-F(' + T(lo) + ')$ con los valores de seno y coseno.', 'Resultado: ' + L(val)] });
  },
  () => { // arcotangente
    const c = pick([1, 2, 4, -1]), k = ri(1, 3), f = `${c}/(x^2+${k * k})`, F = terms([[fr(c, k), `atan(x/${k})`]]), val = terms([[fr(c, 4 * k), 'pi']]);
    return Kit.num(val, intN(f, 0, k), { F, quad: { f, a: '0', b: String(k) }, hint: 'Primitiva con arcotangente. Recuerda $\\operatorname{arctg}1=\\frac{\\pi}{4}$.',
      steps: ['Una primitiva es $F(x)=' + T(F) + '$.', 'En $x=' + k + '$ el argumento vale $1$ y $\\operatorname{arctg}1=\\frac{\\pi}{4}$; en $x=0$ vale $0$.', 'Resultado: ' + L(val)] });
  },
  () => { // sustitución
    const t = ri(0, 2); let f, F, val, lo = '0', hi = '1', hint;
    if (t === 0) { const a = pick([2, 4, 1, 3]); f = terms([[a, 'x*e^(x^2)']]); F = terms([[fr(a, 2), 'e^(x^2)']]); val = terms([[fr(a, 2), 'e'], [fr(-a, 2), '']]); hint = '$u=x^2$, $du=2x\\,dx$.'; }
    else if (t === 1) { const a = pick([2, 4, 1, 3]), n = ri(2, 3); f = terms([[a, `x*(x^2+1)^${n}`]]); F = terms([[fr(a, 2 * (n + 1)), `(x^2+1)^${n + 1}`]]);
      val = fstr(fmul(fr(a, 2 * (n + 1)), fr(Math.pow(2, n + 1) - 1, 1))); hint = '$u=x^2+1$, $du=2x\\,dx$; cuidado con los nuevos límites.'; }
    else { const n = ri(2, 3); f = `cos(x)*sin(x)^${n}`; F = `sin(x)^${n + 1}/${n + 1}`; val = `1/${n + 1}`; hi = 'pi/2'; hint = '$u=\\operatorname{sen}x$, $du=\\cos x\\,dx$.'; }
    return Kit.num(val, E.intTex(f, lo, hi), { F, quad: { f, a: lo, b: hi }, hint, steps: ['Hallamos una primitiva con cambio de variable: $F(x)=' + T(F) + '$.', 'Regla de Barrow: $F(' + T(hi) + ')-F(0)$.', 'Resultado: ' + L(val)] });
  },
  () => { // por partes
    const a = pick([1, 2, 3, -1]), t = ri(0, 4); let f, F, val, lo, hi;
    if (t === 0) { f = terms([[a, 'x*e^x']]); F = terms([[a, '(x-1)*e^x']]); val = String(a); lo = '0'; hi = '1'; }
    else if (t === 1) { f = terms([[a, 'ln(x)']]); F = terms([[a, 'x*ln(x)'], [-a, 'x']]); val = String(a); lo = '1'; hi = 'e'; }
    else if (t === 2) { f = terms([[a, 'x*cos(x)']]); F = terms([[a, 'x*sin(x)'], [a, 'cos(x)']]); val = terms([[fr(a, 2), 'pi'], [-a, '']]); lo = '0'; hi = 'pi/2'; }
    else if (t === 3) { f = terms([[a, 'x*sin(x)']]); F = terms([[-a, 'x*cos(x)'], [a, 'sin(x)']]); val = terms([[a, 'pi']]); lo = '0'; hi = 'pi'; }
    else { f = terms([[a, 'x*ln(x)']]); F = terms([[fr(a, 2), 'x^2*ln(x)'], [fr(-a, 4), 'x^2']]); val = terms([[fr(a, 4), 'e^2'], [fr(a, 4), '']]); lo = '1'; hi = 'e'; }
    return Kit.num(val, E.intTex(f, lo, hi), { F, quad: { f, a: lo, b: hi }, hint: 'Primero una primitiva por partes; después Barrow.',
      steps: ['Por partes obtenemos una primitiva: $F(x)=' + T(F) + '$.', 'Barrow: $F(' + T(hi) + ')-F(' + T(lo) + ')$.', 'Resultado: ' + L(val)] });
  },
];

/* ---------- 9. Áreas ---------- */
const AR = [
  () => { // bajo una curva
    const a = ri(0, 2), b = a + ri(1, 3), p = polyInt([[ri(1, 4), 2], [ri(0, 4), 1], [ri(0, 5), 0]], a, b);
    return Kit.num(fstr(p.v), 'y=' + T(p.f) + ',\\quad ' + T(String(a)) + '\\le x\\le ' + T(String(b)),
      { prompt: 'Calcula el área bajo la curva, por encima del eje OX, en el intervalo indicado.', F: p.F, quad: { f: p.f, a: String(a), b: String(b) },
        hint: 'La función es positiva en el intervalo: el área es $\\int_a^b f(x)\\,dx$.',
        steps: ['La función es positiva, así que el área es $\\int_{' + a + '}^{' + b + '}f(x)\\,dx$.', 'Primitiva: $F(x)=' + T(p.F) + '$.', 'Barrow: $F(' + b + ')-F(' + a + ')=' + T(fstr(p.v)) + '$.'] });
  },
  () => { // parábola y eje OX
    const k = ri(1, 4), a = pick([1, 2]), f = terms([[a * k * k, ''], [-a, 'x^2']]), val = fstr(fr(4 * a * k * k * k, 3));
    return Kit.num(val, 'y=' + T(f), { prompt: 'Calcula el área encerrada entre la parábola y el eje OX.', quad: { f: `abs(${f})`, a: String(-k), b: String(k) },
      hint: 'Corta al eje en las raíces de $y$. Por simetría, el área es el doble de la mitad derecha.',
      steps: ['Cortes con OX: $' + T(f) + '=0\\Rightarrow x=\\pm' + k + '$.', 'Entre ellos la parábola es positiva: área $=\\int_{-' + k + '}^{' + k + '}f\\,dx=2\\int_0^{' + k + '}f\\,dx$.', 'Resultado: ' + L(val)] });
  },
  () => { // parábola y recta
    let x1 = ri(-3, 2), x2 = ri(x1 + 1, Math.min(3, x1 + 4)); const a = pick([1, 1, 2]);
    const f = terms([[a, 'x^2']]), g = terms([[a * (x1 + x2), 'x'], [-a * x1 * x2, '']]), h = terms([[-a, 'x^2'], [a * (x1 + x2), 'x'], [-a * x1 * x2, '']]);
    const val = fstr(fr(a * Math.pow(x2 - x1, 3), 6));
    return Kit.num(val, 'y=' + T(f) + '\\quad\\text{y}\\quad y=' + T(g), { prompt: 'Calcula el área de la región encerrada entre las dos curvas.',
      quad: { f: `abs((${g})-(${f}))`, a: String(x1), b: String(x2) }, hint: 'Iguala las dos funciones para hallar los límites y resta: (la de arriba) − (la de abajo).',
      steps: ['Cortes: $' + T(f) + '=' + T(g) + '\\Rightarrow x=' + x1 + '$ y $x=' + x2 + '$.', 'Entre ambos puntos la recta queda por encima de la parábola.',
        'Área $=\\int_{' + x1 + '}^{' + x2 + '}(' + T(h) + ')\\,dx=' + T(val) + '$.'] });
  },
  () => { // bajo 1/x, e^x, sen x
    const t = ri(0, 2);
    if (t === 0) { const b = pick([2, 3, 4, 'e']), val = b === 'e' ? '1' : `ln(${b})`;
      return Kit.num(val, 'y=\\frac{1}{x},\\quad 1\\le x\\le ' + T(String(b)), { prompt: 'Calcula el área bajo la curva en el intervalo indicado.', F: 'ln(x)', quad: { f: '1/x', a: '1', b: String(b) },
        hint: 'Una primitiva de $\\frac{1}{x}$ es $\\ln x$.', steps: ['Área $=\\int_1^{' + b + '}\\frac{1}{x}dx=\\left[\\ln x\\right]_1^{' + b + '}$.', 'Resultado: ' + L(val)] }); }
    if (t === 1) { const k = pick([1, 2]), b = pick([1, 2]), f = ek(k), val = terms([[fr(1, k), eP(k * b)], [fr(-1, k), '']]);
      return Kit.num(val, 'y=' + T(f) + ',\\quad 0\\le x\\le ' + b, { prompt: 'Calcula el área bajo la curva en el intervalo indicado.', F: terms([[fr(1, k), ek(k)]]), quad: { f, a: '0', b: String(b) },
        hint: 'Primitiva: ' + L(terms([[fr(1, k), ek(k)]])) + '.', steps: ['Área $=\\int_0^{' + b + '}' + T(f) + '\\,dx$.', 'Barrow con la primitiva ' + L(terms([[fr(1, k), ek(k)]])) + '.', 'Resultado: ' + L(val)] }); }
    const a = pick([1, 2, 3]), f = terms([[a, 'sin(x)']]), val = String(2 * a);
    return Kit.num(val, 'y=' + T(f) + ',\\quad 0\\le x\\le\\pi', { prompt: 'Calcula el área bajo la curva en el intervalo indicado.', F: terms([[-a, 'cos(x)']]), quad: { f, a: '0', b: 'pi' },
      hint: 'La función es positiva en $[0,\\pi]$.', steps: ['Área $=\\int_0^{\\pi}' + T(f) + '\\,dx=\\left[' + T(terms([[-a, 'cos(x)']])) + '\\right]_0^{\\pi}$.', 'Resultado: ' + L(val)] });
  },
  () => { // cúbica y eje OX
    const m = ri(1, 3), f = `x^3-${m * m}*x`.replace('-1*x', '-x'), val = fstr(fr(m * m * m * m, 2));
    return Kit.num(val, 'y=' + T(f), { prompt: 'Calcula el área encerrada entre la curva y el eje OX.', quad: { f: `abs(${f})`, a: String(-m), b: String(m) },
      hint: 'Raíces: $x=0$ y $x=\\pm' + m + '$. La función cambia de signo: calcula cada trozo en valor absoluto.',
      steps: ['Cortes con OX: $x(x^2-' + m * m + ')=0\\Rightarrow x=0,\\ \\pm' + m + '$.', 'La función es impar: los dos recintos tienen el mismo área, así que $A=2\\left|\\int_0^{' + m + '}f\\,dx\\right|$.', 'Resultado: ' + L(val)] });
  },
  () => { // raíz y recta
    const m = ri(1, 3), f = 'sqrt(x)', g = m === 1 ? 'x' : `x/${m}`, val = fstr(fr(m * m * m, 6));
    return Kit.num(val, 'y=\\sqrt{x}\\quad\\text{y}\\quad y=' + T(g), { prompt: 'Calcula el área de la región encerrada entre las dos curvas.', quad: { f: `abs(sqrt(x)-${g})`, a: '0', b: String(m * m), n: 100000 },
      hint: 'Iguala $\\sqrt{x}=' + T(g) + '$ (eleva al cuadrado) y resta la de abajo a la de arriba.',
      steps: ['Cortes: $\\sqrt{x}=' + T(g) + '\\Rightarrow x=0$ y $x=' + m * m + '$.', 'Entre ellos $\\sqrt{x}$ queda por encima de la recta.', 'Área $=\\int_0^{' + m * m + '}\\left(\\sqrt{x}-' + T(g) + '\\right)dx=' + T(val) + '$.'] });
  },
];

/* ---------- 10. Volúmenes de revolución ---------- */
const rng = (a, b) => T(String(a)) + '\\le x\\le ' + T(String(b));
const volSteps = (f, a, b, val) => ['Volumen alrededor de OX: $V=\\pi\\int_{' + T(String(a)) + '}^{' + T(String(b)) + '}[f(x)]^2dx$.', 'Aquí $[f(x)]^2=' + T(f) + '$.', 'Integramos y aplicamos Barrow: ' + L(val)];
const VO = [
  () => { const n = ri(1, 2), b = ri(1, 3), val = terms([[fr(Math.pow(b, 2 * n + 1), 2 * n + 1), 'pi']]);
    return Kit.num(val, 'y=' + T(xp(n)) + ',\\quad ' + rng(0, b), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: `pi*(${xp(n)})^2`, a: '0', b: String(b) },
      hint: '$V=\\pi\\int_a^b[f(x)]^2dx$. Eleva $f$ al cuadrado antes de integrar.', steps: volSteps(xp(2 * n), 0, b, val) }); },
  () => { const k = ri(1, 3), h = ri(1, 3), val = terms([[fr(k * k * h * h * h, 3), 'pi']]);
    return Kit.num(val, 'y=' + T(k === 1 ? 'x' : k + '*x') + ',\\quad ' + rng(0, h), { prompt: 'Calcula el volumen del cono que se obtiene al girar la región alrededor del eje OX.', quad: { f: `pi*(${k}*x)^2`, a: '0', b: String(h) },
      hint: '$[f(x)]^2=' + k * k + 'x^2$.', steps: volSteps(terms([[k * k, 'x^2']]), 0, h, val) }); },
  () => { const k = ri(1, 3), b = ri(1, 3), val = terms([[fr(k * k * b * b, 2), 'pi']]);
    return Kit.num(val, 'y=' + T(k === 1 ? 'sqrt(x)' : k + '*sqrt(x)') + ',\\quad ' + rng(0, b), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: `pi*(${k}*sqrt(x))^2`, a: '0', b: String(b), n: 100000 },
      hint: 'Al elevar al cuadrado desaparece la raíz: $[f(x)]^2=' + k * k + 'x$.', steps: volSteps(terms([[k * k, 'x']]), 0, b, val) }); },
  () => { const b = ri(1, 3), val = `pi*((${b}+1)^3-1)/3`;
    return Kit.num(val, 'y=x+1,\\quad ' + rng(0, b), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: 'pi*(x+1)^2', a: '0', b: String(b) },
      hint: '$[f(x)]^2=(x+1)^2$, y una primitiva es $\\frac{(x+1)^3}{3}$.', steps: volSteps('(x+1)^2', 0, b, val) }); },
  () => { const b = ri(2, 5), val = `pi*(${b}-1)/${b}`;
    return Kit.num(val, 'y=\\frac{1}{x},\\quad ' + rng(1, b), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: 'pi/x^2', a: '1', b: String(b) },
      hint: '$[f(x)]^2=\\frac{1}{x^2}=x^{-2}$.', steps: volSteps('1/x^2', 1, b, val) }); },
  () => { const b = ri(1, 2), val = `pi*(e^${2 * b}-1)/2`;
    return Kit.num(val, 'y=e^{x},\\quad ' + rng(0, b), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: 'pi*e^(2*x)', a: '0', b: String(b) },
      hint: '$[f(x)]^2=e^{2x}$.', steps: volSteps('e^(2*x)', 0, b, val) }); },
  () => Kit.num('pi^2/2', 'y=\\operatorname{sen}x,\\quad ' + rng(0, 'pi'), { prompt: 'Calcula el volumen del sólido que se obtiene al girar la región alrededor del eje OX.', quad: { f: 'pi*sin(x)^2', a: '0', b: 'pi' },
    hint: 'Usa $\\operatorname{sen}^2x=\\frac{1-\\cos2x}{2}$.', steps: volSteps('sin(x)^2', 0, 'pi', 'pi^2/2') }),
  () => { const r = ri(1, 3), val = terms([[fr(4 * r * r * r, 3), 'pi']]);
    return Kit.num(val, 'y=\\sqrt{' + (r * r) + '-x^2},\\quad ' + rng(-r, r), { prompt: 'Calcula el volumen de la esfera que se obtiene al girar la semicircunferencia alrededor del eje OX.', quad: { f: `pi*(${r * r}-x^2)`, a: String(-r), b: String(r) },
      hint: '$[f(x)]^2=' + r * r + '-x^2$: ¡un polinomio!', steps: volSteps(terms([[-1, 'x^2'], [r * r, '']]), -r, r, val) }); },
];

root.Topics.push(
  { id: 'barrow', island: 'Integral definida', title: 'Regla de Barrow', sub: 'Integrales con límites', gen: (d) => byLevel(BA, d)() },
  { id: 'areas', island: 'Integral definida', title: 'Áreas', sub: 'Bajo curvas y entre curvas', gen: (d) => byLevel(AR, d)() },
  { id: 'vol', island: 'Integral definida', title: 'Volúmenes de revolución', sub: 'Giros alrededor del eje OX', gen: (d) => byLevel(VO, d)() },
);
})(typeof window !== 'undefined' ? window : globalThis);

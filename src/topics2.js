/* Temas 5-7: cambio de variable, partes, fracciones simples */
(function (root) {
'use strict';
const E = root.Engine, Kit = root.Kit;
const { ri, pick, nz, fr, xp, ek, xm, cx, terms, byLevel, L, LATEX: T } = E;
const par = (v) => v < 0 ? '(' + v + ')' : String(v);

/* ---------- 5. Cambio de variable ---------- */
const SU = [
  () => { // a x (x²+k)^n
    const a = pick([1, 2, 3, 4, -2]), k = nz(-3, 4), n = ri(2, 4), q = terms([[1, 'x^2'], [k, '']]);
    const f = terms([[a, `x*(${q})^${n}`]]), F = terms([[fr(a, 2 * (n + 1)), `(${q})^${n + 1}`]]);
    return Kit.anti(f, F, { dom: [0.2, 1.4], hint: 'Prueba con $u=' + T(q) + '$: su derivada $2x$ aparece (salvo constante) en la integral.',
      steps: ['Tomamos $u=' + T(q) + '$, luego $du=2x\\,dx$ y $x\\,dx=\\frac{du}{2}$.',
        'La integral pasa a $\\frac{' + a + '}{2}\\int u^{' + n + '}\\,du=\\frac{' + a + '}{2}\\cdot\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}$.', 'Deshacemos el cambio: ' + L(F) + ' $+C$'] });
  },
  () => { // a x^(m-1) e^(x^m)
    const a = pick([1, 2, 3, -1]), m = ri(2, 3);
    const f = terms([[a, `${xp(m - 1)}*e^(x^${m})`]]), F = terms([[fr(a, m), `e^(x^${m})`]]);
    return Kit.anti(f, F, { dom: [0.2, 1.4], hint: 'Elige $u=x^' + m + '$ (el exponente de la exponencial).',
      steps: ['$u=x^' + m + '$, $du=' + m + xp(m - 1) + '\\,dx$, así que $' + xp(m - 1) + '\\,dx=\\frac{du}{' + m + '}$.',
        'Queda $\\frac{' + a + '}{' + m + '}\\int e^u\\,du=\\frac{' + a + '}{' + m + '}e^u$.', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // trig^n
    const a = pick([1, 2, 3, -1]), n = ri(2, 4);
    if (pick([0, 1])) {
      const f = terms([[a, `cos(x)*sin(x)^${n}`]]), F = terms([[fr(a, n + 1), `sin(x)^${n + 1}`]]);
      return Kit.anti(f, F, { dom: [0.2, 1.3], hint: 'Elige $u=\\operatorname{sen}x$; entonces $du=\\cos x\\,dx$.',
        steps: ['$u=\\operatorname{sen}x$ y $du=\\cos x\\,dx$.', 'Queda $' + a + '\\int u^{' + n + '}du=' + a + '\\cdot\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}$.', 'Resultado: ' + L(F) + ' $+C$'] });
    }
    const f = terms([[a, `sin(x)*cos(x)^${n}`]]), F = terms([[fr(-a, n + 1), `cos(x)^${n + 1}`]]);
    return Kit.anti(f, F, { dom: [0.2, 1.3], hint: 'Elige $u=\\cos x$; entonces $du=-\\operatorname{sen}x\\,dx$.',
      steps: ['$u=\\cos x$ y $du=-\\operatorname{sen}x\\,dx$, es decir $\\operatorname{sen}x\\,dx=-du$.', 'Queda $-' + par(a) + '\\int u^{' + n + '}du$.', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // f'/f
    const a = pick([1, 2, 3, 4, -2]), k = ri(1, 4), t = ri(0, 3); let f, F, u, du;
    if (t === 0) { f = cx(a, `x/(x^2+${k})`); F = terms([[fr(a, 2), `ln(x^2+${k})`]]); u = `x^2+${k}`; du = '2x\\,dx'; }
    else if (t === 1) { f = cx(a, `x^2/(x^3+${k})`); F = terms([[fr(a, 3), `ln(x^3+${k})`]]); u = `x^3+${k}`; du = '3x^2\\,dx'; }
    else if (t === 2) { f = cx(a, `e^x/(e^x+${k})`); F = terms([[a, `ln(e^x+${k})`]]); u = `e^x+${k}`; du = 'e^x\\,dx'; }
    else { f = cx(a, `cos(x)/(sin(x)+${k + 1})`); F = terms([[a, `ln(sin(x)+${k + 1})`]]); u = `sin(x)+${k + 1}`; du = '\\cos x\\,dx'; }
    return Kit.anti(f, F, { dom: [0.2, 1.4], hint: 'El numerador es (un múltiplo de) la derivada del denominador: $\\int\\frac{u\'}{u}dx=\\ln|u|$.',
      steps: ['Tomamos $u=' + T(u) + '$, con $du=' + du + '$.', 'La integral es un múltiplo de $\\int\\frac{du}{u}=\\ln|u|$ (el denominador es positivo).', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // ln^n / x
    const a = pick([1, 2, 3, -1]), n = ri(1, 3);
    const f = terms([[a, `ln(x)^${n}/x`]]), F = terms([[fr(a, n + 1), `ln(x)^${n + 1}`]]);
    return Kit.anti(f, F, { dom: [0.4, 3], hint: 'Elige $u=\\ln x$; su derivada es $\\frac{1}{x}$.',
      steps: ['$u=\\ln x$ y $du=\\frac{1}{x}\\,dx$.', 'Queda $' + a + '\\int u^{' + n + '}du=' + a + '\\cdot\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}$.', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // e^x sqrt(e^x+k)
    const a = pick([1, 2, 3]), k = ri(1, 3);
    const f = terms([[a, `e^x*sqrt(e^x+${k})`]]), F = terms([[fr(2 * a, 3), `(e^x+${k})^(3/2)`]]);
    return Kit.anti(f, F, { dom: [0.2, 1.4], hint: 'Elige $u=e^x+' + k + '$.',
      steps: ['$u=e^x+' + k + '$ y $du=e^x\\,dx$.', 'Queda $' + a + '\\int u^{1/2}du=' + a + '\\cdot\\frac{2}{3}u^{3/2}$.', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // tan
    const a = pick([1, 2, 3, -1]);
    const f = terms([[a, 'tan(x)']]), F = terms([[-a, 'ln(cos(x))']]);
    return Kit.anti(f, F, { dom: [0.2, 1.3], hint: 'Escribe $\\operatorname{tg}x=\\frac{\\operatorname{sen}x}{\\cos x}$ y usa $u=\\cos x$.',
      steps: ['$\\operatorname{tg}x=\\frac{\\operatorname{sen}x}{\\cos x}$. Con $u=\\cos x$, $du=-\\operatorname{sen}x\\,dx$.', 'Queda $-' + par(a) + '\\int\\frac{du}{u}=-' + par(a) + '\\ln|u|$.', 'Resultado: ' + L(F) + ' $+C$'] });
  },
  () => { // x sqrt(x+k)
    const k = ri(1, 4);
    const f = `x*sqrt(x+${k})`, F = terms([[fr(2, 5), `(x+${k})^(5/2)`], [fr(-2 * k, 3), `(x+${k})^(3/2)`]]);
    return Kit.anti(f, F, { dom: [0.2, 2], hint: 'Elige $u=x+' + k + '$ y despeja $x=u-' + k + '$.',
      steps: ['$u=x+' + k + '$, $x=u-' + k + '$, $dx=du$.', 'Queda $\\int(u-' + k + ')\\sqrt{u}\\,du=\\int\\left(u^{3/2}-' + k + 'u^{1/2}\\right)du$.', 'Integramos y deshacemos: ' + L(F) + ' $+C$'] });
  },
];

/* ---------- 6. Integración por partes ---------- */
const partesSteps = (u, dv, du, v, F) => ['Elegimos $u=' + u + '$ y $dv=' + dv + '\\,dx$ (regla ALPES).', 'Entonces $du=' + du + '\\,dx$ y $v=' + v + '$.',
  'Aplicamos $\\int u\\,dv=uv-\\int v\\,du$ y resolvemos la integral que queda.', 'Resultado: ' + L(F) + ' $+C$'];
const PA = [
  () => { const a = pick([1, 2, 3, -1]), k = pick([1, 1, 2, 3, -1]);
    const kxT = k === 1 ? 'x' : k === -1 ? '-x' : k + 'x', Ex = 'e^{' + kxT + '}', v = k === 1 ? Ex : k === -1 ? '-' + Ex : '\\frac{' + Ex + '}{' + k + '}';
    const f = terms([[a, `x*${ek(k)}`]]), F = terms([[fr(a, k * k), `(${terms([[k, 'x'], [-1, '']])})*${ek(k)}`]]);
    return Kit.anti(f, F, { dom: [0.2, 2], hint: 'Polinomio por exponencial: $u=x$ (el polinomio) y $dv=' + Ex + '\\,dx$.',
      steps: partesSteps('x', Ex, '1', v, F) }); },
  () => { const a = pick([1, 2, 3, -1]), k = ri(1, 3);
    if (pick([0, 1])) { const f = terms([[a, `x*sin(${E.kx(k)})`]]), F = terms([[fr(-a, k), `x*cos(${E.kx(k)})`], [fr(a, k * k), `sin(${E.kx(k)})`]]);
      return Kit.anti(f, F, { dom: [0.2, 2], hint: '$u=x$ y $dv=\\operatorname{sen}(' + (k === 1 ? '' : k) + 'x)\\,dx$.',
        steps: partesSteps('x', '\\operatorname{sen}(' + (k === 1 ? '' : k) + 'x)', '1', '-\\frac{\\cos(' + (k === 1 ? '' : k) + 'x)}{' + k + '}', F) }); }
    const f = terms([[a, `x*cos(${E.kx(k)})`]]), F = terms([[fr(a, k), `x*sin(${E.kx(k)})`], [fr(a, k * k), `cos(${E.kx(k)})`]]);
    return Kit.anti(f, F, { dom: [0.2, 2], hint: '$u=x$ y $dv=\\cos(' + (k === 1 ? '' : k) + 'x)\\,dx$.',
      steps: partesSteps('x', '\\cos(' + (k === 1 ? '' : k) + 'x)', '1', '\\frac{\\operatorname{sen}(' + (k === 1 ? '' : k) + 'x)}{' + k + '}', F) }); },
  () => { const a = pick([1, 2, 3, -1]), f = terms([[a, 'ln(x)']]), F = terms([[a, 'x*ln(x)'], [-a, 'x']]);
    return Kit.anti(f, F, { dom: [0.3, 3], hint: 'Truco: escribe $\\ln x=\\ln x\\cdot1$ y toma $u=\\ln x$, $dv=dx$.',
      steps: partesSteps('\\ln x', '', '\\frac{1}{x}', 'x', F) }); },
  () => { const a = pick([1, 2, 3, -1]), n = ri(1, 3);
    const f = terms([[a, `${xp(n)}*ln(x)`]]), F = terms([[fr(a, n + 1), `${xp(n + 1)}*ln(x)`], [fr(-a, (n + 1) * (n + 1)), xp(n + 1)]]);
    return Kit.anti(f, F, { dom: [0.3, 3], hint: 'El logaritmo manda: $u=\\ln x$ y $dv=x^{' + n + '}dx$.',
      steps: partesSteps('\\ln x', 'x^{' + n + '}', '\\frac{1}{x}', '\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}', F) }); },
  () => { const k = pick([1, 1, 2, -1]);
    const f = `x^2*${ek(k)}`, F = `(${terms([[fr(1, k), 'x^2'], [fr(-2, k * k), 'x'], [fr(2, k * k * k), '']])})*${ek(k)}`;
    return Kit.anti(f, F, { dom: [0.2, 1.8], hint: 'Hay que aplicar partes dos veces: la primera baja el grado de $x^2$ a $x$.',
      steps: ['Primera vez: $u=x^2$, $dv=e^{' + (k === 1 ? '' : k) + 'x}dx$, y queda una integral de $x\\,e^{' + (k === 1 ? '' : k) + 'x}$.', 'Segunda vez: $u=x$, $dv=e^{' + (k === 1 ? '' : k) + 'x}dx$.', 'Juntando todo: ' + L(F) + ' $+C$'] }); },
  () => { const a = pick([1, 2, -1]);
    if (pick([0, 1])) { const f = terms([[a, 'e^x*sin(x)']]), F = terms([[fr(a, 2), 'e^x*(sin(x)-cos(x))']]);
      return Kit.anti(f, F, { dom: [0.2, 2], hint: 'Aplica partes dos veces: reaparece la integral original y se despeja.',
        steps: ['Dos veces por partes (con $u=e^x$) obtenemos $I=e^x(\\operatorname{sen}x-\\cos x)-I$.', 'Despejamos: $2I=e^x(\\operatorname{sen}x-\\cos x)$.', 'Resultado: ' + L(F) + ' $+C$'] }); }
    const f = terms([[a, 'e^x*cos(x)']]), F = terms([[fr(a, 2), 'e^x*(sin(x)+cos(x))']]);
    return Kit.anti(f, F, { dom: [0.2, 2], hint: 'Aplica partes dos veces: reaparece la integral original y se despeja.',
      steps: ['Dos veces por partes (con $u=e^x$) obtenemos $I=e^x(\\operatorname{sen}x+\\cos x)-I$.', 'Despejamos: $2I=e^x(\\operatorname{sen}x+\\cos x)$.', 'Resultado: ' + L(F) + ' $+C$'] }); },
  () => { const a = pick([1, 2, -1]), f = terms([[a, 'atan(x)']]), F = terms([[a, 'x*atan(x)'], [fr(-a, 2), 'ln(1+x^2)']]);
    return Kit.anti(f, F, { dom: [0.2, 2.5], hint: '$u=\\operatorname{arctg}x$ y $dv=dx$; la integral que queda es de tipo $\\frac{u\'}{u}$.',
      steps: partesSteps('\\operatorname{arctg}x', '', '\\frac{1}{1+x^2}', 'x', F) }); },
];

/* ---------- 7. Fracciones simples ---------- */
const ab = () => { const a = ri(-3, 3); let b = ri(-3, 3); while (b === a) b = ri(-3, 3); return [a, b]; };
const lnA = (a) => `ln(abs(${xm(a)}))`;
const RA = [
  () => { const c = pick([1, 2, 3, -1]), k = ri(2, 4), f = `${c}/(x^2+${k * k})`, F = terms([[fr(c, k), `atan(x/${k})`]]);
    return Kit.anti(f, F, { dom: [0.2, 3], hint: 'Denominador sin raíces reales: $\\int\\frac{dx}{x^2+k^2}=\\frac{1}{k}\\operatorname{arctg}\\frac{x}{k}$.',
      steps: ['$x^2+' + k * k + '=' + k * k + '\\left(1+\\left(\\frac{x}{' + k + '}\\right)^2\\right)$, así que es una arcotangente.', 'Resultado: ' + L(F) + ' $+C$'] }); },
  () => { let a = nz(-3, 3), q = nz(-4, 4); while (a + q === 0) q = nz(-4, 4);
    const f = `(${terms([[1, 'x'], [q, '']])})/(${xm(a)})`, F = terms([[1, 'x'], [a + q, lnA(a)]]);
    return Kit.anti(f, F, { dom: [a + 0.3, a + 3], hint: 'Grado del numerador = grado del denominador: divide primero.',
      steps: ['Dividimos: $\\frac{x' + (q > 0 ? '+' : '') + q + '}{' + T(xm(a)) + '}=1+\\frac{' + (a + q) + '}{' + T(xm(a)) + '}$.', 'Integramos cada parte: $x$ y $' + (a + q) + '\\ln|' + T(xm(a)) + '|$.', 'Resultado: ' + L(F) + ' $+C$'] }); },
  () => { const [a, b] = ab(), c = pick([1, 2, 3, -1]), m = Math.max(a, b);
    const f = `${c}/((${xm(a)})*(${xm(b)}))`, F = terms([[fr(c, a - b), lnA(a)], [fr(-c, a - b), lnA(b)]]);
    return Kit.anti(f, F, { dom: [m + 0.3, m + 2.5], hint: 'Descompón en $\\frac{A}{' + T(xm(a)) + '}+\\frac{B}{' + T(xm(b)) + '}$.',
      steps: ['Descomponemos: $\\frac{' + c + '}{(' + T(xm(a)) + ')(' + T(xm(b)) + ')}=\\frac{A}{' + T(xm(a)) + '}+\\frac{B}{' + T(xm(b)) + '}$.',
        'Con $x=' + a + '$: $' + c + '=A\\cdot(' + (a - b) + ')$. Con $x=' + b + '$: $' + c + '=B\\cdot(' + (b - a) + ')$.', 'Integramos con logaritmos: ' + L(F) + ' $+C$'] }); },
  () => { const [a, b] = ab(), A = nz(-3, 3), B = nz(-3, 3), p = A + B, q = -(A * b + B * a), m = Math.max(a, b);
    const num = terms([[p, 'x'], [q, '']]), f = `(${num})/((${xm(a)})*(${xm(b)}))`, F = terms([[A, lnA(a)], [B, lnA(b)]]);
    return Kit.anti(f, F, { dom: [m + 0.3, m + 2.5], hint: 'Descompón en fracciones simples y halla $A$ y $B$ dando a $x$ el valor de cada raíz.',
      steps: ['Descomponemos: $\\frac{' + T(num) + '}{(' + T(xm(a)) + ')(' + T(xm(b)) + ')}=\\frac{A}{' + T(xm(a)) + '}+\\frac{B}{' + T(xm(b)) + '}$.',
        'Con $x=' + a + '$: $' + (p * a + q) + '=A\\cdot(' + (a - b) + ')$, luego $A=' + A + '$.', 'Con $x=' + b + '$: $' + (p * b + q) + '=B\\cdot(' + (b - a) + ')$, luego $B=' + B + '$.',
        'Resultado: ' + L(F) + ' $+C$'] }); },
  () => { const a = nz(-3, 3), f = `x^2/(${xm(a)})`, F = terms([[fr(1, 2), 'x^2'], [a, 'x'], [a * a, lnA(a)]]);
    return Kit.anti(f, F, { dom: [a + 0.3, a + 3], hint: 'El numerador tiene mayor grado: divide $x^2$ entre $' + T(xm(a)) + '$.',
      steps: ['Dividiendo: $\\frac{x^2}{' + T(xm(a)) + '}=x+' + par(a) + '+\\frac{' + a * a + '}{' + T(xm(a)) + '}$.', 'Integramos cada término.', 'Resultado: ' + L(F) + ' $+C$'] }); },
];

root.Topics.push(
  { id: 'sust', island: 'Técnicas', title: 'Cambio de variable', sub: 'Sustitución u = g(x)', gen: (d) => byLevel(SU, d)() },
  { id: 'partes', island: 'Técnicas', title: 'Por partes', sub: '∫u dv = uv − ∫v du', gen: (d) => byLevel(PA, d)() },
  { id: 'racio', island: 'Técnicas', title: 'Fracciones simples', sub: 'Funciones racionales', gen: (d) => byLevel(RA, d)() },
);
})(typeof window !== 'undefined' ? window : globalThis);

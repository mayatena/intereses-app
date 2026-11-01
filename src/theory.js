/* Teoría de cada tema, en páginas cortas. $...$ = fórmula en línea; fx = fórmulas destacadas. */
(function (root) {
'use strict';
const R = String.raw;
root.Theory = {

deriv: [
  { h: 'Integrar es deshacer una derivada', body: R`Si derivas $x^{3}$ obtienes $3x^{2}$. Integrar es el camino de vuelta: dada $3x^{2}$, buscar la función que al derivarla da $3x^{2}$.
Por eso conviene tener frescas las derivadas antes de empezar.` },
  { h: 'Derivadas básicas', fx: [
    R`(x^{n})'=n\,x^{n-1}`, R`(e^{x})'=e^{x}`, R`(\ln x)'=\frac{1}{x}`, R`(\operatorname{sen}x)'=\cos x`,
    R`(\cos x)'=-\operatorname{sen}x`, R`(\operatorname{tg}x)'=\frac{1}{\cos^{2}x}`, R`(\operatorname{arctg}x)'=\frac{1}{1+x^{2}}`] },
  { h: 'Regla de la cadena', body: R`Si hay una función dentro de otra, se deriva la de fuera y se multiplica por la derivada de la de dentro.`,
    fx: [R`\left[f(g(x))\right]'=f'(g(x))\cdot g'(x)`],
    ex: { q: R`f(x)=e^{x^{2}}`, steps: [R`Fuera: $e^{u}$, que se deriva en $e^{u}$. Dentro: $u=x^{2}$, que se deriva en $2x$.`, R`Resultado: $f'(x)=2x\,e^{x^{2}}$.`] } },
  { h: 'Producto y cociente', fx: [R`(uv)'=u'v+uv'`, R`\left(\frac{u}{v}\right)'=\frac{u'v-uv'}{v^{2}}`],
    ex: { q: R`f(x)=x\,e^{x}`, steps: [R`Con $u=x$ y $v=e^{x}$: $f'=1\cdot e^{x}+x\,e^{x}$.`, R`Resultado: $f'(x)=(x+1)\,e^{x}$.`] } },
],

pot: [
  { h: 'Primitiva e integral indefinida', body: R`Una función $F$ es una primitiva de $f$ si $F'=f$. Como la derivada de una constante es $0$, hay infinitas primitivas, todas iguales salvo una constante $C$.
En los ejercicios no hace falta que escribas $+C$.`, fx: [R`\int f(x)\,dx=F(x)+C`] },
  { h: 'La regla de las potencias', body: R`Se suma 1 al exponente y se divide entre el exponente nuevo. Las constantes salen fuera de la integral y las sumas se integran término a término.`,
    fx: [R`\int x^{n}\,dx=\frac{x^{n+1}}{n+1}+C\qquad(n\neq-1)`],
    ex: { q: R`\int\left(6x^{2}+4x-5\right)dx`, steps: [R`Término a término: $\int6x^{2}dx=2x^{3}$, $\int4x\,dx=2x^{2}$ y $\int5\,dx=5x$.`, R`Resultado: $2x^{3}+2x^{2}-5x+C$.`] } },
  { h: 'Raíces y fracciones', body: R`Antes de integrar, reescribe todo como potencias de $x$: $\sqrt{x}=x^{1/2}$ y $\frac{1}{x^{n}}=x^{-n}$.`,
    ex: { q: R`\int\left(\sqrt{x}+\frac{3}{x^{2}}\right)dx`, steps: [R`Reescribimos: $x^{1/2}+3x^{-2}$.`,
      R`$\int x^{1/2}dx=\frac{2}{3}x^{3/2}$ y $\int3x^{-2}dx=3\cdot\frac{x^{-1}}{-1}=-\frac{3}{x}$.`, R`Resultado: $\frac{2}{3}x^{3/2}-\frac{3}{x}+C$.`] } },
  { h: 'Un caso aparte', body: R`La regla falla con $n=-1$, es decir, con $\frac{1}{x}$ (saldría una división entre 0). Su primitiva es un logaritmo, y la verás en el siguiente tema.` },
],

elem: [
  { h: 'Tabla de integrales inmediatas', fx: [
    R`\int e^{x}\,dx=e^{x}+C`, R`\int a^{x}\,dx=\frac{a^{x}}{\ln a}+C`, R`\int\frac{1}{x}\,dx=\ln|x|+C`,
    R`\int\operatorname{sen}x\,dx=-\cos x+C`, R`\int\cos x\,dx=\operatorname{sen}x+C`, R`\int\frac{1}{\cos^{2}x}\,dx=\operatorname{tg}x+C`,
    R`\int\frac{1}{1+x^{2}}\,dx=\operatorname{arctg}x+C`, R`\int\frac{1}{\sqrt{1-x^{2}}}\,dx=\operatorname{arcsen}x+C`] },
  { h: 'Comprueba derivando', body: R`Es la mejor costumbre: derivar tu resultado tiene que devolver lo que había dentro de la integral. Fíjate sobre todo en el signo de $\int\operatorname{sen}x\,dx$.`,
    ex: { q: R`\int\left(3\operatorname{sen}x-\frac{2}{x}\right)dx`, steps: [R`$3\int\operatorname{sen}x\,dx=-3\cos x$ y $2\int\frac{1}{x}dx=2\ln|x|$.`, R`Resultado: $-3\cos x-2\ln|x|+C$.`] } },
],

lin: [
  { h: 'Cuando dentro hay ax+b', body: R`Si conoces $\int f(u)\,du=F(u)$, entonces integrar $f(ax+b)$ es igual, pero dividiendo entre la derivada de lo de dentro, que es $a$.`,
    fx: [R`\int f(ax+b)\,dx=\frac{1}{a}\,F(ax+b)+C`] },
  { h: 'Ejemplos', fx: [R`\int e^{3x+1}dx=\frac{1}{3}e^{3x+1}+C`, R`\int\cos(2x)\,dx=\frac{1}{2}\operatorname{sen}(2x)+C`,
    R`\int(2x+1)^{4}dx=\frac{(2x+1)^{5}}{2\cdot5}+C`, R`\int\frac{1}{5x-2}dx=\frac{1}{5}\ln|5x-2|+C`] },
  { h: 'Un ejemplo completo', ex: { q: R`\int\operatorname{sen}(4x-1)\,dx`, steps: [R`Fuera: $\int\operatorname{sen}u\,du=-\cos u$. Dentro: $u=4x-1$, con derivada $4$.`, R`Resultado: $-\frac{1}{4}\cos(4x-1)+C$.`] },
    body: R`El error típico es olvidar el factor $\frac{1}{a}$. La app te avisa cuando tu resultado sale multiplicado por una constante.` },
],

sust: [
  { h: 'La idea', body: R`Cuando una parte de la integral es (casi) la derivada de otra parte, se cambia de variable: $u=g(x)$ y $du=g'(x)\,dx$.`,
    fx: [R`\int f(g(x))\,g'(x)\,dx=\int f(u)\,du`] },
  { h: 'Los pasos', body: R`1. Elige $u$: lo que hay dentro de una potencia, de un exponente o en un denominador.
2. Calcula $du$.
3. Reescribe toda la integral en $u$.
4. Integra.
5. Deshaz el cambio.` },
  { h: 'Un ejemplo', ex: { q: R`\int2x\left(x^{2}+1\right)^{3}dx`, steps: [R`Tomamos $u=x^{2}+1$, luego $du=2x\,dx$.`, R`La integral queda $\int u^{3}du=\frac{u^{4}}{4}$.`, R`Deshacemos el cambio: $\frac{\left(x^{2}+1\right)^{4}}{4}+C$.`] } },
  { h: 'Cuando falta una constante', body: R`Si te sobra o falta un número, no pasa nada: se arregla con una fracción.`,
    ex: { q: R`\int x\,e^{x^{2}}dx`, steps: [R`$u=x^{2}$ y $du=2x\,dx$, así que $x\,dx=\frac{du}{2}$.`, R`Queda $\frac{1}{2}\int e^{u}du=\frac{1}{2}e^{u}$.`, R`Resultado: $\frac{1}{2}e^{x^{2}}+C$.`] } },
  { h: 'Patrones frecuentes', body: R`Si reconoces uno, la integral se resuelve de memoria.`, fx: [
    R`\int f'(x)\,f(x)^{n}dx=\frac{f(x)^{n+1}}{n+1}+C`, R`\int\frac{f'(x)}{f(x)}\,dx=\ln|f(x)|+C`, R`\int f'(x)\,e^{f(x)}dx=e^{f(x)}+C`] },
],

partes: [
  { h: 'La fórmula', body: R`Sale de la derivada de un producto. Sirve para integrales que son producto de dos funciones de tipo distinto, cuando una se simplifica al derivarla.`,
    fx: [R`\int u\,dv=u\,v-\int v\,du`] },
  { h: 'Regla ALPES', body: R`Toma como $u$ la primera que aparezca en este orden y deja el resto como $dv$:
**A**rcos, **L**ogaritmos, **P**olinomios, **E**xponenciales, **S**eno y coseno.` },
  { h: 'Un ejemplo', ex: { q: R`\int x\,e^{x}dx`, steps: [R`$u=x\Rightarrow du=dx$ y $dv=e^{x}dx\Rightarrow v=e^{x}$.`, R`$\int x\,e^{x}dx=x\,e^{x}-\int e^{x}dx=x\,e^{x}-e^{x}$.`, R`Resultado: $(x-1)\,e^{x}+C$.`] } },
  { h: 'Con un logaritmo', ex: { q: R`\int x\ln x\,dx`, steps: [R`$u=\ln x\Rightarrow du=\frac{1}{x}dx$ y $dv=x\,dx\Rightarrow v=\frac{x^{2}}{2}$.`,
    R`$\int x\ln x\,dx=\frac{x^{2}}{2}\ln x-\int\frac{x}{2}\,dx=\frac{x^{2}}{2}\ln x-\frac{x^{2}}{4}$.`, R`Resultado: $\frac{x^{2}}{2}\ln x-\frac{x^{2}}{4}+C$.`] } },
  { h: 'Tres trucos', body: R`Para $\int\ln x\,dx$ escribe $\ln x\cdot1$ y toma $u=\ln x$.
Si hay $x^{2}$ multiplicando, aplica partes dos veces.
Con $e^{x}\operatorname{sen}x$ la integral original reaparece: se despeja como una ecuación.` },
],

racio: [
  { h: 'Funciones racionales', body: R`Son cocientes de polinomios. Si el grado del numerador es **mayor o igual** que el del denominador, se divide primero. Después se integra según cómo sea el denominador.` },
  { h: 'Raíces distintas', body: R`Se descompone en fracciones simples. Para hallar $A$ y $B$, da a $x$ el valor de cada raíz. Cada fracción se integra a un logaritmo.`,
    fx: [R`\frac{px+q}{(x-a)(x-b)}=\frac{A}{x-a}+\frac{B}{x-b}`],
    ex: { q: R`\int\frac{x+5}{(x-1)(x+2)}\,dx`, steps: [R`Descomponemos: $x+5=A(x+2)+B(x-1)$.`, R`Con $x=1$: $6=3A\Rightarrow A=2$. Con $x=-2$: $3=-3B\Rightarrow B=-1$.`, R`Resultado: $2\ln|x-1|-\ln|x+2|+C$.`] } },
  { h: 'Denominador sin raíces reales', body: R`Un denominador como $x^{2}+4$ no se factoriza: la primitiva es una arcotangente.`,
    fx: [R`\int\frac{dx}{x^{2}+k^{2}}=\frac{1}{k}\operatorname{arctg}\frac{x}{k}+C`] },
  { h: 'Dividir primero', ex: { q: R`\int\frac{x+3}{x-1}\,dx`, steps: [R`Dividimos: $\frac{x+3}{x-1}=1+\frac{4}{x-1}$.`, R`Integramos cada parte: $x$ y $4\ln|x-1|$.`, R`Resultado: $x+4\ln|x-1|+C$.`] } },
],

barrow: [
  { h: 'La integral definida', body: R`Con límites, la integral es un número: el área con signo bajo la curva entre $a$ y $b$. Se calcula con la regla de Barrow, donde $F$ es cualquier primitiva de $f$ (la constante se cancela).`,
    fx: [R`\int_{a}^{b}f(x)\,dx=F(b)-F(a)`] },
  { h: 'Cómo se calcula', ex: { q: R`\int_{0}^{2}\left(3x^{2}+1\right)dx`, steps: [R`Una primitiva es $F(x)=x^{3}+x$.`, R`$F(2)-F(0)=(8+2)-0$.`, R`Resultado: $10$.`] } },
  { h: 'Propiedades', body: R`Si cambias los límites, cambia el signo. Y puedes partir el intervalo por donde quieras.`,
    fx: [R`\int_{a}^{b}f\,dx=-\int_{b}^{a}f\,dx`, R`\int_{a}^{b}f\,dx=\int_{a}^{c}f\,dx+\int_{c}^{b}f\,dx`] },
  { h: 'Cómo dar el resultado', body: R`Escribe el valor exacto: «ln(2)», «pi/3», «e^2-1», «7/3»… También vale un decimal (por ejemplo «2.33») si está bien redondeado.` },
],

areas: [
  { h: 'Área bajo una curva', body: R`Si la función es positiva en el intervalo, el área es la integral.`, fx: [R`A=\int_{a}^{b}f(x)\,dx\qquad(f\ge0)`] },
  { h: 'Si la función cambia de signo', body: R`La integral resta lo que queda bajo el eje. Para el área: halla los cortes con el eje OX, integra cada trozo y suma los **valores absolutos**.` },
  { h: 'Entre dos curvas', body: R`Los límites son los puntos de corte, que salen de resolver $f(x)=g(x)$. A la curva de arriba se le resta la de abajo.`,
    fx: [R`A=\int_{a}^{b}\left(f(x)-g(x)\right)dx\qquad(f\ge g)`] },
  { h: 'Un ejemplo', ex: { q: R`y=x^{2}\quad\text{y}\quad y=x+2`, steps: [
    R`Cortes: $x^{2}=x+2\Rightarrow x^{2}-x-2=0\Rightarrow x=-1$ y $x=2$.`,
    R`Arriba está la recta: $A=\int_{-1}^{2}\left(x+2-x^{2}\right)dx=\left[\frac{x^{2}}{2}+2x-\frac{x^{3}}{3}\right]_{-1}^{2}$.`,
    R`$\left(2+4-\frac{8}{3}\right)-\left(\frac{1}{2}-2+\frac{1}{3}\right)=\frac{10}{3}+\frac{7}{6}=\frac{9}{2}$.`] } },
],

vol: [
  { h: 'Girar una curva alrededor de OX', body: R`Cada trozo de la región, al girar, genera un disco de radio $f(x)$. Se integra el **cuadrado** de la función y se multiplica por $\pi$.`,
    fx: [R`V=\pi\int_{a}^{b}\left[f(x)\right]^{2}dx`] },
  { h: 'Un ejemplo', ex: { q: R`y=\sqrt{x},\quad 0\le x\le4`, steps: [R`Elevamos al cuadrado: $\left[f(x)\right]^{2}=x$.`, R`$V=\pi\int_{0}^{4}x\,dx=\pi\left[\frac{x^{2}}{2}\right]_{0}^{4}$.`, R`Resultado: $8\pi$.`] } },
  { h: 'Cuerpos conocidos', body: R`Con una recta que pasa por el origen sale un cono; con una semicircunferencia, una esfera. De ahí salen las fórmulas de siempre: la esfera de radio $r$ tiene volumen $\frac{4}{3}\pi r^{3}$.
Escribe el resultado con pi, por ejemplo «8*pi» o «pi*(e^2-1)/2».` },
],

};
})(typeof window !== 'undefined' ? window : globalThis);

/* Teoría de Geometría (vectores, rectas y planos), en páginas cortas. */
(function (root) {
'use strict';
const R = String.raw;
root.Theory = root.Theory || {};
Object.assign(root.Theory, {

gvec: [
  { h: 'Vectores en el espacio', body: R`Un vector $\vec u=(u_1,u_2,u_3)$ tiene tres componentes. El vector que va del punto $A$ al punto $B$ se obtiene restando: **extremo menos origen**.`,
    fx: [R`\vec{AB}=B-A=(b_1-a_1,\ b_2-a_2,\ b_3-a_3)`, R`M=\frac{A+B}{2}\quad\text{(punto medio)}`],
    ex: { q: R`A(1,2,3),\quad B(4,0,5)`, steps: [R`$\vec{AB}=(4-1,\ 0-2,\ 5-3)=(3,-2,2)$.`, R`Punto medio: $M=\left(\frac{5}{2},\,1,\,4\right)$.`] } },
  { h: 'Módulo y vector unitario', body: R`El módulo es la longitud del vector. Dividir un vector entre su módulo da un vector **unitario** (de módulo 1) con la misma dirección y sentido.`,
    fx: [R`|\vec u|=\sqrt{u_1^{2}+u_2^{2}+u_3^{2}}`, R`\hat u=\frac{\vec u}{|\vec u|}`],
    ex: { q: R`\vec u=(2,3,6)`, steps: [R`$|\vec u|=\sqrt{4+9+36}=\sqrt{49}=7$.`, R`$\hat u=\left(\frac{2}{7},\,\frac{3}{7},\,\frac{6}{7}\right)$.`] } },
  { h: 'Producto escalar', body: R`El producto escalar de dos vectores es un **número**. Sirve para medir ángulos y detectar perpendicularidad: dos vectores son perpendiculares si y solo si su producto escalar es $0$.`,
    fx: [R`\vec u\cdot\vec v=u_1v_1+u_2v_2+u_3v_3`, R`\cos\alpha=\frac{\vec u\cdot\vec v}{|\vec u|\,|\vec v|}`, R`\vec u\perp\vec v\iff\vec u\cdot\vec v=0`],
    ex: { q: R`\vec u=(1,2,0),\quad\vec v=(2,-1,3)`, steps: [R`$\vec u\cdot\vec v=2-2+0=0$: **son perpendiculares**.`] } },
  { h: 'Cómo escribir vectores y puntos', body: R`En los ejercicios cuyo resultado es un vector o un punto, escribe las tres componentes entre paréntesis y separadas por comas: «(1, -2, 3)».
Las fracciones se escriben con barra: «(1/2, 0, -3/4)». Los decimales, con punto («0.5»), porque la coma separa componentes.
Si el resultado lleva raíces, vale «sqrt(2)». Cuando el enunciado dice que vale cualquier múltiplo, no hace falta que sea el mismo vector que el de la solución.` },
],

gprod: [
  { h: 'Producto vectorial', body: R`El producto vectorial de dos vectores es otro **vector**, perpendicular a los dos. Se calcula con un determinante. Al cambiar el orden, el resultado cambia de signo: $\vec v\times\vec u=-\,\vec u\times\vec v$.`,
    fx: [R`\vec u\times\vec v=\begin{vmatrix}\vec i&\vec j&\vec k\\u_1&u_2&u_3\\v_1&v_2&v_3\end{vmatrix}`],
    ex: { q: R`\vec u=(1,2,0),\quad\vec v=(0,1,3)`, steps: [R`$\vec u\times\vec v=(2\cdot3-0\cdot1,\ 0\cdot0-1\cdot3,\ 1\cdot1-2\cdot0)$.`, R`Resultado: $(6,-3,1)$.`] } },
  { h: 'Áreas', body: R`El módulo del producto vectorial es el área del paralelogramo que forman los dos vectores. El triángulo es la mitad.`,
    fx: [R`\text{Área paralelogramo}=|\vec u\times\vec v|`, R`\text{Área triángulo }ABC=\tfrac{1}{2}\,|\vec{AB}\times\vec{AC}|`],
    ex: { q: R`\vec u=(1,2,0),\quad\vec v=(0,1,3)`, steps: [R`$\vec u\times\vec v=(6,-3,1)$ y $|\vec u\times\vec v|=\sqrt{36+9+1}=\sqrt{46}$.`, R`El triángulo con esos lados tiene área $\frac{\sqrt{46}}{2}$.`] } },
  { h: 'Producto mixto y volúmenes', body: R`El producto mixto de tres vectores es el determinante de sus componentes. En valor absoluto da el volumen del paralelepípedo; el tetraedro es la sexta parte. Si vale $0$, los tres vectores son **coplanarios**.`,
    fx: [R`[\vec u,\vec v,\vec w]=\vec u\cdot(\vec v\times\vec w)=\begin{vmatrix}u_1&u_2&u_3\\v_1&v_2&v_3\\w_1&w_2&w_3\end{vmatrix}`, R`V_{\text{tetraedro}}=\tfrac{1}{6}\,\left|[\vec{AB},\vec{AC},\vec{AD}]\right|`],
    ex: { q: R`\vec u=(1,0,0),\ \vec v=(0,2,0),\ \vec w=(0,0,3)`, steps: [R`El determinante vale $1\cdot2\cdot3=6$: el paralelepípedo tiene volumen $6$.`] } },
],

grecta: [
  { h: 'Un punto y una dirección', body: R`Una recta queda fijada por un punto $P$ y un **vector director** $\vec d$. Un punto $X$ está en la recta si $\vec{PX}$ es proporcional a $\vec d$.
Si te dan dos puntos $A$ y $B$, un vector director es $\vec{AB}$.`,
    fx: [R`(x,y,z)=(p_1,p_2,p_3)+\lambda\,(d_1,d_2,d_3)`],
    ex: { q: R`A(1,2,3),\quad B(3,2,0)`, steps: [R`$\vec d=\vec{AB}=(2,0,-3)$.`, R`$r:\ (x,y,z)=(1,2,3)+\lambda\,(2,0,-3)$.`] } },
  { h: 'Las cuatro formas', body: R`La misma recta se puede escribir de cuatro maneras. En los ejercicios vale cualquiera, salvo que se pida una forma concreta.
La **continua** solo existe si ninguna componente del vector director es $0$.`,
    fx: [R`\text{Vectorial: }(x,y,z)=(p_1,p_2,p_3)+\lambda(d_1,d_2,d_3)`, R`\text{Paramétricas: }\begin{cases}x=p_1+\lambda d_1\\y=p_2+\lambda d_2\\z=p_3+\lambda d_3\end{cases}`,
      R`\text{Continua: }\frac{x-p_1}{d_1}=\frac{y-p_2}{d_2}=\frac{z-p_3}{d_3}`, R`\text{Implícita: }\begin{cases}a_1x+b_1y+c_1z+d_1=0\\a_2x+b_2y+c_2z+d_2=0\end{cases}`] },
  { h: 'De implícitas a las demás', body: R`Las ecuaciones implícitas son dos planos que se cortan. El vector director de la recta es perpendicular a los dos vectores normales, así que sale del producto vectorial. Para un punto, da un valor a una variable y resuelve.`,
    ex: { q: R`\begin{cases}x+y-3=0\\y-z-1=0\end{cases}`, steps: [R`$\vec n_1=(1,1,0)$, $\vec n_2=(0,1,-1)$ y $\vec d=\vec n_1\times\vec n_2=(-1,1,1)$.`, R`Con $z=0$: $y=1$ y $x=2$, luego $P(2,1,0)$.`, R`Resultado: $(x,y,z)=(2,1,0)+\lambda(-1,1,1)$.`] } },
  { h: 'Cómo escribir una recta', body: R`Cualquier forma vale; esto son ejemplos válidos de la misma recta:
1. «(x,y,z) = (2,1,0) + λ(-1,1,1)»
2. «x = 2 - λ; y = 1 + λ; z = λ»
3. «(x-2)/(-1) = (y-1)/1 = z/1»
4. «x + y = 3; y - z = 1»
Para la letra λ usa la tecla del teclado de la app (también vale t). Si el ejercicio pide una forma concreta, la app te lo indica.` },
],

gplano: [
  { h: 'Ecuación general del plano', body: R`Un plano queda fijado por un punto y un **vector normal** $\vec n=(a,b,c)$, perpendicular al plano. Sus coeficientes son los de la ecuación; el término $d$ se obtiene imponiendo que pasa por el punto.`,
    fx: [R`ax+by+cz+d=0`],
    ex: { q: R`A(1,2,3),\quad\vec n=(2,-1,4)`, steps: [R`Plano: $2x-y+4z+d=0$.`, R`Con $A$: $2-2+12+d=0\ \Rightarrow\ d=-12$.`, R`Resultado: $2x-y+4z-12=0$.`] } },
  { h: 'Por tres puntos', body: R`Dos vectores del plano, como $\vec{AB}$ y $\vec{AC}$, dan el normal con su producto vectorial. Es lo mismo si te dan un punto y dos vectores directores.`,
    fx: [R`\vec n=\vec{AB}\times\vec{AC}`],
    ex: { q: R`A(1,0,0),\ B(0,1,0),\ C(0,0,1)`, steps: [R`$\vec{AB}=(-1,1,0)$, $\vec{AC}=(-1,0,1)$ y $\vec n=(1,1,1)$.`, R`Con $A$: $1+d=0$, así que $d=-1$.`, R`Resultado: $x+y+z-1=0$.`] } },
  { h: 'Ecuaciones paramétricas', body: R`Un plano también se escribe con un punto y dos vectores, y dos parámetros: $\lambda$ y $\mu$. Para pasar a la ecuación general, el normal es el producto vectorial de los dos vectores.`,
    fx: [R`(x,y,z)=(p_1,p_2,p_3)+\lambda\,\vec u+\mu\,\vec v`],
    ex: { q: R`(x,y,z)=(1,0,2)+\lambda(1,1,0)+\mu(0,1,1)`, steps: [R`$\vec n=(1,1,0)\times(0,1,1)=(1,-1,1)$.`, R`Con el punto $(1,0,2)$: $1-0+2+d=0\ \Rightarrow\ d=-3$.`, R`Resultado: $x-y+z-3=0$.`] } },
  { h: 'Cómo escribir un plano', body: R`Escribe la ecuación con las variables x, y, z. Vale cualquier múltiplo y cualquier forma:
1. «2x - y + 4z - 12 = 0»
2. «2x - y + 4z = 12»
3. «4x - 2y + 8z = 24»
Con fracciones, «x/2 + y = 3». Los productos entre variables («xy») no son de un plano.` },
],

gpos: [
  { h: 'Recta y plano: punto de corte', body: R`Pasa la recta a paramétricas y sustituye $x,y,z$ en la ecuación del plano. Queda una ecuación con $\lambda$: al despejar, el valor de $\lambda$ da el punto.`,
    ex: { q: R`r:\ \begin{cases}x=1+\lambda\\y=2\lambda\\z=-1+\lambda\end{cases}\qquad\pi:\ x+y-z-4=0`, steps: [R`$(1+\lambda)+2\lambda-(-1+\lambda)-4=0\ \Rightarrow\ 2\lambda-2=0$, luego $\lambda=1$.`, R`Punto: $(2,2,0)$.`] } },
  { h: 'Dos rectas: punto de corte', body: R`Pasa las dos a paramétricas, con **parámetros distintos** ($\lambda$ y $\mu$), e iguala las tres coordenadas. Resuelve el sistema con dos de las ecuaciones y comprueba la tercera.`,
    ex: { q: R`r:\ (1,0,1)+\lambda(1,1,0)\qquad s:\ (0,1,1)+\mu(2,1,0)`, steps: [R`$1+\lambda=2\mu,\ \ \lambda=1+\mu,\ \ 1=1$.`, R`De las dos primeras: $\mu=2$ y $\lambda=3$. La tercera se cumple.`, R`Punto: $(4,3,1)$.`] } },
  { h: 'Posiciones relativas', body: R`**Dos rectas.** Compara los vectores directores.
1. No proporcionales y coplanarias (producto mixto $[\vec{P_1P_2},\vec d_1,\vec d_2]=0$): **se cortan**.
2. No proporcionales y no coplanarias (producto mixto distinto de 0): **se cruzan**.
3. Proporcionales y $P_2$ no está en $r$: **paralelas**; si está en $r$: **coincidentes**.
**Recta y plano.** Si $\vec d\cdot\vec n\neq0$, son secantes. Si vale $0$, mira si un punto de la recta cumple la ecuación del plano: sí, contenida; no, paralela.
**Dos planos.** Si los normales no son proporcionales, son secantes. Si lo son, comprueba si también lo es el término independiente: sí, coinciden; no, son paralelos.` },
  { h: 'Parámetros en el enunciado', body: R`Cuando aparece una letra $m$, traduce la condición geométrica en una ecuación:
1. Recta paralela a plano: $\vec d\cdot\vec n=0$.
2. Recta perpendicular a plano: $\vec d$ y $\vec n$ proporcionales.
3. Rectas paralelas: $\vec d_1$ y $\vec d_2$ proporcionales.
4. Planos perpendiculares: $\vec n_1\cdot\vec n_2=0$.`,
    ex: { q: R`r:\ (1,0,2)+\lambda(2,1,-1)\qquad\pi:\ mx+y+z+5=0`, steps: [R`Paralelos: $\vec d\cdot\vec n=0$, es decir, $2m+1-1=0$.`, R`Resultado: $m=0$.`] } },
  { h: 'Tres planos', body: R`El punto común a tres planos es la solución de un sistema $3\times3$. Si el determinante del sistema no es $0$, la solución es única y se puede hallar con la regla de Cramer: cada incógnita es un cociente de determinantes.`,
    fx: [R`x=\frac{\Delta_x}{\Delta},\qquad y=\frac{\Delta_y}{\Delta},\qquad z=\frac{\Delta_z}{\Delta}`] },
],

gcrit1: [
  { h: 'Un punto y un normal', body: R`En casi todos los problemas de planos necesitas dos cosas: un **punto** y un **vector normal** (o dos vectores del plano, y el normal sale de su producto vectorial).
Traduce cada dato del enunciado:
1. Paralelo a otro plano: tiene su mismo normal.
2. Perpendicular a una recta: el normal es el vector director de la recta.
3. Contiene a una recta o es paralelo a ella: el vector director está en el plano.
4. Perpendicular a otro plano: el normal de ese plano está en el plano.
5. Pasa por $A$ y $B$: $\vec{AB}$ está en el plano.` },
  { h: 'Ejemplo: paralelo a dos rectas', body: R`Plano que pasa por $A$ y es paralelo a las rectas $r$ y $s$: sus vectores directores están en el plano, así que el normal es su producto vectorial.`,
    ex: { q: R`A(1,0,2),\quad\vec d_r=(1,1,0),\quad\vec d_s=(0,1,1)`, steps: [R`$\vec n=\vec d_r\times\vec d_s=(1,-1,1)$.`, R`Plano: $x-y+z+d=0$ y, con $A$: $1+2+d=0\ \Rightarrow\ d=-3$.`, R`Resultado: $x-y+z-3=0$.`] } },
  { h: 'Ejemplo: contiene una recta y un punto', body: R`Un vector del plano es el director de la recta. Otro es el que une un punto de la recta con el punto dado. Su producto vectorial es el normal.`,
    ex: { q: R`r:\ (1,0,0)+\lambda(0,1,1),\qquad A(2,1,0)`, steps: [R`$\vec d=(0,1,1)$ y $\vec{PA}=(1,1,0)$, con $P(1,0,0)$.`, R`$\vec n=\vec d\times\vec{PA}=(-1,1,-1)$.`, R`Plano: $-x+y-z+d=0$ y, con $P$: $d=1$. Es decir, $x-y+z-1=0$.`] } },
  { h: 'Plano mediador', body: R`El plano mediador de $AB$ es perpendicular al segmento y pasa por su punto medio: el normal es $\vec{AB}$ y el punto es $M=\frac{A+B}{2}$.`,
    ex: { q: R`A(1,2,3),\quad B(3,2,1)`, steps: [R`$\vec n=\vec{AB}=(2,0,-2)$ y $M=(2,2,2)$.`, R`Plano: $2x-2z+d=0$ y, con $M$: $4-4+d=0$, así que $d=0$.`, R`Resultado: $x-z=0$.`] } },
],

gcrit2: [
  { h: 'Un punto y una dirección', body: R`Para una recta necesitas un **punto** y un **vector director**. Traduce cada dato:
1. Paralela a otra recta: mismo vector director.
2. Perpendicular a un plano: el director es el normal del plano.
3. Paralela a dos planos: el director es perpendicular a los dos normales, $\vec n_1\times\vec n_2$.
4. Perpendicular a dos rectas: el director es $\vec d_1\times\vec d_2$.` },
  { h: 'Rectas que cortan a otra', body: R`Si la recta pedida debe **cortar** a $r$, el truco es encontrar el punto de corte $Q$. Entonces la recta pedida pasa por $A$ y por $Q$.
1. Para «paralela a un plano $\pi$ y corta a $r$»: el plano paralelo a $\pi$ por $A$ corta a $r$ en $Q$.
2. Para «corta perpendicularmente a $r$»: el plano perpendicular a $r$ por $A$ corta a $r$ en $Q$.`,
    ex: { q: R`A(1,2,0),\quad r:\ (0,0,0)+\lambda(1,1,1)`, steps: [R`Plano perpendicular a $r$ por $A$: $x+y+z+d=0$ con $1+2+0+d=0$, así que $x+y+z-3=0$.`, R`Sustituimos $r$: $3\lambda-3=0\ \Rightarrow\ \lambda=1$, luego $Q(1,1,1)$.`, R`Dirección: $\vec{AQ}=(0,-1,1)$. Recta: $(x,y,z)=(1,2,0)+\lambda(0,-1,1)$.`] } },
  { h: 'Recta que corta a dos rectas', body: R`Si la recta debe pasar por $A$ y cortar a $r$ y a $s$, está en el plano que contiene a $A$ y a $r$, y también en el plano que contiene a $A$ y a $s$: es la **intersección** de esos dos planos.
Halla cada plano con un punto y dos vectores, y el director de la recta es el producto vectorial de los dos normales.` },
],

gdist: [
  { h: 'Distancia de un punto a un plano', body: R`Es la longitud de la perpendicular desde el punto al plano.`,
    fx: [R`d(A,\pi)=\frac{|ax_0+by_0+cz_0+d|}{\sqrt{a^{2}+b^{2}+c^{2}}}`],
    ex: { q: R`A(1,2,3),\quad\pi:\ 2x-y+2z-4=0`, steps: [R`$d=\frac{|2-2+6-4|}{\sqrt{4+1+4}}=\frac{2}{3}$.`] } },
  { h: 'De un punto a una recta', body: R`Con $P$ un punto cualquiera de la recta y $\vec d$ su vector director, el área del paralelogramo que forman $\vec{PA}$ y $\vec d$ dividida entre la base $|\vec d|$ da la altura.`,
    fx: [R`d(A,r)=\frac{|\vec{PA}\times\vec d|}{|\vec d|}`],
    ex: { q: R`A(1,0,0),\quad r:\ (0,0,0)+\lambda(0,1,1)`, steps: [R`$\vec{PA}=(1,0,0)$ y $\vec{PA}\times\vec d=(0,-1,1)$.`, R`$d=\frac{\sqrt{2}}{\sqrt{2}}=1$.`] } },
  { h: 'Paralelos y cruzadas', body: R`1. Entre **rectas paralelas**: distancia de un punto de una a la otra.
2. Entre **recta y plano paralelos**, o entre **planos paralelos**: distancia de un punto de uno al otro.
3. Entre **rectas que se cruzan**: el volumen del paralelepípedo entre la base que forman $\vec d_1$ y $\vec d_2$.`,
    fx: [R`d(r,s)=\frac{\left|[\vec{P_1P_2},\vec d_1,\vec d_2]\right|}{|\vec d_1\times\vec d_2|}`],
    ex: { q: R`r:\ (0,0,0)+\lambda(1,0,0),\qquad s:\ (0,0,1)+\mu(0,1,0)`, steps: [R`$\vec{P_1P_2}=(0,0,1)$ y $\vec d_1\times\vec d_2=(0,0,1)$.`, R`$[\vec{P_1P_2},\vec d_1,\vec d_2]=1$, así que $d=\frac{1}{1}=1$.`] } },
  { h: 'Cómo dar el resultado', body: R`Puedes dejar la raíz o escribirla con decimales. Por ejemplo, «sqrt(14)/7» o «0.5345». Con decimales, la app acepta tu valor si está bien redondeado a las cifras que has escrito.` },
],

gang: [
  { h: 'Ángulo entre rectas y entre planos', body: R`El ángulo entre dos **rectas** es el de sus vectores directores, y el de dos **planos** es el de sus vectores normales. Se pone valor absoluto en el numerador para quedarse con el ángulo agudo.`,
    fx: [R`\cos\alpha=\frac{|\vec u\cdot\vec v|}{|\vec u|\,|\vec v|}`],
    ex: { q: R`\vec d_1=(1,1,0),\quad\vec d_2=(1,0,0)`, steps: [R`$\cos\alpha=\frac{1}{\sqrt{2}\cdot1}=\frac{\sqrt{2}}{2}$.`, R`$\alpha=45^\circ$.`] } },
  { h: 'Ángulo entre recta y plano', body: R`El ángulo entre una recta y un plano es el complementario del que forma la recta con el normal, y por eso aparece el **seno** en lugar del coseno.`,
    fx: [R`\operatorname{sen}\alpha=\frac{|\vec d\cdot\vec n|}{|\vec d|\,|\vec n|}`],
    ex: { q: R`\vec d=(1,0,1),\quad\pi:\ z=0\ \ (\vec n=(0,0,1))`, steps: [R`$\operatorname{sen}\alpha=\frac{1}{\sqrt{2}\cdot1}=\frac{\sqrt{2}}{2}$.`, R`$\alpha=45^\circ$.`] } },
  { h: 'Ángulo en un triángulo', body: R`El ángulo en un vértice, por ejemplo $A$, es el que forman los vectores $\vec{AB}$ y $\vec{AC}$. Aquí **no** se usa el valor absoluto: el ángulo puede ser obtuso.` },
  { h: 'Cómo dar el resultado', body: R`Cuando se pide en grados con dos decimales, escribe, por ejemplo, «54.74» o «54,74». También vale la expresión exacta, como «arccos(1/sqrt(3))*180/pi», pero los decimales son más cómodos.` },
],

gsim: [
  { h: 'Simétrico respecto de un punto', body: R`Si $A'$ es el simétrico de $A$ respecto de $M$, entonces $M$ es el punto medio de $AA'$.`,
    fx: [R`A'=2M-A`],
    ex: { q: R`A(1,2,3),\quad M(0,1,2)`, steps: [R`$A'=2(0,1,2)-(1,2,3)=(-1,0,1)$.`] } },
  { h: 'Proyección y simétrico respecto de un plano', body: R`1. Recta perpendicular al plano por $A$: tiene como director el normal del plano.
2. Su punto de corte con el plano es el **pie de la perpendicular** $A_0$: es la proyección ortogonal de $A$.
3. El simétrico es $A'=2A_0-A$.`,
    ex: { q: R`A(1,2,3),\quad\pi:\ x+y+z-3=0`, steps: [R`Recta: $(1+\lambda,\,2+\lambda,\,3+\lambda)$. En el plano: $3\lambda+3=0\ \Rightarrow\ \lambda=-1$.`, R`Proyección: $A_0=(0,1,2)$. Simétrico: $A'=2A_0-A=(-1,0,1)$.`] } },
  { h: 'Respecto de una recta', body: R`1. Plano perpendicular a $r$ por $A$: su normal es el director de $r$.
2. Su punto de corte con $r$ es el pie $A_0$, la proyección ortogonal.
3. Otra vez, $A'=2A_0-A$.`,
    ex: { q: R`A(2,0,1),\quad r:\ (0,1,0)+\lambda(1,1,0)`, steps: [R`Plano perpendicular por $A$: $x+y-2=0$. Con $r$: $\lambda+1+\lambda-2=0\ \Rightarrow\ \lambda=\frac{1}{2}$.`, R`$A_0=\left(\frac{1}{2},\,\frac{3}{2},\,0\right)$ y $A'=2A_0-A=(-1,3,-1)$.`] } },
],

});
})(typeof window !== 'undefined' ? window : globalThis);

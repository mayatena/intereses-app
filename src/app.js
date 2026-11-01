/* Pantallas y flujo: camino, hojas, sesión (teoría + ejercicios), repaso espaciado y resultados. */
(function () {
'use strict';
const E = Engine, T = Topics, TH = Theory, C = Core;
const { $, esc, rich, I, today, addDays, typeset, texInto } = C;
const INT = [1, 2, 4, 8, 16, 32];           // días hasta el próximo repaso según el nivel de dominio (0-5)
const DX = [0, -56, 0, 56];                  // zigzag del camino
const st = () => C.store.st, save = () => C.store.save();
const nd = (id) => st().nodes[id] || {};
const SUBJ = [
  { id: 'int', name: 'Integrales', lead: 'De las derivadas a los volúmenes de revolución, paso a paso.' },
  { id: 'geo', name: 'Geometría', lead: 'Vectores, rectas y planos: de las ecuaciones a los problemas tipo.' },
];
const sOf = (i) => T[i].subj || 'int';
const tab = () => (SUBJ.some((s) => s.id === st().tab) ? st().tab : 'int');
const prevIdx = (i) => { for (let k = i - 1; k >= 0; k--) if (sOf(k) === sOf(i)) return k; return -1; };
const nextIdx = (i) => { for (let k = i + 1; k < T.length; k++) if (sOf(k) === sOf(i)) return k; return -1; };
const isDone = (i) => !!nd(T[i].id).done;
const unlocked = (i) => { const p = prevIdx(i); return p < 0 || isDone(p); };
const curIdx = (sj = tab()) => T.findIndex((t, i) => sOf(i) === sj && !isDone(i) && unlocked(i));
const dueIdx = (sj = tab()) => T.map((t, i) => i).filter((i) => sOf(i) === sj && isDone(i) && (nd(T[i].id).due || '') <= today());
const streakNow = () => { const s = st().streak; return (s.last === today() || s.last === addDays(today(), -1)) ? s.n : 0; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* ---------- hoja inferior ---------- */
function sheet(html) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  sh.innerHTML = '<div class="grab"></div>' + html;
  document.body.append(bd, sh);
  requestAnimationFrame(() => { bd.classList.add('in'); sh.classList.add('in'); });
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { bd.classList.remove('in'); sh.classList.remove('in'); document.removeEventListener('keydown', onKey); setTimeout(() => { bd.remove(); sh.remove(); }, 300); };
  document.addEventListener('keydown', onKey); bd.onclick = close;
  typeset(sh);
  return { el: sh, close };
}

/* ---------- inicio ---------- */
let firstRender = true;
function home() {
  const app = $('#app'), y = window.scrollY;
  const sj = tab(), SJ = SUBJ.find((x) => x.id === sj), L = T.map((t, i) => i).filter((i) => sOf(i) === sj);
  const due = dueIdx(), cur = curIdx(), done = L.filter(isDone).length;
  let hero;
  if (due.length) hero = { t: 'Repaso de hoy', p: due.length + (due.length === 1 ? ' tema para refrescar' : ' temas para refrescar'), b: 'Repasar', a: 'review' };
  else if (cur >= 0) hero = { t: done ? 'Sigue donde lo dejaste' : 'Empieza aquí', p: T[cur].title, b: done ? 'Continuar' : 'Empezar', a: 'cur' };
  else hero = { t: 'Camino completado', p: 'Practica cuando quieras para no perder nivel.' };

  let html = `<div class="top"><div class="chips"><span class="chip">${I.flame}<span>${streakNow()} ${streakNow() === 1 ? 'día' : 'días'}</span></span><span class="chip">${I.bolt}<span>${st().xp} XP</span></span></div>
    <button class="iconbtn" id="bset" aria-label="Ajustes">${I.gear}</button></div>
    <div class="seg" role="tablist" aria-label="Asignatura">${SUBJ.map((x) => `<button role="tab" class="${x.id === sj ? 'on' : ''}" aria-selected="${x.id === sj}" data-s="${x.id}">${x.name}${x.id !== sj && dueIdx(x.id).length ? '<i class="dot" title="Tienes repasos pendientes"></i>' : ''}</button>`).join('')}</div>
    <h1>${SJ.name}</h1><p class="lead">${SJ.lead}</p>
    <div class="hero"><div class="grow"><h2>${esc(hero.t)}</h2><p>${esc(hero.p)}</p></div>${hero.b ? `<button class="btn sm" id="hbtn" style="flex:none">${hero.b}</button>` : ''}</div>`;
  let last = null;
  L.forEach((i, j) => {
    const t = T[i];
    if (t.island !== last) { if (last !== null) html += '</div></section>'; html += `<section class="island"><h2>${esc(t.island)}</h2><div class="path">`; last = t.island; }
    else {
      const x1 = 150 + DX[(j - 1) % 4], x2 = 150 + DX[j % 4];
      html += `<svg class="link ${isDone(L[j - 1]) ? 'done' : ''}" viewBox="0 0 300 38" preserveAspectRatio="none" aria-hidden="true"><path d="M${x1} 0 C${x1} 19 ${x2} 19 ${x2} 38"/></svg>`;
    }
    const s = isDone(i) ? 'done' : unlocked(i) ? 'open' : 'locked', n = nd(t.id);
    const dots = s === 'done' ? '<div class="dots" title="Nivel de dominio">' + [0, 1, 2, 3, 4].map((k) => `<i class="${k < (n.box || 0) ? 'on' : ''}"></i>`).join('') + '</div>' : '';
    html += `<div class="node ${s}" style="--dx:${DX[j % 4]}px"><button class="nb ${s}" data-i="${i}" aria-label="${esc(t.title)}${s === 'locked' ? ', bloqueado' : ''}">${s === 'done' ? I.check : s === 'open' ? I.play : I.lock}</button>
      <div class="nl">${esc(t.title)}</div><div class="ns">${esc(t.sub)}</div>${dots}${due.includes(i) ? '<div class="due">Repasar hoy</div>' : ''}</div>`;
  });
  html += '</div></section>';
  app.innerHTML = html;
  app.querySelectorAll('.nb').forEach((b) => { b.onclick = () => nodeSheet(+b.dataset.i); });
  $('#bset').onclick = settings;
  app.querySelectorAll('.seg button').forEach((b) => { b.onclick = () => { if (b.dataset.s === sj) return; st().tab = b.dataset.s; save(); firstRender = true; window.scrollTo(0, 0); home(); }; });
  const hb = $('#hbtn');
  if (hb) hb.onclick = () => (hero.a === 'review' ? run({ mode: 'review', ids: due.slice(0, 3).map((i) => T[i].id) }) : run({ mode: 'lesson', ids: [T[cur].id], theory: true }));
  if (firstRender) {
    firstRender = false;
    const o = app.querySelector('.nb.open');
    if (o && L.indexOf(cur) > 2) window.scrollTo(0, window.scrollY + o.getBoundingClientRect().top - window.innerHeight / 2);
  } else window.scrollTo(0, y);
}

function nodeSheet(i) {
  const t = T[i], s = isDone(i) ? 'done' : unlocked(i) ? 'open' : 'locked', n = nd(t.id);
  let body = `<h3>${esc(t.title)}</h3><p class="sub">${esc(t.sub)}${s === 'done' && n.best != null ? ' · Mejor resultado: ' + Math.round(n.best * 100) + ' %' : ''}</p><div class="stack">`;
  if (s === 'locked') body += `<p class="sub" style="margin:0">Completa «${esc(T[prevIdx(i)].title)}» para desbloquearlo. Si ya lo dominas, salta con un test de 5 ejercicios sin fallar ninguno.</p>
    <button class="btn" data-a="test">Hacer el test</button><button class="btn sec" data-a="theory">Ver teoría</button>`;
  else if (s === 'open') body += '<button class="btn" data-a="lesson">Empezar lección</button><button class="btn sec" data-a="theory">Ver teoría</button>';
  else body += '<button class="btn" data-a="practice">Practicar</button><button class="btn sec" data-a="theory">Ver teoría</button>';
  const sh = sheet(body + '</div>');
  sh.el.querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.a; sh.close();
      setTimeout(() => run(a === 'lesson' ? { mode: 'lesson', ids: [t.id], theory: true } : a === 'theory' ? { mode: 'theory', ids: [t.id] } : { mode: a, ids: [t.id] }), 180);
    };
  });
}

function settings() {
  const sh = sheet(`<h3>Ajustes y ayuda</h3><p class="sub">Todo se guarda en este dispositivo.</p>
    <h4>Cómo escribir las respuestas</h4><ul>
      <li>Potencias: «x^2», «x^(3/2)». Fracciones: «1/3», «(x+1)/(x-1)».</li>
      <li>Funciones: «sen(x)», «cos(2x)», «tg(x)», «ln(x)», «e^(2x)», «sqrt(x)», «arctg(x)».</li>
      <li>Valor absoluto: «|x|» o «abs(x)». Constantes: «pi» y «e».</li>
      <li>Las primitivas se comprueban derivando: cualquier forma equivalente vale y no hace falta «+C».</li>
      <li>En resultados numéricos vale el valor exacto («ln(2)», «pi/3») o un decimal bien redondeado.</li></ul>
    <h4>Geometría</h4><ul>
      <li>Vectores y puntos: «(1, -2, 3)». Fracciones con barra («1/2») y decimales con punto («0.5»), porque la coma separa componentes.</li>
      <li>Planos: «2x - y + z = 4». Vale cualquier múltiplo de la ecuación.</li>
      <li>Rectas: vectorial «(x,y,z) = (1,0,2) + λ(1,1,0)», paramétricas separadas por «;», continua o implícita. Si el ejercicio pide una forma, la app lo indica.</li>
      <li>Distancias y ángulos: valor exacto («sqrt(14)/7») o un decimal bien redondeado; los ángulos, en grados.</li></ul>
    <h4>Instalar en el móvil</h4><ul><li>iPhone: Compartir, «Añadir a pantalla de inicio».</li><li>Android: menú ⋮, «Instalar aplicación».</li></ul>
    <h4>Progreso</h4><div class="stack"><button class="btn sec" id="rs">Borrar mi progreso</button></div>`);
  const rs = $('#rs', sh.el);
  rs.onclick = () => {
    if (rs.dataset.sure) { C.store.reset(); sh.close(); home(); return; }
    rs.dataset.sure = 1; rs.textContent = 'Pulsa otra vez para confirmar'; rs.classList.remove('sec'); rs.classList.add('bad');
  };
}

/* ---------- sesión ---------- */
const KEYS = [
  { l: 'x', t: 'x', nn: 1 }, { l: 'xⁿ', t: '^' }, { l: 'x²', t: '^2', nn: 1 }, { l: '( )', t: '()', b: 1 }, { l: '÷', t: '/' },
  { l: '√', t: 'sqrt()', b: 1 }, { l: 'eˣ', t: 'e^()', b: 1 }, { l: 'ln', t: 'ln()', b: 1 }, { l: 'sen', t: 'sen()', b: 1 }, { l: 'cos', t: 'cos()', b: 1 },
  { l: 'tg', t: 'tg()', b: 1 }, { l: 'arctg', t: 'arctg()', b: 1 }, { l: '|x|', t: 'abs()', b: 1, nn: 1 }, { l: 'π', t: 'pi' }, { l: 'e', t: 'e' },
  { l: '+', t: '+' }, { l: '−', t: '-' }, { l: '·', t: '*' }, { l: '⌫', t: 'BS' },
];
const GK = (l, t, b) => ({ l, t, b });
const GKEYS = {
  vec: [GK('( )', '()', 1), GK(',', ','), GK('−', '-'), GK('/', '/'), GK('√', 'sqrt()', 1), GK('π', 'pi'), GK('⌫', 'BS')],
  plane: [GK('x', 'x'), GK('y', 'y'), GK('z', 'z'), GK('=', '='), GK('+', '+'), GK('−', '-'), GK('·', '*'), GK('( )', '()', 1), GK('/', '/'), GK('⌫', 'BS')],
  line: [GK('x', 'x'), GK('y', 'y'), GK('z', 'z'), GK('λ', 'λ'), GK('=', '='), GK('( )', '()', 1), GK(',', ','), GK(';', '; '), GK('+', '+'), GK('−', '-'), GK('/', '/'), GK('⌫', 'BS')],
  gnum: [GK('√', 'sqrt()', 1), GK('( )', '()', 1), GK('/', '/'), GK('π', 'pi'), GK('+', '+'), GK('−', '-'), GK('·', '*'), GK('⌫', 'BS')],
};
function ansTex(ex) {
  if (ex.ansTex) return ex.ansTex;
  if (ex.kind === 'anti') return 'F(x)=' + E.LATEX(ex.sol) + '+C';
  if (ex.kind === 'func') return "f'(x)=" + E.LATEX(ex.f);
  const v = E.fn(ex.value)(0), ex0 = E.LATEX(ex.value);
  return ex0 + (Number.isInteger(v) || /^-?\d+$/.test(ex.value) ? '' : '\\approx ' + String(+v.toFixed(4)).replace('.', '{,}'));
}

function run(cfg) {
  const S = { mode: cfg.mode, ids: cfg.ids, tid: cfg.ids[0], phase: cfg.mode === 'theory' || cfg.theory ? 'theory' : 'ask', tp: 0,
    N: cfg.mode === 'review' ? 6 : cfg.mode === 'test' ? 5 : 8, queue: [], resolved: 0, correct: 0, first: 0, xp: 0, per: {}, extras: 0, cur: null, att: 0, fail: false, locked: false };
  if (cfg.mode === 'review') for (let k = 0; k < S.N; k++) S.queue.push({ id: S.ids[k % S.ids.length], d: 0.25 + Math.random() * 0.65 });
  else if (cfg.mode !== 'theory') for (let k = 0; k < S.N; k++) S.queue.push({ id: S.tid, d: cfg.mode === 'test' ? 0.3 + 0.7 * k / (S.N - 1) : k / (S.N - 1) });

  const el = document.createElement('div'); el.className = 'session'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.innerHTML = `<div class="s-top"><div class="s-in row"><button class="iconbtn" id="sx" aria-label="Cerrar">${I.close}</button><div class="bar"><i id="sbar"></i></div><span class="s-count" id="scnt"></span></div></div>
    <div class="s-body" id="sbody"><div class="s-in" id="sin"></div></div><div class="s-foot"><div class="s-in" id="sfoot"></div></div>`;
  document.body.appendChild(el); document.body.style.overflow = 'hidden';
  const body = $('#sin', el), foot = $('#sfoot', el), bar = $('#sbar', el), cnt = $('#scnt', el), scroller = $('#sbody', el), barBox = $('.bar', el);
  const vv = window.visualViewport;
  const fit = () => { el.style.top = vv.offsetTop + 'px'; el.style.height = vv.height + 'px'; el.style.bottom = 'auto'; };
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit(); }
  const close = () => { if (vv) { vv.removeEventListener('resize', fit); vv.removeEventListener('scroll', fit); } el.remove(); document.body.style.overflow = ''; home(); };
  $('#sx', el).onclick = () => {
    if (S.phase !== 'ask' || (S.resolved === 0 && S.att === 0)) return close();
    const sh = sheet('<h3>¿Salir de la sesión?</h3><p class="sub">Se perderá el avance de esta sesión.</p><div class="stack"><button class="btn" id="keep">Seguir</button><button class="btn sec" id="leave">Salir</button></div>');
    $('#keep', sh.el).onclick = sh.close; $('#leave', sh.el).onclick = () => { sh.close(); close(); };
  };
  const setBar = () => { const tot = S.N + S.extras; bar.style.width = (100 * S.resolved / tot) + '%'; cnt.textContent = Math.min(S.resolved, tot) + '/' + tot; };

  /* teoría */
  function theory() {
    const pages = TH[S.tid] || [], p = pages[S.tp];
    if (!p) { S.phase = 'ask'; return ask(); }
    barBox.style.visibility = 'hidden'; cnt.textContent = (S.tp + 1) + '/' + pages.length;
    const last = S.tp === pages.length - 1;
    body.innerHTML = `<div class="tpage"><h3>${esc(p.h)}</h3>${p.body ? rich(p.body) : ''}${p.fx ? '<div class="fxs">' + p.fx.map((f) => `<div class="fx">$$${f}$$</div>`).join('') + '</div>' : ''}
      ${p.ex ? `<div class="ex"><div class="tag">Ejemplo</div><div class="fx" style="background:none;padding:6px 0">$$${p.ex.q.includes('\\qquad') ? '\\begin{array}{l}' + p.ex.q.split('\\qquad').map((x) => x.trim()).join('\\\\[6pt]') + '\\end{array}' : p.ex.q}$$</div>${p.ex.steps.map((s) => `<div class="st">${rich(s).replace(/^<p>|<\/p>$/g, '')}</div>`).join('')}</div>` : ''}</div>
      <div class="pdots">${pages.map((_, k) => `<i class="${k <= S.tp ? 'on' : ''}"></i>`).join('')}</div>`;
    typeset(body); scroller.scrollTop = 0;
    foot.innerHTML = `<div class="row">${S.tp > 0 ? '<button class="btn sec" id="back" style="width:auto;padding-inline:22px">Atrás</button>' : ''}<button class="btn grow" id="nx">${last ? (S.mode === 'theory' ? 'Listo' : 'Empezar ejercicios') : 'Siguiente'}</button></div>`;
    const bk = $('#back', el); if (bk) bk.onclick = () => { S.tp--; theory(); };
    $('#nx', el).onclick = () => { if (!last) { S.tp++; theory(); } else if (S.mode === 'theory') close(); else { S.phase = 'ask'; barBox.style.visibility = ''; ask(); } };
  }

  /* ejercicio */
  function ask() {
    if (!S.queue.length) return finish();
    const d = S.queue.shift(), topic = T.find((t) => t.id === d.id); let ex;
    try { ex = topic.gen(d.d); } catch (e) { return ask(); }
    S.cur = ex; S.curTopic = topic.id; S.att = 0; S.locked = false; barBox.style.visibility = ''; setBar();
    body.innerHTML = `<div class="prompt${ex.geo ? ' geo' : ''}">${rich(ex.prompt)}</div><div class="q${ex.geo ? ' geo' : ''}" id="qbox"></div>
      <div class="field" id="fld"><label for="ans">${esc(ex.label)}</label><input id="ans" type="text"${ex.ph ? ' placeholder="' + esc(ex.ph) + '"' : ''} inputmode="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Tu respuesta"></div>
      <div class="pv" id="pv"><span class="lbl">Vista previa</span></div><div class="keys" id="keys" role="group" aria-label="Teclado matemático"></div><div id="fbbox" aria-live="polite"></div>`;
    if (ex.geo) typeset($('.prompt', el));
    if (ex.qtex) texInto($('#qbox', el), ex.qtex, true); else $('#qbox', el).hidden = true;
    const input = $('#ans', el), fld = $('#fld', el), fb = $('#fbbox', el), pv = $('#pv', el), keys = $('#keys', el);
    scroller.scrollTop = 0;
    (ex.geo ? GKEYS[ex.keys] || GKEYS.gnum : KEYS.filter((k) => !(ex.kind === 'num' && k.nn))).forEach((k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = k.l; b.setAttribute('aria-label', k.l);
      b.addEventListener('pointerdown', (e) => e.preventDefault());
      b.onclick = () => {
        const a = input.selectionStart, z = input.selectionEnd; input.focus({ preventScroll: true });
        if (k.t === 'BS') { const s = a === z ? Math.max(0, a - 1) : a; input.value = input.value.slice(0, s) + input.value.slice(z); input.setSelectionRange(s, s); }
        else { input.value = input.value.slice(0, a) + k.t + input.value.slice(z); const p = a + k.t.length - (k.b ? 1 : 0); input.setSelectionRange(p, p); }
        upd();
      };
      keys.appendChild(b);
    });
    foot.innerHTML = '<button class="btn" id="chk" disabled>Comprobar</button>';
    const chk = $('#chk', el); let pt;
    function upd() {
      chk.disabled = !input.value.trim() || S.locked; clearTimeout(pt);
      pt = setTimeout(() => {
        const v = input.value; if (!v.trim()) { pv.className = 'pv'; pv.innerHTML = '<span class="lbl">Vista previa</span>'; return; }
        const r = E.preview(v, ex);
        if (r.ok) { pv.className = 'pv'; pv.innerHTML = '<span class="lbl">Se lee</span><span id="pvx"></span>'; texInto($('#pvx', el), r.tex); }
        else { pv.className = 'pv err'; pv.textContent = r.msg; }
      }, 90);
    }
    input.oninput = upd;
    input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (S.locked) next(); else if (!chk.disabled) check(); } };
    chk.onclick = () => (S.locked ? next() : check());
    const solBlock = () => { const id = 'fin' + Math.random().toString(36).slice(2, 7); return { id, html: `<div class="sol">${rich(S.cur.steps.join('\n'))}<div class="fin" id="${id}"></div></div>` }; };
    const showSol = () => { const s = solBlock(); fb.insertAdjacentHTML('beforeend', s.html); typeset(fb); texInto($('#' + s.id, el), ansTex(S.cur), true); };
    const lockUI = () => { S.locked = true; input.disabled = true; chk.disabled = false; chk.textContent = 'Continuar'; chk.classList.remove('bad'); };
    const shake = () => { fld.classList.add('bad'); setTimeout(() => fld.classList.remove('bad'), 800); };
    const tally = (firstTry) => { const p = S.per[S.curTopic] || (S.per[S.curTopic] = { n: 0, first: 0 }); p.n++; if (firstTry) p.first++; S.resolved++; setBar(); };

    function check() {
      const r = E.check(ex, input.value);
      if (r.err || r.empty) { fb.innerHTML = `<div class="fb bad"><b>Revisa cómo lo has escrito</b>${esc(r.msg)}</div>`; shake(); return; }
      if (r.ok) {
        const firstTry = S.att === 0; S.correct++; S.xp += firstTry ? 10 : 5; if (firstTry) S.first++; tally(firstTry); lockUI(); fld.classList.add('good');
        fb.innerHTML = `<div class="fb ok"><b>${pick(['Correcto', 'Muy bien', 'Perfecto', 'Así se hace'])}</b>${r.approx ? (ex.geo ? 'Valor aproximado aceptado.' : 'Valor aproximado aceptado. El exacto es $' + E.LATEX(ex.value) + '$.') : ''}<div><button class="btn sec sm hintbtn" id="sv">Ver solución</button></div></div>`;
        typeset(fb); $('#sv', el).onclick = (e) => { e.target.remove(); showSol(); };
        chk.focus({ preventScroll: true }); return;
      }
      S.att++;
      if (S.mode !== 'test' && S.att === 1) {
        fb.innerHTML = `<div class="fb bad"><b>No es correcto</b>${esc(r.msg)}<div><button class="btn sec sm hintbtn" id="hb">Ver pista</button></div></div>`; shake();
        $('#hb', el).onclick = (e) => { e.target.remove(); fb.insertAdjacentHTML('beforeend', `<div class="hint">${rich(ex.hint || 'Revisa el procedimiento paso a paso.').replace(/^<p>|<\/p>$/g, '')}</div>`); typeset(fb); };
        input.focus({ preventScroll: true }); input.select(); return;
      }
      if (S.mode === 'test') S.fail = true;
      else if (S.extras < 4) { S.queue.push({ id: S.curTopic, d: 0.4 + Math.random() * 0.5 }); S.extras++; }
      tally(false); lockUI();
      fb.innerHTML = `<div class="fb bad"><b>Esta vez no</b>${esc(r.msg)} Así se resuelve:</div>`; showSol(); chk.focus({ preventScroll: true });
    }
    function next() { if (S.fail) finish(); else ask(); }
    input.focus({ preventScroll: true });
  }

  /* resultado */
  function bump(id, acc) {
    const n = st().nodes[id] || (st().nodes[id] = {}), first = !n.done;
    n.done = true; n.seen = (n.seen || 0) + 1; n.best = Math.max(n.best || 0, acc);
    if (first) n.box = acc >= 0.8 ? 1 : 0; else if (acc >= 0.8) n.box = Math.min(5, (n.box || 0) + 1); else if (acc < 0.6) n.box = Math.max(0, (n.box || 0) - 1);
    n.due = addDays(today(), INT[n.box || 0]);
  }
  function finish() {
    S.phase = 'done'; barBox.style.visibility = ''; bar.style.width = '100%'; cnt.textContent = '';
    const s = st(), acc = S.first / S.N, idx = T.findIndex((t) => t.id === S.tid);
    let title, sub, icon = I.check, cls = '', accTxt = Math.round(acc * 100) + ' %';
    if (S.mode === 'test') {
      if (!S.fail) {
        for (let i = 0; i <= idx; i++) { if (sOf(i) !== sOf(idx)) continue; const n = s.nodes[T[i].id] || (s.nodes[T[i].id] = {}); if (!n.done) { n.done = true; n.skipped = true; n.box = 1; n.due = addDays(today(), INT[1]); n.best = 1; n.seen = 0; } }
        S.xp += 30; title = '¡Test superado!'; sub = 'Has desbloqueado «' + T[idx].title + '» y todos los temas anteriores.'; accTxt = '5/5';
      } else { title = 'Aún no'; sub = 'Haz la lección para dominar este tema y vuelve a intentarlo cuando quieras.'; icon = I.lock; cls = 'warn'; accTxt = S.correct + '/5'; }
    } else if (S.mode === 'review') {
      Object.keys(S.per).forEach((id) => bump(id, S.per[id].first / S.per[id].n));
      title = 'Repaso terminado'; sub = S.first + ' de ' + S.N + ' a la primera. Volverán a salir cuando toque.';
    } else {
      const was = isDone(idx); bump(S.tid, acc);
      title = S.mode === 'lesson' ? 'Lección completada' : 'Práctica terminada';
      sub = S.first + ' de ' + S.N + ' a la primera.';
      if (!was && nextIdx(idx) >= 0) sub += ' Has desbloqueado «' + T[nextIdx(idx)].title + '».';
      else if (acc < 0.6) sub += ' Lo repasaremos pronto para afianzarlo.';
    }
    if (S.correct > 0) { const k = s.streak; if (k.last !== today()) { k.n = k.last === addDays(today(), -1) ? k.n + 1 : 1; k.last = today(); } }
    s.xp += S.xp; save();
    body.innerHTML = `<div class="done-screen"><div class="big ${cls}">${icon}</div><h2>${esc(title)}</h2><p class="lead">${esc(sub)}</p>
      <div class="stats"><div class="stat"><b>+${S.xp}</b><span>XP</span></div><div class="stat"><b>${accTxt}</b><span>Aciertos a la primera</span></div><div class="stat"><b>${streakNow()}</b><span>${streakNow() === 1 ? 'Día de racha' : 'Días de racha'}</span></div></div></div>`;
    foot.innerHTML = '<button class="btn" id="fin">Continuar</button>';
    $('#fin', el).onclick = close; scroller.scrollTop = 0;
  }

  if (S.phase === 'theory') theory(); else ask();
}

home();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('.session')) home(); });
})();

/* Núcleo de la interfaz: estado persistente, fechas, iconos, texto enriquecido y render de fórmulas. */
(function (root) {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* texto con **negrita**, «código», líneas y listas numeradas */
function rich(text) {
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/«([^»]+)»/g, '<code>$1</code>');
  let html = '', ol = [];
  const flush = () => { if (ol.length) { html += '<ol>' + ol.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ol>'; ol = []; } };
  for (const line of String(text).split('\n')) {
    const m = /^\d+\.\s+(.*)$/.exec(line);
    if (m) ol.push(m[1]); else { flush(); if (line.trim()) html += '<p>' + inline(line) + '</p>'; }
  }
  flush(); return html;
}

/* iconos (trazo o relleno, heredan el color del texto) */
const S = (body, extra = '') => '<svg class="i" viewBox="0 0 24 24" ' + extra + ' aria-hidden="true">' + body + '</svg>';
const ST = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
const I = {
  check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ST),
  lock: S('<path d="M7 10.5V8a5 5 0 0 1 10 0v2.5M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5z"/>', 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"'),
  play: S('<path d="M8.5 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L10 4.74a1 1 0 0 0-1.5.86z"/>', 'fill="currentColor"'),
  close: S('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', ST),
  flame: S('<path d="M12.5 2.2c.4 2.6 1.7 3.9 3.2 5.6 1.6 1.8 2.8 3.6 2.8 6.2a6.5 6.5 0 0 1-13 0c0-2.4 1-4.1 2.4-5.4.2 1.4.9 2.4 1.9 2.8-.4-3.6.3-6.5 2.7-11.2zM12 20.2a2.9 2.9 0 0 0 2.9-2.9c0-1.5-1-2.4-2.1-3.5-.3 1.1-.9 1.6-1.6 1.9-.6.7-2.1 1.4-2.1 3.6A2.9 2.9 0 0 0 12 20.2z" fill-rule="evenodd"/>', 'fill="currentColor"'),
  bolt: S('<path d="M13.2 2.5L5 13.4h6l-.9 8.1 8.4-11.2h-6.1l.8-7.8z"/>', 'fill="currentColor"'),
  gear: S('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>', ST),
};

/* fechas locales (aaaa-mm-dd) */
const pad = (n) => String(n).padStart(2, '0');
const dstr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => dstr(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return dstr(new Date(y, m - 1, d + n)); };

/* estado guardado en el dispositivo (si el navegador no deja, funciona solo en memoria) */
const KEY = 'integra.v1';
const blank = () => ({ v: 1, xp: 0, streak: { n: 0, last: '' }, nodes: {} });
function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.v === 1) return j; } catch (e) { /* sin almacenamiento */ }
  return blank();
}
const store = { st: load() };
store.save = () => { try { localStorage.setItem(KEY, JSON.stringify(store.st)); } catch (e) { /* sin almacenamiento */ } };
store.reset = () => { store.st = blank(); store.save(); };

/* MathJax: espera a que cargue y encadena los renders */
let chain = Promise.resolve();
function whenMJ(cb, tries = 0) {
  const M = root.MathJax;
  if (M && M.typesetPromise && M.startup && M.startup.promise) M.startup.promise.then(() => cb(true));
  else if (tries > 150) cb(false);
  else setTimeout(() => whenMJ(cb, tries + 1), 100);
}
function typeset(el) {
  el.classList.add('mj-wait');
  whenMJ((ok) => {
    if (!ok) { el.classList.remove('mj-wait'); return; }
    chain = chain.then(() => root.MathJax.typesetPromise([el])).catch(() => {}).then(() => el.classList.remove('mj-wait'));
  });
}
function texInto(el, tex, display) {
  whenMJ((ok) => {
    if (!ok) { el.textContent = tex; return; }
    try { el.replaceChildren(root.MathJax.tex2svg(tex, { display: !!display })); } catch (e) { el.textContent = tex; }
  });
}

root.Core = { $, esc, rich, I, today, addDays, store, typeset, texInto };
})(typeof window !== 'undefined' ? window : globalThis);

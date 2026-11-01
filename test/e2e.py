import json, sys, time, random
from playwright.sync_api import sync_playwright
SH='/tmp/claude-0/-home-claude/d41624be-0c75-5907-ab38-b377d95442f4/scratchpad/shots/'
KATEX_JS=open('/opt/npm-tools/node_modules/katex/dist/katex.min.js').read()
SHIM=KATEX_JS+r"""
;(function(){
 const render=(t,d)=>katex.renderToString(t,{displayMode:d,throwOnError:false});
 const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 window.MathJax={startup:{promise:Promise.resolve()},
  typesetPromise:async(els)=>{for(const el of els){
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    for(const n of nodes){ if(!n.nodeValue.includes('$')||n.parentElement.closest('.katex'))continue;
      const html=n.nodeValue.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/).map(seg=>seg.startsWith('$$')?render(seg.slice(2,-2),true):seg.startsWith('$')&&seg.length>2?render(seg.slice(1,-1),false):esc(seg)).join('');
      const sp=document.createElement('span');sp.innerHTML=html;n.replaceWith(...sp.childNodes);} } },
  tex2svg:(t,o)=>{const s=document.createElement('span');s.innerHTML=render(t,o&&o.display);return s;}};
})();
"""
errors=[]; fails=[]
def ok(c,m):
    if not c: fails.append(m); print('  ✗',m)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    page=ctx.new_page()
    page.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
    page.on('pageerror',lambda e: errors.append('PAGEERROR '+str(e)))
    page.route('**/mathjax/**',lambda r: r.fulfill(body=SHIM,content_type='application/javascript'))
    def load(state=None):
        page.goto('file:///home/claude/integra/dist/index.html')
        page.evaluate("s=>{localStorage.clear(); if(s) localStorage.setItem('integra.v1',JSON.stringify(s));}",state)
        page.reload()
        page.add_style_tag(url='file:///opt/npm-tools/node_modules/katex/dist/katex.min.css')
        page.evaluate("()=>{Topics.forEach(t=>{const g=t.gen;t.gen=(d)=>{const e=g(d);window.__ex=e;return e;};});}")
        page.wait_for_selector('.nb')
    def state(n):  # primeros n temas completados
        ids=['deriv','pot','elem','lin','sust','partes','racio','barrow','areas','vol']
        return {'v':1,'xp':0,'streak':{'n':0,'last':''},'nodes':{i:{'done':True,'box':1,'due':'2999-01-01','best':1,'seen':1} for i in ids[:n]}}
    def ans(ex,i=0):
        v=ex['sol'] if ex['kind']=='anti' else ex['f'] if ex['kind']=='func' else ex['value']
        if ex['kind']=='anti' and i%3==1: v='('+v+')+C'
        return v
    def answer_all(n,label):
        for k in range(n+8):
            if page.query_selector('.done-screen'): return
            page.wait_for_selector('#ans')
            ex=page.evaluate('window.__ex'); a=ans(ex,k)
            page.fill('#ans',a); page.wait_for_timeout(120)
            page.press('#ans','Enter')
            try: page.wait_for_selector('.fb.ok',timeout=2500)
            except Exception: ok(False,f'{label}: no acepta la respuesta correcta {a!r} ({ex["kind"]}, f={ex.get("f")})'); page.screenshot(path=SH+'FAIL.png'); return
            page.click('#chk')
    # ---------- A: primera lección completa con capturas ----------
    load(); page.screenshot(path=SH+'01_home.png')
    page.click('.nb.open'); page.wait_for_selector('.sheet.in'); page.wait_for_timeout(350); page.screenshot(path=SH+'02_sheet.png')
    page.click('[data-a=lesson]'); page.wait_for_selector('.tpage'); page.wait_for_timeout(300); page.screenshot(path=SH+'03_theory.png')
    for _ in range(3): page.click('#nx'); page.wait_for_timeout(150)
    page.wait_for_timeout(300); page.screenshot(path=SH+'04_theory_example.png')
    while page.inner_text('#nx')!='Empezar ejercicios': page.click('#nx'); page.wait_for_timeout(100)
    page.click('#nx'); page.wait_for_selector('#ans'); page.wait_for_timeout(300); page.screenshot(path=SH+'05_exercise.png')
    # teclado
    page.click('#keys button:has-text("sen")'); v=page.input_value('#ans'); ok(v=='sen()', 'tecla sen: '+v)
    ok(page.evaluate("document.getElementById('ans').selectionStart")==4,'cursor dentro del paréntesis')
    page.keyboard.type('2x'); page.wait_for_timeout(200)
    ok('sen' in page.inner_text('#pv') or page.query_selector('#pvx .katex'),'vista previa')
    page.screenshot(path=SH+'06_typing.png')
    # fallo -> pista -> fallo -> solución
    page.fill('#ans','x'); page.press('#ans','Enter'); page.wait_for_selector('.fb.bad'); ok(page.query_selector('#hb') is not None,'botón pista')
    page.click('#hb'); page.wait_for_selector('.hint'); page.screenshot(path=SH+'07_wrong_hint.png')
    page.fill('#ans','x+1'); page.press('#ans','Enter'); page.wait_for_selector('.sol'); page.wait_for_timeout(300); page.screenshot(path=SH+'08_solution.png')
    ok(page.query_selector('.sol .fin .katex') is not None,'solución con fórmula final')
    page.click('#chk'); page.wait_for_selector('#ans')
    answer_all(9,'lección deriv'); page.wait_for_selector('.done-screen'); page.wait_for_timeout(500); page.screenshot(path=SH+'09_done.png')
    page.click('#fin'); page.wait_for_selector('.nb.done'); page.wait_for_timeout(300)
    st=page.evaluate("JSON.parse(localStorage.getItem('integra.v1'))"); ok(st['nodes']['deriv']['done'] and st['xp']>0 and st['streak']['n']==1,'progreso guardado')
    page.screenshot(path=SH+'10_home_after.png',full_page=True)
    # ---------- B: todas las lecciones ----------
    ids=['deriv','pot','elem','lin','sust','partes','racio','barrow','areas','vol']
    for i,tid in enumerate(ids):
        load(state(i)); page.click('.nb.open'); page.click('[data-a=lesson]'); page.wait_for_selector('.tpage')
        np=int(page.inner_text('#scnt').split('/')[1])
        for _ in range(np-1): page.click('#nx')
        page.click('#nx'); answer_all(9,'lección '+tid)
        ok(page.query_selector('.done-screen') is not None,tid+': no llegó al final')
        if tid in ('vol','sust'): page.screenshot(path=SH+f'11_{tid}_done.png')
        page.click('#fin'); page.wait_for_selector('.nb')
        st=page.evaluate("JSON.parse(localStorage.getItem('integra.v1'))"); ok(st['nodes'][tid]['done'],tid+' no marcado como hecho'); print('lección',tid,'ok')
    # ---------- C: test de salto, repaso, práctica ----------
    load(state(1)); page.click('.nb.locked >> nth=0'); page.click('[data-a=test]'); page.wait_for_selector('#ans'); answer_all(5,'test'); page.wait_for_selector('.done-screen')
    ok('superado' in page.inner_text('.done-screen h2'),'test superado'); page.click('#fin'); page.wait_for_selector('.nb')
    st=page.evaluate("JSON.parse(localStorage.getItem('integra.v1'))"); ok(st['nodes']['elem']['done'],'test marca el tema')
    load(state(1)); page.click('.nb.locked >> nth=0'); page.click('[data-a=test]'); page.wait_for_selector('#ans'); page.fill('#ans','x'); page.press('#ans','Enter'); page.wait_for_selector('.sol'); page.click('#chk')
    page.wait_for_selector('.done-screen'); ok('Aún no' in page.inner_text('.done-screen h2'),'test fallado'); page.screenshot(path=SH+'12_test_fail.png')
    s=state(3); s['nodes']['deriv']['due']='2000-01-01'; s['nodes']['pot']['due']='2000-01-01'
    load(s); ok('Repaso de hoy' in page.inner_text('.hero'),'tarjeta de repaso'); page.screenshot(path=SH+'13_review_home.png'); page.click('#hbtn'); page.wait_for_selector('#ans'); answer_all(6,'repaso'); page.wait_for_selector('.done-screen'); page.click('#fin'); page.wait_for_selector('.nb')
    ok('Repaso de hoy' not in page.inner_text('.hero'),'repaso resuelto')
    load(state(10)); page.click('.nb.done >> nth=2'); page.click('[data-a=practice]'); page.wait_for_selector('#ans'); answer_all(8,'práctica'); page.click('#fin'); page.wait_for_selector('.nb')
    page.click('#bset'); page.wait_for_selector('.sheet.in'); page.wait_for_timeout(350); page.screenshot(path=SH+'14_settings.png')
    # decimal aproximado en resultado numérico
    load(state(7)); page.click('.nb.open'); page.click('[data-a=lesson]'); page.wait_for_selector('.tpage')
    for _ in range(3): page.click('#nx')
    page.click('#nx')
    for k in range(40):
        page.wait_for_selector('#ans'); ex=page.evaluate('window.__ex')
        if ex['kind']=='num' and not str(ex['value']).lstrip('-').isdigit(): break
        page.fill('#ans',ans(ex)); page.press('#ans','Enter'); page.wait_for_selector('.fb.ok'); page.click('#chk')
    val=page.evaluate("Engine.fn(window.__ex.value)(0)"); page.fill('#ans',f'{val:.2f}'.replace('.',',')); page.press('#ans','Enter'); page.wait_for_selector('.fb')
    ok(page.query_selector('.fb.ok') is not None,f'decimal con coma aceptado ({val:.2f})'); page.screenshot(path=SH+'15_approx.png')
    # tema oscuro
    page.emulate_media(color_scheme='dark'); page.wait_for_timeout(200); page.screenshot(path=SH+'16_dark.png')
    b.close()
print('ERRORES DE CONSOLA:',[e for e in errors if 'favicon' not in e][:6] or 'ninguno'); print('FALLOS:',fails or 'ninguno')
sys.exit(1 if fails or [e for e in errors if 'favicon' not in e] else 0)

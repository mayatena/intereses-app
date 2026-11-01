from playwright.sync_api import sync_playwright
exec(open('e2e.py').read().split("errors=[]; fails=[]")[0])
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    page=b.new_context(viewport={'width':390,'height':844}).new_page()
    page.on('console',lambda m: print('CONSOLE',m.type,m.text))
    page.on('pageerror',lambda e: print('PAGEERROR',e))
    page.route('**/mathjax/**',lambda r: r.fulfill(body=SHIM,content_type='application/javascript'))
    page.goto('file:///home/claude/integra/dist/index.html'); page.evaluate("localStorage.clear()"); page.reload(); page.wait_for_selector('.nb')
    page.click('.nb.open'); page.wait_for_selector('.sheet.in'); page.click('[data-a=lesson]'); page.wait_for_timeout(1500)
    print(page.evaluate("[...document.body.children].map(e=>e.tagName+'.'+e.className).join(' ; ')")); print(page.evaluate("document.querySelector('.sheet')?document.querySelector('.sheet').innerHTML:'no sheet'")); page.click('[data-a=lesson]') if page.query_selector('[data-a=lesson]') else None; page.wait_for_timeout(800); print(page.evaluate("[...document.body.children].map(e=>e.tagName+'.'+e.className).join(' ; ')"))
    b.close()

import re, json, time
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
PHONE="81933591612"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True); ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page()
    pg.add_init_script("""
      window.__cap=[];
      const ox=XMLHttpRequest.prototype.open, os=XMLHttpRequest.prototype.send, oh=XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.open=function(m,u){this.__u=u;this.__m=m;this.__h={};return ox.apply(this,arguments)};
      XMLHttpRequest.prototype.setRequestHeader=function(k,v){try{this.__h[k]=v}catch(e){}return oh.apply(this,arguments)};
      XMLHttpRequest.prototype.send=function(b){try{if(/shopee\.co\.id\/api|\/api\//.test(this.__u||''))window.__cap.push({url:(this.__u||'').replace('https://shopee.co.id',''),st:'xhr-start',rp:'',body:b?String(b).slice(0,300):null,hd:this.__h,via:'xhr'})}catch(e){}return os.apply(this,arguments)};
      const of=window.fetch;
      window.fetch=function(u,o){const url=typeof u==='string'?u:(u&&u.url)||'';
        const p=of.apply(this,arguments);
        if(/shopee\\.co\\.id\\/api/.test(url)){ p.then(r=>r.clone().text().then(t=>window.__cap.push({url:url.replace('https://shopee.co.id',''),st:r.status,rp:t.slice(0,220),body:o&&o.body?String(o.body).slice(0,300):null,hd:o&&o.headers?Object.fromEntries(Object.entries(o.headers)):null})).catch(()=>{})); }
        return p;};
    """)
    pg.goto("https://shopee.co.id/buyer/login/signup", wait_until="domcontentloaded"); pg.wait_for_timeout(4500)
    try: pg.click('button:has-text("Bahasa Indonesia")', timeout=4000)
    except Exception: pass
    pg.evaluate("()=>{document.querySelectorAll('#modal').forEach(m=>m.style.cssText='display:none!important')}")
    pg.wait_for_timeout(500)
    inp = pg.locator('input[name=phone]')
    inp.scroll_into_view_if_needed(); inp.click(); pg.wait_for_timeout(300)
    inp.type(PHONE, delay=90)
    pg.wait_for_timeout(600)
    print("isi input:", inp.input_value())
    cb = pg.locator('input[type=checkbox]')
    if cb.count():
        try: cb.first.check(timeout=3000)
        except Exception: pg.evaluate("()=>{document.querySelectorAll('input[type=checkbox]').forEach(c=>{if(!c.checked)c.click()})}")
    btn = pg.locator('button:has-text("Berikutnya")').first
    print("btn disabled?", btn.is_disabled())
    pg.evaluate("()=>{document.querySelectorAll('#modal').forEach(m=>m.style.cssText='display:none!important')}")
    try: btn.click(timeout=8000)
    except Exception as e: print('click err:', str(e)[:70])
    pg.wait_for_timeout(9000)
    cap = pg.evaluate("()=>window.__cap||[]")
    api = [c for c in cap if re.search(r'vcode|signup|register|otp|captcha|login', c["url"], re.I)]
    for c in api: print("API:", c["st"], c["url"][:90], "| body:", (c["body"] or "")[:200], "| resp:", c["rp"][:150])
    print("TEKS FORM:", re.sub(r"\s+"," ", pg.evaluate("()=>{const f=document.querySelector('form');return f?f.innerText.slice(0,300):''}")))
    pg.screenshot(path="/tmp/opencode/shopee-real/signup-step2.png")
    br.close()

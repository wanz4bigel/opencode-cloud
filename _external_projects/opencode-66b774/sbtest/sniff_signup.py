import re, json
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
PHONE="81933591612"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True); ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page()
    pg.add_init_script("""
      window.__cap = [];
      const of = window.fetch;
      window.fetch = function(u, o){
        try{
          const url = typeof u === 'string' ? u : u.url;
          if(/vcode|otp\\/send|signup|accountRegistration|check_existing/.test(url)){
            window.__cap.push({url, method:(o&&o.method)||'GET', headers:o&&o.headers?Object.fromEntries(Object.entries(o.headers)):{}, body:o&&o.body?String(o.body).slice(0,600):null});
          }
        }catch(e){}
        return of.apply(this, arguments);
      };
      const ox = window.XMLHttpRequest.prototype.open, os = window.XMLHttpRequest.prototype.send, oh = window.XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.open = function(m,u){ this.__u=u; this.__m=m; this.__h={}; return ox.apply(this, arguments); };
      XMLHttpRequest.prototype.setRequestHeader = function(k,v){ try{this.__h[k]=v}catch(e){} return oh.apply(this, arguments); };
      XMLHttpRequest.prototype.send = function(b){ try{ if(/vcode|otp\\/send|signup|accountRegistration|check_existing/.test(this.__u||'')) window.__cap.push({url:this.__u, method:this.__m, headers:this.__h, body:b?String(b).slice(0,600):null, via:'xhr'}); }catch(e){} return os.apply(this, arguments); };
    """)
    pg.goto("https://shopee.co.id/buyer/login/signup", wait_until="domcontentloaded"); pg.wait_for_timeout(4500)
    try: pg.click('button:has-text("Bahasa Indonesia")', timeout=4000)
    except Exception: pg.evaluate("()=>{const m=document.querySelector('#modal'); if(m) m.style.cssText='display:none!important'}")
    pg.wait_for_timeout(800)
    pg.fill('input[name=phone]', PHONE); pg.wait_for_timeout(600)
    try: pg.check('input[type=checkbox]', timeout=3000)
    except Exception: pass
    pg.evaluate("()=>{document.querySelectorAll('#modal').forEach(m=>m.style.cssText='display:none!important')}")
    pg.click('button:has-text("Berikutnya")', timeout=10000)
    pg.wait_for_timeout(8000)
    cap = pg.evaluate("()=>window.__cap||[]")
    print("URL:", pg.url.split('#')[0])
    print("CAPTURED", len(cap))
    for c in cap:
        print("====", c.get("via","fetch"), c["url"].replace("https://shopee.co.id",""))
        print("   headers:", json.dumps(c.get("headers") or {}, ensure_ascii=False)[:900])
        print("   body:", (c.get("body") or "")[:500])
    print("TEKS:", re.sub(r"\n{2,}"," | ", pg.evaluate("()=>document.body.innerText.slice(0,600)"))[:500])
    br.close()

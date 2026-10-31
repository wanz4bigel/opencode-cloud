import json, os
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True)
    ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta", storage_state="state_signup.json")
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def call(p, b=None, m="POST"):
        h={"x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        if b is not None: h["Content-Type"]="application/json"
        return pg.evaluate("""async ([p,b,h,m])=>{const o={method:m,headers:h,credentials:'include'}; if(b!==null)o.body=JSON.stringify(b);
          const r=await fetch(p,o); let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,400)}}""",[p,b,h,m])
    cands=[
      "/api/v4/account/basic/get_public_key","/api/v4/basic/get_public_key","/api/v4/buyer/get_public_key",
      "/api/v4/account/get_public_key","/api/v4/buyer/account/public_key","/api/v4/authentication/get_public_key",
      "/api/v4/rsa/public_key","/api/v4/buyer/security/public_key",
      "/api/v4/encryption/public_key","/api/v4/security/public_key",
    ]
    for p in cands:
        for m in ("GET","POST"):
            r=call(p, {} if m=="POST" else None, m)
            if r["s"]!=404:
                print(f"{m:4} {p:44}-> {r['s']} {r['b'][:200]}")
    br.close()

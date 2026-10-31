import json, time, sys
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
PHONE=sys.argv[1] if len(sys.argv)>1 else "6283822461998"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True)
    ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page()
    pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(6000)
    pg.goto("https://shopee.co.id/", wait_until="domcontentloaded"); pg.wait_for_timeout(3000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body, hdr=None):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        if hdr: h.update(hdr)
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,400)}}""",[p,body,h])
    print("nomor target:", PHONE)
    r=post("/api/v4/otp/send_vcode", {"phone":PHONE,"otp_usage":"sign_up","channel":1})
    print("send ->", r["s"], r["b"][:280])
    try:
        d=json.loads(r["b"])
        if d.get("error")==0:
            json.dump({"phone":PHONE, "seed":d["data"]["seed"], "csrf":csrf, "ts":time.time()}, open("otp_state.json","w"))
            ctx.storage_state(path="state_signup.json")
            print("OK: seed", d["data"]["seed"], "| sesi disimpen")
        else:
            print("GAK OK:", d)
    except Exception as e:
        print("parse gagal:", r["b"][:200])
    br.close()

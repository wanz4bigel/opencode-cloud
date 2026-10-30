import json
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
PHONE="81933591612"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True); ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body, hdr=None):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        if hdr: h.update(hdr)
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,240)}}""",[p,body,h])
    bodies = [
      {"phone":PHONE,"otp_usage":"SIGN_UP"},
      {"phone":PHONE,"otp_usage":1},
      {"phone":PHONE,"scene":"sign_up"},
      {"phone":PHONE,"type":"sms"},
      {"phone":PHONE},
      {"phone":"6281933591612","otp_usage":"sign_up"},
      {"phone":"081933591612","otp_usage":"sign_up"},
      {"phone":PHONE,"otp_usage":"sign_up","channel":1,"language":"id"},
      {"phone":PHONE,"otp_usage":"sign_up","support_ivs":True,"app_type":1},
    ]
    for i,b in enumerate(bodies):
        r=post("/api/v4/otp/send_vcode", b)
        print(f"[{i}] {json.dumps(b)[:64]:66} -> {r['s']} {r['b'][:130]}")
    r=post("/api/v4/otp/get_supported_countries", {})
    print("get_supported_countries ->", r["s"], r["b"][:120])
    r=post("/api/v4/otp/init_vcode", {"phone":PHONE,"otp_usage":"sign_up"})
    print("init_vcode ->", r["s"], r["b"][:160])
    r=post("/api/v4/basic/init_vcode", {"phone":PHONE,"otp_usage":"sign_up","type":"sms"})
    print("basic/init_vcode ->", r["s"], r["b"][:160])
    br.close()

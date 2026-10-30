import json, os
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
st=json.load(open("otp_state.json")); PHONE, SEED = st["phone"], st["seed"]
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True)
    ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta", storage_state="state_signup.json")
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(4500)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def call(p, body=None, method="POST"):
        h={"x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        if body is not None: h["Content-Type"]="application/json"
        return pg.evaluate("""async ([p,b,h,m])=>{const opt={method:m,headers:h,credentials:'include'};
          if(b!==null) opt.body=JSON.stringify(b);
          const r=await fetch(p,opt); let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,300)}}""",[p,body,h,method])
    paths=[
      ("GET", f"/api/v4/otp/vcode_status?phone={PHONE}&otp_usage=sign_up", None),
      ("GET", f"/api/v4/otp/status?seed={SEED}", None),
      ("POST", "/api/v4/otp/get_vcode", {"phone":PHONE,"otp_usage":"sign_up"}),
      ("POST", "/api/v4/otp/vcode_status", {"phone":PHONE,"otp_usage":"sign_up"}),
      ("POST", "/api/v4/otp/check_delivery_status", {"seed":SEED}),
    ]
    for m,p,b in paths:
        r=call(p,b,m); print(f"{m:4} {p[:46]:48}-> {r['s']} {r['b'][:140]}")
    # resend: seed baru?
    r=call("/api/v4/otp/send_vcode", {"phone":PHONE,"otp_usage":"sign_up","channel":1})
    print("RESEND ->", r["b"][:250])
    d=json.loads(r["b"])
    if d.get("error")==0:
        st["seed"]=d["data"]["seed"]; json.dump(st, open("otp_state.json","w"))
        print("seed baru:", st["seed"])
    br.close()

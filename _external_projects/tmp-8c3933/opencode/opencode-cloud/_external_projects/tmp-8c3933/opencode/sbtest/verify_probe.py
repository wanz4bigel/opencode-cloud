import json, os
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
st=json.load(open("otp_state.json"))
PHONE, SEED = st["phone"], st["seed"]
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True)
    ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta",
                       storage_state="state_signup.json" if os.path.exists("state_signup.json") else None)
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,350)}}""",[p,body,h])
    variants=[
      {"phone":PHONE,"otp_usage":"sign_up","vcode":"123456","seed":SEED},
      {"phone":PHONE,"otp_usage":"sign_up","vcode":"123456","seed":SEED,"channel":1},
      {"phone":PHONE,"otp_usage":"sign_up","vcode":"123456"},
      {"otp_token":SEED,"vcode":"123456"},
    ]
    for i,b in enumerate(variants):
        r=post("/api/v4/otp/verify_vcode", b)
        print(f"[{i}] {json.dumps(b)[:66]:68}-> {r['s']} {r['b'][:200]}")
    br.close()

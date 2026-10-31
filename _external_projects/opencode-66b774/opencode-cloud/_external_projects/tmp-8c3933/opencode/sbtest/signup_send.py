import json, sys, time
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
PHONE="6283822461998"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True)
    ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta", storage_state="state_signup.json") if __import__("os").path.exists("state_signup.json") else br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body, hdr=None):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        if hdr: h.update(hdr)
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,400)}}""",[p,body,h])
    r=post("/api/v4/otp/send_vcode", {"phone":PHONE,"otp_usage":"sign_up","channel":1})
    print("send_vcode ->", r["s"], r["b"][:300])
    data=json.loads(r["b"]).get("data") or {}
    seed=data.get("seed"); 
    # cek endpoint verify / check
    for ep, body in [
        ("/api/v4/otp/verify_vcode", {"phone":PHONE,"otp_usage":"sign_up","vcode":"000000","seed":seed}),
        ("/api/v4/otp/check_vcode_status", {"seed":seed}),
        ("/api/v4/otp/get_vcode_status", {"seed":seed}),
    ]:
        rr=post(ep, body)
        print(f"{ep:38} -> {rr['s']} {rr['b'][:150]}")
    ctx.storage_state(path="state_signup.json")
    print("state saved:", [c["name"] for c in ctx.cookies()][:10])
    br.close()

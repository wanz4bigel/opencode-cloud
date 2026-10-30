import json, sys
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
PHONE="81933591612"
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True); ctx=b.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page()
    pg.goto("https://shopee.co.id/", wait_until="domcontentloaded"); pg.wait_for_timeout(3500)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
            let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,300)}}""",[p,body,h])
    r=pg.evaluate("""async ([p,h])=>{const r=await fetch(p,{headers:h,credentials:'include'});let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,300)}}""",
        [f"/api/v4/accountRegistration/get_supported_countries?phone={PHONE}", {"x-api-source":"pc"}])
    print("supported_countries:", r)
    probes=[
      ("/api/v4/account/check_existing_user", {"phone":PHONE}),
      ("/api/v4/account/check_existing_user", {"phone":PHONE,"country_code":"ID"}),
      ("/api/v4/basic/get_user_id", {"phone":PHONE}),
      ("/api/v4/otp/send_vcode", {"phone":PHONE,"otp_usage":"sign_up"}),
    ]
    for p,b in probes:
        print(f"{p} {json.dumps(b)[:56]:58}->", post(p,b))
    b.close()

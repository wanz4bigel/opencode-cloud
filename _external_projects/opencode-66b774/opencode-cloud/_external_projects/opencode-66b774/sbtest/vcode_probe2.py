import json
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36"
with sync_playwright() as pw:
    br=pw.chromium.launch(headless=True); ctx=br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg=ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf=next((c["value"] for c in ctx.cookies() if c["name"]=="csrftoken"), None)
    def post(p, body):
        h={"Content-Type":"application/json","x-api-source":"pc"}
        if csrf: h["anti-csrf-fetch-value"]=csrf
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return {s:r.status,b:t.slice(0,260)}}""",[p,body,h])
    phones=["81933591612","6281933591612","+6281933591612","081933591612","62 819 3359 1612","81933591612"]
    for i,ph in enumerate(phones):
        b={"phone":ph,"otp_usage":"sign_up","channel":1}
        r=post("/api/v4/otp/send_vcode", b)
        print(f"phone={ph!r:20} -> {r['s']} {r['b'][:150]}")
    b={"phone":"81933591612","otp_usage":"sign_up","channel":1,"formatted_phone_for_server":"+62 819-3359-1612"}
    print("formatted ->", post("/api/v4/otp/send_vcode", b)["b"][:200])
    br.close()

import json, time
from playwright.sync_api import sync_playwright
PHONE = "6283822461998"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
with sync_playwright() as pw:
    br = pw.chromium.launch(headless=True)
    ctx = br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg = ctx.new_page(); pg.goto("https://shopee.co.id/", wait_until="domcontentloaded"); pg.wait_for_timeout(5000)
    csrf = next((c["value"] for c in ctx.cookies() if c["name"] == "csrftoken"), None)
    def post(p, b):
        h = {"Content-Type": "application/json", "x-api-source": "pc"}
        if csrf: h["anti-csrf-fetch-value"] = csrf
        return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return t.slice(0,300)}""", [p, b, h])
    for ch, label in [(3, "whatsapp"), (2, "voice"), (1, "sms-retry")]:
        r = post("/api/v4/otp/send_vcode", {"phone": PHONE, "otp_usage": "sign_up", "channel": ch})
        print(f"channel {ch} ({label:9}) -> {r[:200]}")
        d = json.loads(r)
        if d.get("error") == 0:
            json.dump({"phone": PHONE, "seed": d["data"]["seed"], "channel": ch, "ts": time.time()}, open("otp_state.json", "w"))
            ctx.storage_state(path="state_signup.json")
            print(f">>> TERKIRIM via {label}, seed {d['data']['seed']}")
            break
        time.sleep(6)
    br.close()

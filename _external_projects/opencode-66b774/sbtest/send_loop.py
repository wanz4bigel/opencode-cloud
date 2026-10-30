import json, time, sys
from playwright.sync_api import sync_playwright
PHONE = "6283822461998"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
deadline = time.time() + 40 * 60
log = open("send_loop.log", "a", buffering=1)
with sync_playwright() as pw:
    br = pw.chromium.launch(headless=True)
    while time.time() < deadline:
        ctx = br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
        pg = ctx.new_page()
        try:
            pg.goto("https://shopee.co.id/", wait_until="domcontentloaded"); pg.wait_for_timeout(4000)
            csrf = next((c["value"] for c in ctx.cookies() if c["name"] == "csrftoken"), None)
            h = {"Content-Type": "application/json", "x-api-source": "pc"}
            if csrf: h["anti-csrf-fetch-value"] = csrf
            r = pg.evaluate("""async ([h])=>{const b={phone:'6283822461998',otp_usage:'sign_up',channel:1};
              const r=await fetch('/api/v4/otp/send_vcode',{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
              return await r.text()}""", [h])
            d = json.loads(r)
            log.write(f"{time.strftime('%H:%M:%S')} {r[:120]}\n")
            if d.get("error") == 0:
                json.dump({"phone": PHONE, "seed": d["data"]["seed"], "channel": 1, "ts": time.time()}, open("otp_state.json", "w"))
                ctx.storage_state(path="state_signup.json")
                log.write(f"SUKSESS seed={d['data']['seed']}\n")
                break
        except Exception as e:
            log.write(f"err {str(e)[:80]}\n")
        ctx.close()
        time.sleep(180)
    br.close()

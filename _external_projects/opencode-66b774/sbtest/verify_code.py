import json, sys, time, os
from playwright.sync_api import sync_playwright
CODE = sys.argv[1]
PHONE = "6283822461998"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
SEEDS = ["b9d2922e-9857-472e-8fed-f9b265cb0309", "1222fade-a7ac-4679-a5d2-25b0f87edbff", "57737202-fcb2-433c-bce6-386b3271cdd7"]
with sync_playwright() as pw:
    br = pw.chromium.launch(headless=True)
    for mode in ("restored", "fresh"):
        ss = "state_signup.json" if (mode == "restored" and os.path.exists("state_signup.json")) else None
        ctx = br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta", storage_state=ss)
        pg = ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(4500)
        csrf = next((c["value"] for c in ctx.cookies() if c["name"] == "csrftoken"), None)
        def post(p, b):
            h = {"Content-Type": "application/json", "x-api-source": "pc"}
            if csrf: h["anti-csrf-fetch-value"] = csrf
            return pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
              let t='';try{t=await r.text()}catch(e){}return r.status+' '+t.slice(0,400)}""", [p, b, h])
        print(f"===== mode={mode} =====")
        variants = [
            {"vcode": CODE},
            {"vcode": CODE, "phone": PHONE, "otp_usage": "sign_up"},
            {"vcode": CODE, "phone": PHONE, "otp_usage": "sign_up", "seed": SEEDS[0]},
        ]
        if mode == "fresh":
            variants += [{"vcode": CODE, "phone": PHONE, "otp_usage": "sign_up", "seed": s} for s in SEEDS[1:]]
        stop = False
        for i, b in enumerate(variants):
            r = post("/api/v4/otp/verify_vcode", b)
            print(f"[{i}] {json.dumps(b)[:80]:82}-> {r[:240]}")
            try:
                d = json.loads(r.split(" ", 1)[1])
            except Exception:
                continue
            if d.get("error") == 0:
                json.dump({"mode": mode, "otp": d.get("data")}, open("otp_verified.json", "w"), indent=1)
                ctx.storage_state(path="state_verified.json")
                print(">>> OTP VALID, token tersimpan di otp_verified.json")
                stop = True
                break
        if mode == "fresh":
            ctx.storage_state(path="state_fresh_v.json")
        else:
            ctx.storage_state(path="state_signup.json")
        ctx.close()
    br.close()

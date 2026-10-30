import json, itertools, sys
from playwright.sync_api import sync_playwright

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
EMAIL = "bot.test.reee31 max@gmail.com".replace(" ", "")
EMAIL = "reee31.botmax@gmail.com"

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)
    ctx = b.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta")
    pg = ctx.new_page()
    pg.goto("https://shopee.co.id/", wait_until="domcontentloaded")
    pg.wait_for_timeout(3000)
    csrf = None
    for c in ctx.cookies():
        if c["name"] == "csrftoken":
            csrf = c["value"]
    print("cookies:", [c["name"] for c in ctx.cookies()][:8], "csrf:", (csrf or "")[:12] + "...")

    def post(path, body, headers=None):
        h = {"Content-Type": "application/json", "x-api-source": "pc"}
        if csrf:
            h["anti-csrf-fetch-value"] = csrf
        if headers:
            h.update(headers)
        r = pg.evaluate("""async ([p, body, h]) => {
          const res = await fetch(p, {method:'POST', headers:h, credentials:'include', body: JSON.stringify(body)});
          let t = ''; try { t = await res.text(); } catch(e) {}
          return {status: res.status, body: t.slice(0, 400)};
        }""", [path, body, h])
        return r

    variants = [
        {"email": EMAIL, "otp_usage": "sign_up"},
        {"email": EMAIL, "otp_usage": "SIGN_UP"},
        {"email": EMAIL, "source": "sign_up"},
        {"email": EMAIL, "app_type": 1, "source": "sign_up", "language": "id"},
        {"email": EMAIL, "otp_usage": "sign_up", "scene": "signup_with_email"},
        {},
    ]
    for i, body in enumerate(variants):
        r = post("/api/v4/otp/init_email_otp", body)
        print(f"init[{i}] {json.dumps(body)[:70]!r:72} -> {r['status']} {r['body'][:180]}")
    r = post("/api/v4/otp/init_email_otp", {"email": EMAIL, "otp_usage": "sign_up"}, {"x-app-type": "1"})
    print("init app-type=1 ->", r["status"], r["body"][:200])
    b.close()

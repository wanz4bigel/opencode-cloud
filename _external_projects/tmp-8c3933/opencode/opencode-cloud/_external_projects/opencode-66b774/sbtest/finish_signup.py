import json, sys, hashlib, time, os
from playwright.sync_api import sync_playwright

CODE, USERNAME, PASSWORD = sys.argv[1], sys.argv[2], sys.argv[3]
PHONE = "6283822461998"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
h_pw = hashlib.sha256(hashlib.md5(PASSWORD.encode()).hexdigest().encode()).hexdigest()
st = json.load(open("otp_state.json"))
SEED = st.get("seed")

def login_cookies(ctx):
    return [c["name"] for c in ctx.cookies() if c["name"].startswith("SPC") or c["name"] in ("ssid", "csrf")]

with sync_playwright() as pw:
    br = pw.chromium.launch(headless=True)
    ctx = br.new_context(user_agent=UA, locale="id-ID", timezone_id="Asia/Jakarta",
                         storage_state="state_signup.json" if os.path.exists("state_signup.json") else None)
    pg = ctx.new_page(); pg.goto("https://shopee.co.id/buyer/login", wait_until="domcontentloaded"); pg.wait_for_timeout(4500)
    csrf = next((c["value"] for c in ctx.cookies() if c["name"] == "csrftoken"), None)
    def post(p, b, hdr=None):
        h = {"Content-Type": "application/json", "x-api-source": "pc", "x-app-type": "1"}
        if csrf: h["anti-csrf-fetch-value"] = csrf
        if hdr: h.update(hdr)
        return json.loads(pg.evaluate("""async ([p,b,h])=>{const r=await fetch(p,{method:'POST',headers:h,credentials:'include',body:JSON.stringify(b)});
          let t='';try{t=await r.text()}catch(e){}return t.slice(0,900)}""", [p, b, h]))
    print("hash pw :", h_pw[:24], "...")
    print("seed    :", SEED)
    v = post("/api/v4/otp/verify_vcode", {"vcode": CODE, "phone": PHONE, "otp_usage": "sign_up"})
    print("verify  :", json.dumps(v)[:300])
    tok = (v.get("data") or {}).get("otp_token") or (v.get("data") or {}).get("vcode_token") or (v.get("data") or {}).get("token")
    if not tok and v.get("error") == 0:
        print("data keys:", list((v.get("data") or {}).keys()))
    if tok:
        s = post("/api/v4/account/signup_by_otp", {
            "otp_token": tok, "password": h_pw, "username": USERNAME,
            "support_cpf": False, "cpf": None, "dob": None, "auth_id": None,
            "captcha_signature": None, "captcha_id": None, "stay_logged_in": True})
        print("signup  :", json.dumps(s)[:420])
        if s.get("error") == 0:
            ctx.storage_state(path="state_loggedin.json")
            print("cookies :", login_cookies(ctx))
    br.close()

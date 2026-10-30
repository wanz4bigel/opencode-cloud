"""TANGKAP payload asli yang dikirim halaman Daftar (send_vcode dkk) — ground truth
tanpa nebak. Modal bahasa cuma di-hide (jangan di-removes, React portal bisa crash)."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/sbtest")
PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
SIGNUP = "https://shopee.co.id/buyer/login/signup"
PHONE = "8818524515"

RECORD = """
window.__cap = [];
const of = window.fetch;
window.fetch = function(u, o) {
  try {
    const url = (typeof u === 'string') ? u : (u && u.url) || '';
    if (/\\/api\\/|\\/sapi\\//.test(url)) window.__cap.push({t:'fetch', url, method:(o&&o.method)||'GET',
      body: o && o.body ? String(o.body).slice(0,1200) : null,
      headers: o && o.headers && typeof o.headers === 'object' ? {...o.headers} : null});
  } catch (e) {}
  return of.apply(this, arguments);
};
const ox = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send, osh = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function(k, v) { (this.__h ||= {})[k] = v; return osh.apply(this, arguments); };
XMLHttpRequest.prototype.open = function(m, u) { this.__m = m; this.__u = u; return ox.apply(this, arguments); };
XMLHttpRequest.prototype.send = function(b) {
  try { if (/\\/api\\/|\\/sapi\\//.test(this.__u || '')) window.__cap.push({t:'xhr', url:String(this.__u).slice(0,160),
    method:this.__m, body: b ? String(b).slice(0,1200) : null, headers: this.__h || null}); } catch (e) {}
  return os.apply(this, arguments);
};
"""


def main():
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        reqs = []
        page.on("request", lambda r: reqs.append((r.method, r.url[:150], (r.post_data or "")[:900]))
                if "/api/" in r.url and any(k in r.url for k in ("otp", "authentication", "account", "signup")) else None)
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(5000)

        # hide modal tanpa menghapus node
        page.evaluate("""() => {
          for (const m of document.querySelectorAll('#modal, [class*=modal], [role=dialog]')) {
            const t = (m.textContent || '');
            if (/pilih bahasa/i.test(t)) { m.style.display = 'none'; }
          }
        }""")
        page.evaluate(RECORD)
        page.wait_for_timeout(800)

        state = page.evaluate("""() => {
          const inp = document.querySelector('input[name=phone], input[type=tel]');
          const btns = Array.from(document.querySelectorAll('button')).map(b => (b.textContent||'').trim()).filter(Boolean).slice(0,10);
          return {hasInput: !!inp, btns};
        }""")
        print("state:", json.dumps(state, ensure_ascii=False)[:300])

        if state["hasInput"]:
            page.evaluate("""(phone) => {
              const inp = document.querySelector('input[name=phone], input[type=tel]');
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, phone);
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              const box = document.querySelector('input[type=checkbox]');
              if (box && !box.checked) box.click();
            }""", PHONE)
            page.wait_for_timeout(1000)
            clicked = page.evaluate("""() => {
              const btn = Array.from(document.querySelectorAll('button')).find(b => /berikutnya/i.test(b.textContent || ''));
              if (!btn) return 'no-btn';
              btn.click();
              return 'clicked';
            }""")
            print("klik Berikutnya:", clicked)
            page.wait_for_timeout(10000)

        caps = page.evaluate("() => window.__cap || []")
        print(f"\n{len(caps)} request via intercept:")
        for c in caps[:12]:
            print("-", c.get("method"), c.get("url", "")[:130])
            if c.get("body"):
                print("   body:", c["body"][:500])
            if c.get("headers"):
                keep = {k: v for k, v in c["headers"].items() if k.lower().startswith(("x-", "content-type"))}
                if keep:
                    print("   hdr :", json.dumps(keep)[:260])
        print(f"\n{len(reqs)} request via network:")
        for m, u, b in reqs[:10]:
            print("-", m, u)
            if b:
                print("   body:", b[:400])
        (OUT / "signup_real_requests.json").write_text(
            json.dumps({"intercepted": caps, "network": reqs}, indent=1), encoding="utf-8")
        ctx.close()


if __name__ == "__main__":
    main()

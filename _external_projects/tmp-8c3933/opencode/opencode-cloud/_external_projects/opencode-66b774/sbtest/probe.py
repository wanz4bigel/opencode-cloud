"""Probe kondisi halaman + config userscript yang aktif (diagnosa kenapa klaim di-skip)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, "/home/runner/shopee-bot")
from playwright.sync_api import sync_playwright

import shopee_bot  # pakai loader userscript yang sama dengan runner

PROFILE = Path.home() / ".shopee-bot" / "profile"
URL = "http://shopee.localhost:8899/"

JS = r"""
() => {
  const btns = Array.from(document.querySelectorAll('button')).map((b) => ({
    text: (b.textContent || '').trim(),
    cls: b.className,
    disabled: !!b.disabled,
    visible: (() => {
      const r = b.getBoundingClientRect();
      const s = window.getComputedStyle(b);
      return { w: Math.round(r.width), h: Math.round(r.height), vis: s.visibility, disp: s.display, op: s.opacity };
    })(),
  }));
  return {
    logLevel: (window.SHOPEE_BOT && window.SHOPEE_BOT.config.logLevel) || null,
    missions: (window.SHOPEE_BOT && window.SHOPEE_BOT.config.missions) || null,
    notify: (window.SHOPEE_BOT && window.SHOPEE_BOT.config.notify) || null,
    visibility: document.visibilityState,
    gmSetValue: typeof window.GM_setValue,
    buttons: btns,
  };
}
"""

pw = sync_playwright().start()
ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID")
ctx.add_init_script(shopee_bot.userscript_source())
page = ctx.new_page()
logs = []
page.on("console", lambda m: logs.append(m.text))
page.goto(URL, wait_until="domcontentloaded", timeout=30_000)
page.wait_for_function("() => !!window.SHOPEE_BOT", timeout=20_000)
print(json.dumps(page.evaluate(JS), indent=2, ensure_ascii=False))
ctx.close()
pw.stop()

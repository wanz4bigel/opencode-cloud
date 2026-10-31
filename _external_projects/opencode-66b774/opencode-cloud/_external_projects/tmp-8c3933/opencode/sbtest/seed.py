"""Seed config userscript (localStorage) di profil Playwright yang dipakai runner."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

PROFILE = Path.home() / ".shopee-bot" / "profile"
URL = "http://shopee.localhost:8899/"

CFG = {
    "dryRun": False,
    "logLevel": "debug",
    "panelOpen": False,
    "war": {"enabled": False},
    "missions": {
        "enabled": True,
        "autoNavigate": True,
        "pageUrl": URL,
        "checkIn": True,
        "claimReady": True,
        "visitTasks": False,
        "maxItems": 5,
        "dwellMs": [400, 800],
        "stepGapMs": [300, 600],
    },
    "coins": {"enabled": False},
    "vouchers": {"enabled": False},
    "shops": {"enabled": False},
    "notify": {"sound": False, "toast": False, "titleBlink": False},
}

PROFILE.mkdir(parents=True, exist_ok=True)
pw = sync_playwright().start()
ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID")
page = ctx.new_page()
page.goto(URL, wait_until="domcontentloaded", timeout=30_000)
page.evaluate(
    "([k, v]) => window.localStorage.setItem(k, JSON.stringify(v))",
    ["sb.config.v1", CFG],
)
saved = page.evaluate("() => window.localStorage.getItem('sb.config.v1')")
print("seeded:", json.dumps(saved)[:120])
ctx.close()
pw.stop()

// Test harness: jalankan shopee-bot.user.js di jsdom dan verifikasi perilakunya.
// Catatan: jsdom mengembalikan getBoundingClientRect nol, jadi di-stub supaya
// Human.visible() (cek ukuran elemen) berperilaku seperti browser sungguhan.
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SRC = fs.readFileSync("/home/runner/shopee-bot/shopee-bot.user.js", "utf8");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  \x1b[32mOK\x1b[0m   " + name); }
  else { fail++; console.log("  \x1b[31mFAIL\x1b[0m " + name + (extra ? " :: " + extra : "")); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const jsdomErrors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => jsdomErrors.push(String((e && e.message) || e)));

  const dom = new JSDOM(`<!doctype html><html><head><title>Shopee Test</title></head>
    <body><div id="app">
      <div class="voucher-card"><button id="claimBtn" class="btn">Klaim</button></div>
      <div class="mission-card"><a href="https://shopee.co.id/toko-budi"><button>Kerjakan</button></a></div>
      <div class="mission-card"><button id="checkinBtn">Check In</button></div>
      <div class="mission-card"><button id="readyBtn">Klaim Duit</button></div>
    </div></body></html>`, {
    url: "https://shopee.co.id/m/rewards",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;

  // --- stub lingkungan browser yang tidak disediakan jsdom ---
  w.Element.prototype.getBoundingClientRect = () => ({ x: 100, y: 100, left: 100, top: 100, width: 120, height: 40, right: 220, bottom: 140 });
  w.Element.prototype.scrollIntoView = function () {};
  w.scrollTo = () => {};
  w.scrollBy = () => {};
  w.open = () => ({ closed: false, close() { this.closed = true; } });
  const serverDate = () => new Date().toUTCString();
  w.fetch = async (url, init) => ({
    ok: true, status: 200,
    url: String(url),
    headers: { get: (h) => (String(h).toLowerCase() === "date" ? serverDate() : null) },
    text: async () => JSON.stringify({ code: 0, message: "SUCCESS", data: { license_code: "x" } }),
    json: async () => ({ code: 0, message: "SUCCESS" }),
  });
  w.navigator.clipboard = { writeText: async () => {} };

  const consoleLines = [];
  const origLog = w.console.log, origWarn = w.console.warn, origErr = w.console.error;
  const grab = (lvl, args) => consoleLines.push(lvl + " " + args.map((a) => String(a)).join(" "));
  w.console.log = (...a) => { grab("log", a); };
  w.console.warn = (...a) => { grab("warn", a); };
  w.console.error = (...a) => { grab("error", a); };

  // respons klik tombol klaim: munculkan toast "berhasil" seperti Shopee
  w.document.getElementById("claimBtn").addEventListener("click", () => {
    const t = w.document.createElement("div");
    t.className = "shopee-toast";
    t.textContent = "Berhasil! Voucher sudah diambil";
    w.document.body.appendChild(t);
    w.document.getElementById("claimBtn").textContent = "Sudah Diambil";
  });

  // --- jalankan userscript (tanpa GM_*, jadi jalur GM shim diuji) ---
  ok("Sumber script terbaca", SRC.length > 20000);
  w.eval(SRC);
  await sleep(300);

  const SB = w.SHOPEE_BOT;
  ok("window.SHOPEE_BOT terdaftar", !!SB);
  if (!SB) { console.log("Boot gagal — berhenti."); process.exit(1); }

  // --- panel UI ---
  const panel = w.document.getElementById("shopee-autobot-panel");
  ok("Panel UI dibuat", !!panel);
  ok("Panel punya tab navigasi", !!(panel && panel.querySelector(".sb-tabs")));
  ok("Toggle master ada", !!(panel && panel.querySelector(".sb-on")));

  // --- math waktu (WIB = UTC+7, tanpa DST) ---
  const m = SB.math;
  ok("Offset Asia/Jakarta = +7 jam", m.tzOffsetMs("Asia/Jakarta") === 7 * 3600 * 1000, String(m.tzOffsetMs("Asia/Jakarta")));
  const next = m.nextOccurrence("12:00", "Asia/Jakarta");
  const d = new Date(next);
  const local = new Date(next + m.tzOffsetMs("Asia/Jakarta"));
  ok("nextOccurrence selalu di masa depan", next > Date.now() - 1000);
  ok("nextOccurrence jatuh tepat 12:00 WIB", local.getUTCHours() === 12 && local.getUTCMinutes() === 0,
    "dapat " + local.toISOString());
  const occ = m.occurrenceToday("00:00", "Asia/Jakarta");
  ok("occurrenceToday <= sekarang", occ <= Date.now() + 1000 && Date.now() - occ < 86400000);

  // --- sinkronisasi waktu server ---
  await SB.syncTime();
  ok("Drift jam server terukur (|drift| < 5 menit)", Math.abs(SB.status().offsetMs) < 300000, String(SB.status().offsetMs));

  // --- guard ---
  w.document.cookie = "sessid=abc; ANTIFORGESTOKEN=tok123";
  ok("Master ON default", SB.status().master === true);
  ok("Kuota aksi terisi", SB.status().budgetLeft > 0 && SB.status().budgetLeft <= 900);

  // --- WAR: klik tombol + deteksi toast sukses ---
  SB.run("war");
  await sleep(3000);
  const joined = consoleLines.join("\n");
  ok("War menembak tombol klaim", /War "manual" armed|War/.test(joined));
  ok("War mengklaim & mendeteksi sukses", /TERAMBIL/.test(joined),
    joined.split("\n").filter((l) => /war|klaim/i.test(l)).slice(-4).join(" | "));
  ok("Notif sukses dikirim", /NOTIF: Voucher berhasil/.test(joined));

  // --- Misi: scan & klaim ---
  SB.run("missions");
  await sleep(9000);
  const joined2 = consoleLines.join("\n");
  ok("Modul misi jalan", /Misi: memindai|Klaim reward|Kunjungan misi/.test(joined2));
  ok("Check-in terdeteksi", /Check-in/i.test(joined2),
    joined2.split("\n").filter((l) => /misi|check/i.test(l)).slice(-3).join(" | "));

  // --- Koin & voucher (halaman beda, navigasi marker) ---
  SB.run("coins");
  await sleep(600);
  const joined3 = consoleLines.join("\n");
  ok("Modul koin menandai navigasi halaman", /Buka halaman: https:\/\/shopee\.co\.id\/coin/.test(joined3));

  // --- dry-run & master off ---
  const cfg = SB.config;
  cfg.master = false;
  const before = consoleLines.length;
  SB.run("vouchers");
  await sleep(400);
  ok("Guard master OFF menolak aksi", consoleLines.slice(before).join("\n").indexOf("Pusat voucher") === -1);
  cfg.master = true;
  ok("setMaster via API publik", SB.setMaster(false) === false && SB.setMaster(true) === true);

  // --- persistensi config lewat GM shim (localStorage) ---
  ok("Config tersimpan di localStorage (GM shim)", !!w.localStorage.getItem("sb.config.v1"));

  // --- status & log publik ---
  const st = SB.status();
  ok("status() mengembalikan statistik", typeof st === "object" && "stats" in st && "warNext" in st);
  ok("log() berisi jejak kegiatan", SB.log().length > 50);

  // --- CSS harus terparse bener (jsdom menolak stylesheet cacat) ---
  const cssErr = jsdomErrors.filter((e) => /CSS/i.test(e));
  ok("CSS panel valid (terparse browser)", cssErr.length === 0, cssErr.slice(0, 2).join(" | "));

  // --- tidak ada error fatal ---
  const errs = consoleLines.filter((l) => l.startsWith("error"));
  ok("Tidak ada error runtime", errs.length === 0, errs.slice(0, 5).join(" | "));

  console.log(`\n${pass} lolos, ${fail} gagal`);
  if (process.env.VERBOSE) console.log("\n--- log halaman ---\n" + consoleLines.join("\n"));
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error("Harness error:", e); process.exit(2); });

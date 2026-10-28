import { spawn } from "node:child_process";

const KODE = process.argv[2] || "4mqofgukeo5r";
const PORT = 9333;
const chrome = spawn("chromium", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/bpCDP",
  `https://jwplyr.com/e/${KODE}`
], { stdio: "ignore" });

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
let target = null;
for (let i = 0; i < 40; i += 1) {
  await tidur(500);
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/list`, { signal: AbortSignal.timeout(3000) });
    const list = await r.json();
    target = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    if (target) break;
  } catch { /* belum siap */ }
}
if (!target) { console.log("gagal dapat target"); chrome.kill(); process.exit(1); }
console.log("target:", target.url);

const ws = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let id = 0;
const kirim = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
await new Promise((r) => ws.addEventListener("open", r));
await kirim("Runtime.enable");
await kirim("Page.enable");
await tidur(4000);
// klik overlay biar iframe dibuat
await kirim("Runtime.evaluate", { expression: `document.querySelector('.video-link')?.click(); 1` });
await tidur(7000);
const expr = `(() => {
  const f = [...document.querySelectorAll('iframe')].map(x => x.src).filter(Boolean);
  const top = [...document.querySelectorAll('video')].map(v => ({ d: v.duration, src: v.currentSrc }));
  let dalam = null;
  try {
    const fr = document.querySelector('iframe');
    const v = fr && fr.contentDocument && fr.contentDocument.querySelector('video');
    dalam = v ? { d: v.duration, src: v.currentSrc } : null;
  } catch (e) { dalam = 'cross-origin'; }
  return JSON.stringify({ iframes: f, top, dalam });
})()`;
const hasil = await kirim("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
console.log(hasil.result?.result?.value || JSON.stringify(hasil).slice(0, 500));
chrome.kill();
process.exit(0);

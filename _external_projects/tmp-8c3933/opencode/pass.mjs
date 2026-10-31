// Melewati JS challenge "wsidchk": jalankan JS-nya di shim, replay request-nya, pakai cookie-nya.
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const H = { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'accept-language': 'id-ID,id;q=0.9,en;q=0.8', 'upgrade-insecure-requests': '1' };
const jar = new Map();
const cookieHdr = () => [...jar].map(([k, v]) => k + '=' + v).join('; ');
function eat(res) { for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function raw(url, opts = {}) {
  let lastErr;
  for (let a = 0; a < 5; a++) {
    try {
      const res = await fetch(url, { redirect: 'manual', headers: { ...H, ...(opts.headers || {}), ...(jar.size ? { cookie: cookieHdr() } : {}) }, method: opts.method, body: opts.body });
      eat(res);
      return { status: res.status, loc: res.headers.get('location'), body: await res.text() };
    } catch (e) { lastErr = e; await sleep(400 * (a + 1)); }
  }
  throw lastErr;
}

// ---------- shim browser ----------
const log = [];
class FakeNode {
  constructor(t) { this.tag = t; this.children = []; this.attrs = {}; }
  appendChild(c) { this.children.push(c); return c; }
  set id(v) { this.attrs.id = v; } get id() { return this.attrs.id; }
  set name(v) { this.attrs.name = v; } get name() { return this.attrs.name; }
  set value(v) { this.attrs.value = v; } get value() { return this.attrs.value; }
  set type(v) { this.attrs.type = v; } get type() { return this.attrs.type; }
  set action(v) { this.attrs.action = v; } get action() { return this.attrs.action; }
  set method(v) { this.attrs.method = v; } get method() { return this.attrs.method; }
  set style(v) { this.attrs.style = v; } get style() { return this.attrs.style; }
  submit() { const q = new URLSearchParams(this.children.map(c => [c.name, String(c.value)])); log.push({ method: (this.method || 'GET').toUpperCase(), url: this.action + (this.method === 'POST' ? '' : '?' + q), body: this.method === 'POST' ? q.toString() : null }); }
}
const PluginArray = function () {}, MimeTypeArray = function () {}, Plugin = function () {}, MimeType = function () {};
const plugins = Object.create(PluginArray.prototype); plugins.length = 0;
const mimeTypes = Object.create(MimeTypeArray.prototype); mimeTypes.length = 0;
const document = {
  _els: {},
  getElementById(i) { return this._els[i] || (this._els[i] = new FakeNode('div')); },
  createElement(t) { return new FakeNode(t); },
  addEventListener(ev, fn) { try { fn(); } catch (e) { log.push({ err: String((e && e.stack) || e) }); } },
  attachEvent(ev, fn) { try { fn(); } catch (e) { log.push({ err: String((e && e.stack) || e) }); } },
};
class XMLHttpRequest {
  open(m, u) { this.m = m; this.u = u; }
  setRequestHeader(k, v) { (this.h ||= {})[k] = v; }
  send(b) { log.push({ method: this.m, url: this.u, body: b || null, xhr: true }); }
  set onreadystatechange(f) {}
}
const navigator = { userAgent: UA, appVersion: '5.0 (Windows NT 10.0; Win64; x64)', languages: ['en-US', 'en'], language: 'en-US', plugins, mimeTypes, webdriver: false };
const window = { document, navigator, XMLHttpRequest, URLSearchParams, setTimeout: f => f(), outerWidth: 1920, outerHeight: 1080, PluginArray, MimeTypeArray, Plugin, MimeType, addEventListener() {}, attachEvent() {} };
window.window = window;
Object.assign(globalThis, { window, document, XMLHttpRequest, PluginArray, MimeTypeArray, Plugin, MimeType, URLSearchParams });
function runScripts(html) {
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const s = m[1];
    if (!s.includes('wsidchk')) continue;
    try { new Function('window', 'document', 'navigator', 'XMLHttpRequest', 'PluginArray', 'MimeTypeArray', 'Plugin', 'MimeType', 'URLSearchParams', 'setTimeout', s)(window, document, navigator, XMLHttpRequest, PluginArray, MimeTypeArray, Plugin, MimeType, URLSearchParams, window.setTimeout); }
    catch (e) { console.log('  [shim err]', e.message); }
  }
}

// ---------- loop ----------
const PATH = process.argv[2] || '/';
let r = await raw(BASE + PATH);
for (let i = 0; i < 3 && /wsidchk/.test(r.body) && r.status !== 404; i++) {
  log.length = 0;
  runScripts(r.body);
  for (const l of log) {
    console.log(`[solve ${i}] ${l.method} ${l.url}${l.body ? '  body=' + l.body : ''}`);
    const res = await raw(BASE + l.url, { method: l.method, body: l.body, headers: { referer: BASE + PATH, accept: 'text/html,*/*' } });
    console.log('   ->', res.status, res.loc || '', 'cookies:', [...jar].map(([k, v]) => k + '=' + v.slice(0, 28)).join('|'));
    if (res.status >= 300 && res.status < 400 && res.loc) r = await raw(res.loc.startsWith('http') ? res.loc : BASE + res.loc);
  }
  if (!jar.size) r = await raw(BASE + PATH);
}
console.log('\n=== FINAL', PATH, '->', r.status, 'len', r.body.length, 'challenge?', /wsidchk/.test(r.body), '===');
fs.writeFileSync('/tmp/opencode/home.html', r.body);
fs.writeFileSync('/tmp/opencode/cookies.txt', [...jar].map(([k, v]) => `tutorialinjectid.my.id\t${k}\t/\t${v}\t0`).join('\n') + '\n');
const txt = r.body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
console.log('--- TEKS HALAMAN (awal) ---\n' + txt.slice(0, 1200));
console.log('\n--- LINK / PATH INTERESING ---');
console.log([...new Set(r.body.matchAll(/(?:href|src|action)=["']([^"']+)["']/g)).map(m => m[1])].join('\n'));

// Library: client HTTP yang otomatis melewati JS challenge "wssplashchk/wsidchk"
import { execSync } from 'child_process';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const H = {
  'user-agent': UA,
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.9,en;q=0.8',
  'upgrade-insecure-requests': '1',
  'sec-fetch-dest': 'document', 'sec-fetch-mode': 'navigate', 'sec-fetch-site': 'same-origin', 'sec-fetch-user': '?1',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function makeClient(BASE) {
  const jar = new Map();
  const cookieHdr = () => [...jar].map(([k, v]) => k + '=' + v).join('; ');
  const eat = res => { for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); } };

  async function raw(url, opts = {}) {
    let lastErr;
    for (let a = 0; a < 4; a++) {
      try {
        const res = await fetch(url, {
          redirect: 'manual', method: opts.method, body: opts.body,
          headers: { ...H, ...(opts.headers || {}), ...(jar.size ? { cookie: cookieHdr() } : {}) },
        });
        eat(res);
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('image/') || ct.includes('octet') ? '[binary ' + res.headers.get('content-length') + ']' : await res.text();
        return { status: res.status, loc: res.headers.get('location'), ct, body, headers: res.headers };
      } catch (e) { lastErr = e; await sleep(300 * (a + 1)); }
    }
    return { status: 0, loc: null, ct: '', body: 'FETCH_ERR ' + (lastErr && lastErr.cause ? lastErr.cause.code : lastErr), headers: new Headers() };
  }

  // ---- jalankan JS challenge di shim lalu replay request yang dibikin script ----
  function buildChallengeRequests(html) {
    const out = [];
    const log = [];
    class N {
      constructor(t) { this.t = t; this.children = []; this.a = {}; }
      appendChild(c) { this.children.push(c); return c; }
      set id(v) { this.a.id = v; } get id() { return this.a.id; }
      set name(v) { this.a.name = v; } get name() { return this.a.name; }
      set value(v) { this.a.value = v; } get value() { return this.a.value; }
      set type(v) { this.a.type = v; } get type() { return this.a.type; }
      set action(v) { this.a.action = v; } get action() { return this.a.action; }
      set method(v) { this.a.method = v; } get method() { return this.a.method; }
      set style(v) { this.a.style = v; } get style() { return this.a.style; }
      submit() { const q = new URLSearchParams(this.children.map(c => [c.name, String(c.value)])); log.push({ method: (this.a.method || 'GET').toUpperCase(), url: this.a.action + (String(this.a.method).toUpperCase() === 'POST' ? '' : '?' + q), body: String(this.a.method).toUpperCase() === 'POST' ? q.toString() : null }); }
    }
    const PA = function () {}, MA = function () {}, P = function () {}, M = function () {};
    const plugins = Object.create(PA.prototype); plugins.length = 0;
    const mimeTypes = Object.create(MA.prototype); mimeTypes.length = 0;
    const doc = {
      e: {}, getElementById(i) { return this.e[i] || (this.e[i] = new N('div')); }, createElement(t) { return new N(t); },
      addEventListener(ev, fn) { try { fn(); } catch {} }, attachEvent(ev, fn) { try { fn(); } catch {} },
    };
    class X { open(m, u) { this.m = m; this.u = u; } setRequestHeader(k, v) { (this.h ||= {})[k] = v; } send(b) { log.push({ method: this.m, url: this.u, body: b || null }); } set onreadystatechange(f) {} }
    const nav = { userAgent: UA, appVersion: '5.0 (Windows NT 10.0; Win64; x64)', languages: ['en-US', 'en'], language: 'en-US', plugins, mimeTypes, webdriver: false };
    const win = { document: doc, navigator: nav, XMLHttpRequest: X, URLSearchParams, setTimeout: f => f(), outerWidth: 1920, outerHeight: 1080, PluginArray: PA, MimeTypeArray: MA, Plugin: P, MimeType: M, addEventListener() {}, attachEvent() {} };
    win.window = win;
    for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      const s = m[1];
      if (!/wsidchk/.test(s)) continue;
      try { new Function('window', 'document', 'navigator', 'XMLHttpRequest', 'PluginArray', 'MimeTypeArray', 'Plugin', 'MimeType', 'URLSearchParams', 'setTimeout', s)(win, doc, nav, X, PA, MA, P, M, URLSearchParams, win.setTimeout); } catch {}
    }
    return log;
  }

  async function get(path, opts = {}) {
    let res = await raw(BASE + path, opts);
    for (let i = 0; i < 3; i++) {
      if (!/wsidchk/.test(res.body)) break;
      const reqs = buildChallengeRequests(res.body);
      if (!reqs.length) break;
      for (const l of reqs) {
        // replay request challenge; cukup ambil cookie-nya (302 juga sudah set cookie)
        await raw(BASE + l.url, { method: l.method, body: l.body, headers: { referer: BASE + path, accept: '*/*' } });
      }
      res = await raw(BASE + path, opts);
    }
    return res;
  }

  return {
    BASE, jar, raw, get,
    cookieHdr,
    async probe(path, opts = {}) {
      const r = await get(path, opts);
      const title = (r.body.match(/<title[^>]*>([^<]*)<\/title>/i) || [, ''])[1].trim();
      return { path, status: r.status, len: r.body.length, ct: (r.ct || '').split(';')[0], title, loc: r.loc, isChallenge: /wsidchk/.test(r.body) };
    },
  };
}

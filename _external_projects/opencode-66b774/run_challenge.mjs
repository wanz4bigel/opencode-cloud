import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const htmlRaw = await (await fetch(BASE + '/', { headers: { 'user-agent': UA, accept: 'text/html' } })).text();
if (!/wsidchk/.test(htmlRaw)) { console.log('no challenge'); console.log(htmlRaw.slice(0, 1500)); process.exit(0); }

const scripts = [...htmlRaw.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const target = scripts.find(s => s.includes('wsidchk'));
fs.writeFileSync('/tmp/opencode/ch.js', target);

const log = [];
class FakeNode {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; }
  appendChild(c) { this.children.push(c); return c; }
  set id(v) { this.attrs.id = v; } get id() { return this.attrs.id; }
  set name(v) { this.attrs.name = v; } get name() { return this.attrs.name; }
  set value(v) { this.attrs.value = v; } get value() { return this.attrs.value; }
  set type(v) { this.attrs.type = v; } get type() { return this.attrs.type; }
  set action(v) { this.attrs.action = v; } get action() { return this.attrs.action; }
  set method(v) { this.attrs.method = v; } get method() { return this.attrs.method; }
  set style(v) { this.attrs.style = v; } get style() { return this.attrs.style; }
  submit() {
    const q = new URLSearchParams(this.children.map(c => [c.name, String(c.value)]));
    const body = q.toString();
    log.push({ via: 'form', method: this.method || 'GET', url: this.action + (String(this.method).toUpperCase() === 'POST' ? '' : '?' + body), body: String(this.method).toUpperCase() === 'POST' ? body : null });
  }
}
const PluginArray = function () {}, MimeTypeArray = function () {}, Plugin = function () {}, MimeType = function () {};
const plugins = Object.create(PluginArray.prototype); plugins.length = 5;
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
  send(b) { log.push({ via: 'xhr', method: this.m, url: this.u, body: b || null, headers: this.h || {} }); }
  set onreadystatechange(f) {}
}
const navigator = { userAgent: UA, appVersion: '5.0 (Windows NT 10.0; Win64; x64)', languages: ['en-US', 'en'], language: 'en-US', plugins, mimeTypes, webdriver: false };
const window = {
  document, navigator, XMLHttpRequest, URLSearchParams, setTimeout: (f) => f(),
  outerWidth: 1920, outerHeight: 1080, PluginArray, MimeTypeArray, Plugin, MimeType,
  addEventListener() {}, attachEvent() {},
};
window.window = window;
Object.assign(globalThis, { window, document, XMLHttpRequest, PluginArray, MimeTypeArray, Plugin, MimeType, URLSearchParams });

try {
  new Function('window', 'document', 'navigator', 'XMLHttpRequest', 'PluginArray', 'MimeTypeArray', 'Plugin', 'MimeType', 'URLSearchParams', 'setTimeout', target)(
    window, document, navigator, XMLHttpRequest, PluginArray, MimeTypeArray, Plugin, MimeType, URLSearchParams, window.setTimeout);
} catch (e) { console.log('RUN ERR:', e.message); }

console.log('ENDPOINT:', /'(\/z[0-9a-f]{20,})'/.exec(htmlRaw)?.[1]);
console.log('REQUEST DIBANGUN SCRIPT:');
for (const l of log) console.log('  ' + JSON.stringify(l));

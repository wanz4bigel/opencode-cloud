// test.mjs — kirim daftar request:  LABEL \t METHOD \t PATH_WITH_QUERY \t [POST_BODY]
import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const SNAP = Number(process.argv[3] || 220);
function text(b) {
  return b.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}
async function worker(list) {
  for (const line of list) {
    const [label, method, path, ...rest] = line.split('\t');
    const body = rest.join('\t') || undefined;
    const t0 = Date.now();
    const r = await c.get(path, { method: method || 'GET', body, headers: body ? { 'content-type': 'application/x-www-form-urlencoded' } : {} });
    const dt = Date.now() - t0;
    const txt = text(r.body);
    console.log(`\n### ${label}  [${method || 'GET'} ${path}] -> ${r.status} len=${r.body.length} ct=${(r.ct || '').split(';')[0]} ${dt}ms` + (r.loc ? ' loc=' + r.loc : ''));
    if (process.env.FULL) console.log(txt.slice(0, 4000));
    else console.log(txt.slice(0, SNAP).replace(/\n/g, ' ⏎ '));
    if (r.body !== txt) { /* noop */ }
  }
}
const n = 3;
const b = Array.from({ length: n }, () => []);
lines.forEach((l, i) => b[i % n].push(l));
await Promise.all(b.map(worker));

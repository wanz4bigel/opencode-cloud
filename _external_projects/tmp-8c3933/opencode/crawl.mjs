import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const seen = new Set();
const queue = (fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean)).map(p => new URL(p, BASE).pathname);
const MAX = Number(process.argv[3] || 40);
const rows = [];
fs.mkdirSync('/tmp/opencode/crawl', { recursive: true });

function norm(h) {
  try {
    const u = new URL(h, BASE);
    if (u.host !== new URL(BASE).host) return null;
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|txt|json|map)$/i.test(u.pathname) && !/\.php$/i.test(u.pathname)) return u.pathname + (u.search || '');
    return u.pathname + (u.search || '');
  } catch { return null; }
}

async function work() {
  while (queue.length && seen.size < MAX) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const r = await c.get(p);
    const f = '/tmp/opencode/crawl/' + p.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') + '.html';
    fs.writeFileSync(f, r.body);
    const title = (r.body.match(/<title[^>]*>([^<]*)<\/title>/i) || [, ''])[1].trim();
    rows.push({ p, status: r.status, len: r.body.length, title });
    console.log(String(r.status).padEnd(4), String(r.body.length).padEnd(8), p.padEnd(30), title.slice(0, 55));
    for (const m of r.body.matchAll(/(?:href|src|action)=["']([^"'#]+)["']/gi)) {
      const n = norm(m[1]);
      if (n && !seen.has(n) && !queue.includes(n)) queue.push(n);
    }
  }
}
await Promise.all([work(), work(), work(), work()]);
fs.writeFileSync('/tmp/opencode/crawl.csv', rows.map(r => `${r.status}\t${r.len}\t${r.p}\t${r.title}`).join('\n'));
console.log('\n=== TOTAL HALAMAN:', rows.length, '===');
console.log('=== SEMUA PATH Unik ===');
console.log([...new Set(rows.map(r => r.p))].sort().join('\n'));

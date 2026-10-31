import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const paths = ['/', '/shortlink/'];
const hdrSets = {
  'tanpa-header': {},
  'XFF-1.2.3.4': { 'x-forwarded-for': '1.2.3.4' },
  'XFF-HTML': { 'x-forwarded-for': '9.9.9.9<u>XSSXFF</u>' },
  'XFF-HTML-noip': { 'x-forwarded-for': '<b>DEFACED-TEST</b>' },
  'Client-IP': { 'x-client-ip': '8.8.8.8', 'x-real-ip': '8.8.8.8', 'cf-connecting-ip': '8.8.8.8' },
};
for (const p of paths) {
  await c.get(p);
  for (const [name, h] of Object.entries(hdrSets)) {
    const r = await c.get(p, { headers: h });
    const m = (r.body || '').match(/(IP ADDRESS|IP Anda)[\s\S]{0,220}/i);
    const txt = m ? m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 110) : '(tidak ada IP display)';
    const raw = m ? m[0].replace(/\s+/g, ' ').slice(0, 220) : '';
    console.log(`\n[${p}] ${name.padEnd(16)} -> ${txt}`);
    if (name.includes('HTML')) console.log('   RAW:', raw);
    await sleep(900);
  }
}

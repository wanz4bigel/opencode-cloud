import { makeClient } from './lib.mjs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const p of ['/', '/ssh/', '/config/', '/quizcuan/', '/cryptofree/']) {
  const r = await c.raw(BASE + p);
  const setc = r.headers.getSetCookie();
  console.log('\n=== ' + p + ' -> ' + r.status + (r.loc ? ' loc: ' + r.loc : '') + ' ===');
  const interesting = ['server', 'x-powered-by', 'x-frame-options', 'content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy', 'x-xss-protection', 'cache-control', 'content-type', 'set-cookie', 'location', 'x-redirect-by', 'expires'];
  for (const h of interesting) { const v = r.headers.get(h); if (v) console.log('  ' + h + ': ' + v.slice(0, 160)); }
  if (setc.length) console.log('  [cookies]', setc.map(s => s.split(';').slice(0, 4).join(';')).join(' | '));
  if (p === '/cryptofree/') console.log('  BODY:', (r.body || '').slice(0, 200).replace(/\s+/g, ' '));
  await sleep(600);
}

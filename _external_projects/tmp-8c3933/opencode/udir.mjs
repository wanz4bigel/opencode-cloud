import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const paths = ['/~tutn6686/','/~tutn6686/info.php','/~admin/','/~cpanel/','/~rusmana/','/~Inject-ID/','/~injectid/','/cgi-bin/','/.well-known/security.txt','/server-status','/server-info','/error/','/icons/','/logs/'];
for (const p of paths) {
  try { const r = await c.get(p); const b = r.body||''; console.log(String(r.status).padEnd(4), String(b.length).padStart(7), p, '||', (r.headers.get('location')||''), '||', b.replace(/\s+/g,' ').slice(0,90)); }
  catch(e){ console.log('ERR ', p, e.message); }
}

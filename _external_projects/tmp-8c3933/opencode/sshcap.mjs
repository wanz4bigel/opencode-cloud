import { makeClient } from './lib.mjs';
import fs from 'fs';
const BASE = 'https://tutorialinjectid.my.id';
const c = makeClient(BASE);
if (fs.existsSync('/tmp/opencode/jar.json')) for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync('/tmp/opencode/jar.json', 'utf8')))) c.jar.set(k, v);

const mode = process.argv[2] || 'fetch';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' };

async function binary(path) {
  const res = await fetch(BASE + path, { redirect: 'manual', headers: { ...UA, accept: 'image/avif,image/webp,image/*,*/*', referer: BASE + '/ssh/', cookie: [...c.jar].map(([k, v]) => k + '=' + v).join('; ') } });
  for (const ck of res.headers.getSetCookie()) { const [kv] = ck.split(';'); const i = kv.indexOf('='); if (i > 0) c.jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); }
  return { status: res.status, ct: res.headers.get('content-type'), buf: Buffer.from(await res.arrayBuffer()) };
}

if (mode === 'fetch') {
  await c.get('/ssh/');
  await c.get('/ssh/index.php');
  const img = await binary('/ssh/captcha.php?t=' + Date.now());
  fs.writeFileSync('/tmp/opencode/captcha.jpg', img.buf);
  fs.writeFileSync('/tmp/opencode/jar.json', JSON.stringify([...c.jar]));
  console.log('captcha:', img.status, img.ct, img.buf.length, 'bytes -> /tmp/opencode/captcha.jpg');
  console.log('jar:', [...c.jar].map(([k, v]) => k + '=' + v.slice(0, 24)).join('; '));
} else {
  const code = process.argv[3] || '';
  const sid = process.argv[4] || '1';
  const name = process.argv[5] || 'pwn-test';
  const body = new URLSearchParams({ action: 'create_ssh', server_id: sid, server_name_display: name, captcha_code: code, password: 'pwn123' }).toString();
  const opt = { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded' } };
  let r = await c.get('/ssh/index.php', opt);
  if (/wsidchk/.test(r.body)) r = await c.get('/ssh/index.php', opt);
  console.log('POST create_ssh server_id=' + sid, 'captcha=' + code, '->', r.status, r.body.replace(/\s+/g, ' ').slice(0, 500));
  fs.writeFileSync('/tmp/opencode/jar.json', JSON.stringify([...c.jar]));
}

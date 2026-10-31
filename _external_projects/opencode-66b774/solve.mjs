// Solver untuk JS challenge bertipe "wsidchk" (Apache/PHP edge challenge)
import fs from 'fs';
const BASE = process.argv[2] || 'https://tutorialinjectid.my.id';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function sliceBalanced(src, start) {
  // start = index of first char of expression; baca sampai paren balance & berhenti di , atau ;
  let depth = 0, i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) { i++; break; } }
    else if (depth === 0 && (c === ',' || c === ';')) break;
  }
  return src.slice(start, i);
}

function grabNum(src, name) {
  const re = new RegExp('[,;\\s]' + name + '=(\\+\\()');
  const m = re.exec(src);
  if (!m) return null;
  const expr = src.slice(m.index + m[0].length - 1);
  const ex = sliceBalanced(expr, 0);
  return { expr: ex, val: Number(eval('+' + ex)) };
}

function grabConcat(src, anchor) {
  // ambil ekspresi concat string: 'a'+'b'+... setelah anchor
  const idx = src.indexOf(anchor);
  if (idx < 0) return null;
  let i = src.indexOf("'", idx + anchor.length);
  let out = '';
  while (i > 0 && i < src.length) {
    const end = src.indexOf("'", i + 1);
    if (end < 0) break;
    out += src.slice(i + 1, end);
    const rest = src.slice(end + 1, end + 30);
    const m = /^\s*\+\s*'/.exec(rest);
    if (!m) break;
    i = end + m[0].length;
  }
  return out;
}

async function main() {
  const jar = new Map();
  const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

  const html = await (await fetch(BASE + '/', {
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml', 'accept-language': 'en-US,en;q=0.9' },
  })).text();

  if (!/wsidchk/.test(html)) { console.log('NO CHALLENGE'); console.log(html.slice(0, 4000)); return; }

  const e = grabNum(html, 'e'), L = grabNum(html, 'L');
  const id = grabConcat(html, "'id',");
  const mts = /'ts','(\d+)'/.exec(html);
  const endpoint = /'(\/z[0-9a-f]{20,})'/.exec(html)?.[1];
  const pdata = /'(https%3A%2F%2F[^']+)'/.exec(html)?.[1];

  console.log('id        :', id);
  console.log('ts        :', mts?.[1]);
  console.log('endpoint  :', endpoint);
  console.log('pdata     :', pdata);
  console.log('wsidchk   :', e.val, '+', L.val, '=', e.val + L.val);

  const q = new URLSearchParams({ id, ts: mts[1], wsidchk: String(e.val + L.val), pdata, x: '0' });
  const r = await fetch(BASE + endpoint + '?' + q, {
    headers: { 'user-agent': UA, referer: BASE + '/', cookie: cookieHeader() },
  });
  const setc = r.headers.getSetCookie();
  console.log('challenge :', r.status, setc);
  for (const c of setc) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); }

  const r2 = await fetch(BASE + '/', { headers: { 'user-agent': UA, accept: 'text/html', cookie: cookieHeader() } });
  const out = await r2.text();
  console.log('final     :', r2.status, 'len', out.length, 'challenge?', /wsidchk/.test(out));
  console.log('cookies   :', [...jar].map(([k, v]) => k + '=' + v.slice(0, 40)).join('\n'));
  fs.writeFileSync('/tmp/opencode/home.html', out);
  fs.writeFileSync('/tmp/opencode/cookies.txt', [...jar].map(([k, v]) => `${k}\t${v}\t/`).join('\n'));
  console.log('\n--- HEAD ---\n' + out.replace(/<script[\s\S]*?<\/script>/g, '').slice(0, 2500));
}
main().catch(e => { console.error('ERR', e); });

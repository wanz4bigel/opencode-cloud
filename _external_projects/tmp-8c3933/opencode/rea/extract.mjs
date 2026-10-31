// Ekstrak kandidat endpoint OTP + bentuk payload dari JS yang udah disedot.
//   node extract.mjs <dirJS>
import fs from 'fs';
import path from 'path';
const dir = process.argv[2];
if (!dir) process.exit(2);

const KEY = /(otp|verif|msisdn|sendcode|send-code|send-sms|sendsms|requestcode|generateotp|pin-?request|otponly)/i;
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  }
})(dir);

const hits = new Map();   // endpoint -> {file, ctx}
const payloads = [];      // potongan kode di sekitar panggilan OTP

const PATTERNS = [
  // ".../otp..." dalam string
  /["'`](\/?[a-z0-9][a-z0-9\/_.{}$-]{3,90}(?:otp|verif|msisdn|send-code|sendcode|send-sms|sendsms)[a-z0-9\/_.{}$-]*)["'`]/gi,
  // http(s) absolut
  /["'`](https?:\/\/[a-z0-9.\-_]+\/[a-z0-9\/_.{}$-]{3,120})["'`]/gi,
];

function add(key, file, ctx) {
  const k = key.replace(/^['"`]/, '');
  if (!hits.has(k)) hits.set(k, { file: path.basename(file), ctx: ctx.slice(0, 400) });
}

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(txt))) {
      const s = m[1];
      if (!KEY.test(s)) continue;
      if (/\.(css|png|jpg|svg|woff|gif|html)($|\?)/i.test(s)) continue;
      if (/^(https?:\/\/)/.test(s) && !/\/(api|v[0-9]|auth|user|account|otp|login|register)/i.test(s)) continue;
      add(s, f, txt.slice(Math.max(0, m.index - 200), m.index + 160).replace(/\s+/g, ' '));
    }
  }
  // payload OTP: fungsi yang nyebut otp + objek literal
  const re2 = /[a-zA-Z_$][\w$]*\s*(?:=|:)\s*(?:\([^)]{0,60}\)\s*=>)?\s*[^;]{0,40}(?:post|get|put)\s*\(\s*[^)]{0,120}otp[^)]{0,220}\)/gi;
  let m2;
  while ((m2 = re2.exec(txt))) {
    const c = m2[0].replace(/\s+/g, ' ');
    if (c.length > 90 && c.length < 320) payloads.push({ file: path.basename(f), code: c });
  }
}

const keys = [...hits.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`=== KANDIDAT ENDPOINT (${keys.length}) dari ${files.length} file JS ===`);
for (const [k, v] of keys) console.log(`  ${k}\n      [${v.file}]`);

// Host API absolut + jalur yang kelihatan di file HTML/JS (termasuk host tanpa kata 'api' di path)
const hosts = new Map();
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/https?:\/\/((?:api|auth|gateway|core|app|backend|service|www-api|prod|mobile)[a-z0-9.-]*\.(?:co\.id|id|com|co|net|xyz)(?:\/[a-z0-9\/_.{}$-]{0,70})?)/gi)) {
    const s = m[0];
    if (!hosts.has(s)) hosts.set(s, path.basename(f));
  }
  for (const m of txt.matchAll(/["'`](\/api\/[a-z0-9\/_.{}$-]{3,70})["'`]/gi)) {
    if (!hits.has(m[1])) hits.set(m[1], { file: path.basename(f), ctx: '' });
  }
}
console.log(`\n=== HOST API ABSOLUT (${hosts.size}) ===`);
for (const [h, f] of [...hosts.entries()].sort()) console.log(`  ${h}`);

console.log(`\n=== BENTUK PAYLOAD / PANGGILAN OTP (${payloads.length}) ===`);
const seen = new Set();
for (const p of payloads) {
  const kk = p.code.replace(/\s+/g, '');
  if (seen.has(kk)) continue;
  seen.add(kk);
  if (seen.size > 25) break;
  console.log(`  ${p.code}`);
}

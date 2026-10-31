import { readFileSync, writeFileSync } from "node:fs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const kode = JSON.parse(readFileSync("/tmp/kode-penuh.json", "utf8"));
const lama = JSON.parse(readFileSync("/tmp/jw-hasil.json", "utf8"));
const peta = new Map(lama.map((v) => [v.code, v]));
const sisa = kode.filter((c) => !peta.has(c));

const get = async (u) => {
  for (let i = 0; i < 2; i += 1) {
    try {
      const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!r.ok) return null;
      return await r.text();
    } catch { /* ulang */ }
  }
  return null;
};

const decode = (s) => String(s || "")
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ").trim();

let n = 0;
let hidup = 0;
async function pekerja() {
  while (sisa.length) {
    const c = sisa.shift();
    const t = await get(`https://jwplyr.com/e/${c}`);
    if (t) {
      const title = decode((t.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "");
      const poster = (t.match(/class="thumbnail" src="([^"]+)"/) || [])[1] || "";
      if (title && !/^404|not found|page not found/i.test(title)) {
        peta.set(c, { code: c, title, poster });
        hidup += 1;
      }
    }
    n += 1;
    if (n % 100 === 0) console.error(`${n}/${sisa.length + n} · hidup ${hidup} · total ${peta.size}`);
  }
}

console.log(`kode: ${kode.length} · sudah punya: ${lama.length} · perlu dicek: ${sisa.length}`);
await Promise.all(Array.from({ length: 8 }, pekerja));

const hasil = [...peta.values()];
writeFileSync("/tmp/jw-penuh.json", JSON.stringify(hasil, null, 2));
console.log(`\nhidup total: ${hasil.length} (baru ${hidup}) · dari ${kode.length} kode`);

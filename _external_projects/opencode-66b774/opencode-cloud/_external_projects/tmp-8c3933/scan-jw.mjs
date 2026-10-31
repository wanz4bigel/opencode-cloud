const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
};
const decode = (s) => String(s || "").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
// kode dari hasil panen sebelumnya
const kode = JSON.parse(await (await import("node:fs/promises")).readFile("/tmp/kode.json", "utf8"));
const hasil = [];
let n = 0;
async function pekerja() {
  while (kode.length) {
    const c = kode.shift();
    const t = await get(`https://jwplyr.com/e/${c}`);
    if (t) {
      const title = decode((t.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "").trim();
      const poster = (t.match(/class="thumbnail" src="([^"]+)"/) || [])[1] || "";
      if (title && !/^404|not found/i.test(title)) hasil.push({ code: c, title, poster });
    }
    n += 1;
    if (n % 50 === 0) console.error(`  ${n} · ${hasil.length} hidup`);
  }
}
await Promise.all(Array.from({ length: 6 }, pekerja));
const fs = await import("node:fs/promises");
await fs.writeFile("/tmp/jw-hasil.json", JSON.stringify(hasil, null, 2));
console.log("hidup:", hasil.length, "dari", n);
const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo)/i;
const INDO = /(indo|indonesia|bokep|cewek|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|jilbab|hijab)/i;
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|tresome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|affair|anal|hentai|ngewe|ngue|nguw|ngemut|hisap|kontol|sucks|kocokin|genjot|jilat|stepson|stepmom|stepsis|stepbro|adik|kakak|tiri|prank|ojol)/i;
const BAD = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak|underage|preteen|loli|china|douyin|jepang|korea|thai|barat|bule)/i;
const ok = hasil.filter((v) => SINYAL.test(v.title) && INDO.test(v.title) && !BUKAN.test(v.title) && !BAD.test(v.title));
console.log("lolos filter:", ok.length);
ok.slice(0, 40).forEach((v) => console.log("  +", v.title.slice(0, 80)));
console.log("--- contoh mentah:");
hasil.slice(0, 10).forEach((v) => console.log("  ·", v.title.slice(0, 70)));

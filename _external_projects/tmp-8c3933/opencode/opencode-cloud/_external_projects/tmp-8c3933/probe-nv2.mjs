const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
const parse = (h) => [...h.matchAll(/<a href="(\/video\/(\d+)\/[^"]*)" title="([^"]*)"[\s\S]{0,900}?<img src="([^"]+)"[\s\S]{0,200}?<i class="time">([^<]+)<\/i>/gi)].map((m) => ({ id: m[2], title: decode(m[3]), thumb: m[4], dur: m[5] }));
const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo|squirt|becek|crot|fingering)/i;
const INDO = /(indo|indonesia|jilbab|hijab|tante|janda|abg|cewek|cindo|amoy|memek|bokep|suster|pembantu|mertua|ukhti|tobrut|toge|bumil)/i;
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair|video call|anal|asshole|hentai|ngewe|ngemut|hisap|kontol|sucks|di ?kocokin|stepson|stepmom|stepsis|stepbro|rides on|\bpee\b|piss)/i;
const BAD = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak kecil|underage|preteen|loli)/i;
const ok = (v) => v.id && SINYAL.test(v.title) && INDO.test(v.title) && !BUKAN.test(v.title) && !BAD.test(v.title);
for (const q of ["indonesian colmek", "colmek", "indo colmek", "colmek hijab", "colmek abg", "colmek dildo", "janda colmek", "toge colmek", "masturbasi indonesia", "cewek colmek", "bokep colmek", "viral colmek"]) {
  const base = `https://www.nuvid.com/search/videos/${encodeURIComponent(q)}`;
  const pages = await Promise.all([1, 2, 3].map((p) => get(p === 1 ? base : `${base}/${p}`)));
  const all = pages.flatMap(parse);
  const uniq = new Map(all.map((v) => [v.id, v]));
  console.log(`${q.padEnd(22)} ambil=${String(uniq.size).padStart(3)} lolos=${String([...uniq.values()].filter(ok).length).padStart(3)}  ${([...uniq.values()].find(ok) || {}).title?.slice(0, 45) || "-"}`);
}

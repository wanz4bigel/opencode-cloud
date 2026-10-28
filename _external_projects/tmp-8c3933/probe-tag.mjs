const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
const parse = (html) => [...html.matchAll(/<div id="video_([a-z0-9]+)"[\s\S]{0,2600}?<p class="title"><a href="([^"]+)" title="([^"]+)">/gi)].map((m) => ({ id: m[1], title: decode(m[3]) }));
const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo|squirt|becek|crot|fingering)/i;
const INDO = /(indo|indonesia|jilbab|hijab|tante|janda|abg|cewek|cindo|amoy|memek|bokep|suster|pembantu|mertua|ukhti|tobrut)/i;
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair|video call|anal|asshole|hentai|ngewe|ngemut|hisap|kontol|sucks|di ?kocokin|stepson|stepmom|stepsis|stepbro|rides on|\bpee\b|piss)/i;
const BAD = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak kecil|underage|preteen|loli)/i;
const tags = ["indonesian-masturbation", "masturbasi", "masturbation-indonesia", "indo-masturbasi", "solo-indonesia", "solo-indo", "hijab-masturbation", "jilbab-masturbasi", "abg-masturbasi", "janda-masturbasi", "tante-masturbasi", "dildo-masturbasi", "ngocok", "onani", "coli", "cewek-indonesia", "bokep-indonesia", "viral-indonesia", "toge-indonesia", "chindo", "amoy", "toket-indonesia", "kamera-hp", "vcs-indonesia"];
for (const t of tags) {
  const h1 = await get(`https://www.xvideos.com/tags/${t}`);
  const h2 = await get(`https://www.xvideos.com/tags/${t}/1`);
  const all = [...parse(h1), ...parse(h2)];
  const ok = all.filter((v) => SINYAL.test(v.title) && INDO.test(v.title) && !BUKAN.test(v.title) && !BAD.test(v.title));
  const total = (h1.match(/([\d.,]+)\s*Results/i) || [])[1] || "?";
  console.log(`${t.padEnd(26)} total=${String(total).padStart(7)} ambil=${String(all.length).padStart(3)} lolos=${String(ok.length).padStart(3)} ${(ok[0] && ok[0].title.slice(0, 38)) || ""}`);
}

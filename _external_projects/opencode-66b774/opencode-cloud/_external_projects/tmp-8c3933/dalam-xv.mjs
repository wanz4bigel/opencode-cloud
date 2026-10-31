const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
const parse = (h) => [...h.matchAll(/<div id="video_([a-z0-9]+)"[\s\S]{0,2600}?<p class="title"><a href="([^"]+)" title="([^"]+)">/gi)].map((m) => ({ id: m[1], title: decode(m[3]) }));
const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo)/i;
const INDO = /(indo|indonesia|bokep|cewek|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|kakak ipar|adik tiri)/i;
const BUKAN_INDO = /(indian|arab|malay|pinay|filipina|thai|japanese|korea|vietnam|turkey|turkish|bangladesh|pakistan|sri lanka|black|ebony|latina|russian|europe|american|british|white|hindi)/i;
const BUKAN = /(ngentot|entot|ngentit|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair|video call|anal|asshole|hentai|ngewe|ngemut|hisap|kontol|sucks|di ?kocokin|ngocokin|colmekin|genjot|jilat|stepson|stepmom|stepsis|stepbro|rides on|\bpee\b|piss|caught|police|public|outdoor|bus stop|lonte|michat|prank|reuni|crot di mulut|maid|mutual)/i;
const BAD = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak kecil|underage|preteen|loli)/i;
const ok = (v) => SINYAL.test(v.title) && INDO.test(v.title) && !BUKAN.test(v.title) && !BUKAN_INDO.test(v.title) && !BAD.test(v.title);
for (const q of ["colmek indo", "indo colmek", "colmek"]) {
  const uniq = new Map();
  const dots = [];
  for (let p = 0; p < 30; p += 1) {
    const u = `https://www.xvideos.com/?k=${encodeURIComponent(q)}${p ? `&p=${p}` : ""}`;
    const h = await get(u);
    const v = parse(h);
    for (const x of v) uniq.set(x.id, x);
    if (p % 10 === 9) dots.push(`p${p + 1}:${[...uniq.values()].filter(ok).length}`);
  }
  console.log(`${q.padEnd(14)} unik=${uniq.size} lolos=${[...uniq.values()].filter(ok).length}  ${dots.join(" ")}`);
}

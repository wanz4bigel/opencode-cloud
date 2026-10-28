const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'");
const SINYAL = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo|squirt|becek|crot|fingering)/i;
const INDO = /(indo|indonesia|jilbab|hijab|tante|janda|abg|cewek|cindo|amoy|memek|bokep|suster|pembantu|mertua|ukhti|tobrut|toge|bumil)/i;
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair|video call|anal|asshole|hentai|ngewe|ngemut|hisap|kontol|sucks|di ?kocokin|stepson|stepmom|stepsis|stepbro|rides on|\bpee\b|piss)/i;
const BAD = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak kecil|underage|preteen|loli)/i;

const ypParse = (h) => [...h.matchAll(/<article class="video-box[\s\S]*?<\/article>/gi)].map((m) => {
  const a = m[0];
  return {
    id: (a.match(/data-video-id="(\d+)"/) || [])[1],
    title: decode((a.match(/aria-label="([^"]*)"/) || [])[1] || ""),
    thumb: (a.match(/data-src="(https:[^"]+)"/) || [])[1] || "",
    dur: ((a.match(/video-duration[\s\S]{0,120}?<span>\s*([\d:]+)\s*<\/span>/i) || [])[1] || "0:00").trim()
  };
});
const nvParse = (h) => [...h.matchAll(/<a href="(\/video\/(\d+)\/[^"]*)" title="([^"]*)"[\s\S]{0,900}?<img src="([^"]+)"[\s\S]{0,200}?<i class="time">([^<]+)<\/i>/gi)].map((m) => ({
  id: m[2], title: decode(m[3]), thumb: m[4], dur: m[5]
}));
const secs = (d) => { const p = d.split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
const ok = (v) => v.id && v.title && v.thumb && secs(v.dur) >= 45 && SINYAL.test(v.title) && INDO.test(v.title) && !BUKAN.test(v.title) && !BAD.test(v.title);

const Q = ["indonesian colmek", "colmek", "indo colmek", "masturbasi indo", "hijab colmek", "abg colmek", "dildo indo", "cewek colmek", "toge colmek", "janda colmek"];
for (const q of Q) {
  const y1 = await get(`https://www.youporn.com/search/?query=${encodeURIComponent(q)}`);
  const y2 = await get(`https://www.youporn.com/search/?query=${encodeURIComponent(q)}&page=2`);
  const nBase = `https://www.nuvid.com/search/${encodeURIComponent(q)}`;
  const n1 = await get(nBase);
  const n2 = await get(`${nBase}/2`);
  const ya = [...ypParse(y1), ...ypParse(y2)];
  const na = [...nvParse(n1), ...nvParse(n2)];
  console.log(`${q.padEnd(18)} YP ${String(ya.length).padStart(3)}/${String(ya.filter(ok).length).padStart(3)}   NV ${String(na.length).padStart(3)}/${String(na.filter(ok).length).padStart(3)}   ${(ya.find(ok) || na.find(ok) || {}).title?.slice(0, 40) || "-"}`);
}

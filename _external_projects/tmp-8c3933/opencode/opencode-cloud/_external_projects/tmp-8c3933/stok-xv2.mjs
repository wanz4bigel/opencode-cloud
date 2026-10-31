const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const parse = (html) => {
  const out = [];
  const re = /<div id="video_([a-z0-9]+)"[\s\S]{0,2500}?<p class="title"><a href="([^"]+)" title="([^"]+)">[\s\S]{0,200}?<span class="duration">([^<]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html))) {
    const seg = html.slice(m.index, m.index + 2500);
    const thumb = (seg.match(/data-src="(https:[^"]+\.(?:jpg|webp))"/) || [])[1] || "";
    out.push({ id: m[1], href: m[2], title: decodeEntities(m[3]), dur: m[4].trim(), thumb });
  }
  return out;
};
const decodeEntities = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair)/i;
const COLM = /(colmek|masturbat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo|squirt|becek|crot)/i;
const bases = [
  ["tag indonesia-colmek", "https://www.xvideos.com/tags/indonesia-colmek", "tag"],
  ["tag colmek", "https://www.xvideos.com/tags/colmek", "tag"],
  ["tag masturbasi-indonesia", "https://www.xvideos.com/tags/masturbasi-indonesia", "tag"],
  ["search colmek", "https://www.xvideos.com/?k=colmek", "search"],
  ["search colmek indo", "https://www.xvideos.com/?k=colmek+indo", "search"],
  ["search indo colmek", "https://www.xvideos.com/?k=indo+colmek", "search"],
  ["search dildo indo", "https://www.xvideos.com/?k=dildo+indo", "search"],
  ["search masturbasi indo", "https://www.xvideos.com/?k=masturbasi+indo", "search"]
];
for (const [name, base, kind] of bases) {
  const first = await get(base);
  const n1 = parse(first).length;
  const total = (first.match(/([\d.,]+)\s*Results/i) || [])[1] || (first.match(/([\d.,]+)\s*videos/i) || [])[1] || "?";
  let all = parse(first);
  const pageUrl = (p) => kind === "tag" ? `${base}/${p}` : `${base}&p=${p}`;
  const rest = await Promise.all([2, 3, 4, 5, 6].map((p) => get(pageUrl(p))));
  for (const r of rest) all = all.concat(parse(r));
  const uniq = new Map();
  for (const v of all) if (!uniq.has(v.id)) uniq.set(v.id, v);
  const ok = [...uniq.values()].filter((v) => COLM.test(v.title) && !BUKAN.test(v.title));
  console.log(`${name.padEnd(26)} p1=${String(n1).padStart(3)} total=${String(total).padStart(8)} kumpul=${String(uniq.size).padStart(4)} lolos=${String(ok.length).padStart(4)}`);
  if (name === "tag indonesia-colmek") ok.slice(0, 5).forEach((v) => console.log(`    ${v.dur.padEnd(7)} ${v.title.slice(0, 60)}`));
}

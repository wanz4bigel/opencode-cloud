const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const parse = (html) => {
  const out = [];
  // obj_ ... block: <div class="thumb"><a href="/video.ID/slug" title="..."><img ...><span class="duration">mm:ss</span>
  const re = /<a href="\/video\.([a-z0-9]+)\/([^"]+)"[^>]*title="([^"]*)"[\s\S]{0,500}?<img[^>]+src="([^"]+)"[\s\S]{0,300}?<span class="duration">([^<]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html))) out.push({ id: m[1], slug: m[2], title: m[3], thumb: m[4], dur: m[5] });
  return out;
};
const BUKAN = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|video call|vc sex|affair)/i;
const COLM = /(colmek|masturbat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo|squirt|becek)/i;
const bases = [
  ["tag indonesia-colmek", "https://www.xvideos.com/tags/indonesia-colmek"],
  ["tag colmek", "https://www.xvideos.com/tags/colmek"],
  ["tag masturbasi-indonesia", "https://www.xvideos.com/tags/masturbasi-indonesia"],
  ["search colmek", "https://www.xvideos.com/?k=colmek"],
  ["search colmek indo", "https://www.xvideos.com/?k=colmek+indo"],
  ["search indo colmek", "https://www.xvideos.com/?k=indo+colmek"],
  ["search dildo indo", "https://www.xvideos.com/?k=dildo+indo"],
  ["search masturbasi indo", "https://www.xvideos.com/?k=masturbasi+indo"]
];
for (const [name, base] of bases) {
  const first = await get(base);
  const n1 = parse(first).length;
  const total = (first.match(/([\d.,]+)\s*(?:Results|results|video)/) || [])[1] || "?";
  let all = parse(first);
  if (n1) {
    const pages = [2, 3, 4, 5];
    const rest = await Promise.all(pages.map((p) => get(`${base}${base.includes("?") ? "&" : "/"}p=${p}`.replace("/p=", "/"))));
    // try both forms
    for (let i = 0; i < rest.length; i++) all = all.concat(parse(rest[i]));
  }
  const uniq = new Map();
  for (const v of all) if (!uniq.has(v.id)) uniq.set(v.id, v);
  const ok = [...uniq.values()].filter((v) => COLM.test(v.title) && !BUKAN.test(v.title));
  console.log(`${name.padEnd(26)} page1=${String(n1).padStart(3)} total=${String(total).padStart(7)} kumpul=${String(uniq.size).padStart(4)} lolos=${String(ok.length).padStart(4)}`);
}

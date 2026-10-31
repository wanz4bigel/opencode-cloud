const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&ndash;/g, "-");
const parse = (html) => {
  const out = [];
  const re = /<div id="video_([a-z0-9]+)"[\s\S]{0,2500}?<p class="title"><a href="([^"]+)" title="([^"]+)">[\s\S]{0,200}?<span class="duration">([^<]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html))) {
    const seg = html.slice(m.index, m.index + 2500);
    out.push({ id: m[1], href: m[2], title: decode(m[3]), dur: m[4].trim(), thumb: (seg.match(/data-src="(https:[^"]+)"/) || [])[1] || "" });
  }
  return out;
};
const TAGS = ["indonesia-colmek", "colmek", "masturbasi-indonesia", "indo-colmek", "colmek-indonesia", "abg-colmek", "hijab-colmek", "jilbab-colmek", "dildo-indonesia", "masturbasi-indo"];
const SEARCH = ["colmek", "colmek indo", "indo colmek", "colmek hijab", "colmek abg", "colmek janda", "colmek dildo", "masturbasi indonesia", "ngocok indo", "dildo indo", "solo indo", "cewek colmek"];
const rows = [];
for (const t of TAGS) {
  const base = `https://www.xvideos.com/tags/${t}`;
  const h1 = await get(base);
  const h2 = await get(`${base}/1`);
  const a = parse(h1);
  const total = (h1.match(/([\d.,]+)\s*Results/i) || [])[1] || "?";
  rows.push([`tag ${t}`, a.length + parse(h2).length, total, (a[0] && a[0].title) || "-"]);
}
for (const q of SEARCH) {
  const base = `https://www.xvideos.com/?k=${encodeURIComponent(q)}`;
  const h1 = await get(base);
  const h2 = await get(`${base}&p=1`);
  const a = parse(h1);
  const total = (h1.match(/([\d.,]+)\s*Results/i) || [])[1] || "?";
  rows.push([`cari ${q}`, a.length + parse(h2).length, total, (a[0] && a[0].title) || "-"]);
}
for (const [n, got, total, ex] of rows) console.log(`${n.padEnd(28)} 2hal=${String(got).padStart(3)} total=${String(total).padStart(8)}  ${ex.slice(0, 45)}`);

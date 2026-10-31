const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const urls = [
  ["youporn", "https://www.youporn.com/search/?query=indonesian+colmek"],
  ["youporn2", "https://www.youporn.com/search/?query=colmek"],
  ["tube8", "https://www.tube8.com/searches/?q=indonesian+colmek"],
  ["tube8b", "https://www.tube8.com/searches/?q=colmek"],
  ["nuvid", "https://www.nuvid.com/search/indonesian%20colmek"],
  ["nuvidb", "https://www.nuvid.com/search/colmek"],
  ["beeg", "https://beeg.com/search?q=indonesian%20colmek"],
  ["anybunny", "https://anybunny.com/?q=indonesian+colmek"]
];
for (const [n, u] of urls) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    const vids = (t.match(/\/watch\/|\/video\d|\/video\/|video-box|search-video|thumb/gi) || []).length;
    console.log(`${n.padEnd(10)} ${r.status} ${String(t.length).padStart(7)}b hits=${vids} XFO=${r.headers.get("x-frame-options") || "-"}`);
    if (r.ok) {
      const title = (t.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "";
      console.log(`   ${title.slice(0, 80)}`);
    }
  } catch (e) { console.log(`${n.padEnd(10)} ERR ${e.message}`); }
}

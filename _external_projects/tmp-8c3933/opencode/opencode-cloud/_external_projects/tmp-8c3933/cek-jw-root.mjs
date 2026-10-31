const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const urls = [
  "https://jwplyr.com/",
  "https://jwplyr.com/?op=video",
  "https://jwplyr.com/search/colmek",
  "https://jwplyr.com/?q=colmek",
  "https://jwplyr.com/videos",
  "https://dood.boo/",
  "https://dood.boo/?op=video",
  "https://playmogo.com/",
  "https://vidxlr.top/"
];
for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const t = await r.text();
    const title = (t.match(/<title[^>]*>([^<]*)/i) || [])[1] || "";
    const forms = (t.match(/<form/gi) || []).length;
    const inputs = (t.match(/type=["'](?:text|search)["']/gi) || []).length;
    console.log(`${String(r.status).padEnd(4)} ${u.padEnd(32)} ${String(t.length).padStart(7)}b forms=${forms} search=${inputs} | ${title.slice(0, 45)}`);
  } catch (e) { console.log(`ERR  ${u.padEnd(32)} ${e.message}`); }
}

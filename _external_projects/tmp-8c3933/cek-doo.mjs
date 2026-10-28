const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const hosts = [
  "https://doostream.com/",
  "https://www.doostream.com/",
  "https://doostream.net/",
  "https://doodstream.com/",
  "https://dood.watch/",
  "https://dood.so/",
  "https://dood.pm/",
  "https://doods.pro/",
  "https://doo.stream/",
  "https://doodstream.co/"
];
for (const u of hosts) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const t = await r.text();
    const title = (t.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
    console.log(`${String(r.status).padEnd(4)} ${u.padEnd(30)} -> ${r.url.slice(0, 60).padEnd(60)} ${title.slice(0, 40)}`);
    console.log(`     XFO=${r.headers.get("x-frame-options") || "-"} CSP=${(r.headers.get("content-security-policy") || "-").slice(0, 50)}`);
  } catch (e) { console.log(`ERR  ${u.padEnd(30)} ${e.message}`); }
}

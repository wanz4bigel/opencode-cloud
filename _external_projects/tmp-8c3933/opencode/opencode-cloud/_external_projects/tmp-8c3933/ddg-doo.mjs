const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const ddg = async (q) => {
  const body = new URLSearchParams({ q, kl: "id-id" });
  const r = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded", "accept-language": "id-ID,id;q=0.9" },
    body,
    signal: AbortSignal.timeout(25000)
  });
  const html = await r.text();
  return [...html.matchAll(/class="result__a" href="([^"]+)"/g)].map((m) => {
    let u = m[1].replace(/&amp;/g, "&");
    if (u.includes("uddg=")) u = decodeURIComponent(new URLSearchParams(u.split("?")[1]).get("uddg") || u);
    return u;
  });
};
const queries = ["doodstream colmek", "dood.watch colmek", "dood.pm colmek indo", "site:dood.watch colmek", "site:dood.pm colmek", "doostream colmek", "doodstream bokep indo", "dood.watch bokep colmek"];
for (const q of queries) {
  const links = await ddg(q);
  console.log(`\n== ${q} (${links.length})`);
  for (const l of links.slice(0, 8)) console.log("  " + l.slice(0, 110));
}

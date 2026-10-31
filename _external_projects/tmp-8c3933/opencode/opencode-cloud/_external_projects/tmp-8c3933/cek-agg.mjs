const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return { status: r.status, body: r.ok ? await r.text() : "" };
  } catch (e) { return { status: 0, body: "" }; }
};
for (const u of ["https://www.xxxbule.com/niches/indo-colmek-viral-dood", "https://rusoska.com/search/doodstream-colmek", "https://www.xxxbule.com/search/indo+colmek"]) {
  const r = await get(u);
  const b = r.body;
  const ifr = [...new Set([...b.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
  const dood = [...new Set([...b.matchAll(/(?:vidclr|vidslr|jwplyr|vidxlr|dood)\.[a-z.]+\/(?:e|d)\/([a-z0-9]+)/gi)].map((m) => m[1]))];
  const vids = [...new Set([...b.matchAll(/href="([^"]*(?:video|watch|niche)[^"]*)"/gi)].map((m) => m[1]))];
  console.log(`\n${u}\n  ${r.status} ${b.length}b iframes=${ifr.length} dood=${dood.length} videoLinks=${vids.length}`);
  console.log("  iframe:", ifr.slice(0, 4).join(" | ").slice(0, 200));
  console.log("  dood:", dood.slice(0, 5).join(", "));
  console.log("  links:", vids.slice(0, 5).join(" | ").slice(0, 200));
}

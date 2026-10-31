const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const homes = [
  ["bokep31", "https://bokep31.work/"],
  ["kingland", "https://kingbokep.land/"],
  ["sedia", "https://sediabokep.tokyo/"],
  ["bandar", "https://bandarbokep.boats/"],
  ["colmekan", "https://colmekan.com/"],
  ["dicrotin", "https://dicrotin.com/"],
  ["indo18", "https://www.indo18.com/"]
];
const get = async (url) => {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) });
  return { status: r.status, url: r.url, html: await r.text() };
};
for (const [name, home] of homes) {
  try {
    const { status, html } = await get(home);
    // candidate video links
    const links = [...new Set([...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]))]
      .filter((u) => !/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp)(\?|$)/i.test(u))
      .filter((u) => /(watch|video|nonton|bokep|colmek|post|\/\d{4}\/|\/\d{5,})/i.test(u))
      .filter((u) => !/(category|kategori|tag|page|privacy|dmca|contact|about|login|register|search)/i.test(u));
    const abs = links.map((u) => { try { return new URL(u, home).toString(); } catch { return null; } }).filter(Boolean);
    const uniq = [...new Set(abs)].slice(0, 4);
    console.log(`\n== ${name} ${status} · ${uniq.length} calon`);
    for (const u of uniq) {
      try {
        const p = await get(u);
        const ifr = [...new Set([...p.html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
        const mp4 = [...new Set([...p.html.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((m) => m[0]))];
        console.log(`  ${p.status} ${u.slice(0, 90)}`);
        if (ifr.length) console.log(`     IF ${ifr.slice(0, 3).join(" | ").slice(0, 190)}`);
        if (mp4.length) console.log(`     MP4 ${mp4.slice(0, 2).join(" | ").slice(0, 170)}`);
      } catch (e) { console.log(`  ERR ${u.slice(0, 80)} ${e.message}`); }
    }
  } catch (e) { console.log(`== ${name} ERR ${e.message}`); }
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const urls = [
  ["xvideos-tag", "https://www.xvideos.com/tags/indonesia-colmek"],
  ["xvideos-search", "https://www.xvideos.com/?k=indonesia+colmek"],
  ["tiava", "https://www.tiava.com/search/a/indo%20colmek"],
  ["tubegalore", "https://www.tubegalore.com/search/a/indonesia%20colmek"],
  ["sedia-post", "https://sediabokep.tokyo/tonton/6212-2/kompilasi-video-skandal-jove-amoy-cindo-ngewe-durasi-panjang"],
  ["king-play", "https://kingbokep.land/play-stream/sv1/in/xB1cKAwVMBwtcVF1RHF9cV1ZIWVgJU1hVTF9fVw9LUlVHAFoYWVMKCVhQHEBUXFRWXUhAQBBYS0NMUVpa"]
];
for (const [n, u] of urls) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    const t = await r.text();
    console.log(`${n.padEnd(15)} ${r.status} ${String(t.length).padStart(7)}b XFO=${r.headers.get("x-frame-options") || "-"}`);
    const m = [...new Set([...t.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((x) => x[0]))].filter((x) => !/iklan|ads|promo|banner/i.test(x));
    if (m.length) console.log(`   MEDIA ${m.slice(0, 3).join("\n         ")}`);
    const ifr = [...new Set([...t.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((x) => x[1]))];
    if (ifr.length) console.log(`   IF ${ifr.slice(0, 2).join(" | ")}`);
  } catch (e) { console.log(`${n.padEnd(15)} ERR ${e.message}`); }
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => (await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) })).text();
const posts = [
  "https://dicrotin.com/update-colmek-barbar-miss-laras-bahenol-semok.html",
  "https://dicrotin.com/miss-sila-genz-puting-bulet-pap-omek-buat-pacar.html",
  "https://dicrotin.com/selly-kusuma-hijab-kesepian-colmek-enak-di-wc.html",
  "https://dicrotin.com/masturbasi-miss-preety-blasteran-kurus-tocil.html",
  "https://dicrotin.com/testimoni-colmek-dari-mamah-muda-tobrut-seksi.html",
  "https://dicrotin.com/video-exclusive-mika-gee-cosplayer-wibu-toge.html"
];
for (const p of posts) {
  try {
    const html = await get(p);
    const ifr = [...new Set([...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))][0] || "-";
    let media = "-";
    if (ifr !== "-") {
      const f = await get(ifr);
      const m = [...new Set([...f.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((x) => x[0]))].filter((x) => !/iklan|ads|promo/i.test(x));
      media = m[0] || "-";
    }
    const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
    console.log(`${p.split("/").pop().slice(0, 45).padEnd(46)} ${ifr.includes("/e/") ? "E" : ifr.includes("/v/") ? "V" : "?"} ${media.slice(0, 90)}`);
  } catch (e) { console.log(`${p} ERR ${e.message}`); }
}

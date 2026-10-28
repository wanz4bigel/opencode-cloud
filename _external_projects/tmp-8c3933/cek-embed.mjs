const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const urls = [
  ["luluvido", "https://luluvido.com/e/2w8140jntphy"],
  ["indopanas-v", "https://indopanas.cyou/v/update-colmek-barbar-miss-laras-bahenol-semok"],
  ["indopanas-e", "https://indopanas.cyou/e/Selly%20Kusuma%20Hijab%20Kesepian%20Colmek%20Enak%20Di%20Wc"],
  ["dicrotin", "https://dicrotin.com/update-colmek-barbar-miss-laras-bahenol-semok.html"],
  ["sedia", "https://sediabokep.tokyo/tonton/6212-2/kompilasi-video-skandal-jove-amoy-cindo-ngewe-duras"]
];
for (const [name, url] of urls) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, referer: "https://dicrotin.com/" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    const html = await r.text();
    console.log(`\n== ${name} ${r.status} ${r.url} ${html.length}b`);
    console.log(`   XFO=${r.headers.get("x-frame-options") || "-"} CSP=${(r.headers.get("content-security-policy") || "-").slice(0, 80)} CT=${r.headers.get("content-type")}`);
    const ifr = [...new Set([...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
    const mp4 = [...new Set([...html.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((m) => m[0]))];
    const vids = [...new Set([...html.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((m) => m[0]))];
    if (ifr.length) console.log(`   IF ${ifr.slice(0, 4).join("\n      ")}`);
    if (mp4.length) console.log(`   MP4 ${vids.slice(0, 3).join("\n       ")}`);
    if (!ifr.length && !mp4.length) {
      console.log(`   <video>: ${/player|jwplayer|videojs|hls|stream/i.test(html) ? "ada kata player/hls" : "tidak ada"}`);
      console.log(`   snippet: ${html.replace(/\s+/g, " ").slice(0, 200)}`);
    }
  } catch (e) { console.log(`== ${name} ERR ${e.message}`); }
}

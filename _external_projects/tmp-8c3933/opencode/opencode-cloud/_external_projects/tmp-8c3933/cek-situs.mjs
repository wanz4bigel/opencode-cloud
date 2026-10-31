const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const pages = [
  ["bokep31", "https://bokep31.work/indonesia/bokep-indo-colmek-nakal-sendiri-sampai-basah/"],
  ["kingbokep", "https://kingbokep.vu/koleksi/indo-colmek"],
  ["dicrotin", "https://dicrotin.com/category/bokep-indonesia/bokep-colmek"],
  ["indo18", "https://www.indo18.com/category/masturbasi/"],
  ["colmekan", "https://colmekan.com/"],
  ["ksatria", "https://ksatriabokep.com/"],
  ["kingland", "https://kingbokep.land/"],
  ["sedia", "https://sediabokep.tokyo/"],
  ["abgindo", "https://abgindoterbaru.com/"],
  ["ruang", "https://ruangbokep.co/"],
  ["bandar", "https://bandarbokep.boats/"],
  ["pasar", "https://pasarbokep.co/"],
  ["filmele", "https://www.filmeleporn.com/watch/80110263.html"]
];
const out = [];
await Promise.allSettled(pages.map(async ([name, url]) => {
  try {
    const r = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(25000)
    });
    const html = await r.text();
    const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 6);
    const mp4 = [...new Set([...html.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((m) => m[0]))].slice(0, 4);
    out.push({
      name, status: r.status, final: r.url, bytes: html.length,
      xfo: r.headers.get("x-frame-options") || "",
      csp: r.headers.get("content-security-policy") || "",
      iframes, mp4
    });
  } catch (e) {
    out.push({ name, error: String(e.message || e) });
  }
}));
out.sort((a, b) => a.name.localeCompare(b.name));
for (const o of out) {
  if (o.error) { console.log(`${o.name.padEnd(10)} ERROR ${o.error}`); continue; }
  console.log(`${o.name.padEnd(10)} ${o.status} ${String(o.bytes).padStart(7)}b XFO=${o.xfo || "-"} CSP=${(o.csp || "-").slice(0, 60)}`);
  if (o.iframes.length) console.log(`   iframe: ${o.iframes.join(" | ").slice(0, 200)}`);
  if (o.mp4.length) console.log(`   mp4: ${o.mp4.join(" | ").slice(0, 200)}`);
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  return { status: r.status, body: await r.text(), url: r.url, xfo: r.headers.get("x-frame-options") || "", csp: r.headers.get("content-security-policy") || "" };
};
const w = await get("https://kingbokep.vu/watch/koleksi-live-tante-presti-bersama-temannya-88510346-3");
console.log("watch", w.status, w.body.length);
const i = w.body.indexOf("88510346");
console.log(w.body.slice(Math.max(0, i - 900), i + 700).replace(/\s+/g, " "));
console.log("\n--- script tags ---");
console.log([...w.body.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)].map((m) => m[1]).slice(0, 10).join("\n"));
for (const u of ["https://play1.bigdood.top/embed/88510346", "https://play1.bigdood.top/embed?code=88510346"]) {
  const r = await get(u);
  console.log(`\n${u} -> ${r.status} len=${r.body.length} XFO=${r.xfo || "-"} CSP=${(r.csp || "-").slice(0, 40)}`);
  console.log(r.body.replace(/\s+/g, " ").slice(0, 240));
}

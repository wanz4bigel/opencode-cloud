const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return { status: r.status, url: r.url, xfo: r.headers.get("x-frame-options") || "", csp: r.headers.get("content-security-policy") || "", body: await r.text() };
  } catch (e) { return { status: 0, body: "", err: e.message }; }
};
for (const u of ["https://dood.top/", "https://play1.bigdood.top/embed", "https://play1.bigdood.top/"]) {
  const r = await get(u);
  console.log(`${u} -> ${r.status} ${r.url || ""} XFO=${r.xfo || "-"} CSP=${(r.csp || "-").slice(0, 60)} len=${r.body.length}`);
  console.log("   " + r.body.replace(/\s+/g, " ").slice(0, 200));
}
// kingbokep video page
const home = await get("https://kingbokep.vu/");
const links = [...new Set([...home.body.matchAll(/href="(https:\/\/kingbokep\.vu\/(?:view|koleksi)\/[^"]+)"/g)].map((m) => m[1]))];
console.log("\nkingbokep links:", links.length, links.slice(0, 3));
if (links[0]) {
  const p = await get(links[0]);
  console.log("post status", p.status, p.body.length);
  for (const kata of ["bigdood", "dood", "iframe", "data-id", "file_code", "embed"]) {
    const i = p.body.indexOf(kata);
    if (i >= 0) console.log(`  [${kata}]`, p.body.slice(Math.max(0, i - 160), i + 200).replace(/\s+/g, " "));
  }
}

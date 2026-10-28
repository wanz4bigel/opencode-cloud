const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  return { status: r.status, body: await r.text(), url: r.url };
};
const home = await get("https://kingbokep.vu/");
const all = [...new Set([...home.body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))].filter((u) => /view|nonton|koleksi|video/.test(u));
console.log("links:", all.length);
console.log(all.slice(0, 12).join("\n"));
const target = all.find((u) => /\/view\//.test(u)) || all[0];
if (target) {
  const url = target.startsWith("http") ? target : "https://kingbokep.vu" + target;
  const p = await get(url);
  console.log("\npost:", url, p.status, p.body.length);
  for (const kata of ["bigdood", "data-id", "data-file", "file_code", "iframe", "player", "embed"]) {
    let idx = 0, n = 0;
    while ((idx = p.body.toLowerCase().indexOf(kata, idx)) >= 0 && n < 2) {
      console.log(`  [${kata}]`, p.body.slice(Math.max(0, idx - 180), idx + 220).replace(/\s+/g, " "));
      idx += kata.length; n += 1;
    }
  }
}

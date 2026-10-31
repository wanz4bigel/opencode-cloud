const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
  return r.ok ? await r.text() : "";
};
const urls = ["https://kingbokep.vu/", "https://sediabokep.tokyo/", "https://ksatriabokep.com/", "https://abgindoterbaru.com/"];
for (const u of urls) {
  const h = await get(u);
  console.log(`\n===== ${u} (${h.length})`);
  const re = /(dood|doostream)/gi;
  let m, n = 0;
  while ((m = re.exec(h)) && n < 4) {
    console.log("--- ctx ---");
    console.log(h.slice(Math.max(0, m.index - 350), m.index + 350).replace(/\s+/g, " ").slice(0, 700));
    n += 1;
  }
  const emb = [...new Set([...h.matchAll(/https?:\/\/[^"'\s<>]*(?:dood|ds2play|playmogo)[^"'\s<>]*/gi)].map((x) => x[0]))];
  console.log("URL:", emb.slice(0, 8));
}

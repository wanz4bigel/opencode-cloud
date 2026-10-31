const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
const homes = [
  "https://bokep31.work/",
  "https://dicrotin.com/",
  "https://kingbokep.land/",
  "https://sediabokep.tokyo/",
  "https://bandarbokep.boats/",
  "https://www.indo18.com/",
  "https://colmekan.com/",
  "https://abgindoterbaru.com/",
  "https://ruangbokep.co/",
  "https://pasarbokep.co/",
  "https://ksatriabokep.com/",
  "https://kingbokep.vu/"
];
const POLA = /(dood[^"'\s<>]*|doostream[^"'\s<>]*|playmogo[^"'\s<>]*|ds2play[^"'\s<>]*)/gi;
for (const home of homes) {
  const html = await get(home);
  const hits = [...new Set([...html.matchAll(POLA)].map((m) => m[0]))].slice(0, 6);
  const iframes = [...new Set([...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))].slice(0, 4);
  console.log(`\n== ${home} ${html.length}b dood=${hits.length}`);
  if (hits.length) console.log("   dood: " + hits.join(" | "));
  if (iframes.length) console.log("   iframe: " + iframes.join(" | ").slice(0, 180));
}

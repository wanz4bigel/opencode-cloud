const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
  return r.ok ? await r.text() : "";
};
const yp = await get("https://www.youporn.com/search/?query=indonesian+colmek");
const i = yp.indexOf("watch/");
console.log("YOUPORN len", yp.length, "idx", i);
console.log(yp.slice(Math.max(0, i - 800), i + 900).replace(/\n\s*\n/g, "\n"));
const nv = await get("https://www.nuvid.com/search/indonesian%20colmek");
const j = nv.indexOf("/video");
console.log("\nNVIDIA len", nv.length, "idx", j);
console.log(nv.slice(Math.max(0, j - 500), j + 800).replace(/\n\s*\n/g, "\n"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    return [r.status, r.ok ? await r.text() : ""];
  } catch (e) { return [0, ""]; }
};
const urls = [
  "https://www.nuvid.com/tag/indonesian",
  "https://www.nuvid.com/tags/indonesian",
  "https://www.nuvid.com/category/indonesian",
  "https://www.nuvid.com/indonesian-porn",
  "https://www.nuvid.com/search/videos/indonesian%20colmek",
  "https://www.youporn.com/category/indonesian/",
  "https://www.youporn.com/indonesian/",
  "https://www.youporn.com/search/?query=indonesian+colmek&page=5",
  "https://www.youporn.com/search/?query=indonesian+colmek&page=10",
  "https://www.youporn.com/search/?query=colmek+indo&page=5"
];
for (const u of urls) {
  const [s, h] = await get(u);
  const arts = (h.match(/<article class="video-box/gi) || []).length;
  const nvv = (h.match(/class="box-tumb related_vid/gi) || []).length;
  const total = (h.match(/([\d.,]+)\s*(?:Videos|videos|results)/) || [])[1] || "?";
  console.log(`${String(s).padEnd(4)} art=${String(arts).padStart(3)} nv=${String(nvv).padStart(3)} total=${String(total).padStart(7)}  ${u}`);
}

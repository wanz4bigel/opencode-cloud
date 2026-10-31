const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25000) });
  return r.ok ? await r.text() : "";
};
const yp = await get("https://www.youporn.com/search/?query=indonesian+colmek");
const arts = [...yp.matchAll(/<article class="video-box[\s\S]*?<\/article>/gi)].map((m) => m[0]);
console.log("youporn articles:", arts.length);
const a0 = arts[0] || "";
console.log("duration match:", (a0.match(/duration[^>]*>([^<]+)</i) || [])[1] || (a0.match(/video-duration[^>]*>([^<]+)/i) || [])[1] || "-");
console.log("aria:", (a0.match(/aria-label="([^"]*)"/) || [])[1]);
console.log("img:", (a0.match(/data-src="([^"]+)"/) || [])[1]);
console.log("links:", [...new Set([...a0.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))].slice(0, 4));
console.log("--- chunk with duration ---");
const di = a0.search(/duration/i);
console.log(a0.slice(Math.max(0, di - 200), di + 300).replace(/\n\s*\n/g, "\n"));

const nv = await get("https://www.nuvid.com/search/indonesian%20colmek");
const vids = [...nv.matchAll(/href="(\/video\/[^"]+)"/g)].map((m) => m[1]);
console.log("\nnuvid /video links:", [...new Set(vids)].slice(0, 5));
const k = nv.search(/class="[^"]*video[^"]*"/i);
console.log(nv.slice(Math.max(0, k - 400), k + 1200).replace(/\n\s*\n/g, "\n").slice(0, 1800));

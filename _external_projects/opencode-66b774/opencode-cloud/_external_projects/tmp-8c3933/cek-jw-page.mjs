const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://jwplyr.com/e/4mqofgukeo5r", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
const t = await r.text();
console.log("len", t.length);
console.log(t.slice(0, 2600).replace(/\s+/g, " "));
console.log("\n--- durasi/OG ---");
for (const kata of ["og:image", "og:title", "duration", "poster", "video", "mp4", "m3u8"]) {
  const i = t.indexOf(kata);
  if (i >= 0) console.log(`[${kata}]`, t.slice(Math.max(0, i - 120), i + 220).replace(/\s+/g, " "));
}

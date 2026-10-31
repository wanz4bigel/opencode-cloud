const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const url = process.argv[2];
const r = await fetch(url, { headers: { "user-agent": UA, referer: "https://jwplyr.com/" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
const t = await r.text();
console.log(r.status, t.length, "XFO:", r.headers.get("x-frame-options") || "-");
for (const kata of ["<video", "duration", "m3u8", ".mp4", "sources", "jwplayer", "file:"]) {
  const i = t.indexOf(kata);
  if (i >= 0) console.log(`\n[${kata}] ` + t.slice(Math.max(0, i - 200), i + 300).replace(/\s+/g, " "));
}
console.log("\nHEAD:\n" + t.replace(/\s+/g, " ").slice(0, 400));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const iframe = process.argv[2];
const r = await fetch(iframe, { headers: { "user-agent": UA, referer: "https://jwplyr.com/" }, signal: AbortSignal.timeout(20000) });
const t = await r.text();
const stream = (t.match(/https:\/\/jwplyr\.com\/stream\.php[^"']+/) || [])[0];
console.log("stream url:", stream);
if (stream) {
  const s = await fetch(stream.replace(/&amp;/g, "&"), { headers: { "user-agent": UA, referer: iframe }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  const st = await s.text();
  console.log("stream status", s.status, s.headers.get("content-type"), st.length);
  console.log(st.slice(0, 800));
  const m3u8 = [...new Set([...st.matchAll(/https?:\/\/[^"'\s\\]+?\.m3u8[^"'\s\\]*/gi)].map((m) => m[0]))];
  const mp4 = [...new Set([...st.matchAll(/https?:\/\/[^"'\s\\]+?\.mp4[^"'\s\\]*/gi)].map((m) => m[0]))];
  console.log("m3u8:", m3u8.slice(0, 2), "mp4:", mp4.slice(0, 2));
}

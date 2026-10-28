const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://www.xvideos.com/tags/indonesia-colmek", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
const html = await r.text();
const vids = [...new Set([...html.matchAll(/href="(\/video\.([a-z0-9]+)\/([^"]+))"/gi)].map((m) => ({ id: m[2], path: m[1], title: m[3] })))];
console.log("videos:", vids.length);
for (const v of vids.slice(0, 5)) console.log(" ", v.id, decodeURIComponent(v.title).replace(/_/g, " ").slice(0, 60));
// also titles in <p class="title">
const titles = [...html.matchAll(/<p class="title"><a[^>]+title="([^"]+)"/gi)].map((m) => m[1]);
console.log("titles:", titles.slice(0, 4));
if (vids[0]) {
  for (const emb of [`https://www.xvideos.com/embedframe/${vids[0].id}`, `https://www.xvideos.com/embedframe/${vids[0].id}/`]) {
    const e = await fetch(emb, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    const body = await e.text();
    console.log(`\nembed ${e.status} ${body.length}b XFO=${e.headers.get("x-frame-options") || "-"} CSP=${(e.headers.get("content-security-policy") || "-").slice(0, 60)}`);
    const m = [...new Set([...body.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((x) => x[0]))].filter((x) => !/preview|thumb/i.test(x));
    console.log("  media:", m.slice(0, 2));
  }
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const urls = [
  "https://jwplyr.com/e/m98ovzdqup5a",
  "https://jwplyr.com/e/6nm4cy61vanf",
  "https://jwplyr.com/e/4mqofgukeo5r"
];
for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    const mp4 = [...new Set([...t.matchAll(/https?:\/\/[^"'\s\\]+?\.(?:mp4|m3u8)[^"'\s\\]*/gi)].map((m) => m[0]))].slice(0, 2);
    console.log(`\n${u}\n  ${r.status} ${r.url} len=${t.length} XFO=${r.headers.get("x-frame-options") || "-"} CSP=${(r.headers.get("content-security-policy") || "-").slice(0, 50)}`);
    console.log(`  title: ${(t.match(/<title[^>]*>([^<]*)/i) || [])[1] || "-"}`);
    if (mp4.length) console.log("  media: " + mp4.join(" | ").slice(0, 200));
    console.log("  head: " + t.replace(/\s+/g, " ").slice(0, 150));
  } catch (e) { console.log(`\n${u}\n  ERR ${e.message}`); }
}

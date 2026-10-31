const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return { status: r.status, url: r.url, body: await r.text(), xfo: r.headers.get("x-frame-options") || "", csp: r.headers.get("content-security-policy") || "" };
  } catch (e) { return { status: 0, body: "", err: e.message }; }
};
const t = await get("https://t.me/s/dooodlive");
console.log("telegram", t.status, t.body.length);
const links = [...new Set([...t.body.matchAll(/https?:\/\/(?:dood[^"'\s<>]*|ds2play[^"'\s<>]*)["<]/gi)].map((m) => m[0].slice(0, -1)))];
console.log("dood links:", links.length);
console.log(links.slice(0, 8).join("\n"));
const msgs = [...t.body.matchAll(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
console.log("pesan:", msgs.length);
msgs.slice(0, 6).forEach((m) => console.log("  -", m.slice(0, 100)));
for (const link of links.slice(0, 2)) {
  const e = await get(link.replace("dood.pm", "dood.pm"));
  console.log(`\n${link} -> ${e.status} ${e.url} XFO=${e.xfo || "-"} CSP=${(e.csp || "-").slice(0, 40)}`);
  console.log("  ", e.body.replace(/\s+/g, " ").slice(0, 160));
}

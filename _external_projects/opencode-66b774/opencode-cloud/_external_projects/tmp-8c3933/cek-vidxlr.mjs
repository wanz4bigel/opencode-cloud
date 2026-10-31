const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  return { status: r.status, url: r.url, body: await r.text(), xfo: r.headers.get("x-frame-options") || "" };
};
const r = await get("https://vidxlr.top/");
console.log("status", r.status, r.url, r.body.length, "XFO", r.xfo || "-");
const links = [...new Set([...r.body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))];
console.log("links:", links.length);
console.log(links.slice(0, 25).join("\n"));
const iframes = [...new Set([...r.body.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
console.log("iframes:", iframes.slice(0, 5));
console.log("\nSnippet:\n" + r.body.replace(/\s+/g, " ").slice(0, 800));

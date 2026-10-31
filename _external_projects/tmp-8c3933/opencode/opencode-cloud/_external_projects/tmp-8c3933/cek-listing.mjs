const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (url) => {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(30000) });
  return { status: r.status, html: await r.text(), url: r.url };
};
const { status, html } = await get("https://dicrotin.com/category/bokep-indonesia/bokep-colmek");
console.log("status", status, "len", html.length);
// article cards
const arts = [...html.matchAll(/<article[\s\S]*?<\/article>/gi)].map((m) => m[0]);
console.log("articles:", arts.length);
console.log("---- contoh 1 ----");
console.log((arts[0] || html).replace(/\s+/g, " ").slice(0, 1400));
// pagination
const pag = [...new Set([...html.matchAll(/href=["']([^"']*page\/\d+[^"']*)["']/gi)].map((m) => m[1]))];
console.log("---- pagination ----");
console.log(pag.slice(0, 12).join("\n"));
// post count
const n = html.match(/(\d+)\s*(?:post|video|artikel)/i);
console.log("count hint:", n && n[0]);

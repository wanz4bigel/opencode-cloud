const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://dicrotin.com/category/bokep-indonesia/bokep-colmek", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30000) });
const html = await r.text();
const links = [...html.matchAll(/href=["'](https:\/\/dicrotin\.com\/[^"']+\.html)["']/gi)].map((m) => m[1]);
console.log("post links:", links.length);
console.log([...new Set(links)].slice(0, 6).join("\n"));
const i = html.indexOf(links[0] || "zzz");
console.log("\n---- konteks kartu ----\n");
console.log(html.slice(Math.max(0, i - 700), i + 900).replace(/\n\s*\n/g, "\n"));

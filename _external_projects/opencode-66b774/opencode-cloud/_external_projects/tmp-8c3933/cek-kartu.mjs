const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://dicrotin.com/category/bokep-indonesia/bokep-colmek", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30000) });
const html = await r.text();
const i = html.indexOf("entry-title");
console.log("entry-title at", i);
console.log(html.slice(i - 900, i + 1500).replace(/\n\s*\n/g, "\n"));

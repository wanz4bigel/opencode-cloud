const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://www.xvideos.com/tags/indonesia-colmek", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
const html = await r.text();
const i = html.indexOf("/video.okvcpmb5d12");
console.log(html.slice(Math.max(0, i - 700), i + 1000).replace(/\n\s*\n/g, "\n"));

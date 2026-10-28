const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://www.nuvid.com/search/indonesian%20colmek", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
const html = await r.text();
const i = html.indexOf("/video/9303383/");
console.log(html.slice(Math.max(0, i - 900), i + 1200).replace(/\n\s*\n/g, "\n"));

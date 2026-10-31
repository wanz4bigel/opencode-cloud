const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const r = await fetch("https://jwplyr.com/e/4mqofgukeo5r", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
const t = await r.text();
const i = t.indexOf("videq_iframe");
console.log(t.slice(Math.max(0, i - 1500), i + 2500).replace(/\s+/g, " "));

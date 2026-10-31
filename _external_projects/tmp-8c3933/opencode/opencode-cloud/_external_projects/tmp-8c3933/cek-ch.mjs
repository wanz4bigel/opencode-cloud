const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
for (const ch of ["asupancolmek331", "sobatsabun2", "vidoystream", "dooodlive"]) {
  const h = await get(`https://t.me/s/${ch}`);
  const posts = (h.match(/tgme_widget_message_wrap/g) || []).length;
  const dood = [...new Set([...h.matchAll(/(?:vidclr|vidslr|jwplyr|vidxlr)\.[a-z.]+\/(?:e|d)\/([a-z0-9]+)/gi)].map((m) => m[1]))];
  const text = h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const colmek = (text.match(/colmek/gi) || []).length;
  console.log(`${ch.padEnd(16)} len=${String(h.length).padStart(7)} posts=${posts} dood=${dood.length} kataColmek=${colmek} ${h ? "" : "(kosong)"}`);
  if (dood.length) console.log("   contoh:", dood.slice(0, 4).join(", "));
}

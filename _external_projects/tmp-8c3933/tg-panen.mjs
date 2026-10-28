const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};
let url = "https://t.me/s/dooodlive";
const kode = new Set();
const pesan = [];
let before = null;
for (let page = 0; page < 8; page += 1) {
  const html = await get(url + (before ? `?before=${before}` : ""));
  if (!html) break;
  const blocks = [...html.matchAll(/<div class="tgme_widget_message[^"]*" data-post="([^"]+)"[\s\S]*?(?=<div class="tgme_widget_message[^"]*" data-post=|<\/section>)/g)];
  let min = null;
  for (const b of blocks) {
    const id = Number(b[1].split("/").pop());
    if (!min || id < min) min = id;
    const text = (b[0].match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "";
    const clean = text.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    const links = [...b[0].matchAll(/(?:https?:\/\/)?((?:vidclr|vidslr|jwplyr|dood|vidxlr)\.[a-z.]+)\/(?:e|d)\/([a-z0-9]+)/gi)].map((m) => `${m[1]}/${m[2]}`);
    if (links.length) pesan.push({ id, clean, links });
    links.forEach((l) => kode.add(l.split("/")[1]));
  }
  if (!min) break;
  before = min;
  console.log(`halaman ${page + 1}: ${blocks.length} pesan, total link ${kode.size}, judul "${pesan.at(-1)?.clean.slice(0, 40)}"`);
  if (blocks.length === 0) break;
}
const fs=await import("node:fs/promises");
await fs.writeFile("/tmp/kode.json", JSON.stringify([...kode], null, 2));
console.log("\ntotal pesan berlink:", pesan.length, "· kode unik:", kode.size);
pesan.slice(-10).forEach((p) => console.log(p.id, p.clean.slice(0, 70), "→", p.links.slice(0, 2).join(",")));

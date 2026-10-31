import { writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = async (u) => {
  try {
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : "";
  } catch { return ""; }
};

const kode = new Set();
const pesan = [];
let before = null;
for (let page = 0; page < 100; page += 1) {
  const html = await get("https://t.me/s/dooodlive" + (before ? `?before=${before}` : ""));
  if (!html) break;
  const blocks = [...html.matchAll(/<div class="tgme_widget_message[^"]*" data-post="([^"]+)"[\s\S]*?(?=<div class="tgme_widget_message[^"]*" data-post=|<\/section>)/g)];
  let min = null;
  let baru = 0;
  for (const b of blocks) {
    const id = Number(b[1].split("/").pop());
    if (!min || id < min) min = id;
    const text = (b[0].match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "";
    const clean = text.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/\s+/g, " ").trim();
    const links = [...b[0].matchAll(/(?:https?:\/\/)?((?:vidclr|vidslr|jwplyr|dood|vidxlr)\.[a-z.]+)\/(?:e|d)\/([a-z0-9]+)/gi)].map((m) => `${m[1]}/${m[2]}`);
    if (links.length) pesan.push({ id, clean, links });
    for (const l of links) {
      const c = l.split("/")[1];
      if (!kode.has(c)) { kode.add(c); baru += 1; }
    }
  }
  if (!min) break;
  console.log(`hal ${String(page + 1).padStart(2)} id=${before || "-"}..${min} pesan=${blocks.length} baru=${baru} total=${kode.size}`);
  if (min <= 1 || (before !== null && min >= before)) break;
  before = min;
}

await writeFile("/tmp/kode-penuh.json", JSON.stringify([...kode], null, 2));
await writeFile("/tmp/pesan-penuh.json", JSON.stringify(pesan, null, 2));
console.log(`\nselesai: ${pesan.length} pesan berlink · ${kode.size} kode unik`);

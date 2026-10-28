// Uji apakah setiap alamat di katalog masih menjawab: `npm run probe`.
// "Rusak" di situs ini hampir selalu berarti URL host-nya mati, bukan kodenya.
import { listVideos } from "../src/db.js";
import { labelOf } from "../src/hosts.js";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const OK = new Set([200, 206, 301, 302, 303, 307, 308]);

async function cek(rawUrl, { ringan = false } = {}) {
  try {
    const res = await fetch(rawUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(ringan ? 12000 : 15000),
      headers: { "user-agent": UA, ...(ringan ? {} : { range: "bytes=0-999" }), connection: "close" }
    });
    await res.body?.cancel();
    return res.status;
  } catch (err) {
    return `GAGAL-${err.name || err.cause?.code || "jaringan"}`;
  }
}

/** Vimeo & archive.org suka membalas 200 untuk video yang sudah dihapus. */
async function masihAda(provider, rawUrl) {
  if (provider === "vimeo") {
    const id = (rawUrl.match(/vimeo\.com\/(\d{4,})/) || [])[1];
    if (!id) return "";
    const status = await cek(`https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F${id}`, { ringan: true });
    return status === 200 ? "" : `oEmbed Vimeo membalas ${status}`;
  }
  if (provider === "archive") {
    const id = (rawUrl.match(/archive\.org\/(?:details|embed)\/([\w.-]{3,})/) || [])[1];
    if (!id) return "";
    const status = await cek(`https://archive.org/metadata/${encodeURIComponent(id)}`, { ringan: true });
    return status === 200 ? "" : `metadata archive.org membalas ${status}`;
  }
  return "";
}

const { rows } = listVideos({ per: 5000 });
console.log(`Menguji ${rows.length} alamat katalog...\n`);
let mati = 0;
for (const video of rows) {
  const status = await cek(video.url);
  const kenapa = (await masihAda(video.provider, video.url)) || (OK.has(status) ? "" : `HTTP ${status}`);
  if (kenapa) {
    mati += 1;
    console.log(`✗ ${String(status).padEnd(6)} ${labelOf(video.provider).padEnd(15)} ${video.title.slice(0, 40)}\n      ${video.url} — ${kenapa}`);
  } else {
    console.log(`✓ ${String(status).padEnd(6)} ${labelOf(video.provider).padEnd(15)} ${video.title.slice(0, 46)}`);
  }
}
console.log(mati ? `\n${mati} alamat perlu diganti (lewat /admin).` : "\nSemua tautan hidup.");
process.exit(mati ? 1 : 0);

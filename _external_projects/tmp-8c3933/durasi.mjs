const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const kode = process.argv[2];

const get = async (u, extra = {}) => {
  const r = await fetch(u, {
    headers: { "user-agent": UA, referer: "https://jwplyr.com/", ...extra },
    redirect: "follow",
    signal: AbortSignal.timeout(30000)
  });
  return r;
};

const html = await (await get(`https://jwplyr.com/e/${kode}`)).text();
const src = (html.match(/var SRC = '([^']+)'/) || [])[1];
if (!src) throw new Error("SRC tidak ada");
const iframe = new URL(src, "https://jwplyr.com").href;
const iframeHtml = await (await get(iframe)).text();
const stream = (iframeHtml.match(/https:\/\/jwplyr\.com\/stream\.php[^"']+/) || [])[0].replace(/&amp;/g, "&");
const streamHtml = await (await get(stream, { referer: iframe })).text();
const mp4 = (streamHtml.match(/<source src="([^"]+)"/) || [])[1];
if (!mp4) throw new Error("mp4 tidak ada");

const head = await get(mp4, { referer: "https://jwplyr.com/" });
const total = Number(head.headers.get("content-length") || 0);
await head.body?.cancel?.();

function durasiMp4(buf) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const box = (off) => {
    let sz = view.getUint32(off);
    const type = String.fromCharCode(buf[off + 4], buf[off + 5], buf[off + 6], buf[off + 7]);
    let header = 8;
    if (sz === 1) { sz = Number(view.getBigUint64(off + 8)); header = 16; }
    if (sz === 0) sz = buf.length - off;
    return { sz, type, header };
  };
  const mvhd = (off, sz, header) => {
    const p = off + header;
    const v = buf[p];
    if (v === 1) return Number(view.getBigUint64(p + 24)) / view.getUint32(p + 20);
    return view.getUint32(p + 16) / view.getUint32(p + 12);
  };
  for (let off = 0; off + 8 <= buf.length;) {
    const b = box(off);
    if (b.sz < b.header || off + b.sz > buf.length) break;
    if (b.type === "moov") {
      for (let c = off + b.header; c + 8 <= off + b.sz;) {
        const d = box(c);
        if (d.sz < d.header) break;
        if (d.type === "mvhd") return mvhd(c, d.sz, d.header);
        c += d.sz;
      }
    }
    if (b.type === "mvhd") return mvhd(off, b.sz, b.header);
    off += b.sz;
  }
  return 0;
}

let detik = 0;
const r1 = await get(mp4, { referer: "https://jwplyr.com/", range: "bytes=0-2097151" });
detik = durasiMp4(Buffer.from(await r1.arrayBuffer()));
if (!detik && total > 0) {
  const mulai = Math.max(0, total - 3 * 1024 * 1024);
  const r2 = await get(mp4, { referer: "https://jwplyr.com/", range: `bytes=${mulai}-${total - 1}` });
  detik = durasiMp4(Buffer.from(await r2.arrayBuffer()));
}
console.log(JSON.stringify({ kode, detik: Math.round(detik), poster: (html.match(/class="thumbnail" src="([^"]+)"/) || [])[1] || "", judul: (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "" }));

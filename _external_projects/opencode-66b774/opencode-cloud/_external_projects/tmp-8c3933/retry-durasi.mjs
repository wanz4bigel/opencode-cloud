import { readFileSync, writeFileSync } from "node:fs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const semua = JSON.parse(readFileSync("/tmp/dood-pilih.json", "utf8"));
const lama = JSON.parse(readFileSync("/tmp/dood-durasi.json", "utf8"));
const daftar = semua.filter((v) => {
  const h = lama.find((x) => x.code === v.code);
  return !h || !h.detik;
});

const get = async (u, extra = {}) => {
  const r = await fetch(u, {
    headers: { "user-agent": UA, referer: "https://jwplyr.com/", ...extra },
    redirect: "follow",
    signal: AbortSignal.timeout(30000)
  });
  return r;
};

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
  const mvhd = (off, header) => {
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
        if (d.type === "mvhd") return mvhd(c, d.header);
        c += d.sz;
      }
    }
    if (b.type === "mvhd") return mvhd(off, b.header);
    off += b.sz;
  }
  // moov sering ditaruh di ekor file. Cari tanda "moov" lalu baca kotaknya.
  let idx = buf.indexOf("moov");
  while (idx >= 4) {
    const start = idx - 4;
    const sz = view.getUint32(start);
    if (sz >= 8 && start + sz <= buf.length) {
      for (let c = start + 8; c + 8 <= start + sz;) {
        const d = box(c);
        if (d.sz < d.header) break;
        if (d.type === "mvhd") return mvhd(c, d.header);
        c += d.sz;
      }
    }
    idx = buf.indexOf("moov", idx + 4);
  }
  return 0;
}

async function satu(v) {
  for (let coba = 0; coba < 5; coba += 1) {
    try {
      const html = await (await get(`https://jwplyr.com/e/${v.code}`)).text();
      const src = (html.match(/var SRC = '([^']+)'/) || [])[1];
      if (!src) throw new Error("SRC");
      const iframe = new URL(src, "https://jwplyr.com").href;
      const iframeHtml = await (await get(iframe)).text();
      const stream = (iframeHtml.match(/https:\/\/jwplyr\.com\/stream\.php[^"']+/) || [])[0].replace(/&amp;/g, "&");
      const streamHtml = await (await get(stream, { referer: iframe })).text();
      const mp4 = (streamHtml.match(/<source src="([^"]+)"/) || [])[1];
      if (!mp4) throw new Error("mp4");
      const head = await get(mp4, { referer: "https://jwplyr.com/" });
      const total = Number(head.headers.get("content-length") || 0);
      await head.body?.cancel?.();
      const r1 = await get(mp4, { referer: "https://jwplyr.com/", range: "bytes=0-2097151" });
      let detik = durasiMp4(Buffer.from(await r1.arrayBuffer()));
      if (!detik && total > 0) {
        const mulai = Math.max(0, total - 10 * 1024 * 1024);
        const r2 = await get(mp4, { referer: "https://jwplyr.com/", range: `bytes=${mulai}-${total - 1}` });
        detik = durasiMp4(Buffer.from(await r2.arrayBuffer()));
      }
      if (!detik) throw new Error("durasi 0");
      const poster = (html.match(/class="thumbnail" src="([^"]+)"/) || [])[1] || v.poster;
      return { ...v, detik: Math.round(detik), poster };
    } catch (e) {
      if (coba === 1) return { ...v, detik: 0, galat: e.message };
      await new Promise((r) => setTimeout(r, 2500 + coba * 2000));
    }
  }
}

const hasil = [];
let n = 0;
async function pekerja() {
  while (daftar.length) {
    const v = daftar.shift();
    const h = await satu(v);
    hasil.push(h);
    n += 1;
    console.error(`${n} ${h.code} ${h.detik ? `${Math.floor(h.detik / 60)}m${h.detik % 60}s` : "GAGAL " + h.galat}`);
  }
}
await Promise.all(Array.from({ length: 2 }, pekerja));

const gabung = lama.map((v) => {
  const h = hasil.find((x) => x.code === v.code);
  return h && h.detik ? h : v;
});
for (const h of hasil) if (!gabung.some((v) => v.code === h.code)) gabung.push(h);
gabung.sort((a, b) => b.detik - a.detik);
writeFileSync("/tmp/dood-durasi.json", JSON.stringify(gabung, null, 2));
console.log("\nselesai percobaan:", hasil.length, "· total dapat durasi:", gabung.filter((v) => v.detik > 0).length, "dari", gabung.length);
for (const v of gabung) console.log(`${String(Math.round(v.detik / 60)).padStart(3)}m  ${v.detik ? "" : "GAGAL "}${v.code}  ${v.title.slice(0, 65)}`);

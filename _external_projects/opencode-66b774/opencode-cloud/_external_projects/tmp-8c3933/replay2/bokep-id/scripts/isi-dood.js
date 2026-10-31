// Isi katalog tambahan dari DoodStream — sumber ketiga setelah Eporner & XVideos.
//
//   node scripts/isi-dood.js              panen riwayat channel + periksa semua kode
//   node scripts/isi-dood.js --hal 20     batasi 20 halaman Telegram
//   node scripts/isi-dood.js --raw        cetak JSON saja, tidak menulis berkas
//
// Kenapa lewat Telegram? DoodStream tidak punya katalog publik. Channel
// "DOODSTREAM INDO" (t.me/s/dooodlive) menyebar alamat file; alamat itu sekarang
// memakai cermin vidclr.sbs yang cuma mengalihkan ke jwplyr.com. Halaman
// jwplyr.com/e/<kode> adalah pemutarnya, boleh ditanam (tanpa X-Frame-Options),
// dan menyimpan judul + poster asli.
//
// Yang disimpan cuma alamat; videonya tetap diputar dari host aslinya. Durasi
// dibaca dari file (MP4 moov/mvhd atau playlist HLS), bukan dikarang. Video yang
// durasinya tidak terbaca dibuang supaya badge durasi tidak berbohong.
//
// Hasil: data/katalog-dood.json — dibaca otomatis oleh src/db.js saat seed.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const CHANNEL = "dooodlive";
const args = process.argv.slice(2);
const angka = (nama, cadangan) => {
  const i = args.indexOf(`--${nama}`);
  return i >= 0 && Number(args[i + 1]) ? Number(args[i + 1]) : cadangan;
};
const MAKS_HAL = Math.max(1, angka("hal", 80));
const CETAK = args.includes("--raw");
const dirData = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");

/** Kategori dan pola judulnya — sama seperti scripts/isi-xv.js. */
const KATEGORI = [
  ["colmek-hijab", /jilbab|hijab|kerudung|ukhti|mukenah/],
  ["colmek-amoy", /amoy|chindo|cindo|chinese|china|cina/],
  ["colmek-toge", /toge|tobrut|montok|gembrot|chubby|gemuk|bbw|gemoy/],
  ["colmek-toket", /toket|tetek|susu|payudara|big.?tits|big.?boob|pentil/],
  ["colmek-janda", /janda|tante|bunda|mama|mom|milf|\bibu\b|mertua/],
  ["colmek-mahasiswi", /mahasiswi|kuliah|kampus|skripsi/],
  ["colmek-abg", /abg|remaja|teen|tocil|muda|18 ?yo|18 tahun/],
  ["colmek-mandi", /mandi|shower|basah|toilet|wc/],
  ["colmek-dildo", /dildo|vibrator|bantal|guling|botol|timun|terong|colok|stik/],
  ["colmek-live", /live|webcam|vcs|streaming|host|ome/],
  ["colmek-viral", /viral|tiktok|terbaru|update|baru/],
  ["colmek-kamera-hp", /./]
];

// —— Penyaring ————————————————————————————————————————————————
// Normalisasi dulu: garis bawah & strip jadi spasi, alamat/mention dibuang.
// Tanpa ini, judul "Bokep_Indo_Smp_..." bisa lolos dari \bsmp\b.
const normal = (s) =>
  String(s || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:t\.me|telegram|twitter|x\.com)\S*/gi, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/[_\-–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SINYAL_COLMEK = /(?:\bcolmek(?:an)?\b|\bmasturbat\w*\b|\bmastrubat\w*\b|\bdildo\b|\bvibrator\b|\bngocok\b|\bonani\b|\bcoli\b|\bmain sendiri\b|\bsolo\b)/i;
// Harus ada tanda Indonesia. Kata slang ("sampe", "pake", "gemoy") ikut dihitung,
// karena banyak judul lokal tidak menulis "indo" sama sekali.
const SINYAL_INDO = /(indo|indonesia|bokep|cewek|cewe|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|jilbab|hijab|sampe|smpe|sampai|banget|bgt|pake|pakai|sange|gemoy|klimaks|muncrat|banjir)/i;
const BUKAN_INDO = /(china|douyin|jepang|jepun|korea|thai|arab|india|malay|pinay|filipina|vietnam|russia|ebony|latina|barat|bule|japanese|indian|turkish)/i;
const BUKAN_COLMEK = /(ngentot|entot|sepong|blowjob|creampie|threesome|tresome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|affair|\banal\b|hentai|ngewe|ngemut|hisap|kontol|sucks|ngocokin|colmekin|genjot|jilat|stepson|stepmom|stepsis|stepbro|tiri|keponakan|ponakan|sepupu|saudara|sedarah|kandung|prank|ojol|maid|mutual)/i;
// Tidak boleh ada petunjuk anak sekolah / di bawah umur. \*{2,} menangkap judul
// yang menyensor kata terlarang dengan bintang.
const DILARANG = /(sekolah|sekolahan|siswi|pelajar|seragam|\bkelas\b|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|bocah|anak|dede|adik|kakak|tiri|underage|preteen|loli|\*{2,})/i;

// Judul untuk tampilan: buang ekstensi, alamat, mention, dan iklan di ujung.
const rapikan = (s) =>
  String(s || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:t\.me|telegram|twitter|x\.com)\S*/gi, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/_+/g, " ")
    .replace(/\s*[-–|]\s*(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\S*/gi, " ")
    .replace(/\b(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\.[a-z]{2,}\S*/gi, " ")
    .replace(/\b(?:vidxlr|jwplyr|doodstream|lulustream|liveomek|vidclr|vidslr)\b/gi, " ")
    .replace(/\.(?:mp4|mkv|webm|avi)\b/gi, " ")
    .replace(/\b(?:CEK|JOIN|TELE|TELEGRAM)\b.*$/i, " ")
    .replace(/\b\d{3,4}p\b/gi, " ")
    .replace(/[_\-.]+/g, " ")
    .replace(/[|[\]]+/g, " ")
    .replace(/\s*#+\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–|#.]+|[\s\-–|#.]+$/g, "")
    .trim();

const kunciJudul = (s) => normal(s).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);

/** Kumpulan id video Eporner yang sudah ada, supaya re-upload tidak dobel. */
function idEpornerSudahAda() {
  const set = new Set();
  try {
    const isi = JSON.parse(readFileSync(path.join(dirData, "katalog.json"), "utf8"));
    for (const daftar of Object.values(isi.hasil || {})) {
      for (const v of Array.isArray(daftar) ? daftar : []) {
        const id = (String(v.url || "").match(/video-([^/]+)/) || [])[1];
        if (id) set.add(id.toLowerCase());
      }
    }
  } catch { /* katalog utama belum ada */ }
  return set;
}

// —— HTTP ————————————————————————————————————————————————————
async function ambil(url, extra = {}, timeout = 20000) {
  for (let i = 0; i < 2; i += 1) {
    try {
      const r = await fetch(url, {
        headers: { "user-agent": UA, ...extra },
        redirect: "follow",
        signal: AbortSignal.timeout(timeout)
      });
      if (r.ok) return await r.text();
      if (r.status === 404) return "";
    } catch { /* coba sekali lagi */ }
  }
  return "";
}

const decode = (s) =>
  String(s || "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// —— 1. Panen kode dari channel Telegram ——————————————————————
async function panenKode() {
  const kode = new Set();
  let before = null;
  for (let hal = 1; hal <= MAKS_HAL; hal += 1) {
    const html = await ambil(`https://t.me/s/${CHANNEL}${before ? `?before=${before}` : ""}`);
    if (!html) break;
    const blok = [...html.matchAll(/<div class="tgme_widget_message[^"]*" data-post="([^"]+)"[\s\S]*?(?=<div class="tgme_widget_message[^"]*" data-post=|<\/section>)/g)];
    let min = null;
    for (const b of blok) {
      const id = Number(b[1].split("/").pop());
      if (!min || id < min) min = id;
      for (const m of b[0].matchAll(/(?:https?:\/\/)?(?:vidclr|vidslr|jwplyr|dood|vidxlr)\.[a-z.]+\/(?:e|d)\/([a-z0-9]{6,})/gi)) {
        kode.add(m[1]);
      }
    }
    if (!min || min <= 1 || (before !== null && min >= before)) break;
    before = min;
    if (hal % 10 === 0) console.error(`  telegram ${hal} halaman · ${kode.size} kode`);
  }
  return [...kode];
}

// —— 2. Periksa halaman pemutar ——————————————————————————————
async function periksaKode(daftar) {
  const sisa = [...daftar];
  const hidup = [];
  let n = 0;
  async function pekerja() {
    while (sisa.length) {
      const c = sisa.shift();
      const html = await ambil(`https://jwplyr.com/e/${c}`);
      if (html) {
        const judul = decode((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "");
        const poster = (html.match(/class="thumbnail" src="([^"]+)"/) || [])[1] || "";
        if (judul && poster && !/^404|not found|page not found/i.test(judul)) hidup.push({ code: c, title: judul, poster });
      }
      n += 1;
      if (n % 200 === 0) console.error(`  periksa ${n}/${daftar.length} · hidup ${hidup.length}`);
    }
  }
  await Promise.all(Array.from({ length: 8 }, pekerja));
  return hidup;
}

// —— 3. Durasi dari file aslinya ——————————————————————————————
function durasiMp4(buf) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const kotak = (off) => {
    let sz = view.getUint32(off);
    const type = String.fromCharCode(buf[off + 4], buf[off + 5], buf[off + 6], buf[off + 7]);
    let header = 8;
    if (sz === 1) { sz = Number(view.getBigUint64(off + 8)); header = 16; }
    if (sz === 0) sz = buf.length - off;
    return { sz, type, header };
  };
  const hitung = (off, header) => {
    const p = off + header;
    if (buf[p] === 1) return Number(view.getBigUint64(p + 24)) / view.getUint32(p + 20);
    return view.getUint32(p + 16) / view.getUint32(p + 12);
  };
  const cariMvhd = (mulai, akhir) => {
    for (let c = mulai; c + 8 <= akhir;) {
      const d = kotak(c);
      if (d.sz < d.header) break;
      if (d.type === "mvhd") return hitung(c, d.header);
      c += d.sz;
    }
    return 0;
  };

  // Coba dari awal file (moov biasanya di depan).
  for (let off = 0; off + 8 <= buf.length;) {
    const b = kotak(off);
    if (b.sz < b.header || off + b.sz > buf.length) break;
    if (b.type === "moov") return cariMvhd(off + b.header, off + b.sz);
    if (b.type === "mvhd") return hitung(off, b.header);
    off += b.sz;
  }
  // Banyak file menaruh moov di ekor; cari tanda "moov" lalu baca kotaknya.
  let idx = buf.indexOf("moov");
  while (idx >= 4) {
    const start = idx - 4;
    const sz = view.getUint32(start);
    if (sz >= 8 && start + sz <= buf.length) {
      const d = cariMvhd(start + 8, start + sz);
      if (d) return d;
    }
    idx = buf.indexOf("moov", idx + 4);
  }
  return 0;
}

async function durasiHls(url) {
  let teks = await ambil(url, { referer: "https://jwplyr.com/" });
  if (!teks) return 0;
  if (/#EXT-X-STREAM-INF/i.test(teks)) {
    const baris = teks.split("\n").map((s) => s.trim());
    let pilih = "";
    let bandwidth = -1;
    for (let i = 0; i < baris.length; i += 1) {
      if (!baris[i].startsWith("#EXT-X-STREAM-INF")) continue;
      const bw = Number((baris[i].match(/BANDWIDTH=(\d+)/i) || [])[1] || 0);
      const next = baris.slice(i + 1).find((l) => l && !l.startsWith("#"));
      if (next && bw >= bandwidth) { bandwidth = bw; pilih = next; }
    }
    if (pilih) teks = await ambil(new URL(pilih, url).href, { referer: "https://jwplyr.com/" });
  }
  let total = 0;
  for (const m of teks.matchAll(/#EXTINF:([0-9.]+)/g)) total += Number(m[1]);
  return total;
}

async function durasiSatu(code) {
  for (let coba = 0; coba < 3; coba += 1) {
    try {
      const html = await ambil(`https://jwplyr.com/e/${code}`);
      const src = (html.match(/var SRC = '([^']+)'/) || [])[1];
      if (!src) throw new Error("alamat pemutar tidak ada");
      const iframe = new URL(src, "https://jwplyr.com").href;
      const iframeHtml = await ambil(iframe);
      const stream = ((iframeHtml.match(/https:\/\/jwplyr\.com\/stream\.php[^"']+/) || [])[0] || "").replace(/&amp;/g, "&");
      if (!stream) throw new Error("stream.php tidak ada");
      const streamHtml = await ambil(stream, { referer: iframe });
      const media = (streamHtml.match(/<source src="([^"]+)"/) || [])[1];
      if (!media) throw new Error("sumber video tidak ada");

      if (/\.m3u8(\?|#|$)/i.test(media)) {
        const detik = await durasiHls(media);
        if (detik) return Math.round(detik);
        throw new Error("playlist kosong");
      }

      const kepala = await fetch(media, {
        headers: { "user-agent": UA, referer: "https://jwplyr.com/", range: "bytes=0-0" },
        signal: AbortSignal.timeout(20000)
      });
      const total = Number((kepala.headers.get("content-range") || "").split("/")[1] || kepala.headers.get("content-length") || 0);
      await kepala.body?.cancel?.();

      const awal = await fetch(media, {
        headers: { "user-agent": UA, referer: "https://jwplyr.com/", range: "bytes=0-2097151" },
        signal: AbortSignal.timeout(30000)
      });
      let detik = durasiMp4(Buffer.from(await awal.arrayBuffer()));
      if (!detik && total > 0) {
        const mulai = Math.max(0, total - 10 * 1024 * 1024);
        const ekor = await fetch(media, {
          headers: { "user-agent": UA, referer: "https://jwplyr.com/", range: `bytes=${mulai}-${total - 1}` },
          signal: AbortSignal.timeout(30000)
        });
        detik = durasiMp4(Buffer.from(await ekor.arrayBuffer()));
      }
      if (detik) return Math.round(detik);
      throw new Error("durasi tidak terbaca");
    } catch (e) {
      if (coba === 2) return 0;
      await new Promise((r) => setTimeout(r, 1500 + coba * 1500));
    }
  }
  return 0;
}

// —— 4. Jalankan ——————————————————————————————————————————————
const semuaKode = await panenKode();
console.error(`kode unik: ${semuaKode.length}`);
if (!semuaKode.length) {
  console.error("Tidak ada kode yang dipanen. Channel mungkin berubah alamat.");
  process.exit(1);
}

const hidup = await periksaKode(semuaKode);
console.error(`halaman hidup: ${hidup.length}`);

const eporner = idEpornerSudahAda();
const sudah = new Set();
const kandidat = [];
for (const v of hidup) {
  const t = normal(v.title);
  const k = kunciJudul(t);
  if (!k || sudah.has(k)) continue;
  if (!SINYAL_COLMEK.test(t) || !SINYAL_INDO.test(t)) continue;
  if (BUKAN_INDO.test(t) || BUKAN_COLMEK.test(t) || DILARANG.test(t)) continue;
  // Re-upload dari Eporner: judulnya menyebut id video yang sudah ada.
  if ([...t.matchAll(/[a-z0-9]{8,14}/gi)].some((m) => eporner.has(m[0].toLowerCase()))) continue;
  sudah.add(k);
  kandidat.push({ ...v, judul: rapikan(v.title) || rapikan(t) });
}
console.error(`lolos penyaring: ${kandidat.length}`);

// Durasi diambil 3 sekaligus; yang gagal/tidak terbaca dibuang.
const sisa = [...kandidat];
const siap = [];
let n = 0;
async function pekerjaDurasi() {
  while (sisa.length) {
    const v = sisa.shift();
    const detik = await durasiSatu(v.code);
    n += 1;
    if (detik >= 60) siap.push({ ...v, detik });
    else console.error(`  buang ${v.code} (${detik ? `${detik} dtk` : "durasi gagal"})`);
    if (n % 5 === 0) console.error(`  durasi ${n}/${kandidat.length}`);
  }
}
await Promise.all(Array.from({ length: 3 }, pekerjaDurasi));

const hasil = {};
for (const [slug] of KATEGORI) hasil[slug] = [];
for (const v of siap.sort((a, b) => b.detik - a.detik)) {
  const judul = v.judul.toLowerCase();
  for (const [slug, pola] of KATEGORI) {
    if (!pola.test(judul)) continue;
    hasil[slug].push({
      id: v.code,
      title: v.judul,
      url: `https://jwplyr.com/e/${v.code}`,
      detik: v.detik,
      tag: "colmek,indonesia",
      poster: v.poster,
      rasio: 0,
      views: 0,
      added: ""
    });
    break;
  }
}

const isi = {
  dibuat: new Date().toISOString(),
  sumber: "jwplyr",
  catatan: "Panen dari channel Telegram publik t.me/s/dooodlive; diputar dari player jwplyr.com. Durasi dibaca dari file aslinya.",
  hasil
};

if (CETAK) {
  process.stdout.write(JSON.stringify(isi, null, 2));
} else {
  mkdirSync(dirData, { recursive: true });
  writeFileSync(path.join(dirData, "katalog-dood.json"), JSON.stringify(isi, null, 2));
  for (const [slug] of KATEGORI) {
    const isiKategori = hasil[slug];
    console.log(`${slug.padEnd(20)} ${String(isiKategori.length).padStart(3)}  ${isiKategori.slice(0, 1).map((v) => `${Math.round(v.detik / 60)}m ${v.title.slice(0, 34)}`).join("")}`);
  }
  console.log(`\nDoodStream: ${siap.length} video · ${Math.round(siap.reduce((a, v) => a + v.detik, 0) / 60)} menit`);
  console.log("Lanjut: npm run reset — katalog.json + katalog-xv.json + katalog-dood.json dibaca otomatis oleh seed.");
}

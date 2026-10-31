// Isi katalog dengan video colmek SUNGGUHAN dari API publik Eporner:
//
//   node scripts/isi.js                 ambil sebanyak mungkin (12 kategori × 100)
//   node scripts/isi.js --per 40        batasi jumlah per kategori
//   node scripts/isi.js --short 30      durasi minimum detik
//   node scripts/isi.js --kategori colmek-hijab
//   node scripts/isi.js --raw           cetak JSON saja, tidak menulis berkas
//
// Hasilnya ditulis ke data/katalog.json dan dibaca src/db.js waktu mengisi katalog.
//
// Kenapa Eporner? Satu-satunya host dewasa yang kami temukan yang (a) tidak di balik
// Cloudflare, (b) membolehkan iframe, dan (c) punya API yang memberi judul, durasi,
// tag, dan gambar aslinya. Jadi kartu tidak pernah berbohong.
//
// Halaman API: https://www.eporner.com/api/ (v2, tanpa kunci untuk pencarian).

const API = "https://www.eporner.com/api/v2/video/search/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/**
 * Semua kueri mengandung "colmek"/dildo. Diambil banyak halaman per kueri, lalu
 * digabung, karena satu kueri saja mentok di beberapa ratus video.
 */
const KUERI = [
  "colmek",
  "colmek_indo",
  "colmek_indonesian",
  "indo_colmek",
  "colmek_abg",
  "abg_colmek",
  "colmek_janda",
  "janda_colmek",
  "colmek_tante",
  "tante_colmek",
  "colmek_mahasiswi",
  "mahasiswi_colmek",
  "colmek_kuliah",
  "colmek_hijab",
  "hijab_colmek",
  "colmek_jilbab",
  "jilbab_colmek",
  "colmek_toge",
  "toge_colmek",
  "colmek_toket",
  "toket_colmek",
  "colmek_amoy",
  "amoy_colmek",
  "colmek_chindo",
  "chindo_colmek",
  "colmek_mandi",
  "mandi_colmek",
  "colmek_kamar_mandi",
  "colmek_dildo",
  "dildo_indonesian",
  "colmek_vibrator",
  "colmek_bantal",
  "colmek_live",
  "live_colmek",
  "colmek_webcam",
  "colmek_vcs",
  "colmek_viral",
  "viral_colmek",
  "colmek_terbaru",
  "colmek_hp",
  "colmek_amateur"
];

/**
 * Kategori dan pola judulnya. Video dimasukkan ke kategori pertama yang cocok
 * dan masih punya kuota; sisanya masuk "Colmek Kamera HP" (kategori umum).
 */
const KATEGORI = [
  ["colmek-hijab", /jilbab|hijab|kerudung|ukhti/],
  ["colmek-amoy", /amoy|chindo|cindo|chinese|china|cina/],
  ["colmek-toge", /toge|montok|gembrot|chubby|gemuk|bbw|gemoy/],
  ["colmek-toket", /toket|tetek|susu|payudara|big.?tits|big.?boob|pentil/],
  ["colmek-janda", /janda|tante|bunda|mama|mom|milf|\bibu\b/],
  ["colmek-mahasiswi", /mahasiswi|kuliah|kampus|skripsi/],
  ["colmek-abg", /abg|remaja|sma|smk|siswi|teen|tocil|muda/],
  ["colmek-mandi", /mandi|shower|basah|toilet/],
  ["colmek-dildo", /dildo|vibrator|bantal|guling|botol|timun|terong/],
  ["colmek-live", /live|webcam|vcs|streaming|host/],
  ["colmek-viral", /viral|tiktok|terbaru|update|baru/],
  ["colmek-kamera-hp", /./]
];

// Saringan isi: video harus benar-benar soal colmek/masturbasi, bukan adegan
// ngentot yang cuma numpang tag "indonesian".
const SINYAL_COLMEK = /(colmek|masturbat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo)/i;
const BUKAN_COLMEK = /(ngentot|entot|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber)/i;
// Jangan pernah loloskan judul yang mengarah ke anak di bawah umur.
const DILARANG = /(\bsmp\b|\bsd\b|sekolah dasar|bocah|anak kecil|underage|preteen|loli)/i;

const args = process.argv.slice(2);
const angka = (nama, cadangan) => {
  const i = args.indexOf(`--${nama}`);
  return i >= 0 && Number(args[i + 1]) ? Number(args[i + 1]) : cadangan;
};
const PER = Math.max(1, angka("per", 100));
const PENDEK = angka("short", 45);
const PANJANG = angka("long", 3000);
const HANYA = args.includes("--kategori") ? args[args.indexOf("--kategori") + 1] : null;
const CETAK = args.includes("--raw");

async function halaman(kueri, hal) {
  const url = `${API}?query=${encodeURIComponent(kueri)}&format=json&per_page=100&page=${hal}&sort=views&status=active`;
  for (let percobaan = 1; percobaan <= 3; percobaan += 1) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(percobaan === 1 ? 20000 : 12000),
        headers: { "user-agent": UA, accept: "application/json", connection: "close" }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.videos) ? data.videos : [];
    } catch {
      /* coba lagi, lalu menyerah diam-diam */
    }
  }
  return [];
}

function tagDari(kata) {
  return String(kata || "")
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9 _-]/g, "").replace(/\s+/g, "_"))
    .filter((t) => t.length > 2 && !/\d{4,}/.test(t))
    .slice(0, 6);
}

function layak(v) {
  const detik = Number(v.length_sec) || 0;
  const gambar = v.default_thumb && v.default_thumb.src;
  if (!v.id || !v.title || !gambar) return false;
  if (detik < PENDEK || detik > PANJANG) return false;
  if (!/\//.test(v.url || "")) return false;
  return !DILARANG.test(v.title);
}

/** Video harus menyebut colmek/masturbasi DI JUDULNYA, bukan cuma di tag. */
function khususColmek(v) {
  const judul = String(v.title || "");
  if (BUKAN_COLMEK.test(judul)) return false;
  return SINYAL_COLMEK.test(judul);
}

/**
 * Judul dari host sering ada emoji / karakter asing, dan kadang emoji itu
 * mendarat sebagai mojibake ("Squirtð¦"). Diperbaiki dulu, baru dibersihkan.
 */
function bersihkan(text) {
  let keluar = String(text || "");
  if (/[\u0080-\u00FF]{2,}/.test(keluar)) {
    try {
      const diperbaiki = Buffer.from(keluar, "latin1").toString("utf8");
      if (!/[^\x20-\x7E\u00A0-\uFFFF]/.test(diperbaiki)) keluar = diperbaiki;
    } catch {
      /* biarkan apa adanya */
    }
  }
  return keluar
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{E0000}-\u{E007F}]/gu, "")
    .replace(/[\u0080-\u00BF\u2010-\u206F\uFFF0-\uFFFF]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 90);
}

/**
 * Kunci anti-duplikat: Eporner sering mengunggah ulang video yang sama dengan id
 * berbeda tapi judul sama. Judul yang sudah dinormalkan lebih ampuh daripada id.
 */
function kunci(v) {
  const judul = bersihkan(v.title).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
  return judul || `id:${v.id}`;
}

function rapikan(v) {
  const tag = tagDari(v.keywords);
  return {
    id: v.id,
    title: bersihkan(v.title),
    url: v.url,
    detik: Number(v.length_sec) || 0,
    tag: (tag.length ? tag : ["colmek"]).join(","),
    poster: v.default_thumb.src,
    rasio: (Number(v.default_thumb.width) || 0) && (Number(v.default_thumb.height) || 0)
      ? Number(v.default_thumb.width) / Number(v.default_thumb.height)
      : 0,
    views: Math.round(Number(v.views) || 0),
    added: v.added || ""
  };
}

/**
 * Ambil semua kueri di beberapa halaman sekaligus. Dibatasi 5 permintaan
 * bersamaan supaya API-nya tidak dibanjiri.
 */
async function kumpulkan() {
  const kolam = [];
  const sudah = new Set();
  const antre = [...KUERI];
  let selesai = 0;

  async function pekerja() {
    while (antre.length) {
      const q = antre.shift();
      const balasan = await Promise.all([1, 2, 3, 4, 5].map((hal) => halaman(q, hal)));
      for (const v of balasan.flat()) {
        if (!layak(v) || !khususColmek(v)) continue;
        const k = kunci(v);
        if (sudah.has(k)) continue;
        sudah.add(k);
        kolam.push(rapikan(v));
      }
      selesai += 1;
      if (selesai % 8 === 0 || !antre.length) {
        console.error(`  ${selesai}/${KUERI.length} kueri · ${kolam.length} video unik`);
      }
    }
  }

  await Promise.all(Array.from({ length: 5 }, pekerja));
  return kolam;
}

const kolam = await kumpulkan();
// Yang paling banyak ditonton didahulukan, supaya kalau kuota penuh yang jelek dibuang.
kolam.sort((a, b) => b.views - a.views);

const hasil = {};
const laporan = [];
for (const [slug] of KATEGORI) hasil[slug] = [];

let tidakDapat = 0;
for (const v of kolam) {
  const judul = v.title.toLowerCase();
  let masuk = false;
  for (const [slug, pola] of KATEGORI) {
    if (HANYA && slug !== HANYA) continue;
    if (hasil[slug].length >= PER) continue;
    if (!pola.test(judul)) continue;
    hasil[slug].push(v);
    masuk = true;
    break;
  }
  if (!masuk) tidakDapat += 1;
}

for (const [slug] of KATEGORI) {
  if (HANYA && slug !== HANYA) continue;
  const isi = hasil[slug];
  laporan.push(
    `${slug.padEnd(22)} ${String(isi.length).padStart(3)}  ${
      isi.slice(0, 3).map((v) => `${Math.round(v.detik / 60)}m ${v.title.slice(0, 26)}`).join(" · ") || "(kosong)"
    }`
  );
}

const jumlah = Object.values(hasil).reduce((a, v) => a + v.length, 0);
if (!CETAK) {
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { default: path } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "katalog.json"), JSON.stringify({ dibuat: new Date().toISOString(), hasil }, null, 2));
  console.log(laporan.join("\n"));
  console.log(`\nkolam: ${kolam.length} video unik · dipakai: ${jumlah} · sisa tak berkategori: ${tidakDapat}`);
  console.log("Lanjut: npm run reset — berkas katalog.json dibaca otomatis oleh seed.");
} else {
  process.stdout.write(JSON.stringify(hasil, null, 2));
}

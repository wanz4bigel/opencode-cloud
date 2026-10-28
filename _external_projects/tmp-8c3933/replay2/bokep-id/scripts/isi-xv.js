// Isi katalog tambahan dari XVideos — sumber kedua selain Eporner.
//
//   node scripts/isi-xv.js                ambil semua halaman yang masuk akal
//   node scripts/isi-xv.js --hal 10       batasi 10 halaman per kueri
//   node scripts/isi-xv.js --raw          cetak JSON saja
//
// Kenapa XVideos? Halaman tag/pencariannya bisa diakses dari server ini (tidak 403
// seperti XHamster/XNXX/Pornhub), dan alamat /embedframe/<id> memang disediakan
// untuk ditanam di situs lain — sudah dites muter di dalam iframe.
//
// Hasilnya ditulis ke data/katalog-xv.json. src/db.js membaca katalog.json
// (Eporner) lalu katalog-xv.json, dan membuang judul yang kembar.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const DASAR = "https://www.xvideos.com";

/**
 * Sumber: tag resmi XVideos + pencarian. Yang "tag" punya halaman /tags/<nama>/<n>,
 * yang "cari" pakai ?k=<kueri>&p=<n>. Keduanya dihitung dari 1 di sini.
 */
const SUMBER = [
  ["tag", "indonesia-colmek", 10],
  ["tag", "colmek", 20],
  ["tag", "masturbasi-indonesia", 10],
  ["tag", "indo-colmek", 10],
  ["tag", "colmek-indonesia", 16],
  ["tag", "abg-colmek", 4],
  ["tag", "hijab-colmek", 6],
  ["tag", "jilbab-colmek", 6],
  ["tag", "dildo-indonesia", 14],
  ["tag", "masturbasi-indo", 8],
  ["tag", "hijab-masturbation", 12],
  ["tag", "masturbation-indonesia", 12],
  ["tag", "indonesian-masturbation", 6],
  ["tag", "masturbasi", 14],
  ["tag", "solo-indonesia", 12],
  ["tag", "solo-indo", 16],
  ["tag", "indo-masturbasi", 4],
  ["tag", "cewek-indonesia", 8],
  ["tag", "chindo", 6],
  ["tag", "dildo-masturbasi", 4],
  ["tag", "ngocok", 4],
  ["tag", "toket-indonesia", 3],
  ["tag", "bokep-indonesia", 12],
  ["tag", "viral-indonesia", 8],
  ["tag", "jilbab-masturbasi", 2],
  ["tag", "tante-masturbasi", 2],
  ["tag", "onani", 2],
  ["tag", "coli", 2],
  ["tag", "amoy", 2],
  ["cari", "colmek", 20],
  ["cari", "colmek indo", 20],
  ["cari", "indo colmek", 20],
  ["cari", "colmek hijab", 12],
  ["cari", "colmek abg", 12],
  ["cari", "colmek terbaru", 8],
  ["cari", "viral colmek", 8],
  ["cari", "ngocok memek", 8],
  ["cari", "masturbasi colmek", 8]
];

/** Kategori dan pola judulnya — sama seperti scripts/isi.js. */
const KATEGORI = [
  ["colmek-hijab", /jilbab|hijab|kerudung|ukhti/],
  ["colmek-amoy", /amoy|chindo|cindo|chinese|china|cina/],
  ["colmek-toge", /toge|montok|gembrot|chubby|gemuk|bbw|gemoy/],
  ["colmek-toket", /toket|tetek|susu|payudara|big.?tits|big.?boob|pentil/],
  ["colmek-janda", /janda|tante|bunda|mama|mom|milf|\bibu\b|mertua/],
  ["colmek-mahasiswi", /mahasiswi|kuliah|kampus|skripsi/],
  ["colmek-abg", /abg|remaja|teen|tocil|muda|18 ?yo|18 tahun/],
  ["colmek-mandi", /mandi|shower|basah|toilet|wc/],
  ["colmek-dildo", /dildo|vibrator|bantal|guling|botol|timun|terong/],
  ["colmek-live", /live|webcam|vcs|streaming|host/],
  ["colmek-viral", /viral|tiktok|terbaru|update|baru/],
  ["colmek-kamera-hp", /./]
];

const SINYAL_COLMEK = /(colmek|masturbat|mastrubat|dildo|vibrator|ngocok|onani|coli|main sendiri|solo)/i;
// Harus kelihatan Indonesia. "hijab"/"jilbab" saja tidak cukup — tag hijab XVideos
// penuh video Arab/India/Malaysia, jadi kata itu baru dihitung kalau ada kata Indo lain.
const SINYAL_INDO = /(indo|indonesia|bokep|cewek|memek|cindo|amoy|tante|janda|abg|tobrut|toge|suster|pembantu|mertua|ukhti|kakak ipar|adik tiri)/i;
// Jangan pernah loloskan video yang jelas bukan orang Indonesia.
const BUKAN_INDO = /(indian|arab|malay|pinay|filipina|thai|japanese|korea|vietnam|turkey|turkish|bangladesh|pakistan|sri lanka|black|ebony|latina|russian|europe|american|british|white|hindi)/i;
const BUKAN_COLMEK = /(ngentot|entot|ngentit|sepong|blowjob|creampie|threesome|couple|ngesex|\bsex\b|fuck|gilir|bercinta|\bml\b|goyang|selingkuh|skandal|pijat|open ?bo|barber|affair|video call|anal|asshole|hentai|ngewe|ngemut|hisap|kontol|sucks|di ?kocokin|ngocokin|colmekin|genjot|jilat|stepson|stepmom|stepsis|stepbro|rides on|\bpee\b|piss|caught|police|public|outdoor|bus stop|lonte|michat|prank|reuni|crot di mulut|maid|mutual)/i;
// Jangan pernah loloskan judul yang mengarah ke anak sekolah / di bawah umur.
const DILARANG = /(sekolah|siswi|\bsmp\b|\bsd\b|\bsma\b|\bsmk\b|pelajar|bocah|anak kecil|underage|preteen|loli)/i;

const args = process.argv.slice(2);
const angka = (nama, cadangan) => {
  const i = args.indexOf(`--${nama}`);
  return i >= 0 && Number(args[i + 1]) ? Number(args[i + 1]) : cadangan;
};
const MAKS_HAL = Math.max(1, angka("hal", 40));
const CETAK = args.includes("--raw");

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

/** Durasi XVideos berbentuk "5 min", "1 h 5 min", "12 min". */
function detik(dur) {
  const jam = Number((dur.match(/(\d+)\s*h/i) || [])[1] || 0);
  const menit = Number((dur.match(/(\d+)\s*min/i) || [])[1] || 0);
  return jam * 3600 + menit * 60;
}

/** Ambil satu halaman HTML, dengan satu percobaan ulang. */
async function ambil(url) {
  for (let i = 0; i < 2; i += 1) {
    try {
      const r = await fetch(url, {
        headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8" },
        redirect: "follow",
        signal: AbortSignal.timeout(i === 0 ? 25000 : 15000)
      });
      if (r.ok) return await r.text();
      if (r.status === 404) return "";
    } catch {
      /* coba sekali lagi */
    }
  }
  return "";
}

/** Satu kartu video = div#video_<eid> ... <p class="title"> ... <span class="duration">. */
function kartu(html) {
  const out = [];
  const re = /<div id="video_([a-z0-9]+)"[\s\S]{0,2600}?<p class="title"><a href="([^"]+)" title="([^"]+)">[\s\S]{0,240}?<span class="duration">([^<]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html))) {
    const potong = html.slice(m.index, m.index + 2600);
    const poster = (potong.match(/data-src="(https:[^"]+?\.(?:jpg|jpeg|webp|png))"/) || [])[1] || "";
    out.push({
      eid: m[1],
      path: m[2],
      judul: decode(m[3]),
      durasi: m[4].trim(),
      poster
    });
  }
  return out;
}

function alamat(kind, kueri, hal) {
  if (hal <= 1) return kind === "tag" ? `${DASAR}/tags/${kueri}` : `${DASAR}/?k=${encodeURIComponent(kueri)}`;
  return kind === "tag"
    ? `${DASAR}/tags/${kueri}/${hal - 1}`
    : `${DASAR}/?k=${encodeURIComponent(kueri)}&p=${hal - 1}`;
}

/** Video harus menyebut colmek/masturbasi DI JUDUL, dan bukan adegan ngentot. */
function layak(v) {
  const judul = v.judul;
  if (!judul || !v.eid || !v.poster) return false;
  const d = detik(v.durasi);
  if (d < 45 || d > 3600) return false;
  if (DILARANG.test(judul)) return false;
  if (BUKAN_INDO.test(judul)) return false;
  if (BUKAN_COLMEK.test(judul)) return false;
  return SINYAL_COLMEK.test(judul) && SINYAL_INDO.test(judul);
}

const kunci = (v) => v.judul.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60) || v.eid;

/** Kumpulkan semua halaman, 4 permintaan sekaligus, tanpa menduplikasi judul. */
async function kumpulkan() {
  const tugas = [];
  for (const [kind, kueri, batas] of SUMBER) {
    for (let hal = 1; hal <= Math.min(batas, MAKS_HAL); hal += 1) tugas.push([kind, kueri, hal]);
  }
  const kolam = [];
  const sudah = new Set();
  let selesai = 0;

  async function pekerja() {
    while (tugas.length) {
      const [kind, kueri, hal] = tugas.shift();
      const html = await ambil(alamat(kind, kueri, hal));
      for (const v of kartu(html)) {
        if (!layak(v)) continue;
        const k = kunci(v);
        if (sudah.has(k)) continue;
        sudah.add(k);
        kolam.push({
          id: v.eid,
          title: v.judul,
          url: `${DASAR}${v.path.split("?")[0]}`,
          detik: detik(v.durasi),
          tag: "colmek,indonesia",
          poster: v.poster,
          rasio: 0,
          views: 0,
          added: ""
        });
      }
      selesai += 1;
      if (selesai % 25 === 0 || !tugas.length) {
        console.error(`  ${selesai} halaman · ${kolam.length} video unik`);
      }
    }
  }

  await Promise.all(Array.from({ length: 4 }, pekerja));
  return kolam;
}

const kolam = await kumpulkan();
kolam.sort((a, b) => b.detik - a.detik);

const hasil = {};
for (const [slug] of KATEGORI) hasil[slug] = [];
for (const v of kolam) {
  const judul = v.title.toLowerCase();
  for (const [slug, pola] of KATEGORI) {
    if (!pola.test(judul)) continue;
    hasil[slug].push(v);
    break;
  }
}

const jumlah = Object.values(hasil).reduce((a, v) => a + v.length, 0);
const laporan = KATEGORI.map(
  ([slug]) => `${slug.padEnd(22)} ${String(hasil[slug].length).padStart(3)}  ${hasil[slug].slice(0, 2).map((v) => `${Math.round(v.detik / 60)}m ${v.title.slice(0, 30)}`).join(" · ")}`
);

if (!CETAK) {
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { default: path } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "katalog-xv.json"), JSON.stringify({ dibuat: new Date().toISOString(), sumber: "xvideos", hasil }, null, 2));
  console.log(laporan.join("\n"));
  console.log(`\nkolam XVideos: ${kolam.length} video colmek unik · dipakai: ${jumlah}`);
  console.log("Lanjut: npm run reset — katalog.json + katalog-xv.json dibaca otomatis oleh seed.");
} else {
  process.stdout.write(JSON.stringify(hasil, null, 2));
}

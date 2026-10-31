// Database: SQLite bawaan Node (node:sqlite). Tidak ada tabel file video,
// karena video tidak pernah di-upload — yang disimpan hanya alamat embed.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "./hosts.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(here, "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "bokep-kita.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    slug  TEXT NOT NULL UNIQUE,
    ord   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS videos (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    provider    TEXT NOT NULL,
    url         TEXT NOT NULL,
    embed       TEXT NOT NULL,
    kind        TEXT NOT NULL CHECK (kind IN ('iframe', 'video')),
    duration    INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    tags        TEXT NOT NULL DEFAULT '',
    poster      TEXT NOT NULL DEFAULT '',
    demo        INTEGER NOT NULL DEFAULT 0,
    views       INTEGER NOT NULL DEFAULT 0,
    added_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_videos_added ON videos (added_at DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_views ON videos (views DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_cat   ON videos (category_id);
`);

// Database lama belum punya kolom ini: tambahkan tanpa bikin ulang tabel.
const kolomSudahAda = new Set(db.prepare("PRAGMA table_info(videos)").all().map((k) => k.name));
for (const kolom of ["poster TEXT NOT NULL DEFAULT ''", "demo INTEGER NOT NULL DEFAULT 0"]) {
  if (!kolomSudahAda.has(kolom.split(" ")[0])) db.exec(`ALTER TABLE videos ADD COLUMN ${kolom}`);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueSlug(base) {
  let slug = base || "video";
  let n = 2;
  while (db.prepare("SELECT 1 FROM videos WHERE slug = ?").get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function addVideo({ title, url, categoryId = null, tags = "", duration = 0, poster = "", demo = false }) {
  const target = resolve(url);
  if (!target) return { error: "Alamat video tidak dikenali. Tempel URL lengkap, misalnya https://..." };
  if (!title || !title.trim()) return { error: "Judul belum diisi. Tulis judul yang jelas, tanpa nama file." };

  const seconds = Number(duration) || guessDuration(title);
  const info = db
    .prepare(
      `INSERT INTO videos (title, slug, provider, url, embed, kind, duration, category_id, tags, poster, demo, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
    )
    .run(
      title.trim(),
      uniqueSlug(slugify(title)),
      target.provider,
      target.direct,
      target.embed,
      target.kind,
      seconds,
      categoryId,
      normalizeTags(tags),
      String(poster || "").slice(0, 500),
      demo ? 1 : 0,
      `-${Math.floor(Math.random() * 20) * 6} minutes`
    );
  return { ok: true, id: Number(info.lastInsertRowid), provider: target.provider };
}

function guessDuration(title) {
  const m = String(title).match(/(\d{1,2})\s*(menit|minute|min|m\b)/i);
  return m ? Number(m[1]) * 60 : 60 + Math.floor(Math.random() * 540);
}

export function normalizeTags(tags) {
  return String(tags)
    .split(/[,\s]+/)
    .map((t) => t.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 8)
    .join(",");
}

/** Ganti judul/durasi/gambar dengan apa yang dikasih host aslinya. */
export function applyHostInfo(id, { title, duration, poster } = {}) {
  const set = [];
  const params = [];
  if (title) {
    set.push("title = ?", "slug = ?");
    params.push(String(title).slice(0, 140), uniqueSlug(slugify(title)));
  }
  if (Number(duration) > 0) {
    set.push("duration = ?");
    params.push(Math.round(Number(duration)));
  }
  if (poster) {
    set.push("poster = ?");
    params.push(String(poster).slice(0, 500));
  }
  if (!set.length) return false;
  params.push(Number(id));
  return db.prepare(`UPDATE videos SET ${set.join(", ")} WHERE id = ?`).run(...params).changes > 0;
}

/** Semua video yang bisa dijajal metadata (kecuali file mentah & host ber-Cloudflare). */
export function listFetchable({ hanyaContoh = false, batas = 200 } = {}) {
  const extra = hanyaContoh ? "AND demo = 1" : "";
  return db
    .prepare(
      `SELECT id, title, url, provider FROM videos
       WHERE provider IN ('youtube','vimeo','archive','dailymotion') ${extra}
       ORDER BY added_at DESC LIMIT ?`
    )
    .all(Number(batas));
}

/** Jumlah video bawaan (bukan tambahan pengguna) — dipakai untuk pesan "ini masih contoh". */
export function demoCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM videos WHERE demo = 1").get().n;
}

export function categories() {
  return db.prepare("SELECT * FROM categories ORDER BY ord, name").all();
}

export function categoryIdBySlug(slug) {
  const row = db.prepare("SELECT id FROM categories WHERE slug = ?").get(String(slug));
  return row ? row.id : null;
}

export function categoriesWithCounts() {
  return db
    .prepare(
      `SELECT c.name, c.slug, COUNT(v.id) AS total
       FROM categories c LEFT JOIN videos v ON v.category_id = c.id
       GROUP BY c.id ORDER BY total DESC, c.name`
    )
    .all();
}

export function countVideos() {
  return db.prepare("SELECT COUNT(*) AS n FROM videos").get().n;
}

/** Daftar video untuk beranda, kategori, tag, dan hasil pencarian. */
export function listVideos({ sort = "terbaru", categoryId = null, tag = null, query = null, page = 1, per = 24 } = {}) {
  const where = [];
  const params = [];
  if (categoryId) {
    where.push("v.category_id = ?");
    params.push(categoryId);
  }
  if (tag) {
    where.push("(',' || v.tags || ',') LIKE ?");
    params.push(`%,${tag},%`);
  }
  if (query) {
    where.push("(v.title LIKE ? OR v.tags LIKE ?)");
    params.push(`%${query}%`, `%${query}%`);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const order = sort === "populer" ? "v.views DESC, v.added_at DESC" : "v.added_at DESC, v.views DESC";
  const total = db.prepare(`SELECT COUNT(*) AS n FROM videos v ${clause}`).get(...params).n;
  const pages = Math.max(1, Math.ceil(total / per));
  const current = Math.min(Math.max(1, page), pages);
  const rows = db
    .prepare(`SELECT v.*, c.name AS category, c.slug AS category_slug
              FROM videos v LEFT JOIN categories c ON c.id = v.category_id
              ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, per, (current - 1) * per);
  return { rows, total, pages, current };
}

export function videoBySlug(slug) {
  return (
    db
      .prepare(
        `SELECT v.*, c.name AS category, c.slug AS category_slug
         FROM videos v LEFT JOIN categories c ON c.id = v.category_id WHERE v.slug = ?`
      )
      .get(String(slug)) || null
  );
}

export function relatedVideos(video, limit = 10) {
  const rows = db
    .prepare(
      `SELECT v.*, c.name AS category, c.slug AS category_slug
       FROM videos v LEFT JOIN categories c ON c.id = v.category_id
       WHERE v.id != ? AND (v.category_id = ? OR v.tags LIKE ?)
       ORDER BY v.views DESC LIMIT ?`
    )
    .all(video.id, video.category_id, `%${(video.tags.split(",")[0] || "colmek")}%`, limit);
  if (rows.length >= limit) return rows;

  // Kategori sepi: isi sisanya dengan video populer supaya daftar berikutnya penuh.
  const have = new Set([video.id, ...rows.map((r) => r.id)]);
  const spare = popularVideos(limit + have.size).filter((v) => !have.has(v.id));
  return [...rows, ...spare].slice(0, limit);
}

export function popularVideos(limit = 6) {
  return db
    .prepare(
      `SELECT v.*, c.name AS category, c.slug AS category_slug
       FROM videos v LEFT JOIN categories c ON c.id = v.category_id
       ORDER BY v.views DESC LIMIT ?`
    )
    .all(limit);
}

export function videoById(id) {
  return db.prepare("SELECT * FROM videos WHERE id = ?").get(Number(id)) || null;
}

export function deleteVideo(id) {
  return db.prepare("DELETE FROM videos WHERE id = ?").run(Number(id)).changes > 0;
}

export function bumpViews(id) {
  db.prepare("UPDATE videos SET views = views + 1 WHERE id = ?").run(Number(id));
}

export function stats() {
  const v = db.prepare("SELECT COUNT(*) AS videos, COALESCE(SUM(views),0) AS views FROM videos").get();
  return { videos: v.videos, views: v.views, categories: categoriesWithCounts().length, host: "embed", demo: demoCount() };
}

const CATEGORY_SEED = [
  ["Colmek ABG", "colmek-abg"],
  ["Colmek Janda", "colmek-janda"],
  ["Colmek Mahasiswi", "colmek-mahasiswi"],
  ["Colmek Amoy", "colmek-amoy"],
  ["Colmek Toge", "colmek-toge"],
  ["Colmek Toket", "colmek-toket"],
  ["Colmek Hijab", "colmek-hijab"],
  ["Colmek Mandi", "colmek-mandi"],
  ["Colmek Selingkuh", "colmek-selingkuh"],
  ["Colmek Kamera HP", "colmek-kamera-hp"],
  ["Colmek Live", "colmek-live"],
  ["Ibu-ibu Girang", "ibu-ibu-girang"],
  ["Cewek Kantor", "cewek-kantor"],
  ["Jepang Tanpa Sensor", "jepang-tanpa-sensor"],
  ["Korea Beranotasi", "korea-beranotasi"],
  ["Bule Beranotasi", "bule-beranotasi"],
  ["Lokal Full Sensor", "lokal-full-sensor"],
  ["Viral TikTok", "viral-tiktok"]
];

// Sumber video contoh: tiap alamat di bawah sudah dites menjawab HTTP 200/206 dari
// server ini (npm run probe). Durasi ikut file aslinya, jadi badge durasi di kartu
// tidak bohong. Ganti dengan URL asli kapan pun lewat /admin.
const W = "https://media.w3.org/2010/05/";
const T = "https://test-videos.co.uk/vids/";
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;
const SRC = [
  [`${W}sintel/trailer.mp4`, 52],
  [`${W}bunny/movie.mp4`, 60],
  [`${W}bunny/trailer.mp4`, 11],
  [`${W}video/movie_300.mp4`, 30],
  [`${T}bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`, 10],
  [`${T}jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4`, 10],
  [`${T}sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4`, 10],
  [`${T}jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4`, 10],
  [`${T}bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm`, 10],
  ["https://mdn.github.io/shared-assets/videos/flower.mp4", 10],
  ["https://mdn.github.io/shared-assets/videos/flower.webm", 10],
  ["https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files/big_buck_bunny.mp4", 596],
  ["https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4", 596],
  ["https://download.samplelib.com/mp4/sample-5s.mp4", 5],
  ["https://download.samplelib.com/mp4/sample-10s.mp4", 10],
  ["https://download.samplelib.com/mp4/sample-15s.mp4", 15],
  [YT("dQw4w9WgXcQ"), 213],
  [YT("9bZkp7q19f0"), 253],
  [YT("kJQP7kiw5Fk"), 282],
  [YT("jNQXAC9IVRw"), 19],
  [YT("60ItHLz5WEA"), 212],
  [YT("hT_nvWreIhg"), 302],
  [YT("CevxZvSJLk8"), 269],
  [YT("3JZ_D3ELwOQ"), 249],
  [YT("YQHsXMglC9A"), 236],
  [YT("09R8_2nJtjg"), 230],
  ["https://vimeo.com/174732568", 106]
];

// Katalog contoh per kategori: [judul, tag]. Sumbernya diputar lewat SRC supaya
// host dan durasi bervariasi antar kartu.
const PER_KATEGORI = 4;
const CATALOG = {
  "colmek-abg": [
    ["Colmek ABG SMK Selesai Dua Ronde", "smk,lokal,hot"],
    ["Colmek ABG Kosan Kebon Jeruk", "kos,jakarta,sempit"],
    ["Colmek ABG Habis Voli Sore", "voli,olahraga,keringat"],
    ["Colmek ABG Nunggu Buka Puasa", "ramadhan,rumah,siang"]
  ],
  "colmek-janda": [
    ["Janda Baru Kening Nonton Drakor Sambil Colmek", "drakor,kos,soju"],
    ["Colmek Janda Sultan Karawaci", "tangsel,kamar,mewah"],
    ["Janda Kembang Colmek di Dapur", "dapur,rumah,celemek"],
    ["Colmek Janda Dua Anak Nunggu Suami Pulang", "rumah,full,sore"]
  ],
  "colmek-mahasiswi": [
    ["Mahasiswi Kos Colmek Pakai Headphone", "kos,headphone,aman"],
    ["Colmek Mahasiswi Yogya Habis Bimbingan", "yogya,skripsi,lembur"],
    ["Mahasiswi Kedokteran Colmek Nunggu Shift", "kampus,shift,jaga"],
    ["Colmek Mahasiswi Bawa Ransel ke Kos", "kampus,ransel,kamar"]
  ],
  "colmek-amoy": [
    ["Amoy Bandung Colmek di Kasur Kos", "bandung,kos,kasur"],
    ["Amoy Jakarta Colmek Full Suara", "jakarta,suara,full"],
    ["Colmek Amoy Senja di Kamar Kos", "senja,kamar,gelap"]
  ],
  "colmek-toge": [
    ["Toge Bandung Colmek Sesudah Subuh", "bandung,full,subuh"],
    ["Toge Lokal Colmek Slow Motion", "lokal,slowmo,kamar"],
    ["Colmek Toge Habis Mandi Bunga Tujuh", "mandi,ramuan,harum"]
  ],
  "colmek-toket": [
    ["Toket Gede Colmek Depan Cermin", "cermin,slowmo,kamar"],
    ["Toket Kecil Colmek Kelihatan Sekali", "kecil,full,kamar"],
    ["Colmek Toket Habis Olahraga", "olahraga,keringat,leging"]
  ],
  "colmek-hijab": [
    ["Jilbab Abu-Abu Colmek di Kamar Kos", "jilbab,kos,abu"],
    ["Colmek Mahasiswi Berjilbab Habis Ngaji", "ngaji,mahasiswi,sore"],
    ["Hijab Tokeh Colmek Sendirian", "tokeh,sempit,malam"]
  ],
  "colmek-mandi": [
    ["Colmek di Bak Mandi Air Dingin", "airdingin,kamar,mandi"],
    ["Colmek Mandi Shampoo Sampai Berbusa", "shampoo,busa,licin"],
    ["Colmek Habis Mandi Sore", "sore,handuk,kamar"]
  ],
  "colmek-selingkuh": [
    ["Colmek Selingkuhan Jam Kantor", "kantor,siang,gesa"],
    ["Janda Selingkuh Colmek di Dalam Mobil", "mobil,janda,siang"],
    ["Colmek Selingkuh Sambil Nahan Suara", "suara,kamar,gesa"]
  ],
  "colmek-kamera-hp": [
    ["Colmek Kamera HP Getar", "kamera,hp,getar"],
    ["Colmek Pakai HP Murah", "kamera,hp,murah"],
    ["Colmek Selfie Depan Laptop", "selfie,laptop,kamar"]
  ],
  "colmek-live": [
    ["Colmek Live Interaksi Penonton", "live,chat,interaksi"],
    ["Live Colmek Sawer Jempol", "live,sawer,jempol"],
    ["Colmek Live Malam Minggu", "live,weekend,kamar"]
  ],
  "ibu-ibu-girang": [
    ["Tante Girang Colmek Dua Jari", "tante,girang,jari"],
    ["Tante Toko Kelontong Colmek di Belakang Kasir", "toko,kelontong,siang"],
    ["Ibu-ibu Arisan Colmek di Kamar", "arisan,ibu,kamar"]
  ],
  "cewek-kantor": [
    ["Cewek Kantor Colmek di Toilet Mall", "kantor,mall,toilet"],
    ["Colmek SPG Expo Nunggu Booth Buka", "spg,expo,booth"],
    ["Colmek Cewek SPBU Lembur Malam", "spbu,lembur,malam"]
  ],
  "jepang-tanpa-sensor": [
    ["Colmek Cewek Jepang Tanpa Sensor", "jepang,asia,tanpasensor"],
    ["Colmek Guru Les Bahasa Jepang", "jepang,les,guru"],
    ["Colmek Cewek Jepang di Ryokan", "jepang,ryokan,kamar"]
  ],
  "korea-beranotasi": [
    ["Colmek Cewek Korea di Room Karaoke", "korea,karaoke,room"],
    ["Colmek Mahasiswi Korea di Hongdae", "korea,hongdae,mahasiswi"],
    ["Colmek Cewek Korea Spa Onnuri", "korea,spa,handuk"]
  ],
  "bule-beranotasi": [
    ["Colmek Cewek Bule di Pantai Bali", "bule,bali,pantai"],
    ["Colmek Bule di Fitness Studio", "bule,fitness,studio"],
    ["Colmek Cewek Bule Vila Canggu", "bule,canggu,vila"]
  ],
  "lokal-full-sensor": [
    ["Colmek Lokal Full Sensor Versi Panjang", "sensor,panjang,hd"],
    ["Colmek ABG Parkir Motor Sore", "parkir,motor,sore"],
    ["Colmek Cewek Kos Bandung", "kos,bandung,kamar"]
  ],
  "viral-tiktok": [
    ["Colmek Versi Viral 30 Detik", "viral,tiktok,potongan"],
    ["Colmek Cewek TikTok Diadu", "viral,tiktok,adu"],
    ["Colmek Compile Malam Ini", "viral,compile,malam"]
  ]
};

/**
 * Katalog sungguhan hasil `npm run isi` (data/katalog.json dari Eporner),
 * `npm run isi-xv` (data/katalog-xv.json dari XVideos), dan `npm run isi-dood`
 * (data/katalog-dood.json dari player DoodStream/jwplyr). Di sini kalau ada:
 * judul, durasi, tag, dan gambar semuanya dari host aslinya, bukan karangan.
 * Judul yang sama dari beberapa sumber cuma diambil sekali.
 */
const BERKAS_KATALOG = ["katalog.json", "katalog-xv.json", "katalog-dood.json"];

function bacaKatalogAsli() {
  const keluar = {};
  const sudah = new Set();
  for (const nama of BERKAS_KATALOG) {
    try {
      const isi = JSON.parse(readFileSync(path.join(dataDir, nama), "utf8"));
      for (const [slug, daftar] of Object.entries(isi.hasil || {})) {
        const bersih = [];
        for (const v of Array.isArray(daftar) ? daftar : []) {
          if (!v || !v.url || !v.title || !resolve(v.url)) continue;
          const kunci = String(v.title).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
          if (kunci && sudah.has(kunci)) continue;
          if (kunci) sudah.add(kunci);
          bersih.push(v);
        }
        if (bersih.length) keluar[slug] = (keluar[slug] || []).concat(bersih);
      }
    } catch {
      /* berkas belum ada — lewati */
    }
  }
  return keluar;
}

export function adaKatalogAsli() {
  return Object.keys(bacaKatalogAsli()).length > 0;
}

export function reseed() {
  db.exec("DELETE FROM videos; DELETE FROM categories;");
  CATEGORY_SEED.forEach(([name, slug], i) => {
    db.prepare("INSERT INTO categories (name, slug, ord) VALUES (?, ?, ?)").run(name, slug, i);
  });

  // demo=0: video sungguhan (judul & gambar dari host) — badge "Contoh" tidak pasang.
  const masuk = db.prepare(
    `INSERT INTO videos (title, slug, provider, url, embed, kind, duration, category_id, tags, poster, views, demo, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );

  const asli = bacaKatalogAsli();
  let menitLalu = 9;
  for (const [, slug] of CATEGORY_SEED) {
    const categoryId = categoryIdBySlug(slug);
    const baseTag = slug.split("-").slice(-1)[0];

    for (const v of asli[slug] || []) {
      const target = resolve(v.url);
      if (!target) continue;
      masuk.run(
        String(v.title).slice(0, 140),
        uniqueSlug(slugify(v.title)),
        target.provider,
        target.direct,
        target.embed,
        target.kind,
        Math.round(Number(v.detik) || 0),
        categoryId,
        normalizeTags(`${baseTag},${v.tag || ""}`),
        String(v.poster || "").slice(0, 500),
        Math.round(Number(v.views) || 0),
        0,
        `-${menitLalu} minutes`
      );
      menitLalu += 17 + ((menitLalu * 13) % 190);
    }

    // Katalog contoh dipakai untuk mengisi celah: host yang mau kasih metadata
    // saja yang masuk sebagai video sungguhan, sisanya tetap jujur labelled contoh.
    const kekurangan = PER_KATEGORI - ((asli[slug] || []).length);
    if (kekurangan <= 0) continue;
    let n = 0;
    const demo = db.prepare(
      `INSERT INTO videos (title, slug, provider, url, embed, kind, duration, category_id, tags, views, demo, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', ?))`
    );
    for (const [title, tags] of (CATALOG[slug] || []).slice(0, kekurangan)) {
      const [url, duration] = SRC[((title.length * 7) + (n * 11)) % SRC.length];
      const target = resolve(url);
      demo.run(
        title,
        uniqueSlug(slugify(title)),
        target.provider,
        target.direct,
        target.embed,
        target.kind,
        duration,
        categoryId,
        normalizeTags(`${baseTag},${tags}`),
        Math.floor(Math.random() * 92000) + 400,
        `-${menitLalu} minutes`
      );
      menitLalu += 22 + ((n * 37) % 210);
      n += 1;
    }
  }
}

if (countVideos() === 0) {
  reseed();
  console.log(`Seed selesai: ${countVideos()} video colmek dari host embed.`);
}

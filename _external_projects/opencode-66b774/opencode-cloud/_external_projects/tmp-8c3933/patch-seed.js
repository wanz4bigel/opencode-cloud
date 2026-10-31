const BLOCK = "src/db.js";
const fs = require("node:fs");
const file = "src/db.js";
const lines = fs.readFileSync(file, "utf8").split("\n");
const start = lines.findIndex((l) => l.startsWith("const CATEGORY_SEED = ["));
const end = lines.findIndex((l) => l.startsWith("export function reseed"));
if (start < 0 || end < 0) throw new Error("penanda tidak ketemu");

const block = `const CATEGORY_SEED = [
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

// Sumber video contoh: setiap alamat di bawah sudah dites menjawab HTTP 200/206
// dari server ini (npm run probe). Durasi ikut file aslinya, jadi badge durasi di
// kartu tidak bohong. Ganti dengan URL asli kapan pun lewat /admin.
const W = "https://media.w3.org/2010/05/";
const T = "https://test-videos.co.uk/vids/";
const YT = (id) => \`https://www.youtube.com/watch?v=\${id}\`;
const SRC = [
  [\`${W}sintel/trailer.mp4\`, 52],
  [\`${W}bunny/movie.mp4\`, 60],
  [\`${W}bunny/trailer.mp4\`, 11],
  [\`${W}video/movie_300.mp4\`, 30],
  [\`${T}bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4\`, 10],
  [\`${T}jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4\`, 10],
  [\`${T}sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4\`, 10],
  [\`${T}jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4\`, 10],
  [\`${T}bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm\`, 10],
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
  ["https://vimeo.com/76979871", 405]
];

// Katalog contoh per kategori: [judul, tag]. Sumbernya diputar lewat SRC supaya
// host dan durasinya bervariasi antar kartu.
const CATALOG = {
  "colmek-abg": [
    ["Colmek ABG SMK Selesai Dua Ronde", "abg,smk,lokal"],
    ["Colmek ABG Kosan Kebon Jeruk", "abg,kos,jakarta"],
    ["Colmek ABG Habis Voli Sore", "abg,voli,olahraga"],
    ["Colmek ABG Nunggu Buka Puasa", "abg,ramadhan,rumah"]
  ],
  "colmek-janda": [
    ["Janda Baru Kening Nonton Drakor Sambil Colmek", "janda,drakor,kos"],
    ["Colmek Janda Sultan Karawaci", "janda,tangsel,kamar"],
    ["Janda Kembang Colmek di Dapur", "janda,dapur,rumah"],
    ["Colmek Janda Dua Anak Nunggu Suami Pulang", "janda,rumah,full"]
  ],
  "colmek-mahasiswi": [
    ["Mahasiswi Kos Colmek Pakai Headphone", "mahasiswi,kos,headphone"],
    ["Colmek Mahasiswi Yogya Habis Bimbingan", "mahasiswi,yogya,skripsi"],
    ["Mahasiswi Kedokteran Colmek Nunggu Shift", "mahasiswi,kos,lembur"],
    ["Colmek Mahasiswi Bawa Ransel ke Kos", "mahasiswi,kampus,ransel"]
  ],
  "colmek-amoy": [
    ["Amoy Bandung Colmek di Kasur Kos", "amoy,bandung,kos"],
    ["Amoy Jakarta Colmek Full Suara", "amoy,jakarta,suara"],
    ["Colmek Amoy Senja di Kamar Kos", "amoy,senja,kamar"]
  ],
  "colmek-toge": [
    ["Toge Bandung Colmek Sesudah Subuh", "toge,bandung,full"],
    ["Toge Lokal Colmek Slow Motion", "toge,lokal,slowmo"],
    ["Colmek Toge Habis Mandi Bunga Tujuh", "toge,mandi,ramuan"]
  ],
  "colmek-toket": [
    ["Toket Gede Colmek Depan Cermin", "toket,cermin,slowmo"],
    ["Toket Kecil Colmek Kelihatan Sekali", "toket,kecil,full"],
    ["Colmek Toket Habis Olahraga", "toket,olahraga,keringat"]
  ],
  "colmek-hijab": [
    ["Jilbab Abu-Abu Colmek di Kamar Kos", "hijab,jilbab,kos"],
    ["Colmek Mahasiswi Berjilbab Habis Ngaji", "hijab,mahasiswi,ngaji"],
    ["Hijab Tokeh Colmek Sendirian", "hijab,tokeh,sempit"]
  ],
  "colmek-mandi": [
    ["Colmek di Bak Mandi Air Dingin", "mandi,airdingin,kamar"],
    ["Colmek Mandi Shampoo Sampai Berbusa", "mandi,shampoo,busa"],
    ["Colmek Habis Mandi Sore", "mandi,sore,handuk"]
  ],
  "colmek-selingkuh": [
    ["Colmek Selingkuhan Jam Kantor", "selingkuh,kantor,siang"],
    ["Janda Selingkuh Colmek di Dalam Mobil", "selingkuh,janda,mobil"],
    ["Colmek Selingkuh Sambil Nahan Suara", "selingkuh,suara,kamar"]
  ],
  "colmek-kamera-hp": [
    ["Colmek Kamera HP Getar", "kamera,hp,getar"],
    ["Colmek Repakai HP Murah", "kamera,hp,murah"],
    ["Colmek Selfie Depan Laptop", "kamera,selfie,laptop"]
  ],
  "colmek-live": [
    ["Colmek Live Interaksi Penonton", "live,interaksi,chat"],
    ["Live Colmek Sawer Jempol", "live,sawer,jempol"],
    ["Colmek Live Malam Minggu", "live,weekend,kamar"]
  ],
  "ibu-ibu-girang": [
    ["Tante Girang Colmek Dua Jari", "tante,girang,jari"],
    ["Tante Toko Kelontong Colmek di Belakang Kasir", "tante,toko,kelontong"],
    ["Ibu-ibu Arisan Colmek di Kamar", "ibu,arisan,kamar"]
  ],
  "cewek-kantor": [
    ["Cewek Kantor Colmek di Toilet Mall", "kantor,mall,toilet"],
    ["Colmek SPG Expo Nunggu Booth Buka", "spg,expo,booth"],
    ["Colmek Cewek SPBU Lembur Malam", "spbu,lembur,malam"]
  ],
  "jepang-tanpa-sensor": [
    ["Colmek Cewek Jepang Tanpa Sensor", "jepang,asia,tanpa sensor"],
    ["Colmek Guru Les Bahasa Jepang", "jepang,les,guru"],
    ["Colmek Cewek Jepang di Ryokan", "jepang,ryokan,kamar"]
  ],
  "korea-beranotasi": [
    ["Colmek Cewek Korea di Room Karaoke", "korea,karaoke,room"],
    ["Colmek Mahasiswi Korea di Hongdae", "korea,hongdae,mahasiswi"],
    ["Colmek Cewek Korea Spa Onnuri", "korea,spa,onnuri"]
  ],
  "bule-beranotasi": [
    ["Colmek Cewek Bule di Pantai Bali", "bule,bali,pantai"],
    ["Colmek Bule di Fitness Studio", "bule,fitness,studio"],
    ["Colmek Cewek Bule Vila Canggu", "bule,canggu,vila"]
  ],
  "lokal-full-sensor": [
    ["Colmek Lokal Full Sensor Versi Panjang", "lokal,sensor,panjang"],
    ["Colmek ABG Parkir Motor Sore", "lokal,parkir,motor"],
    ["Colmek Cewek Kos Bandung", "lokal,kos,bandung"]
  ],
  "viral-tiktok": [
    ["Colmek Versi Viral 30 Detik", "viral,tiktok,potongan"],
    ["Colmek Cewek TikTok Diadu", "viral,tiktok,adu"],
    ["Colmek Compile Malam Ini", "viral,compile,malam"]
  ]
};
`;

const reseed = `export function reseed() {
  db.exec("DELETE FROM videos; DELETE FROM categories;");
  CATEGORY_SEED.forEach(([name, slug], i) => {
    db.prepare("INSERT INTO categories (name, slug, ord) VALUES (?, ?, ?)").run(name, slug, i);
  });

  const insert = db.prepare(
    \`INSERT INTO videos (title, slug, provider, url, embed, kind, duration, category_id, tags, views, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))\`
  );

  let minutesAgo = 14;
  let n = 0;
  for (const [, slug] of CATEGORY_SEED) {
    const categoryId = categoryIdBySlug(slug);
    const baseTag = slug.split("-").slice(-1)[0];
    (CATALOG[slug] || []).forEach(([title, tags], i) => {
      const [url, duration] = SRC[(n * 11 + slug.length * 3) % SRC.length];
      const target = resolve(url);
      insert.run(
        title,
        uniqueSlug(slugify(title)),
        target.provider,
        target.direct,
        target.embed,
        target.kind,
        duration,
        categoryId,
        normalizeTags(\`${baseTag},\${tags}\`),
        Math.floor(Math.random() * 92000) + 400,
        \`-\${minutesAgo} minutes\`
      );
      minutesAgo += 22 + ((n * 37) % 210);
      n += 1;
    });
  }
}
`;

fs.writeFileSync(file, [...lines.slice(0, start), block, reseed, ...lines.slice(end + "export function reseed() {".split("\n").length + start + 1)].join("\n"), "utf8");
console.log("blok seed diganti");

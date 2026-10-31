// Ambil judul, durasi, dan gambar asli langsung dari host video.
//
// Kenapa ini penting: waktu cuma alamat yang disimpan, judul ditulis manual dan
// thumbnail digambar sendiri — jadi judul bisa tidak nyambung sama isinya. Dengan
// fungsi ini, host yang mau kasih metadata (YouTube, Vimeo, Internet Archive,
// Dailymotion, atau halaman biasa ber-og:title) mengisi judul & gambar aslinya
// secara otomatis.
//
// Host yang servernya diblokir (XHamster/XNXX/Pornhub biasanya pakai Cloudflare)
// tidak akan pernah dijiteng dari sini — itu disengaja, jadi aman dan cepat.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const TIMEOUT = 6000;
const MAX_HTML = 900_000;
// YouTube sering menolak koneksi keep-alive kedua dari proses yang sama, jadi
// setiap request ditutup rapi supaya tidak jatuh ke jalur gagal.
const NO_KEEPALIVE = { connection: "close" };

const ABS = /^https?:\/\//i;
const CLEAN = /^[^<>"'`\\]+$/;
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)(\?|#|$)/i;

/** CDN gambar yang aman di-hotlink browser pengunjung. */
const SAFE_IMAGE_HOSTS = ["i.ytimg.com", "i.vimeocdn.com", "archive.org", "img.dailymotion.com"];

function pickUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.length > 500 || !CLEAN.test(raw)) return null;
  return ABS.test(raw) ? raw : null;
}

function pickText(value) {
  const raw = String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw || /<(script|style)/i.test(raw)) return null;
  return raw.slice(0, 140);
}

function metaFromHtml(html, name) {
  const wanted = name.toLowerCase();
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const prop = (tag.match(/\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    if (prop.toLowerCase() !== wanted) continue;
    return (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1] || "";
  }
  return "";
}

/** Hanya gambar yang aman di-hotlink browser pengunjung. */
function safeImage(url) {
  const picked = pickUrl(url);
  if (!picked) return null;
  let target;
  try {
    target = new URL(picked);
  } catch {
    return null;
  }
  if (target.protocol !== "https:") return null;
  const host = target.hostname;
  if (/\b(adult|porn|xxx|nsfw|xvideos|xnxx|xhamster|bitchute)\b/i.test(host)) return null;
  const ekstensiAman = IMAGE_FILE.test(target.pathname);
  const cdnDipercaya = SAFE_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  if (!ekstensiAman && !cdnDipercaya) return null;
  return target.href;
}

/** Cek cepat apakah gambar benar-benar ada, sebelum alamatnya disimpan permanen. */
async function liveImage(url) {
  const picked = safeImage(url);
  if (!picked) return null;
  try {
    const res = await fetch(picked, {
      method: "HEAD",
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "user-agent": UA, ...NO_KEEPALIVE }
    });
    return res.ok ? picked : null;
  } catch {
    return null;
  }
}

async function getJson(rawUrl, { percobaan = 2, timeout = TIMEOUT } = {}) {
  // DNS pertama di proses baru bisa lambat, dan oEmbed adalah panggilan pertama
  // kita. Tanpa percobaan ulang, YouTube terlihat "tidak kasih metadata" padahal
  // cuma belum siap.
  for (let i = 1; i <= percobaan; i += 1) {
    try {
      const res = await fetch(rawUrl, {
        signal: AbortSignal.timeout(i === 1 ? Math.max(timeout, 12000) : timeout),
        headers: { "user-agent": UA, accept: "application/json", ...NO_KEEPALIVE }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      if (i === percobaan) return null;
    }
  }
  return null;
}

async function getHtml(rawUrl) {
  try {
    const res = await fetch(rawUrl, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "user-agent": UA, accept: "text/html", ...NO_KEEPALIVE }
    });
    if (!res.ok) return "";
    return (await res.text()).slice(0, MAX_HTML);
  } catch {
    return "";
  }
}

const YT_ID = /^(?:(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/;
const VIMEO_ID = /^(?:(?:www\.)?vimeo\.com\/)(\d{4,})/;
const DM_ID = /^(?:(?:www\.)?dailymotion\.com\/video|dai\.ly)\/([\w]{4,})/;
const ARCHIVE_ID = /^archive\.org\/(?:details|embed)\/([\w.-]{3,})/;
const DIRECT_FILE = /\.(mp4|webm|ogv|ogg|m3u8|mov)(\?|#|$)/i;

const YT_OEMBED = (id) =>
  `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;

/** Internet Archive: judul, durasi, dan thumbnail benar-benar dari itemnya. */
async function fromArchive(identifier) {
  const meta = await getJson(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
  if (!meta || !meta.metadata) return null;
  const title = pickText(meta.metadata.title);
  const seconds = Math.round(Number(meta.metadata.length) || 0) || undefined;
  if (!title) return null;
  return { title, seconds, thumb: await liveImage(`https://archive.org/services/img/${identifier}`) };
}

/**
 * Coba baca metadata host. Kalau host tidak mau kasih, hasilnya `dipakai: false`
 * dan pemanggil tetap pakai judul tulisan tangan.
 *
 * @returns {Promise<{dipakai:boolean, judul?:string, detik?:number, gambar?:string, via:string, pesan?:string}>}
 */
export async function fetchInfo(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || "").trim());
  } catch {
    return { dipakai: false, via: "salah", pesan: "URL tidak dikenali." };
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  // `search` wajib ikut: id YouTube ada di ?v=, jadi dibuang = tidak pernah dikenali.
  const at = `${host}${url.pathname}${url.search}`;

  const yt = at.match(YT_ID);
  if (yt) {
    const data = await getJson(YT_OEMBED(yt[1]));
    if (data && data.title) {
      return {
        dipakai: true,
        judul: pickText(data.title),
        detik: Math.round(Number(data.duration) || 0) || undefined,
        gambar: safeImage(String(data.thumbnail_url || "").replace(/\/(?:default|mqdefault)\.jpg$/, "/hqdefault.jpg")),
        via: "YouTube"
      };
    }
    // oEmbed gagal: coba meta halaman tonton, biasanya masih ada og:title.
    const fromPage = await scrapeMeta(url);
    if (fromPage) return { ...fromPage, via: "YouTube (halaman)" };
    return { dipakai: false, via: "youtube.com", pesan: "Video YouTube-nya tidak ketemu di oEmbed." };
  }

  const vimeo = at.match(VIMEO_ID);
  if (vimeo) {
    const data = await getJson(`https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F${vimeo[1]}`);
    if (data && data.title) {
      return {
        dipakai: true,
        judul: pickText(data.title),
        detik: Math.round(Number(data.duration) || 0) || undefined,
        gambar: safeImage(data.thumbnail_url),
        via: "Vimeo"
      };
    }
    return { dipakai: false, via: "Vimeo", pesan: "Video Vimeo-nya tidak ketemu (mungkin privat)." };
  }

  const dm = at.match(DM_ID);
  if (dm) {
    const data = await getJson(`https://www.dailymotion.com/oembed?url=${encodeURIComponent(url.href)}`);
    if (data && data.title) {
      return {
        dipakai: true,
        judul: pickText(data.title),
        detik: Math.round(Number(data.duration) || 0) || undefined,
        gambar: safeImage(data.thumbnail_url),
        via: "Dailymotion"
      };
    }
  }

  const ar = at.match(ARCHIVE_ID);
  if (ar) {
    const found = await fromArchive(ar[1]);
    if (found) return { dipakai: true, judul: found.title, detik: found.seconds, gambar: found.thumb, via: "Internet Archive" };
    return { dipakai: false, via: "Internet Archive", pesan: "Item archive.org-nya tidak ketemu." };
  }

  if (DIRECT_FILE.test(url.pathname)) {
    return {
      dipakai: false,
      via: "file langsung",
      pesan: "File mentah tidak punya metadata — judul tetap ditulis manual, thumbnail digambar sendiri."
    };
  }

  const fromPage = await scrapeMeta(url);
  if (fromPage) return fromPage;

  return {
    dipakai: false,
    via: host,
    pesan: `${host} tidak kasih metadata ke server (biasanya diblokir Cloudflare). Judul manual tetap jalan.`
  };
}

async function scrapeMeta(url) {
  const html = await getHtml(url.href);
  if (!html) return null;
  const title = pickText(metaFromHtml(html, "og:title") || metaFromHtml(html, "twitter:title") || metaFromHtml(html, "title"));
  if (!title) return null;
  const seconds = Math.round(Number(metaFromHtml(html, "video:duration")) || 0) || undefined;
  const gambar = safeImage(metaFromHtml(html, "og:image") || metaFromHtml(html, "twitter:image"));
  return { dipakai: true, judul: title, detik: seconds, gambar, via: "meta halaman" };
}

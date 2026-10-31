// Peta host video. Situs ini tidak menampung video — yang disimpan cuma alamat,
// jadi pekerjaan utama kode adalah mengenali host dan mengubahnya ke alamat embed.
// Daftar ini juga yang menampilkan halaman /host.

const idOf = (re, text) => (text.match(re) || [])[1] || null;
// Untuk host yang tidak punya alamat embed (halaman videonya juga pemutarnya),
// alamat aslinya yang dipakai.
const page = (id, url) => url.href;

/**
 * Tiap aturan:
 *   hosts   → domain yang dikenali (pencocokan akhir, subdomain ikut)
 *   embed   → ambil id dari URL; null kalau URL-nya bukan halaman video
 *   to      → id (atau URL penuh) jadi alamat embed
 *   frame   → false = host ini biasanya menolak di-iframe, jadi tautan langsung
 *             yang dipakai dan halaman nonton memunculkan tombol "Buka di host asli"
 */
export const HOSTS = [
  {
    key: "youtube",
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    note: "Termasuk youtu.be, /shorts/, dan /live/.",
    embed: (host, path, url) =>
      host === "youtu.be"
        ? idOf(/^\/([\w-]{6,})/, path)
        : idOf(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/, path) || (url.searchParams.get("v") || "").slice(0, 12),
    to: (x) => `https://www.youtube-nocookie.com/embed/${x}`
  },
  {
    key: "bitchute",
    label: "Bitchute",
    hosts: ["bitchute.com"],
    example: "https://www.bitchute.com/video/6yP4k3Z8q1Wd/",
    note: "Favorit konten lokal karena longgar soal sensor.",
    embed: (host, path) => idOf(/^\/(?:video|play|embed)\/([\w]+)/, path),
    to: (x) => `https://www.bitchute.com/embed/${x}/`
  },
  {
    key: "xhamster",
    label: "XHamster",
    hosts: ["xhamster.com", "xhamster.desi", "xhamster1.desi", "xhamster2.com", "xhamster3.com"],
    example: "https://www.xhamster.com/videos/judul-video-22984710",
    embed: (host, path) => idOf(/(\d{6,})/, path),
    to: (x) => `https://www.xhamster.com/embed/${x}`
  },
  {
    key: "xnxx",
    label: "XNXX",
    hosts: ["xnxx.com", "xnxx2.com", "redx.tv"],
    example: "https://www.xnxx.com/video-1abc23f/judul-video",
    embed: (host, path) => idOf(/(?:video-|embed-)(\w{4,})/, path),
    to: (x) => `https://www.xnxx.com/embed/${x}`
  },
  {
    key: "xvideos",
    label: "XVideos",
    hosts: ["xvideos.com", "xvideos.es"],
    example: "https://www.xvideos.com/video43912891/judul-video",
    note: "Dua bentuk alamat: /video43912891/ (angka) dan /video.okvcpmb5d12/ (huruf-angka).",
    embed: (host, path) => idOf(/\/video\.([a-z0-9]{8,})/, path) || idOf(/video(\d{5,})/, path),
    to: (x) => `https://www.xvideos.com/embedframe/${x}`
  },
  {
    key: "pornhub",
    label: "Pornhub",
    hosts: ["pornhub.com", "pornhubselect.com", "pornhub.net"],
    example: "https://www.pornhub.com/view_video.php?viewkey=ph5abc123def456",
    embed: (host, path, url) =>
      idOf(/^\/embed\/([\w-]{6,})/, path) || idOf(/(\d{7,})/, path) || (url.searchParams.get("viewkey") || "").slice(0, 24),
    to: (x) => `https://www.pornhub.com/embed/${x}`
  },
  {
    key: "txxx",
    label: "TXXX",
    hosts: ["txxx.com", "txxx.to", "tnaflix.com"],
    example: "https://tdn.txxx.com/videos/123456/judul-video/",
    embed: (host, path) => idOf(/\/videos?\/(\d{4,})/, path),
    to: (x) => `https://tdn.txxx.com/videos/${x}/embed/`
  },
  {
    key: "eporner",
    label: "Eporner",
    hosts: ["eporner.com"],
    example: "https://www.eporner.com/video-7A8t2Juhur8/miss-nn/",
    note: "Punya API publik, jadi judul & gambarnya bisa diambil otomatis. Lihat npm run isi.",
    // id-nya acak huruf+angka (bukan cuma angka), jadi [\w]+ harus dipakai.
    embed: (host, path) => idOf(/\/video-([\w-]{4,})\//, path),
    to: (x) => `https://www.eporner.com/embed/${x}/`
  },
  {
    key: "youporn",
    label: "YouPorn",
    hosts: ["youporn.com"],
    example: "https://www.youporn.com/watch/1234567/judul-video/",
    embed: (host, path) => idOf(/\/watch\/(\d{5,})/, path),
    to: (x) => `https://www.youporn.com/embed/${x}`
  },
  {
    key: "spankbang",
    label: "SpankBang",
    hosts: ["spankbang.com"],
    example: "https://spankbang.com/abc12/video/judul",
    embed: (host, path) => idOf(/^\/([\w]{5,})\/(?:video|playlist)/, path),
    to: (x) => `https://spankbang.com/${x}/embed/`
  },
  {
    key: "beeg",
    label: "Beeg",
    hosts: ["beeg.com"],
    example: "https://beeg.com/1234567",
    embed: (host, path) => idOf(/^\/(\d{6,})/, path),
    to: (x) => `https://beeg.com/video/${x}`
  },
  {
    key: "javhd",
    label: "JavHD",
    hosts: ["javhd.com"],
    example: "https://www.javhd.com/video-12345-judul",
    embed: (host, path) => idOf(/video-(\d{3,})/, path),
    to: (x) => `https://www.javhd.com/embed/${x}`
  },
  {
    key: "missav",
    label: "MissAV",
    hosts: ["missav.com", "missav.net", "missax.com"],
    example: "https://missav.com/en/abc123",
    note: "Kalau layarnya kosong, pakai tombol buka di host asli.",
    embed: (host, path) => (path.length > 4 ? path.slice(1) : null),
    to: page
  },
  {
    key: "anybunny",
    label: "AnyBunny",
    hosts: ["anybunny.to", "anybunny.plus", "azb.moobi.me"],
    example: "https://anybunny.to/v/12345678/judul",
    embed: (host, path) => idOf(/^\/v\/(\d{5,})/, path),
    to: (x) => `https://anybunny.to/embed_player/${x}/false`
  },
  {
    key: "dailymotion",
    label: "Dailymotion",
    hosts: ["dailymotion.com", "dai.ly"],
    example: "https://www.dailymotion.com/video/x8abcde",
    embed: (host, path) => (host === "dai.ly" ? idOf(/^\/([\w]{4,})/, path) : idOf(/\/video\/([\w]{4,})/, path)),
    to: (x) => `https://geo.dailymotion.com/player.html?video=${x}`
  },
  {
    key: "vimeo",
    label: "Vimeo",
    hosts: ["vimeo.com", "player.vimeo.com"],
    example: "https://vimeo.com/76979871",
    embed: (host, path) => idOf(/^\/(\d{4,})/, path),
    to: (x) => `https://player.vimeo.com/video/${x}`
  },
  {
    key: "archive",
    label: "Internet Archive",
    hosts: ["archive.org", "archive.ph"],
    example: "https://archive.org/details/BigBuckBunny_124",
    embed: (host, path) => idOf(/^\/details\/([\w.-]{3,})/, path),
    to: (x) => `https://archive.org/embed/${x}`
  },
  {
    key: "ok",
    label: "Ok.ru",
    hosts: ["ok.ru"],
    example: "https://ok.ru/video/1234567890123",
    embed: (host, path) => idOf(/video\/?(\d{6,})/, path),
    to: (x) => `https://ok.ru/videoembed/${x}`
  },
  {
    key: "vk",
    label: "VK Video",
    hosts: ["vk.com", "vkvideo.ru"],
    example: "https://vk.com/video-12345_67890",
    frame: false,
    note: "VK minta token halaman, jadi paling andal dibuka di host.",
    embed: () => "page",
    to: page
  },
  {
    key: "facebook",
    label: "Facebook",
    hosts: ["facebook.com", "fb.watch"],
    example: "https://www.facebook.com/reel/1234567890",
    embed: () => "page",
    to: (x, url) => `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.href)}&autoplay=false`
  },
  {
    key: "streamtape",
    label: "StreamTape",
    hosts: ["streamtape.com", "streamtape.to", "streamnn.com"],
    example: "https://streamtape.com/v/AbCdEf12345/judul",
    frame: false,
    embed: () => "page",
    to: page
  },
  {
    key: "upcloud",
    label: "UpCloud / UpStream",
    hosts: ["upcloud.my", "upstream.to", "upvid.cc"],
    example: "https://upstream.to/embed-abc123.html",
    frame: false,
    embed: () => "page",
    to: page
  },
  {
    key: "mixdrop",
    label: "Mixdrop",
    hosts: ["mixdrop.co", "mixdrop.to", "mixdrop.sx", "mixdrp.to"],
    example: "https://mixdrop.to/f/abc123",
    frame: false,
    embed: () => "page",
    to: page
  },
  {
    key: "dood",
    label: "DoodStream",
    hosts: ["jwplyr.com", "vidclr.sbs", "vidslr.sbs", "dood.watch", "dood.pm", "dood.la", "dood.stream", "dood.boo"],
    example: "https://jwplyr.com/e/abc123",
    note: "Cermin jwplyr.com: /e/<kode> adalah pemutarnya dan boleh ditanam. Domain dood.* sering diblokir Cloudflare di server ini.",
    // Kode file DoodStream huruf+angka. Alamat /d/<kode> (unduh) dianggap sama.
    embed: (host, path) => idOf(/^\/(?:e|d)\/([a-z0-9]{6,})/i, path),
    to: (x) => `https://jwplyr.com/e/${x}`
  },
  {
    key: "filemoon",
    label: "Filemoon",
    hosts: ["filemoon.sx", "filemoon.to", "filemo.tv"],
    example: "https://filemoon.sx/e/abc123/judul",
    frame: false,
    embed: () => "page",
    to: page
  },
  {
    key: "sbstream",
    label: "SBStream / HD-1",
    hosts: ["sbstrm.net", "hd-1.me", "vidhidepro.com"],
    example: "https://sbstrm.net/f/abc123",
    frame: false,
    embed: () => "page",
    to: page
  }
];

const PROVIDER_LABEL = Object.fromEntries(HOSTS.map((h) => [h.key, h.label]));
PROVIDER_LABEL.file = "File langsung";
PROVIDER_LABEL.lain = "Eksternal";

const DIRECT_FILE = /\.(mp4|webm|ogv|ogg|m3u8|mov)(\?|#|$)/i;

export function labelOf(provider) {
  return PROVIDER_LABEL[provider] || PROVIDER_LABEL.lain;
}

/** Host yang biasanya menolak di-iframe. */
export function blocksFraming(provider) {
  return HOSTS.some((h) => h.key === provider && h.frame === false);
}

function matchHost(rule, host) {
  return rule.hosts.some((h) => host === h || host.endsWith(`.${h}`));
}

/**
 * @returns {{provider:string, embed:string, direct:string, kind:('iframe'|'video')}|null}
 */
export function resolve(rawUrl) {
  const direct = String(rawUrl || "").trim();
  let url;
  try {
    url = new URL(direct);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname;

  // File video mentah: diputar pakai pemutar bawaan browser, tanpa iframe.
  if (DIRECT_FILE.test(path)) {
    return { provider: "file", embed: direct, direct, kind: "video" };
  }

  for (const rule of HOSTS) {
    if (!matchHost(rule, host)) continue;
    const found = rule.embed(host, path, url);
    if (!found) continue;
    const embed = rule.to(found, url);
    return { provider: rule.key, embed, direct, kind: "iframe" };
  }

  return { provider: "lain", embed: direct, direct, kind: "iframe" };
}

/** Ringkasan host untuk halaman /host. */
export function hostCatalog() {
  const rows = HOSTS.map((rule) => ({
    label: rule.label,
    example: rule.example,
    note: rule.note || (rule.frame === false ? "Sering menolak iframe." : ""),
    cara: rule.key === "facebook" ? "Pemutar Facebook" : rule.frame === false ? "Sering harus dibuka di host" : "iframe embed"
  }));
  rows.unshift({
    label: "File langsung (.mp4/.webm/.m3u8)",
    example: "https://cdn.example.com/colmek.mp4",
    note: "Diputar pakai pemutar bawaan browser.",
    cara: "Pemutar browser"
  });
  return rows;
}

// Kenali host video dari URL yang ditempel. Tidak ada upload: yang kita simpan
// cuma alamat, dan pemutar video tetap di server host aslinya.

const DIRECT_FILE = /\.(mp4|webm|ogv|ogg|m3u8|mov)(\?|#|$)/i;

const PROVIDER_LABEL = {
  youtube: "YouTube",
  bitchute: "Bitchute",
  xhamster: "XHamster",
  xnxx: "XNXX",
  ivideopop: "iVideoPop",
  vimeo: "Vimeo",
  facebook: "Facebook",
  file: "File langsung",
  streamtape: "StreamTape",
  upcloud: "UpCloud",
  mixdrop: "Mixdrop",
  dood: "Dood",
  lain: "Eksternal"
};

const NO_FRAME = new Set(["streamtape", "upcloud", "mixdrop", "dood"]);

export function labelOf(provider) {
  return PROVIDER_LABEL[provider] || PROVIDER_LABEL.lain;
}

/** Host ini biasanya menolak di-iframe, jadi tautan langsung lebih andal. */
export function blocksFraming(provider) {
  return NO_FRAME.has(provider);
}

function idFrom(match) {
  return match ? match[1] : null;
}

/**
 * @returns {{provider:string, embed:string, kind:('iframe'|'video'), direct:string}}
 */
export function resolve(rawUrl) {
  const direct = String(rawUrl || "").trim();
  let u;
  try {
    u = new URL(direct);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname;

  // YouTube
  if (host === "youtu.be") {
    const id = idFrom(path.match(/^\/([\w-]{6,})/));
    if (id) return out("youtube", `https://www.youtube-nocookie.com/embed/${id}`, direct);
  }
  if (host.endsWith("youtube.com")) {
    const id =
      idFrom(path.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/)) ||
      idFrom(u.searchParams.get("v") ? `/x${u.searchParams.get("v")}`.match(/^\/x([\w-]{6,})/) : null);
    if (id) return out("youtube", `https://www.youtube-nocookie.com/embed/${id}`, direct);
  }

  // Bitchute — dulu favorit konten lokal karena bebas sensor. Halaman videonya
  // memakai /video/<id>/, tautan lawas memakai /play/<id>/.
  if (host.endsWith("bitchute.com")) {
    const id = idFrom(path.match(/^\/(?:video|play|embed)\/([\w]+)/));
    if (id) return out("bitchute", `https://www.bitchute.com/embed/${id}/`, direct);
  }

  // XHamster
  if (host.endsWith("xhamster.com") || host.endsWith("xhamster1.desi")) {
    const id = idFrom(path.match(/(\d{6,})/));
    if (id) return out("xhamster", `https://www.xhamster.com/embed/${id}`, direct);
  }

  // XNXX
  if (host.endsWith("xnxx.com") || host.endsWith("xnxx2.com")) {
    const id = idFrom(path.match(/video-(\w+)/));
    if (id) return out("xnxx", `https://redxnxx.net/player-flv.php?id=${id}`, direct);
  }

  // iVideoPop / Gfunamaker — sering dipakai untuk konten Indonesia
  if (host.includes("ivideopop") || host.includes("gfunamaker")) {
    return out("ivideopop", direct, direct);
  }

  // Vimeo
  if (host === "vimeo.com") {
    const id = idFrom(path.match(/^\/(\d+)/));
    if (id) return out("vimeo", `https://player.vimeo.com/video/${id}`, direct);
  }

  // Facebook / fb.watch
  if (host.includes("facebook.com") || host === "fb.watch") {
    const q = new URLSearchParams({ href: direct, autoplay: "false" });
    return out("facebook", `https://www.facebook.com/plugins/video.php?${q}`, direct);
  }

  // Host mirror yang tidak bisa di-iframe
  if (host.includes("streamtape") || host.includes("streamnn")) return out("streamtape", direct, direct);
  if (host.includes("upcloud") || host.includes("upstream")) return out("upcloud", direct, direct);
  if (host.includes("mixdrop")) return out("mixdrop", direct, direct);
  if (host.includes("dood.")) return out("dood", direct, direct);

  // File video mentah: diputar pakai pemutar bawaan browser
  if (DIRECT_FILE.test(path)) return out("file", direct, direct, "video");

  return out("lain", direct, direct);
}

function out(provider, embed, direct, kind = "iframe") {
  return { provider, embed, direct, kind };
}

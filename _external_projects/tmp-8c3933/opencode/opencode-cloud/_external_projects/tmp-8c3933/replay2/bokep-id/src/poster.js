// Thumbnail digambar sendiri sebagai SVG dari slug video.
//
// Kenapa bukan cuplikan帧 dari host? Karena ambil gambar dari host berarti tiap
// penonton bikin request ke host itu — selain lambat, itu membocorkan traffic kita.
// Dengan SVG lokal: nol request keluar, ukurannya ~1KB, dan tetap konsisten.
//
// Bug lama yang perlu diingat: hash FNV itu angka 32 bit. Pakai `>>` bikin angka
// jadi negatif dan index palet kacau (thumbnail hilang semua). Harus `>>>`.

const PALETTES = [
  ["#123c33", "#1f6b52", "#7fe3b0"],
  ["#3a1030", "#6d1f4e", "#ff5fa2"],
  ["#13294b", "#1f4f8c", "#6fc0ff"],
  ["#3d2208", "#7a4a12", "#ffc36b"],
  ["#2b0f36", "#5c2470", "#c98cff"],
  ["#3b1418", "#7c2a2f", "#ff8f7a"]
];

/** FNV-1a, sengaja 32 bit supaya hasil hash() selalu positif. */
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Warna dasar thumbnail, dipakai CSS sebagai cadangan kalau gambarnya gagal. */
export function posterPalette(slug) {
  const [deep, mid, accent] = PALETTES[hash(String(slug)) % PALETTES.length];
  return { deep, mid, accent };
}

export function durationText(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Lima susunan bentuk; pilihannya deterministik dari slug. */
function shapes(variant, accent) {
  const soft = `fill="${accent}" opacity="0.18"`;
  const line = `stroke="${accent}" stroke-width="6" fill="none" opacity="0.35"`;
  switch (variant) {
    case 0:
      return `<circle cx="690" cy="360" r="150" ${soft}/><circle cx="690" cy="360" r="230" ${line}/>`;
    case 1:
      return `<ellipse cx="300" cy="430" rx="260" ry="90" ${soft}/><ellipse cx="640" cy="250" rx="150" ry="60" ${soft}/>`;
    case 2:
      return `<rect x="120" y="120" width="300" height="300" rx="40" ${soft}/><rect x="520" y="300" width="320" height="180" rx="24" ${soft}/>`;
    case 3:
      return `<path d="M80 470 C 300 180, 560 560, 900 130" ${line}/><path d="M80 520 C 340 300, 620 610, 900 260" ${line}/>`;
    default:
      return `<circle cx="480" cy="270" r="200" ${soft}/><path d="M180 540 L480 200 L780 540 Z" ${soft}/>`;
  }
}

/**
 * @param {string} slug   pengungkit tetap: thumbnail video tidak pernah berubah
 * @param {string} title  kalau diisi, judul ikut ditulis (varian untuk og:image)
 */
export function posterSvg(slug, title = "") {
  const seed = hash(String(slug));
  const [deep, mid, accent] = PALETTES[seed % PALETTES.length];
  const variant = Math.floor(seed / 7) % 5;
  const tilt = (seed % 9) - 4;
  const label = title
    ? `<text x="60" y="470" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#fdf6ec" opacity="0.94">${escapeXml(wrapTitle(title))}</text>`
    : "";
  const strip = title
    ? ""
    : `<rect x="0" y="470" width="960" height="70" fill="#000" opacity="0.28"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${mid}"/><stop offset="0.72" stop-color="${deep}"/>
    </linearGradient>
    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="none"/><path d="M0 0 H8" stroke="#000" stroke-opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="960" height="540" fill="url(#bg)"/>
  <g transform="rotate(${tilt} 480 270)">
    <rect x="-120" y="-120" width="1200" height="780" fill="url(#grid)"/>
    ${shapes(variant, accent)}
  </g>
  ${strip}
  <g transform="translate(60 60)">
    <rect width="64" height="64" rx="14" fill="${accent}" opacity="0.92"/>
    <text x="32" y="42" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#1d1915">BK</text>
  </g>${label}
</svg>`;
}

function wrapTitle(title) {
  const words = String(title).split(/\s+/).slice(0, 9).join(" ");
  return words.length > 46 ? `${words.slice(0, 43)}...` : words;
}

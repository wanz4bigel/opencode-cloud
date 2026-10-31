// Semua HTML dibuat di server: tidak ada framework, tidak ada build step.
import { categoriesWithCounts, demoCount, popularVideos, stats } from "./db.js";
import { blocksFraming, hostCatalog, labelOf } from "./hosts.js";
import { durationText, escapeXml, posterPalette } from "./poster.js";

export const esc = escapeXml;

export function fmtViews(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1).replace(/\.0$/, "")}rb`;
  return String(v);
}

function qs(base, extra) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...extra })) {
    if (v === null || v === undefined || v === "" ) continue;
    params.set(k, String(v));
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

const NAV = [
  { href: "/", label: "Terbaru", pada: (p, q) => p === "/" && q.urutan !== "populer" },
  { href: "/?urutan=populer", label: "Populer", pada: (p, q) => p === "/" && q.urutan === "populer" },
  { href: "/katalog", label: "Kategori", pada: (p) => p === "/katalog" || p.startsWith("/k/") || p.startsWith("/tag/") },
  { href: "/host", label: "Sumber", pada: (p) => p === "/host" },
  { href: "/admin", label: "Kelola", pada: (p) => p.startsWith("/admin") }
];

function nav({ path, query }) {
  const links = NAV.map((item) => `<a class="${item.pada(path, query) ? "is-current" : ""}" href="${item.href}">${item.label}</a>`).join("");
  return `<nav class="topnav" aria-label="Utama">${links}</nav>`;
}

function header({ path, query, gate }) {
  return `<header class="head">
  <div class="head__row">
    <a class="brand" href="/">
      <span class="brand__mark">BK</span>
      <span class="brand__text">BokepKita</span>
      <span class="brand__badge">18+</span>
    </a>
    <form class="search" method="get" action="/cari" role="search">
      <input type="search" name="q" placeholder="cari: janda, abg, toge..." value="${esc(query.q || "")}" aria-label="Cari video">
      <button class="btn btn--go" type="submit">Cari</button>
    </form>
    ${gate ? "" : nav({ path, query })}
  </div>
</header>`;
}

function ageGate() {
  return `<div class="gate">
  <div class="gate__box">
    <p class="gate__kicker">Situs dewasa</p>
    <h2 class="gate__title">Khusus 18+</h2>
    <p class="gate__text">Masuk kalau kamu sudah 18 tahun ke atas.</p>
    <div class="gate__actions">
      <a class="btn btn--go" href="/sudah-18?next=/">Saya sudah 18</a>
      <a class="btn" href="https://google.com" rel="nofollow">Saya keluar</a>
    </div>
  </div>
</div>`;
}

export function layout({ title, description = "Koleksi video colmek Indonesia, semuanya embed dari host — tidak ada upload.", path = "/", query = {}, body, ogImage, gate = false }) {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:none">
<meta name="rating" content="adult">
<meta property="og:site_name" content="BokepKita">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:image" content="${esc(ogImage || "")}">
<meta name="theme-color" content="#17130f">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Umpan BokepKita" href="/rss.xml">
<link rel="stylesheet" href="/static/style.css">
</head>
<body class="${gate ? "is-gated" : ""}">${header({ path, query, gate })}
<main class="wrap">${body}</main>
${footer()}
<script src="/static/app.js" defer></script>
${gate ? ageGate() : ""}
</body>
</html>`;
}

/** Kartu video. Gambar tetap dari /t/, warna dasar kartu jadi cadangan kalau gagal. */
export function card(video, { featured = false } = {}) {
  const href = `/v/${video.slug}`;
  const tone = posterPalette(video.slug);
  return `<article class="card${featured ? " card--featured" : ""}">
  <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true" style="--th:${tone.mid};--th2:${tone.deep}">
    <img src="/t/${video.slug}.svg" alt="" width="960" height="540" loading="lazy" decoding="async">
    <span class="card__dur">${durationText(video.duration)}</span>
    <span class="card__play" aria-hidden="true"></span>
    ${video.demo ? '<span class="tag tag--demo">Contoh</span>' : ""}
  </a>
  <h3 class="card__title"><a href="${href}">${esc(video.title)}</a></h3>
  <p class="card__meta">
    ${video.category ? `<a href="/k/${video.category_slug}">${esc(video.category)}</a>` : "<span>Tanpa kategori</span>"}
    <span>·</span><span>${fmtViews(video.views)} nonton</span>
    <span>·</span><span>${esc(labelOf(video.provider))}</span>
  </p>
</article>`;
}

function grid(videos) {
  if (!videos.length) return "";
  const [first, ...rest] = videos;
  return `<div class="grid">${card(first, { featured: videos.length > 4 })}${rest.map((v) => card(v)).join("")}</div>`;
}

function rail(videos) {
  if (!videos.length) return "";
  return `<section class="rail-wrap">
  <h2 class="section-title">Sering dibuka orang</h2>
  <div class="rail">${videos
    .map(
      (v) => `<a class="rail__item" href="/v/${v.slug}" style="--th:${posterPalette(v.slug).mid};--th2:${posterPalette(v.slug).deep}">
      <img src="/t/${v.slug}.svg" alt="" width="480" height="270" loading="lazy" decoding="async">
      <span class="rail__dur">${durationText(v.duration)}</span>
      <span class="rail__title">${esc(v.title)}</span>
    </a>`
    )
    .join("")}</div></section>`;
}

function pager({ pages, current, path, query }) {
  if (pages <= 1) return "";
  const prev = current > 1 ? `<a class="btn" href="${path}${qs(query, { halaman: current - 1 })}">Sebelumnya</a>` : "";
  const berikut = current < pages ? `<a class="btn" href="${path}${qs(query, { halaman: current + 1 })}">Berikutnya</a>` : "";
  return `<div class="pager">${prev}<p class="pager__note">Halaman ${current} dari ${pages}</p>${berikut}</div>`;
}

function footer() {
  const cats = categoriesWithCounts().slice(0, 8);
  const s = stats();
  return `<footer class="foot">
  <div class="foot__cols">
    <div>
      <h4>BokepKita</h4>
      <p>BokepKita cuma menempel video dari host lain — ${hostCatalog().length} sumber dikenal.
        Tidak ada satu pun file video yang kami unggah, jadi tidak ada server video yang perlu kami bayar.</p>
      <p><a class="foot__link" href="/host">Lihat daftar sumber yang didukung</a></p>
    </div>
    <div>
      <h4>Kategori populer</h4>
      <ul class="foot__list">${cats
        .map((c) => `<li><a href="/k/${c.slug}">${esc(c.name)}</a> <span>${c.total}</span></li>`)
        .join("")}</ul>
    </div>
    <div>
      <h4>Ekonomi situs</h4>
      <ul class="foot__list">
        <li>Video <span>${s.videos}</span></li>
        <li>Kategori <span>${s.categories}</span></li>
        <li>View <span>${fmtViews(s.views)}</span></li>
        <li>File di server <span>0</span></li>
      </ul>
      <p><a class="foot__link" href="/rss.xml">Umpan RSS</a> · <a class="foot__link" href="/sitemap.xml">Sitemap</a></p>
    </div>
  </div>
  <p class="foot__legal">Katalog &amp; hak siar video milik host masing-masing. Situs ini hanya menyediakan tautan.</p>
</footer>`;
}

/** Muncul cuma selama katalog masih berisi video bawaan. */
function demoNotice() {
  const n = demoCount();
  if (!n) return "";
  return `<aside class="notice">
  <b>${n} video di bawah masih contoh.</b>
  Judulnya ditulis untuk uji tampilan, videonya file uji (Big Buck Bunny, Sintel, video musik) — makanya judul dan isinya beda.
  Tambahkan video sungguhan di <a href="/admin">panel kelola</a>, atau pakai <code>npm run asli</code> buat narik judul &amp; gambar asli dari host.
</aside>`;
}

export function homePage({ rows, pages, current, query }) {
  const sortLabel = query.urutan === "populer" ? "Paling banyak ditonton" : "Barang baru malam ini";
  const tubuh = rows.length ? grid(rows) : `<p class="empty">Katalog masih kosong. <a href="/admin">Tempel URL pertama</a>.</p>`;
  const body = `
  <section class="strip">
    <h1 class="strip__title">${sortLabel}</h1>
    <p class="strip__note">${rows.length} video di halaman ini — semuanya ditempel dari host, tidak ada satu file pun yang diunggah ke sini.</p>
    <div class="switch" role="group" aria-label="Urutan">
      <a class="${query.urutan !== "populer" ? "is-on" : ""}" href="/${qs(query, { urutan: null, halaman: null })}">Terbaru</a>
      <a class="${query.urutan === "populer" ? "is-on" : ""}" href="/${qs(query, { urutan: "populer", halaman: null })}">Populer</a>
    </div>
  </section>
  ${chips()}
  ${demoNotice()}
  ${tubuh}
  ${rail(popularVideos(8).filter((v) => !rows.slice(0, 6).some((r) => r.id === v.id)))}
  ${pager({ pages, current, path: "/", query })}`;
  return layout({ title: "BokepKita — video colmek Indonesia, tanpa upload", path: "/", query, body });
}

function chips() {
  const cats = categoriesWithCounts().filter((c) => c.total).slice(0, 9);
  if (!cats.length) return "";
  return `<ul class="chips">${cats
    .map((c) => `<li><a href="/k/${c.slug}">${esc(c.name)} <span>${c.total}</span></a></li>`)
    .join("")}</ul>`;
}

export function catalogPage() {
  const cats = categoriesWithCounts();
  const body = `
  <section class="strip">
    <h1 class="strip__title">Semua kategori</h1>
    <p class="strip__note">${cats.length} kategori · ${cats.reduce((a, c) => a + c.total, 0)} video.</p>
  </section>
  <ul class="catalog">${cats
    .map((c) => `<li><a href="/k/${c.slug}"><span>${esc(c.name)}</span><span>${c.total}</span></a></li>`)
    .join("")}</ul>`;
  return layout({ title: `Kategori (${cats.length}) — BokepKita`, path: "/katalog", query: {}, body });
}

export function listPage({ heading, note, rows, pages, current, path, query }) {
  const body = `
  <section class="strip">
    <h1 class="strip__title">${esc(heading)}</h1>
    <p class="strip__note">${esc(note)}</p>
  </section>
  ${rows.length ? grid(rows) : `<p class="empty">Belum ada video di sini. <a href="/admin">Tempel satu URL</a> dan video ini langsung tampil.</p>`}
  ${pager({ pages, current, path, query })}`;
  return layout({ title: `${heading} — BokepKita`, path, query, body });
}

export function searchPage({ query, rows, pages, current }) {
  const heading = query.q ? `Hasil pencarian: ${query.q}` : "Pencarian";
  const body = `
  <section class="strip">
    <h1 class="strip__title">${esc(heading)}</h1>
    <p class="strip__note">${rows.length ? `${rows.length} video ketemu.` : "Tidak ada yang cocok. Coba kata lain, misalnya <i>janda</i>, <i>abg</i>, atau <i>kos</i>."}</p>
  </section>
  ${rows.length ? grid(rows) : ""}
  ${pager({ pages, current, path: "/cari", query })}`;
  return layout({ title: `${heading} — BokepKita`, path: "/cari", query, body });
}

export function hostsPage() {
  const rows = hostCatalog();
  const body = `
  <section class="strip">
    <h1 class="strip__title">Sumber yang didukung</h1>
    <p class="strip__note">
      Tidak ada video yang diunggah ke sini. Tempel alamat dari salah satu host di bawah di
      <a href="/admin">panel kelola</a>, dan BokepKita langsung tahu cara memutarnya.
    </p>
  </section>
  <ul class="hostlist">${rows
    .map(
      (h) => `<li class="hostlist__item">
      <div>
        <h3 class="hostlist__name">${esc(h.label)}</h3>
        <p class="hostlist__example"><code>${esc(h.example)}</code></p>
        ${h.note ? `<p class="hostlist__note">${esc(h.note)}</p>` : ""}
      </div>
      <span class="badge${h.cara.startsWith("Sering") ? " badge--warn" : ""}">${esc(h.cara)}</span>
    </li>`
    )
    .join("")}</ul>
  <p class="empty">Host yang tidak ada di daftar tetap bisa ditempel — ia masuk sebagai
    <b>Eksternal</b> dan dicoba lewat iframe. Kalau host itu menolak, tombol
    <b>Buka di host asli</b> di halaman nonton yang bekerja.</p>`;
  return layout({ title: `Sumber yang didukung (${rows.length}) — BokepKita`, path: "/host", query: {}, body });
}

export function watchPage({ video, related, host }) {
  const tone = posterPalette(video.slug);
  const ditolak = blocksFraming(video.provider);
  const pemutar =
    video.kind === "video"
      ? `<video class="player__media" controls playsinline preload="metadata" poster="${esc(video.poster || `/t/${video.slug}.svg`)}" src="${esc(video.embed)}"></video>`
      : `<iframe class="player__media" src="${esc(video.embed)}" title="${esc(video.title)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  const queue = related.length
    ? related
        .map(
          (v) => `<li><a href="/v/${v.slug}"${v.id === video.id ? ' class="is-current"' : ""}>
        <span class="side__media" style="--th:${posterPalette(v.slug).mid};--th2:${posterPalette(v.slug).deep}">
          <img src="/t/${v.slug}.svg" alt="" width="480" height="270" loading="lazy" decoding="async">
          <span class="side__dur">${durationText(v.duration)}</span>
        </span>
        <span class="side__text">
          <span class="side__title">${esc(v.title)}</span>
          <span class="side__meta">${esc(v.category || "Tanpa kategori")} · ${fmtViews(v.views)} nonton · ${esc(labelOf(v.provider))}</span>
        </span></a></li>`
        )
        .join("")
    : `<p class="empty empty--sm">Belum ada video lain di kategori ini.</p>`;

  const body = `
  <article class="watch">
    <div class="watch__main">
      <div class="player" style="--th:${tone.mid};--th2:${tone.deep}">${pemutar}</div>
      ${ditolak
        ? `<p class="watch__note">Host <b>${esc(labelOf(video.provider))}</b> biasanya menolak di-iframe.
           Kalau layarnya kosong, pakai tombol <b>Buka di host asli</b> di bawah.</p>`
        : ""}
      <h1 class="watch__title">${esc(video.title)}</h1>
      <div class="watch__facts">
        <p><span>Durasi</span><b>${durationText(video.duration)}</b></p>
        <p><span>Diputar</span><b>${fmtViews(video.views)} kali</b></p>
        <p><span>Host</span><b>${esc(labelOf(video.provider))}</b></p>
        ${video.category ? `<p><span>Kategori</span><b><a href="/k/${video.category_slug}">${esc(video.category)}</a></b></p>` : ""}
      </div>
      <div class="watch__actions">
        <button class="btn btn--go" type="button" data-copy="${esc(video.embed)}">Salin tautan</button>
        <a class="btn" href="${esc(video.url)}" target="_blank" rel="noopener nofollow">Buka di host asli</a>
      </div>
      ${(video.tags || "").split(",").filter(Boolean).length
        ? `<ul class="tags">${video.tags
            .split(",")
            .filter(Boolean)
            .map((t) => `<li><a class="tag" href="/tag/${encodeURIComponent(t)}">#${esc(t)}</a></li>`)
            .join("")}</ul>`
        : ""}
      ${video.demo
        ? `<p class="watch__note"><b>Ini video contoh.</b> Judulnya ditulis untuk uji tampilan; videonya file uji dari
           host publik. Ganti lewat <a href="/admin">panel kelola</a> atau jalankan <code>npm run asli</code>
           untuk mengambil judul &amp; gambar asli dari host.</p>`
        : ""}
    </div>
    <aside class="watch__side">
      <h2 class="section-title section-title--sm">Lanjut ke berikutnya</h2>
      <ul class="side">${queue}</ul>
    </aside>
  </article>`;

  return layout({
    title: `${video.title} — BokepKita`,
    description: `${video.title} · durasi ${durationText(video.duration)} · diputar dari ${labelOf(video.provider)}.`,
    path: `/v/${video.slug}`,
    query: {},
    body,
    ogImage: video.poster || `${host}/p/${video.slug}.svg`
  });
}

export function notFoundPage(message = "Halaman tidak ketemu.") {
  const body = `<section class="strip">
    <h1 class="strip__title">404</h1>
    <p class="strip__note">${esc(message)}</p>
    <p class="empty"><a href="/">Kembali ke beranda</a> atau lihat <a href="/katalog">semua kategori</a>.</p>
  </section>`;
  return layout({ title: "404 — BokepKita", path: "/", query: {}, body });
}

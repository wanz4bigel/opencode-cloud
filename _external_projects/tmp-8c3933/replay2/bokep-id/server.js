// BokepKita — HTTP murni + SQLite bawaan Node. Tidak ada dependensi npm,
// tidak ada build step. Semua halaman dirender di server.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addVideo,
  applyHostInfo,
  bumpViews,
  categoriesWithCounts,
  categoryIdBySlug,
  countVideos,
  deleteVideo,
  db,
  listFetchable,
  listVideos,
  popularVideos,
  relatedVideos,
  stats,
  videoBySlug
} from "./src/db.js";
import { hostCatalog, labelOf } from "./src/hosts.js";
import { durationText, posterSvg } from "./src/poster.js";
import { fetchInfo } from "./src/info.js";
import { adminPage } from "./src/admin.js";
import {
  catalogPage,
  esc,
  homePage,
  hostsPage,
  layout,
  listPage,
  notFoundPage,
  searchPage,
  watchPage
} from "./src/views.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "public");
const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gus";
// Rute yang tidak pernah ditutup gerbang 18+: aset, tombol konfirmasi, umpan.
const TERBUKA = /^(\/static\/|\/sudah-18|\/t\/|\/p\/|\/rss\.xml|\/sitemap\.xml|\/robots\.txt)/;

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/rss+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const done = Symbol("selesai");

/** Penonton dihitung per IP per video, ditimpa tiap 30 menit. Di memori saja. */
const viewCache = new Map();
const JENDELA = 30 * 60 * 1000;
function catatPenonton(ip, video) {
  const kunci = `${ip}|${video.id}`;
  const tadi = viewCache.get(kunci);
  if (tadi && Date.now() - tadi < JENDELA) return false;
  viewCache.set(kunci, Date.now());
  if (viewCache.size > 5000) viewCache.clear();
  bumpViews(video.id);
  return true;
}

function readCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function readBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 200_000) break;
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function hostOf(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const fwd = req.headers["x-forwarded-proto"];
  const proto = typeof fwd === "string" ? fwd.split(",")[0].trim() : "http";
  return `${proto}://${req.headers.host}`;
}

async function serveStatic(req, res, pathname) {
  const rel = pathname.slice("/static/".length);
  let file;
  try {
    file = await readFile(path.join(publicDir, rel));
  } catch {
    return false;
  }
  const ext = path.extname(rel).toLowerCase();
  res.writeHead(200, {
    "content-type": MIME[ext] || "application/octet-stream",
    "cache-control": "public, max-age=3600"
  });
  res.end(req.method === "HEAD" ? undefined : file);
  return true;
}

/** Gambar thumbnail: /t/<slug>.svg polos, /p/<slug>.svg berjudul (buat og:image). */
function servePoster(res, pathname, denganJudul) {
  const slug = decodeURIComponent(pathname.slice(3)).replace(/\.svg$/i, "");
  const video = videoBySlug(slug);
  if (!video) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Thumbnail tidak ketemu.\n");
    return done;
  }
  res.writeHead(200, {
    "content-type": MIME[".svg"],
    // Sengaja cuma 1 jam: kalau format thumbnail berubah, browser tidak
    // menahan versi rusak seharian penuh.
    "cache-control": "public, max-age=3600",
    "x-content-type-options": "nosniff"
  });
  res.end(posterSvg(video.slug, denganJudul ? video.title : ""));
  return done;
}

function rss(host) {
  const { rows } = listVideos({ per: 30 });
  const item = (v) => `<item>
    <title>${esc(v.title)}</title>
    <link>${host}/v/${v.slug}</link>
    <guid isPermaLink="true">${host}/v/${v.slug}</guid>
    <pubDate>${new Date(`${String(v.added_at).replace(" ", "T")}Z`).toUTCString()}</pubDate>
    <description>${esc(`${v.title} · durasi ${durationText(v.duration)} · diputar dari ${labelOf(v.provider)}.`)}</description>
  </item>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>BokepKita — video colmek terbaru</title>
  <link>${host}/</link>
  <description>Video colmek Indonesia, semua embed dari host.</description>
${rows.map(item).join("\n")}
</channel></rss>`;
}

function sitemap(host) {
  const { rows } = listVideos({ per: 5000 });
  const l = (loc, prio) => `  <url><loc>${loc}</loc><changefreq>daily</changefreq><priority>${prio}</priority></url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${l(`${host}/`, "1.0")}
${l(`${host}/katalog`, "0.6")}
${categoriesWithCounts().map((c) => l(`${host}/k/${c.slug}`, "0.7")).join("\n")}
${rows.map((v) => l(`${host}/v/${v.slug}`, "0.9")).join("\n")}
</urlset>`;
}

/** Panggil metadata host lalu timpa judul/durasi/gambar yang tersimpan. */
export async function samakanJudul({ hanyaContoh = false, batas = 200 } = {}) {
  const kandidat = listFetchable({ hanyaContoh, batas });
  let diubah = 0;
  let gambar = 0;
  let dilewati = 0;
  for (const video of kandidat) {
    const info = await fetchInfo(video.url);
    if (!info.dipakai) {
      dilewati += 1;
      continue;
    }
    if (applyHostInfo(video.id, { title: info.judul, duration: info.detik, poster: info.gambar })) {
      diubah += 1;
      if (info.gambar) gambar += 1;
    }
  }
  return { diubah, gambar, dilewati, dicek: kandidat.length };
}

async function handleAdmin(req, res, url, cookies) {
  const { pathname } = url;
  const host = hostOf(req);
  const form = req.method === "POST" ? await readBody(req) : null;
  const token = url.searchParams.get("token") || cookies.admin || (form && form.get("token")) || "";
  let kind = "ok";

  if (token !== ADMIN_TOKEN) {
    if (token) return page(adminPage({ token: null, note: "Kata kunci salah.", host }), 401);
    return page(adminPage({ token: null, host }));
  }

  // Kata kunci diingat di cookie, jadi berpindah halaman panel tidak perlu
  // menyeret ?token= di setiap tautan.
  if (cookies.admin !== ADMIN_TOKEN) {
    res.appendHeader("set-cookie", `admin=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict`);
  }

  if (req.method === "POST") {
    let note;
    let kind = "ok";

    if (pathname === "/admin/tambah") {
      const urlVideo = (form.get("url") || "").trim();
      let judul = (form.get("judul") || "").trim();
      let durasi = Number(form.get("durasi")) || 0;
      let poster = "";
      let pesanMeta = "";

      if (form.get("ambil") === "1") {
        const info = await fetchInfo(urlVideo);
        if (info.dipakai) {
          judul = judul && !/^(contoh|tes|test)$/i.test(judul) ? judul : info.judul;
          durasi = durasi || info.detik || 0;
          poster = info.gambar || "";
          pesanMeta = ` Judul${info.detik ? " & durasi" : ""}${info.gambar ? " & gambar" : ""} diambil dari ${info.via}.`;
        } else {
          pesanMeta = ` ${info.pesan || `${info.via} tidak kasih metadata.`}`;
        }
      }

      const hasil = addVideo({
        title: judul,
        url: urlVideo,
        categoryId: form.get("kategori") ? Number(form.get("kategori")) : null,
        tags: form.get("tags") || "",
        duration: durasi,
        poster
      });
      if (hasil.error) {
        note = hasil.error;
        kind = "err";
      } else {
        note = `Video disimpan. Host terdeteksi: ${labelOf(hasil.provider)}.${pesanMeta}`;
      }
    } else if (pathname === "/admin/impor") {
      const categoryId = form.get("kategori") ? Number(form.get("kategori")) : null;
      const mauAmbil = form.get("ambil") === "1";
      let ditambah = 0;
      const gagal = [];
      for (const baris of (form.get("daftar") || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)) {
        const [sebelum, sesudah] = baris.split("|").map((s) => (s || "").trim());
        const urlVideo = sebelum.startsWith("http") ? sebelum : sesudah || "";
        let judul = sebelum.startsWith("http") ? "" : sebelum;
        let durasi = 0;
        let poster = "";
        if (mauAmbil || !judul) {
          const info = await fetchInfo(urlVideo);
          if (info.dipakai) {
            judul = judul || info.judul;
            durasi = info.detik || 0;
            poster = info.gambar || "";
          }
        }
        const hasil = addVideo({ title: judul || urlVideo, url: urlVideo, categoryId, tags: "", duration: durasi, poster });
        if (hasil.ok) ditambah += 1;
        else gagal.push(judul || baris);
      }
      note = `${ditambah} video ditambahkan${gagal.length ? ` — gagal: ${gagal.join(", ")}` : ""}.`;
    } else if (pathname === "/admin/samakan") {
      const hasil = await samakanJudul({
        hanyaContoh: form.get("contoh") === "1",
        batas: Math.min(300, Math.max(1, Number(form.get("batas")) || 30))
      });
      note = `${hasil.diubah} dari ${hasil.dicek} video disamakan dengan judul aslinya${
        hasil.gambar ? `, ${hasil.gambar} pakai gambar asli` : ""
      }${hasil.dilewati ? ` — ${hasil.dilewati} host tidak kasih metadata` : ""}.`;
    } else if (pathname.startsWith("/admin/hapus/")) {
      const id = Number(pathname.split("/")[3]);
      note = deleteVideo(id) ? "Tautan video dihapus dari katalog." : "Video itu sudah tidak ada.";
    } else {
      note = "Aksi tidak dikenali.";
      kind = "err";
    }

    res.appendHeader("set-cookie", `bkpesan=${encodeURIComponent(note)}; Path=/; Max-Age=120; SameSite=Lax`);
    res.writeHead(303, { location: `/admin?token=${encodeURIComponent(token)}` });
    res.end();
    return done;
  }

  const note = cookies.bkpesan ? decodeURIComponent(cookies.bkpesan) : "";
  res.appendHeader("set-cookie", "bkpesan=; Path=/; Max-Age=0; SameSite=Lax");
  return page(adminPage({ token, note, kind, host }));
}

function page(html, status = 200) {
  return { html, status };
}

async function route(req, res, url, cookies) {
  const { pathname } = url;
  const host = hostOf(req);
  const query = Object.fromEntries(url.searchParams.entries());

  const kirim = (hasil) => {
    res.writeHead(hasil.status, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : hasil.html);
    return done;
  };
  const raw = (text, type, status = 200) => {
    res.writeHead(status, { "content-type": type, "cache-control": "public, max-age=300" });
    res.end(text);
    return done;
  };
  const redirect = (lokasi, status = 302) => {
    res.writeHead(status, { location: lokasi });
    res.end();
    return done;
  };

  if (pathname === "/sudah-18") {
    const next = String(query.next || "/").startsWith("/") ? String(query.next || "/") : "/";
    res.appendHeader("set-cookie", "usia=1; Path=/; Max-Age=31536000; SameSite=Lax");
    return redirect(next);
  }

  // Gerbang 18+ dipasang di server, bukan modal JavaScript: kontennya ada di
  // bawah lapisan, tapi pengunjung baru & mesin pencari tidak melihatnya.
  const gerbang = !cookies.usia && !TERBUKA.test(pathname) && !pathname.startsWith("/admin");

  if (pathname.startsWith("/static/")) {
    const ok = await serveStatic(req, res, pathname);
    if (ok) return done;
    return kirim(page(notFoundPage("Berkas tidak ketemu."), 404));
  }
  if (pathname.startsWith("/t/")) return servePoster(res, pathname, false);
  if (pathname.startsWith("/p/")) return servePoster(res, pathname, true);

  if (pathname === "/") {
    const data = listVideos({
      sort: query.urutan === "populer" ? "populer" : "terbaru",
      page: Number(query.halaman) || 1,
      per: 24
    });
    return kirim(page(homePage({ ...data, query, gate: gerbang })));
  }

  if (pathname === "/host") return kirim(page(hostsPage()));
  if (pathname === "/katalog" || (pathname === "/cari" && !query.q)) return kirim(page(catalogPage()));

  if (pathname === "/cari") {
    const data = listVideos({ query: query.q, page: Number(query.halaman) || 1, per: 24 });
    return kirim(page(searchPage({ query, ...data, gate: gerbang })));
  }

  if (pathname.startsWith("/k/")) {
    const slug = pathname.slice(3);
    const cat = categoriesWithCounts().find((c) => c.slug === slug);
    if (!cat) return kirim(page(notFoundPage(`Kategori "${slug}" tidak ada.`), 404));
    const data = listVideos({
      categoryId: categoryIdBySlug(slug),
      sort: query.urutan === "populer" ? "populer" : "terbaru",
      page: Number(query.halaman) || 1,
      per: 24
    });
    return kirim(
      page(
        listPage({
          heading: cat.name,
          note: `${data.total} video kategori ${cat.name}${
            data.total ? ` · diputar dari ${hostCatalog().length} sumber` : " · belum ada isinya, tempel URL pertamamu"
          }.`,
          ...data,
          path: `/k/${slug}`,
          query,
          gate: gerbang
        })
      )
    );
  }

  if (pathname.startsWith("/tag/")) {
    const tag = decodeURIComponent(pathname.slice(5));
    const data = listVideos({ tag, page: Number(query.halaman) || 1, per: 24 });
    return kirim(
      page(
        listPage({
          heading: `Tag: #${tag}`,
          note: `${data.total} video dengan tag #${tag}.`,
          ...data,
          path: `/tag/${encodeURIComponent(tag)}`,
          query,
          gate: gerbang
        })
      )
    );
  }

  if (pathname.startsWith("/v/")) {
    const video = videoBySlug(pathname.slice(3));
    if (!video) return kirim(page(notFoundPage("Video itu tidak ada di katalog."), 404));
    if (!gerbang) catatPenonton(req.socket.remoteAddress || "x", video);
    return kirim(page(watchPage({ video, related: relatedVideos(video, 12), host, gate: gerbang })));
  }

  if (pathname === "/rss.xml") return raw(rss(host), MIME[".xml"]);
  if (pathname === "/sitemap.xml") return raw(sitemap(host), MIME[".xml"]);
  if (pathname === "/robots.txt")
    return raw(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${host}/sitemap.xml\n`, MIME[".txt"]);

  if (pathname.startsWith("/admin")) {
    const hasil = await handleAdmin(req, res, url, cookies);
    if (!hasil) return done;
    if (hasil.html) return kirim(hasil);
    return done;
  }

  return kirim(page(notFoundPage("Halaman yang kamu minta tidak ada."), 404));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "strict-origin-when-cross-origin");
  try {
    const hasil = await route(req, res, url, readCookies(req));
    if (hasil !== done && !res.headersSent) res.writeHead(500).end();
  } catch (err) {
    console.error(`[rute] ${req.method} ${url.pathname}`, err);
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "text/html; charset=utf-8" });
      res.end(
        layout({ title: "Sedang bermasalah — BokepKita", body: "<p class='empty'>Situs sedang bermasalah. Coba lagi sebentar.</p>" })
      );
    } else {
      res.end();
    }
  }
});

server.listen(PORT, () => {
  const s = stats();
  console.log(`BokepKita jalan di http://localhost:${PORT}`);
  console.log(`  katalog: ${countVideos()} video · ${s.categories} kategori · ${s.demo} masih contoh`);
  console.log(`  panel:   http://localhost:${PORT}/admin (kata kunci: ${ADMIN_TOKEN})`);
  console.log(`  sumber:  ${hostCatalog().length} host dikenali · SQLite di ${db ? "data/bokep-kita.db" : "?"}`);
});

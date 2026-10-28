import io

def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    miss = []
    for a, b in pairs:
        if a in s:
            s = s.replace(a, b, 1)
        else:
            miss.append(a[:70])
    io.open(path, 'w', encoding='utf-8').write(s)
    return miss

H = '/home/runner/bali-wisata/index.html'
C = '/home/runner/bali-wisata/assets/css/styles.css'
J = '/home/runner/bali-wisata/assets/js/app.js'

lama_burung = '''        <g class="poster-burung" stroke="#14110D" stroke-width="3.4" fill="none" stroke-linecap="round">
          <path d="M236 168 c10 -9 18 -9 26 0"/>
          <path d="M272 150 c8 -7 15 -7 21 0"/>
        </g>'''
baru_burung = '''        <g class="poster-burung" stroke="#14110D" stroke-width="3.4" fill="none" stroke-linecap="round">
          <path d="M258 132 c10 -9 18 -9 26 0"/>
          <path d="M300 114 c8 -7 15 -7 21 0"/>
        </g>'''

lama_teks_bawah = '        <text class="poster-kecil poster-kecil-bawah" x="44" y="888">TIGA RUTE · 12 BULAN · SATU KANTONG</text>'
baru_teks_bawah = '        <text class="poster-kecil poster-strap" x="44" y="182">TIGA RUTE · 12 BULAN · SATU KANTONG</text>'

lama_peta = '''        <svg viewBox="0 0 1000 560" aria-hidden="true">
          <path d="M30 300 C90 262 190 232 300 224 C380 218 470 214 560 192 C628 176 690 196 760 210 C850 226 940 236 974 254 C946 288 892 316 828 334 C770 350 722 356 686 360 C664 372 646 392 632 424 C618 452 588 462 556 452 C528 442 518 412 508 388 C470 382 424 374 366 364 C266 348 150 334 62 318 Z" fill="#0E3B34" stroke="#C89C4C" stroke-width="3"/>
          <ellipse cx="866" cy="470" rx="72" ry="27" fill="#0E3B34" stroke="#C89C4C" stroke-width="2.5"/>
          <ellipse cx="768" cy="418" rx="26" ry="14" fill="#0E3B34" stroke="#C89C4C" stroke-width="2.5"/>
          <ellipse cx="150" cy="150" rx="20" ry="10" fill="#0E3B34" stroke="#C89C4C" stroke-width="2"/>
          <ellipse cx="96" cy="120" rx="14" ry="8" fill="#0E3B34" stroke="#C89C4C" stroke-width="2"/>
          <path d="M560 250 L596 190 L628 250 Z" fill="#C89C4C" opacity=".55"/>
          <path d="M470 268 L500 214 L530 268 Z" fill="#C89C4C" opacity=".35"/>
          <text class="peta-laut" x="120" y="470">Laut Bali</text>
          <text class="peta-laut" x="770" y="120">Selat Lombok</text>
        </svg>'''
baru_peta = '''        <svg viewBox="0 0 1000 560" aria-hidden="true">
          <path d="M24 296 L120 262 L240 240 L360 230 L470 220 L560 198 L650 184 L740 202 L840 222 L930 240 L986 258 L920 292 L840 318 L760 336 L692 348 L654 372 L634 410 L606 440 L572 452 L546 438 L536 406 L528 380 L470 366 L380 356 L280 344 L170 326 L74 310 Z" fill="#0E3B34" stroke="#C89C4C" stroke-width="4" stroke-linejoin="round"/>
          <ellipse cx="866" cy="470" rx="72" ry="27" fill="#0E3B34" stroke="#C89C4C" stroke-width="2.5"/>
          <ellipse cx="768" cy="418" rx="26" ry="14" fill="#0E3B34" stroke="#C89C4C" stroke-width="2.5"/>
          <ellipse cx="150" cy="150" rx="22" ry="11" fill="#0E3B34" stroke="#C89C4C" stroke-width="2"/>
          <ellipse cx="96" cy="118" rx="15" ry="9" fill="#0E3B34" stroke="#C89C4C" stroke-width="2"/>
          <path d="M584 268 L622 200 L660 268 Z" fill="#C89C4C" opacity=".5"/>
          <path d="M498 276 L528 224 L558 276 Z" fill="#C89C4C" opacity=".32"/>
          <ellipse cx="548" cy="288" rx="24" ry="10" fill="#C89C4C" opacity=".25"/>
          <text class="peta-laut" x="110" y="470">Laut Bali</text>
          <text class="peta-laut" x="756" y="122">Selat Lombok</text>
        </svg>'''

lama_opsi = '''          <select id="inap">
            <option value="300000">Homestay kipas, kamar mandi dalam · Rp 300 ribu per malam</option>
            <option value="550000" selected>Penginapan ber-AC · Rp 550 ribu per malam</option>
            <option value="1400000">Villa dengan kolam pribadi · Rp 1,4 juta per malam</option>
          </select>'''
baru_opsi = '''          <select id="inap">
            <option value="300000">Homestay kipas · Rp 300 ribu/malam</option>
            <option value="550000" selected>Penginapan ber-AC · Rp 550 ribu/malam</option>
            <option value="1400000">Villa kolam pribadi · Rp 1,4 juta/malam</option>
          </select>'''

lama_kend = '''          <select id="jalan">
            <option value="motor">Motor matic, dua unit · Rp 130 ribu per unit per hari</option>
            <option value="lepas" selected>Mobil sewa lepas kunci · Rp 400 ribu per hari</option>
            <option value="sopir">Mobil dengan sopir 10 jam · Rp 800 ribu per hari</option>
          </select>'''
baru_kend = '''          <select id="jalan">
            <option value="motor">Motor matic, 2 unit · Rp 260 ribu/hari</option>
            <option value="lepas" selected>Mobil lepas kunci · Rp 400 ribu/hari</option>
            <option value="sopir">Mobil + sopir 10 jam · Rp 800 ribu/hari</option>
          </select>'''

m = patch(H, [
    (lama_burung, baru_burung),
    (lama_teks_bawah, baru_teks_bawah),
    (lama_peta, baru_peta),
    (lama_opsi, baru_opsi),
    (lama_kend, baru_kend),
])

m += patch(C, [
    ('.poster-kecil-bawah{fill:var(--poleng);opacity:.9;font-size:19px}',
     '.poster-strap{font-size:19px;font-weight:700;letter-spacing:.1em;opacity:.9}'),
    ('.kotak{display:flex;gap:.6rem;align-items:flex-start;font-size:.95rem;margin-bottom:.5rem;cursor:pointer}',
     '.kotak{display:flex;gap:.6rem;align-items:flex-start;font-size:.95rem;margin-bottom:.5rem;cursor:pointer}\n.lapangan .kotak{font-family:var(--font-badan);font-weight:400}'),
    ('.musim-grafik{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:stretch;min-height:236px;border-bottom:2px solid var(--poleng)}',
     '.musim-grafik{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:stretch;min-height:300px;border-bottom:2px solid var(--poleng)}'),
    ('.titik span{position:absolute;left:50%;top:-1.55rem;transform:translateX(-50%);font-size:.78rem;white-space:nowrap;color:var(--kapur);font-weight:700;pointer-events:none}',
     '.titik span{position:absolute;left:50%;top:-1.7rem;transform:translateX(-50%);font-size:.78rem;white-space:nowrap;color:var(--kapur);font-weight:700;pointer-events:none;opacity:0;background:rgba(6,42,37,.92);padding:.1rem .4rem;border-radius:2px}\n.titik:hover span,.titik:focus-visible span,.titik[aria-pressed=true] span{opacity:1}'),
    ('  .musim-grafik{min-height:180px}', '  .musim-grafik{min-height:220px}'),
    ('  .titik span{display:none}\n', ''),
])

m += patch(J, [
    ("(6 + Math.round(m.h / maksimum * 66))", "(8 + Math.round(m.h / maksimum * 74))"),
])

# koordinat titik peta baru
peta_lama = io.open(J, encoding='utf-8').read()
koord = {
 'Kuta': ('50, 69.3', '50.5, 65.4'),
 'Uluwatu': ('57.2, 78.7', '59.2, 77.1'),
 'Tanah Lot': ('33, 62', '33, 60.7'),
 'Jatiluwih': ('40, 56.8', '41, 56.8'),
 'Ubud': ('52, 60.4', '52.8, 58.2'),
 'Tegallalang': ('51.2, 52.9', '51.5, 53.5'),
 'Kintamani': ('58.5, 42.1', '57.5, 50.4'),
 'Munduk': ('39.2, 43.6', '39.2, 46.8'),
 'Lovina': ('30, 38.4', '33, 43.9'),
 'Sidemen': ('70, 56.8', '69, 57.1'),
 'Tirta Gangga': ('78.2, 52.9', '78.2, 53.6'),
 'Amed': ('84.8, 43.2', '85.2, 43.6'),
 'Padang Bai': ('76.2, 61.1', '74.2, 61.1'),
 'Gilimanuk': ('7.2, 54.6', '7, 53.6'),
 'Nusa Penida': ('86.6, 83.9', '86.6, 83.9'),
 'Gili Trawangan': ('15, 26.8', '15, 26.8'),
}
for nama, (lama, baru) in koord.items():
    a = '{ x: %s, n: \'%s\'' % (lama, nama)
    b = '{ x: %s, n: \'%s\'' % (baru, nama)
    if a in peta_lama:
        peta_lama = peta_lama.replace(a, b, 1)
    elif lama != baru:
        m.append('koordinat ' + nama)
io.open(J, 'w', encoding='utf-8').write(peta_lama)

# pilih Ubud saat halaman terbuka
a = """      semuaTitik.push(b);
      kanvas.appendChild(b);
    });
  }"""
b = """      semuaTitik.push(b);
      kanvas.appendChild(b);
      if (t.n === 'Ubud') terpilih = b;
    });
    if (terpilih) terpilih.click();
  }"""
s = io.open(J, encoding='utf-8').read()
if a in s:
    s = s.replace(a, b, 1)
    s = s.replace("    var semuaTitik = [];", "    var semuaTitik = [], terpilih = null;", 1)
    io.open(J, 'w', encoding='utf-8').write(s)
else:
    m.append('blok peta click')

print('MISSING:', m)

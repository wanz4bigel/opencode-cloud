import io

def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    miss = []
    for a, b in pairs:
        if a in s:
            s = s.replace(a, b, 1)
        else:
            miss.append(a[:60])
    io.open(path, 'w', encoding='utf-8').write(s)
    return miss

H = '/home/runner/bali-wisata/index.html'
C = '/home/runner/bali-wisata/assets/css/styles.css'
J = '/home/runner/bali-wisata/assets/js/app.js'

m = []

# 1. gunung Batur digeser ke kiri supaya tidak menumpuk dengan titik
m += patch(H, [
  ('<path d="M498 276 L528 224 L558 276 Z" fill="#C89C4C" opacity=".32"/>\n          <ellipse cx="548" cy="288" rx="24" ry="10" fill="#C89C4C" opacity=".25"/>',
   '<path d="M452 284 L484 232 L516 284 Z" fill="#C89C4C" opacity=".32"/>\n          <ellipse cx="500" cy="294" rx="24" ry="10" fill="#C89C4C" opacity=".25"/>'),
  # catatan legenda di panel peta
  ('<p id="petaCatat" class="peta-catat">Pilih titik untuk melihat jarak, waktu tempuh, dan apa yang sebenarnya ada di sana.</p>',
   '<p id="petaCatat" class="peta-catat">Pilih titik untuk melihat jarak, waktu tempuh, dan apa yang sebenarnya ada di sana.</p>\n        <p class="peta-legenda">Titik emas menandai tempat, titik merah adalah yang sedang Anda pilih. Jarak pada daftar ini nyata, bentuk pulaunya tidak.</p>'),
  # dek musim menjelaskan titik harga
  ('<p class="bagian-dek">Pola umum Bali selatan dan tengah, bukan ramalan. Batang hijau menunjukkan curah hujan, titik merah menunjukkan harga penginapan terhadap bulan Juni.</p>',
   '<p class="bagian-dek">Pola umum Bali selatan dan tengah, bukan ramalan. Batang hijau menunjukkan curah hujan. Titik di atas batang terisi makin penuh kalau harga penginapan makin tinggi terhadap Juni.</p>'),
])

m += patch(C, [
  ('.bulan[aria-pressed="true"] .bulan-harga{background:var(--kamboja)}',
   '.bulan[aria-pressed="true"] .bulan-harga{border-color:var(--poleng)}'),
  ('.peta-catat{color:rgba(244,239,226,.8);font-size:.95rem}',
   '.peta-catat{color:rgba(244,239,226,.8);font-size:.95rem}\n.peta-legenda{margin-top:1.4rem;padding-top:1rem;border-top:1px dashed rgba(227,190,120,.4);font-size:.88rem;color:rgba(244,239,226,.66)}'),
])

# 2. titik harga jadi pengisi (gauge)
lama = """      b.setAttribute('aria-label', NAMA_BULAN[m.b] + ', hujan ' + m.h + ' dari 100, harga penginapan ' + Math.round(m.harga * 100) + ' persen terhadap Juni');
      b.innerHTML = '<span class="bulan-harga"></span>' +"""
baru = """      b.setAttribute('aria-label', NAMA_BULAN[m.b] + ', hujan ' + m.h + ' dari 100, harga penginapan ' + Math.round(m.harga * 100) + ' persen terhadap Juni');
      var isi = Math.round((m.harga - 0.92) / 0.56 * 100);
      b.innerHTML = '<span class="bulan-harga" style="background:linear-gradient(0deg,var(--kamboja) ' + isi + '%,transparent ' + isi + '%)"></span>' +"""
m += patch(J, [(lama, baru)])

print('MISSING:', m)

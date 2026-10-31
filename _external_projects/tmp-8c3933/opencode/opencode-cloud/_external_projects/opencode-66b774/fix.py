import sys, io
p = '/home/runner/bali-wisata/index.html'
s = io.open(p, encoding='utf-8').read()
fixes = [
 ('<header class="atAS">', '<header class="bilah">'),
 ('Kintamani untuk_view Danau Batur', 'Kintamani untuk melihat Danau Batur'),
 ('Jatiluwih – Tanah Lot – Senggigi? tidak, kembali ke Ubud, 126 km', 'Jatiluwih – Tanah Lot – Ubud, 126 km'),
 ('jalan sempit dua motor tidak bisa berpapasan santai', 'jalan sempit, dua motor tidak bisa berpapasan santai'),
 ('Pulang ke airport 45 menit kalau sebelum maghrib', 'Pulang ke bandara 45 menit kalau sebelum maghrib'),
 ('Tiga air terjun di sisi barat Tegallalang bisa didatangi jalan kaki 25 menit antar titik, tanpa sopir, kalau Anda menginap di Chek Menasya?',
  'Tiga air terjun di timur Ubud, Kanto Lampo, Tukad Cepung, dan Penglumbaran, bisa didatangi sendiri tanpa sopir kalau Anda menginap di Ubud utara. Jauhnya di bawah 25 menit.'),
 ('jalur shortcut Chek-Ayas utara Tegallalang tidak beraspal tiga kilometer terakhir; jangan lewat situ naik motor matic habis hujan.',
  'jalan shortcut Tegallalang ke Kintamani tidak beraspal pada tiga kilometer terakhir. Jangan lewat situ naik motor matic setelah hujan.'),
 ('<h3>Munduk – Lovina – Mendurang? tidak: Gitgit – Lovina, 66 km</h3>', '<h3>Munduk – Gitgit – Lovina, 66 km</h3>'),
 ('Trek sunrise mulai 02.30–04.00 dari Senton song? Basecamp di Senton Song, Toya Devasya, Quicksilver: tiga titik, tiga harga, rata-rata Rp 500–750 ribu dengan pemandu dan sarapan. Alternatif tanpa trek: naik ke Senton song panorama jam 6 pagi.',
  'Berangkat ke basecamp pukul 02.30 sampai 04.00. Ada tiga jalur. Pura Ulun Danu Batur paling ramai, Toya Devasya lebih sepi dan lewat sumber air panas, Quicksilver paling pendek. Operator memasang Rp 500–750 ribu per orang dengan pemandu dan sarapan. Kalau tidak mau mendaki, naik ke titik pandang Penelokan pukul 06.00.'),
 ('Toya Devasya lewat jalan tanah 25 menit dari Senton Song, hanya dua mobil bisa berpapasan di dua titik. Sopir lokal saja yang berani malam hari.',
  'Jalan tanah ke basecamp Toya Devasya 25 menit dari aspal, dan hanya dua mobil bisa berpapasan di dua titik. Hanya sopir lokal yang biasa lewat sini pada malam hari.'),
 ('<h3>Down ke Padang Bai, 44 km</h3>', '<h3>Turun ke Padang Bai, 44 km</h3>'),
 ('Berkas: jalan timur lebih lengang, tapi dua kali harus menanjak lewat Cenglek dan Duda yang berkelok. Tiba di Amed 14.00, snorkel di pemukulan? di Amed Timur jam 16.00 masih kelihatan penyu.',
  'Jalan timur lebih lengang, tapi dua kali menanjak lewat Cenglek dan Duda yang berkelok. Tiba di Amed pukul 14.00. Snorkel di Amed Timur pukul 16.00 masih kelihatan penyu.'),
 ('Sepeda Rp 40–75 ribu sehari, cidara hanya untuk barang.', 'Sepeda Rp 40–75 ribu sehari, cidomo hanya untuk barang.'),
 ('Baliki lewat Sanur untuk makan siang; By Pass Timur lebih lengang daripada jalan Bypass Ngurah Rai. Siang di Sanur, sore ke Kuta untuk oleh-oleh, malam di Jimbaran.',
  'Pulang lewat Rendang dan Selat ke Sanur untuk makan siang; jalur ini lebih lengang daripada By Pass Ngurah Rai. Siang di Sanur, sore ke Kuta untuk oleh-oleh, malam di Jimbaran.'),
 ('Jalan Bypass Ngurah Rai dari Sanur ke airport punya satu titik macet permanen di depan Terminal Internasional sampai underpass.',
  'By Pass Ngurah Rai dari Sanur ke bandara punya satu titik macet tetap di depan terminal keberangkatan.'),
 ('dua titik sempit di Pasar Batukaru dan dekat Danau Tamblingan', 'dua titik sempit di jalur Batukaru dan di dekat Danau Tamblingan'),
 ('siang ke Banyumala Twin atau Sekumpul lewat jalan desa Munduk.', 'siang ke Banyumala Twin, sepuluh menit, atau turun ke Sekumpul lewat Sawan, empat puluh lima menit.'),
 ('dan jalanlicin di Penelokan', 'dan jalan licin di Penelokan'),
 ('Yang hilang adalah jalan masuk vila di lembah Chek Menasya dan beberapa desa di Les dan Munti.',
  'Yang hilang sinyalnya adalah lembah sungai tempat vila berdiri, dan beberapa desa di Les dan Munti.'),
 ('jalur kedua di Pura Jati lebih sepi daripada jalur Senton Song yang ramai.',
  'jalur Toya Devasya lebih sepi daripada jalur Pura Ulun Danu Batur yang ramai.'),
 ('Kendaraan besar tidak boleh lewat Shortcut Chek dan jalur Tegallalang–Batur setelah pukul 16.00.',
  'Bus besar tidak boleh lewat jalan shortcut Tegallalang dan jalur Tegallalang ke Kintamani setelah pukul 16.00.'),
 ('kabut biasanya turun 15.30–17.00 di tikungan Munduk', 'kabut biasanya turun pukul 15.30 sampai 17.00 di tikungan Munduk'),
 ('<b>Es Campur Bu Tokes</b><span>Jalan Batur, Denpasar', '<b>Es Campur Bu Madé</b><span>Renon, Denpasar'),
 ('Tirta Empul buka 07.30, datang setelah 10.00 berdesakan dengan bus.', 'Tirta Empul buka 07.30. Setelah pukul 10.00 Anda berdesakan dengan bus.'),
 ('<p>Bandara ke Ubud 36 km. Isi BBM di SPBU Sesetan atau Dalung sebelum masuk jalan desa; pom di utara sering habis pukul 4 sore. Sore: sawah Campuhan dan jalan kaki 20 menit di jurang Sungai Unda.</p>',
  '<p>Bandara ke Ubud 36 km. Isi BBM di SPBU Sesetan atau Dalung sebelum masuk jalan desa, karena pom di utara sering kosong sore hari. Sore: jalan kaki 20 menit di jurang Sungai Campuhan.</p>'),
 ('<p>Motor masuk untuk dua orang yang berbadan kecil', '<p>Motor cukup untuk dua orang yang berbadan kecil'),
]
missed = []
for a, b in fixes:
    if a in s:
        s = s.replace(a, b)
    else:
        missed.append(a[:60])
io.open(p, 'w', encoding='utf-8').write(s)
print('MISSED:', len(missed))
for m in missed:
    print(' -', m)

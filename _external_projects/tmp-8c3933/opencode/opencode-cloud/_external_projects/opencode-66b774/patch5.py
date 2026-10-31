import io
def patch(p, pairs):
    s=io.open(p,encoding='utf-8').read(); miss=[]
    for a,b in pairs:
        if a in s: s=s.replace(a,b,1)
        else: miss.append(a[:60])
    io.open(p,'w',encoding='utf-8').write(s); return miss

H='/home/runner/bali-wisata/index.html'; C='/home/runner/bali-wisata/assets/css/styles.css'
m = patch(H, [
 ('<main id="isi">',
  '''<noscript>
  <p class="tanpa-js">Grafik musim, kalkulator biaya, peta, checklist, dan validasi form butuh JavaScript. Rute,
  aturan pura, daftar warung, dan pertanyaan yang sering masuk tetap terbaca tanpa JavaScript.</p>
</noscript>

<main id="isi">'''),
 ('<form class="pesan" id="formPesan" novalidate>',
  '<form class="pesan" id="formPesan" novalidate action="mailto:jalan@banuabali.example" method="post" enctype="text/plain">'),
])
m += patch(C, [
 ('.lewati:focus{left:12px;top:12px}',
  '.lewati:focus{left:12px;top:12px}\n.tanpa-js{max-width:var(--isi);margin:0 auto;padding:1rem clamp(1.2rem,4vw,3rem);background:var(--kamboja);color:#fff;font-size:.96rem}'),
 ('  .titik{width:18px;height:18px}', '  .titik{width:20px;height:20px}'),
 ('.titik:hover,.titik[aria-pressed=true]{background:var(--kamboja);border-color:var(--kuningan-muda);transform:translate(-50%,-50%) scale(1.3)}',
  '.titik:hover,.titik[aria-pressed=true]{background:var(--kamboja);border-color:var(--kuningan-muda);transform:translate(-50%,-50%) scale(1.3);z-index:4}'),
])
print('MISSING:', m)

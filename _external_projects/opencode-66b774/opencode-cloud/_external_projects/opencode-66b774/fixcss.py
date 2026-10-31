import io
p = '/home/runner/bali-wisata/assets/css/styles.css'
s = io.open(p, encoding='utf-8').read()
fixes = [
 ('.peta{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.7fr);gap:clamp(1.2rem,3vw,2.6rem);max-width:var(--isi);margin-inline:auto;padding-inline:clamp(1.2rem,4vw,3rem)}',
  '.peta{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.7fr);gap:clamp(1.2rem,3vw,2.6rem)}'),
 ('.maju{font-size:.95rem;color:var(--kuningan-muda);margin:0 0 .5rem;max-width:var(--isi);margin-inline:auto;padding-inline:clamp(1.2rem,4vw,3rem)}',
  '.maju{font-size:.95rem;color:var(--kuningan-muda);margin:0 0 .5rem}'),
 ('.maju-bilah{height:8px;background:rgba(244,239,226,.22);max-width:var(--isi);margin:0 auto 2rem;padding-inline:0;overflow:hidden}',
  '.maju-bilah{height:8px;background:rgba(244,239,226,.22);margin:0 0 2rem;overflow:hidden}'),
 ('.cek{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1rem,3vw,2.4rem);max-width:var(--isi);margin-inline:auto;padding-inline:clamp(1.2rem,4vw,3rem)}',
  '.cek{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1rem,3vw,2.4rem)}'),
 ('.musim-grafik{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:end;min-height:230px;border-bottom:2px solid var(--poleng);padding-bottom:0}',
  '.musim-grafik{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;align-items:stretch;min-height:236px;border-bottom:2px solid var(--poleng)}\n.musim-isi{margin:0}'),
 ('.daftar-makan{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(1.4rem,4vw,3.4rem);padding-top:clamp(2.4rem,5vw,4rem)}',
  '.daftar-makan{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(1.4rem,4vw,3.4rem)}'),
 ('.makan-kat{max-width:62ch;font-size:.95rem;color:rgba(20,17,13,.72);padding:1.6rem clamp(1.2rem,4vw,3rem) 0;margin-inline:auto}',
  '.makan-kat{max-width:62ch;font-size:.95rem;color:rgba(20,17,13,.72);margin-top:1.8rem}'),
]
missed = []
for a, b in fixes:
    if a in s:
        s = s.replace(a, b)
    else:
        missed.append(a[:70])
io.open(p, 'w', encoding='utf-8').write(s)
print('MISSED', missed)

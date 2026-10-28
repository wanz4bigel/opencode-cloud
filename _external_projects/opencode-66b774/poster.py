import io, re
p = '/home/runner/bali-wisata/index.html'
s = io.open(p, encoding='utf-8').read()

poster = '''    <figure class="poster">
      <svg viewBox="0 0 620 920" role="img" aria-label="Poster bergaya lama: Gunung Agung di belakang gerbang pura terbelah, padi bertingkat, keranjang bunga, dan matahari merah.">
        <defs>
          <pattern id="bintik" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="2.4" cy="2.4" r="1.2" fill="#14110D" opacity=".18"/>
          </pattern>
          <linearGradient id="langit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F7F3E9"/>
            <stop offset="100%" stop-color="#EDE3CC"/>
          </linearGradient>
        </defs>
        <rect width="620" height="920" fill="url(#langit)"/>
        <text class="poster-tulis" x="44" y="96">AGUNG</text>
        <text class="poster-kecil" x="44" y="126">3.031 MDPL · KINTAMANI</text>
        <circle class="poster-matahari" cx="436" cy="238" r="102" fill="#C1432E"/>
        <g class="poster-burung" stroke="#14110D" stroke-width="3.4" fill="none" stroke-linecap="round">
          <path d="M236 168 c10 -9 18 -9 26 0"/>
          <path d="M272 150 c8 -7 15 -7 21 0"/>
        </g>
        <!-- range Agung -->
        <path d="M0 470 L112 366 L176 418 L246 300 L322 244 L396 302 L472 386 L544 340 L620 424 L620 470 Z" fill="#0E3B34"/>
        <path d="M246 300 L322 244 L396 302 L362 336 L330 318 L296 340 L268 324 Z" fill="#F7F3E9" opacity=".2"/>
        <!-- bukit padi bertingkat -->
        <path d="M0 470 L620 470 L620 626 L0 626 Z" fill="#3F7C55"/>
        <g stroke="#C89C4C" stroke-width="2.4" fill="none" opacity=".85">
          <path d="M0 502 C120 486 232 512 348 496 C452 482 548 506 620 494"/>
          <path d="M0 540 C118 524 234 550 352 534 C456 520 552 544 620 532"/>
          <path d="M0 578 C122 562 236 588 350 572 C458 558 554 582 620 570"/>
        </g>
        <!-- halaman depan -->
        <path d="M0 626 L620 626 L620 920 L0 920 Z" fill="#EFE6D1"/>
        <path d="M0 626 L620 626 L620 920 L0 920 Z" fill="url(#bintik)"/>
        <path d="M0 626 L620 626" stroke="#14110D" stroke-width="3"/>
        <!-- gerbang candi bentar kiri -->
        <path class="gerbang" d="M64 920 L64 782 L88 782 L88 748 L66 748 L66 714 L92 714 L92 680 L74 680 L74 646 L98 646 L98 612 L82 612 L82 578 L106 578 L106 544 L92 544 L92 512 L116 512 L116 480 L104 480 L104 452 L122 452 L122 480 L142 480 L142 514 L158 514 L158 552 L172 552 L172 594 L186 594 L186 638 L198 638 L198 686 L208 686 L208 738 L216 738 L216 920 Z" fill="#14110D"/>
        <!-- gerbang candi bentar kanan -->
        <path class="gerbang" d="M556 920 L556 782 L532 782 L532 748 L554 748 L554 714 L528 714 L528 680 L546 680 L546 646 L522 646 L522 612 L538 612 L538 578 L514 578 L514 544 L528 544 L528 512 L504 512 L504 480 L516 480 L516 452 L498 452 L498 480 L478 480 L478 514 L462 514 L462 552 L448 552 L448 594 L434 594 L434 638 L422 638 L422 686 L412 686 L412 738 L404 738 L404 920 Z" fill="#14110D"/>
        <!-- kain poleng pada gerbang -->
        <g class="poster-poleng">
          <rect x="64" y="756" width="152" height="24" fill="#F7F3E9"/>
          <rect x="64" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="102" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="140" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="178" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="404" y="756" width="152" height="24" fill="#F7F3E9"/>
          <rect x="404" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="442" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="480" y="756" width="19" height="24" fill="#14110D"/>
          <rect x="518" y="756" width="19" height="24" fill="#14110D"/>
        </g>
        <!-- palem -->
        <g class="poster-palem" stroke="#14110D" stroke-width="7.5" fill="none" stroke-linecap="round">
          <path d="M26 920 C44 830 38 772 22 730"/>
          <path d="M22 730 C4 714 -4 692 -2 672"/>
          <path d="M22 730 C10 704 16 676 32 660"/>
          <path d="M22 730 C42 706 64 698 84 702"/>
          <path d="M596 920 C578 832 582 776 596 736"/>
          <path d="M596 736 C614 720 622 700 620 680"/>
          <path d="M596 736 C608 710 602 682 586 666"/>
          <path d="M596 736 C576 712 554 706 534 710"/>
        </g>
        <!-- canang sari di halaman -->
        <g class="poster-canang">
          <path d="M268 872 L352 872 L342 906 L278 906 Z" fill="none" stroke="#14110D" stroke-width="4"/>
          <path d="M278 872 L342 872" stroke="#14110D" stroke-width="2.4"/>
          <circle cx="288" cy="864" r="9" fill="#C1432E"/>
          <circle cx="310" cy="858" r="9" fill="#C89C4C"/>
          <circle cx="332" cy="864" r="9" fill="#F7F3E9" stroke="#14110D" stroke-width="2"/>
          <path d="M310 852 L310 812" stroke="#14110D" stroke-width="3"/>
          <path d="M310 806 c8 -8 8 -16 0 -24 c-8 -8 -8 -16 0 -24" stroke="#14110D" stroke-width="2.4" fill="none" opacity=".7"/>
        </g>
        <text class="poster-kecil poster-kecil-bawah" x="44" y="888">TIGA RUTE · 12 BULAN · SATU KANTONG</text>
      </svg>
      <figcaption>Poster dan peta di halaman ini sketsa tangan, bukan untuk navigasi.</figcaption>
    </figure>'''

mulai = s.index('<figure class="poster">')
akhir = s.index('</figure>', mulai) + len('</figure>')
s = s[:mulai - 4] + poster + s[akhir:]
io.open(p, 'w', encoding='utf-8').write(s)
print('poster diganti')

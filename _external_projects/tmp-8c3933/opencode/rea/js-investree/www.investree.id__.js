(function(){
    const sel = "masuk|login|log in|daftar|register|verifikasi";
    const els = [...document.querySelectorAll('a,button,[role=button]')];
    const el = els.find(e => sel.split('|').some(k => (e.textContent || '').toLowerCase().includes(k)));
    if (el) el.click();
    return !!el;
  })()
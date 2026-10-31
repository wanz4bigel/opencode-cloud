(function(){
    const sel = "login|masuk|sign in|masuk";
    const els = [...document.querySelectorAll('a,button,[role=button]')];
    const el = els.find(e => sel.split('|').some(k => (e.textContent || '').toLowerCase().includes(k)));
    if (el) el.click();
    return !!el;
  })()
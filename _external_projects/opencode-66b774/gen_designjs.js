const fs = require('fs');

function hexToHsl(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = parseInt(hex.slice(0,2),16)/255;
  const g = parseInt(hex.slice(2,4),16)/255;
  const b = parseInt(hex.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h = (g-b)/d + (g<b?6:0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h /= 6;
  }
  return { h: h*360, s: s*100, l: l*100 };
}
function hslToHex(h,s,l){
  s/=100; l/=100;
  const c = (1-Math.abs(2*l-1))*s;
  const x = c*(1-Math.abs((h/60)%2-1));
  const m = l - c/2;
  let r=0,g=0,b=0;
  if (h<60){r=c;g=x;}
  else if (h<120){r=x;g=c;}
  else if (h<180){g=c;b=x;}
  else if (h<240){g=x;b=c;}
  else if (h<300){r=x;b=c;}
  else {r=c;b=x;}
  const to = v => Math.round((v+m)*255).toString(16).padStart(2,'0');
  return '#'+to(r)+to(g)+to(b);
}
function ramp(hex){
  const {h,s} = hexToHsl(hex);
  const steps = [14,26,38,52,64,76,86,96];
  return steps.map(L => {
    let sat = s;
    if (L < 30) sat = s*(0.55 + L/80);
    if (L > 80) sat = s*(1 - (L-80)/40*0.85);
    if (sat < 2) sat = 2;
    return hslToHex(h, sat, L);
  });
}

const colors = [
 {key:'ground', hex:'#d4dade', role:'neutral', name:'Concrete Ground'},
 {key:'surface', hex:'#eef1f2', role:'neutral', name:'Surface'},
 {key:'surface-2', hex:'#e2e7ea', role:'neutral', name:'Surface 2'},
 {key:'paper', hex:'#f7f8f7', role:'neutral', name:'Paper'},
 {key:'mail-paper', hex:'#fbfaf6', role:'neutral', name:'Mail Paper'},
 {key:'ink', hex:'#121a22', role:'neutral', name:'Ink'},
 {key:'muted', hex:'#4e5a63', role:'neutral', name:'Muted'},
 {key:'faint', hex:'#525d67', role:'neutral', name:'Faint'},
 {key:'line', hex:'#c2cacd', role:'neutral', name:'Steel Line'},
 {key:'line-strong', hex:'#98a4aa', role:'neutral', name:'Steel Line Strong'},
 {key:'rail', hex:'#16202c', role:'neutral', name:'Rail'},
 {key:'rail-2', hex:'#1e2b3a', role:'neutral', name:'Rail 2'},
 {key:'rail-3', hex:'#263545', role:'neutral', name:'Rail 3'},
 {key:'rail-line', hex:'#2d3b4a', role:'neutral', name:'Rail Line'},
 {key:'rail-ink', hex:'#f2efe6', role:'neutral', name:'Rail Ink'},
 {key:'rail-muted', hex:'#a8b2bd', role:'neutral', name:'Rail Muted'},
 {key:'locker-blue', hex:'#2e4d61', role:'secondary', name:'Locker Blue'},
 {key:'locker-blue-deep', hex:'#254152', role:'secondary', name:'Locker Blue Deep'},
 {key:'locker-blue-ink', hex:'#f1f4f4', role:'secondary', name:'Locker Blue Ink'},
 {key:'locker-blue-muted', hex:'#c0cfd7', role:'secondary', name:'Locker Blue Muted'},
 {key:'accent', hex:'#f3b61f', role:'primary', name:'Parcel Yellow'},
 {key:'accent-strong', hex:'#b97b00', role:'primary', name:'Amber Strong'},
 {key:'accent-ink', hex:'#191a12', role:'primary', name:'Accent Ink'},
 {key:'accent-soft', hex:'#f8e8b8', role:'primary', name:'Accent Soft'},
 {key:'alert', hex:'#c1492f', role:'tertiary', name:'Alert Vermilion'},
 {key:'alert-soft', hex:'#f6ddd5', role:'tertiary', name:'Alert Soft'},
 {key:'ok', hex:'#2c7454', role:'tertiary', name:'Verified Green'},
 {key:'ok-soft', hex:'#dcebe2', role:'tertiary', name:'Ok Soft'},
 {key:'tag-bg', hex:'#f2ede0', role:'neutral', name:'Tag Paper'},
 {key:'tag-ink', hex:'#171c22', role:'neutral', name:'Tag Ink'},
 {key:'tag-line', hex:'#d2c9b7', role:'neutral', name:'Tag Line'},
 {key:'focus', hex:'#f3b61f', role:'primary', name:'Focus'},
];

const colorMeta = {};
for (const c of colors) {
  colorMeta[c.key] = { role: c.role, displayName: c.name, canonical: c.hex, tonalRamp: ramp(c.hex) };
}

const typographyMeta = {
  display: { displayName: 'Display', purpose: 'Ledger title and section masthead; tight tracking, never body copy.' },
  headline: { displayName: 'Headline', purpose: 'Opened parcel subject and OTP banners.' },
  title: { displayName: 'Title', purpose: 'Sender names, brand wordmark context, dense small labels.' },
  body: { displayName: 'Body', purpose: 'All reading text, help copy, form fields.' },
  label: { displayName: 'Label', purpose: 'Martian Mono status, count, countdown, code, machine labels.' },
};

const shadows = [
 { name: 'tag-lift', value: '0 10px 24px -16px rgba(0, 0, 0, 0.85)', purpose: 'The claim-ticket address tag only.' },
 { name: 'overlay-light', value: '0 18px 44px -22px rgba(10, 16, 23, 0.55)', purpose: 'Dialogs and lifted overlays in light mode.' },
 { name: 'overlay-dark', value: '0 18px 50px -18px rgba(0, 0, 0, 0.8)', purpose: 'Dialogs and lifted overlays in dark mode.' },
 { name: 'selected-row', value: 'inset 0 0 0 1px #98a4aa', purpose: 'Selected ledger row, no blur.' },
];

const motion = [
 { name: 'scanline', value: '1.5s cubic-bezier(0.16, 1, 0.3, 1)', purpose: 'Single arrival scanline pass on a new unread row.' },
 { name: 'led-pulse', value: '2.6s ease-in-out infinite', purpose: 'Unread LED breath.' },
 { name: 'state-transition', value: '120ms ease', purpose: 'Default color/background/border transitions.' },
 { name: 'drawer-slide', value: '220ms cubic-bezier(0.16, 1, 0.3, 1)', purpose: 'Mobile rail drawer open/close.' },
 { name: 'spin', value: '0.9s linear infinite', purpose: 'Busy spinners.' },
];

const breakpoints = [
 { name: 'xs', value: '600px' },
 { name: 'sm', value: '760px' },
 { name: 'md', value: '820px' },
 { name: 'lg', value: '1080px' },
 { name: 'xl', value: '1240px' },
];

// Component snippets
const C = {};
function cmp(name, kind, refersTo, description, html, css) {
  return { name, kind, refersTo, description, html, css };
}

const components = [
 cmp('Primary Button','button','button-primary','Dark ink button for secondary primary actions.',
  '<button class="ds-btn-primary">OPEN PARCEL</button>',
  '.ds-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid var(--ink,#121a22); border-radius:4px; background:var(--ink,#121a22); color:var(--paper,#f7f8f7); font:600 12.5px/1.2 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); letter-spacing:-0.005em; white-space:nowrap; cursor:pointer; transition:background 120ms ease,border-color 120ms ease,color 120ms ease; } .ds-btn-primary:hover { background:color-mix(in srgb,var(--ink,#121a22) 84%,var(--ground,#d4dade)); } .ds-btn-primary:focus-visible { outline:2px solid var(--focus,#f3b61f); outline-offset:2px; } .ds-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }'),
 cmp('Accent Button','button','button-accent','Parcel-yellow primary action: copy address, new address, send.',
  '<button class="ds-btn-accent">COPY ADDRESS</button>',
  '.ds-btn-accent { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid color-mix(in srgb,var(--accent-ink,#191a12) 22%,transparent); border-radius:4px; background:var(--accent,#f3b61f); color:var(--accent-ink,#191a12); font:600 12.5px/1.2 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); letter-spacing:-0.005em; white-space:nowrap; cursor:pointer; transition:background 120ms ease,border-color 120ms ease,color 120ms ease; } .ds-btn-accent:hover { background:color-mix(in srgb,var(--accent,#f3b61f) 84%,var(--ink,#121a22)); } .ds-btn-accent:focus-visible { outline:2px solid var(--focus,#f3b61f); outline-offset:2px; } .ds-btn-accent:disabled { opacity:0.55; cursor:not-allowed; }'),
 cmp('Ghost Button','button','button-ghost','Transparent bordered control for cancel/secondary actions.',
  '<button class="ds-btn-ghost">CANCEL</button>',
  '.ds-btn-ghost { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid var(--line-strong,#98a4aa); border-radius:4px; background:transparent; color:var(--ink,#121a22); font:600 12.5px/1.2 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); letter-spacing:-0.005em; white-space:nowrap; cursor:pointer; transition:background 120ms ease,border-color 120ms ease,color 120ms ease; } .ds-btn-ghost:hover { background:var(--surface-2,#e2e7ea); border-color:var(--ink,#121a22); } .ds-btn-ghost:focus-visible { outline:2px solid var(--focus,#f3b61f); outline-offset:2px; }'),
 cmp('Danger Button','button','button-danger','Vermilion destructive action (delete, remove).',
  '<button class="ds-btn-danger">EMPTY LOCKER</button>',
  '.ds-btn-danger { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid var(--alert,#c1492f); border-radius:4px; background:var(--alert,#c1492f); color:#ffffff; font:600 12.5px/1.2 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); letter-spacing:-0.005em; white-space:nowrap; cursor:pointer; transition:background 120ms ease,border-color 120ms ease,color 120ms ease; } .ds-btn-danger:hover { background:color-mix(in srgb,var(--alert,#c1492f) 82%,#000000); } .ds-btn-danger:focus-visible { outline:2px solid var(--focus,#f3b61f); outline-offset:2px; }'),
 cmp('Text Input','input','input-text','Single-line field on paper with steel border.',
  '<label class="ds-field"><span class="ds-field__label">LOCAL PART</span><input class="ds-input" type="text" placeholder="you" /></label>',
  '.ds-field { display:flex; flex-direction:column; gap:6px; min-width:0; font-family:var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); } .ds-field__label { font-family:var(--mono,\'Martian Mono\',ui-monospace,\'SFMono-Regular\',Menlo,monospace); font-size:9.5px; font-weight:500; letter-spacing:0.09em; text-transform:uppercase; color:var(--muted,#4e5a63); } .ds-input { width:100%; height:40px; padding:0 11px; border:1px solid var(--line-strong,#98a4aa); border-radius:4px; background:var(--paper,#f7f8f7); color:var(--ink,#121a22); font:400 13px/1.2 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); transition:border-color 120ms ease,background 120ms ease; } .ds-input:hover { border-color:var(--muted,#4e5a63); } .ds-input:focus { outline:2px solid var(--accent,#f3b61f); outline-offset:1px; border-color:var(--ink,#121a22); }'),
 cmp('Search Field','input','search','Ledger search with key hint.',
  '<div class="ds-search"><svg class="ds-search__icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="ds-search__input" type="search" placeholder="Search mail" /><kbd class="ds-search__kbd">/</kbd></div>',
  '.ds-search { display:flex; align-items:center; gap:7px; height:36px; padding:0 9px; border:1px solid var(--line-strong,#98a4aa); border-radius:3px; background:var(--paper,#f7f8f7); color:var(--muted,#4e5a63); transition:border-color 120ms ease; } .ds-search:focus-within { border-color:var(--ink,#121a22); outline:2px solid var(--accent,#f3b61f); outline-offset:1px; } .ds-search__icon { flex:0 0 auto; } .ds-search__input { flex:1; min-width:0; height:100%; border:0; outline:0; background:transparent; color:var(--ink,#121a22); font:400 11.5px/1 var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); } .ds-search__kbd { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; border:1px solid var(--line,#c2cacd); border-bottom-width:2px; border-radius:2px; background:var(--surface,#eef1f2); font:500 9px/1 var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); color:var(--muted,#4e5a63); }'),
 cmp('Badge / Count','chip','badge','Parcel-yellow count on tabs and rail.',
  '<span class="ds-badge">3</span>',
  '.ds-badge { display:inline-flex; align-items:center; justify-content:center; padding:1px 4px; border-radius:0; background:var(--accent,#f3b61f); color:var(--accent-ink,#191a12); font:700 7.5px/1 var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); letter-spacing:0.05em; }'),
 cmp('Parcel Tag (Claim Ticket)','custom','parcel-tag','The address claim ticket with QR, barcode, countdown.',
  '<div class="ds-parcel-tag"><div class="ds-parcel-tag__perf"></div><div class="ds-parcel-tag__top"><span class="ds-parcel-tag__label">CLAIM TICKET</span><span class="ds-parcel-tag__code">MB-2472</span></div><div class="ds-parcel-tag__main"><div class="ds-parcel-tag__addr"><span class="ds-parcel-tag__local">rainy-otter</span><span class="ds-parcel-tag__domain">@mail.example</span></div><div class="ds-parcel-tag__qr">QR</div></div><div class="ds-parcel-tag__barcode"></div><div class="ds-parcel-tag__expiry"><div class="ds-parcel-tag__expiry-line"><span class="ds-parcel-tag__label">EXPIRES</span><span class="ds-parcel-tag__time">23:59:42</span></div><div class="ds-expiry-meter"><span class="ds-expiry-meter__fill"></span></div></div><div class="ds-parcel-tag__actions"><button class="ds-btn-accent ds-btn-accent--small">COPY ADDRESS</button><button class="ds-btn-ghost ds-btn-ghost--small">NEW</button></div></div>',
  '.ds-parcel-tag { position:relative; width:280px; padding:12px 13px 13px; border:1px solid color-mix(in srgb,var(--tag-line,#d2c9b7) 80%,#000000); border-radius:4px; background:var(--tag-bg,#f2ede0); color:var(--tag-ink,#171c22); box-shadow:0 10px 24px -16px rgba(0,0,0,0.85); font-family:var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); } .ds-parcel-tag__perf { height:1px; margin-bottom:9px; background-image:linear-gradient(90deg,var(--tag-line,#d2c9b7) 55%,transparent 55%); background-size:7px 1px; opacity:0.9; } .ds-parcel-tag__top { display:flex; align-items:center; justify-content:space-between; gap:8px; } .ds-parcel-tag__label { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:8px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:color-mix(in srgb,var(--tag-ink,#171c22) 68%,var(--tag-bg,#f2ede0)); } .ds-parcel-tag__code { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:8px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; color:color-mix(in srgb,var(--tag-ink,#171c22) 68%,var(--tag-bg,#f2ede0)); } .ds-parcel-tag__main { display:grid; grid-template-columns:minmax(0,1fr) 76px; gap:10px; align-items:start; margin-top:8px; } .ds-parcel-tag__addr { display:flex; flex-wrap:wrap; } .ds-parcel-tag__local { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:14px; font-weight:700; letter-spacing:-0.045em; color:var(--tag-ink,#171c22); } .ds-parcel-tag__domain { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:10px; font-weight:400; letter-spacing:-0.03em; color:color-mix(in srgb,var(--tag-ink,#171c22) 60%,var(--tag-bg,#f2ede0)); margin-left:1px; } .ds-parcel-tag__qr { display:flex; align-items:center; justify-content:center; height:76px; padding:3px; border:1px solid var(--tag-line,#d2c9b7); border-radius:2px; background:#f6f2e6; font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:8px; color:var(--tag-ink,#171c22); } .ds-parcel-tag__barcode { display:flex; align-items:stretch; gap:2px; height:18px; margin-top:9px; overflow:hidden; opacity:0.82; } .ds-parcel-tag__expiry { margin-top:10px; padding-top:9px; border-top:1px dashed var(--tag-line,#d2c9b7); } .ds-parcel-tag__expiry-line { display:flex; align-items:center; justify-content:space-between; gap:6px; } .ds-parcel-tag__time { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:11.5px; font-weight:500; letter-spacing:-0.02em; color:var(--tag-ink,#171c22); } .ds-expiry-meter { position:relative; height:3px; margin-top:6px; background:color-mix(in srgb,var(--tag-line,#d2c9b7) 70%,transparent); } .ds-expiry-meter__fill { position:absolute; inset:0 auto 0 0; width:62%; background:var(--tag-ink,#171c22); transition:width 500ms linear; } .ds-parcel-tag__actions { display:flex; align-items:center; gap:5px; margin-top:11px; } .ds-parcel-tag__actions .ds-btn-accent,.ds-parcel-tag__actions .ds-btn-ghost { min-height:32px; font-size:10.5px; flex:1; } .ds-btn-accent--small,.ds-btn-ghost--small { min-height:32px !important; font-size:10.5px !important; }'),
 cmp('Ledger Row (Message)','custom','message-row','Unread-aware ledger row with arrival LED and scanline.',
  '<div class="ds-msg-row is-unread is-arrived"><span class="ds-led ds-led--on"></span><button class="ds-msg-main"><span class="ds-avatar">RO</span><span class="ds-msg-body"><span class="ds-msg-top"><span class="ds-msg-sender">Recruiter Otomatis</span><span class="ds-msg-time">2m</span></span><span class="ds-msg-subject">Your one-time code</span><span class="ds-msg-snippet">Use 482910 to verify your email...</span></span></button><button class="ds-star" aria-label="star">★</button></div>',
  '.ds-msg-row { position:relative; display:grid; grid-template-columns:14px minmax(0,1fr) 25px; align-items:stretch; min-height:74px; border-bottom:1px solid var(--line,#c2cacd); background:var(--surface,#eef1f2); overflow:hidden; font-family:var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); } .ds-msg-row:hover { background:var(--paper,#f7f8f7); } .ds-msg-row.is-unread { background:color-mix(in srgb,var(--accent,#f3b61f) 7%,var(--surface,#eef1f2)); } .ds-msg-row.is-unread:hover { background:color-mix(in srgb,var(--accent,#f3b61f) 11%,var(--surface,#eef1f2)); } .ds-msg-row.is-selected { background:var(--paper,#f7f8f7); box-shadow:inset 0 0 0 1px var(--line-strong,#98a4aa); } .ds-msg-row.is-selected > .ds-led { background:var(--accent,#f3b61f); box-shadow:0 0 0 2px color-mix(in srgb,var(--accent,#f3b61f) 45%,transparent); } .ds-msg-row.is-arrived::after { content:\'\'; position:absolute; left:0; right:0; top:0; height:1px; background:var(--accent,#f3b61f); box-shadow:0 0 9px var(--accent,#f3b61f); animation:ds-scan 1.5s cubic-bezier(0.16,1,0.3,1) forwards; pointer-events:none; } @keyframes ds-scan { 0%{top:0;opacity:1;} 85%{opacity:1;} 100%{top:calc(100% - 1px);opacity:0;} } .ds-led { align-self:start; margin:22px 0 0 6px; width:7px; height:7px; flex:0 0 7px; background:var(--muted,#4e5a63); box-shadow:none; } .ds-led--on { background:var(--accent,#f3b61f); animation:ds-ledpulse 2.6s ease-in-out infinite; } @keyframes ds-ledpulse { 0%,100%{box-shadow:0 0 0 2px color-mix(in srgb,var(--accent,#f3b61f) 16%,transparent),0 0 5px color-mix(in srgb,var(--accent,#f3b61f) 55%,transparent);} 50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent,#f3b61f) 24%,transparent),0 0 11px color-mix(in srgb,var(--accent,#f3b61f) 85%,transparent);} } .ds-msg-main { display:grid; grid-template-columns:30px minmax(0,1fr) 58px; gap:9px; align-items:start; min-width:0; padding:11px 2px 11px 7px; border:0; background:transparent; text-align:left; color:inherit; font:inherit; cursor:pointer; } .ds-avatar { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; flex:0 0 30px; border:1px solid var(--line,#c2cacd); border-radius:3px; background:var(--surface-2,#e2e7ea); color:var(--ink,#121a22); font:700 9px/1 var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); letter-spacing:-0.03em; text-transform:uppercase; } .ds-msg-body { display:flex; flex-direction:column; gap:2px; min-width:0; } .ds-msg-top { display:flex; align-items:center; gap:5px; min-width:0; } .ds-msg-sender { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:500; color:var(--ink,#121a22); } .is-unread .ds-msg-sender { font-weight:700; } .ds-msg-time { margin-left:auto; font:500 8px/1.3 var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); color:var(--muted,#4e5a63); white-space:nowrap; } .ds-msg-subject { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:400; color:var(--ink,#121a22); } .is-unread .ds-msg-subject { font-weight:600; } .ds-msg-snippet { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10.5px; color:var(--muted,#4e5a63); } .ds-star { display:inline-flex; align-items:flex-start; justify-content:center; width:25px; padding:11px 2px 0 0; border:0; background:transparent; color:var(--line-strong,#98a4aa); opacity:0.6; cursor:pointer; transition:opacity 120ms ease,color 120ms ease; } .ds-msg-row:hover .ds-star { opacity:1; } .ds-star:hover { color:var(--ink,#121a22); }'),
 cmp('OTP Banner','custom','otp-banner','Rail-surface banner for extracted one-time code.',
  '<div class="ds-otp-banner"><span class="ds-otp-banner__label">CODE DETECTED</span><span class="ds-otp-banner__value">482910</span><button class="ds-btn-accent ds-btn-accent--small">COPY</button></div>',
  '.ds-otp-banner { display:flex; align-items:center; gap:12px; padding:10px 12px; border:1px solid var(--rail-line,#2d3b4a); border-radius:3px; background:var(--rail,#16202c); color:var(--rail-ink,#f2efe6); font-family:var(--font,\'Archivo Variable\',\'Archivo\',ui-sans-serif,system-ui,sans-serif); } .ds-otp-banner__label { display:inline-flex; align-items:center; gap:6px; font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:7.5px; letter-spacing:0.1em; color:var(--rail-muted,#a8b2bd); white-space:nowrap; } .ds-otp-banner__value { font-family:var(--mono,\'Martian Mono\',ui-monospace,Menlo,monospace); font-size:clamp(20px,2.8vw,29px); font-weight:700; letter-spacing:0.16em; line-height:1; color:var(--accent,#f3b61f); font-variant-numeric:tabular-nums; } .ds-otp-banner .ds-btn-accent { margin-left:auto; min-height:32px; font-size:10.5px; }'),
];

const now = new Date().toISOString();

const sidecar = {
  schemaVersion: 2,
  generatedAt: now,
  title: 'Design System: Angin',
  extensions: {
    colorMeta,
    typographyMeta,
    shadows,
    motion,
    breakpoints,
  },
  components,
  narrative: {
    northStar: 'The 24-Hour Parcel Locker',
    overview: 'Angin is a disposable inbox read as a parcel locker rather than a mail client. The address is a claim ticket, a message is a parcel, arrival is a lit cell. The system refuses the soft card-grid SaaS mail client: no decorative cards, no bouncing entrances, no pillowy surfaces. Everything is structured like steel and paper — a near-black rail, powder-coated locker blue, cool concrete ground, 1px rules, 2–5px corners, and parcel-yellow signal light. Density is high but never cramped; the ledger is scannable, the reader is calm, and the account of what is stored and for how long is always visible. The atmosphere is working-space rather than marketing: labels in Martian Mono, tabular figures, barcodes, QR furniture, and a status strip that reads like a loading dock.\n\nThe page still behaves like a real mail client — top utility bar, left rail, searchable ledger, opened parcel on the right — because the audience knows that pattern and needs speed over novelty. The world is carried by palette, type, density, and one signature motion: the arrival LED on an unread row, followed by a single scanline pass. Motion is otherwise 120ms and utilitarian. Dark mode inverts the concrete-to-rail contrast without changing the locker accent.',
    keyCharacteristics: [
      'Claim-ticket address tag with QR, barcode, and countdown as the identity of the system.',
      'Parcel-yellow LED as the sole chromatic emphasis; seen on primary actions, unread rows, and focus.',
      'Martian Mono for codes, counts, labels, metadata; Archivo for everything a reader reads.',
      '1px steel rules instead of shadows; tonal layering instead of elevation.',
      '2–5px corners throughout; no pill surfaces except scrollbars.',
      'Ledger rows, not cards: hover swaps background, never lifts a tile.',
    ],
    rules: [
      { name: 'The One Voice Rule', body: 'Parcel yellow is the only chromatic accent on a screen; locker blue is a surface. A primary action is yellow, a status alert is vermilion, and nothing else carries hue. If two elements both need emphasis, one of them is not emphasis.', section: 'colors' },
      { name: 'The No-Line-Card Rule', body: 'Surfaces are separated by 1px steel rules, never by shadowed cards. A rounded box with a drop shadow is off-system in this world.', section: 'colors' },
      { name: 'The Alert Budget Rule', body: 'Vermilion is spent only on destructive verbs, expired countdowns, form errors, and failed DNS. It never decorates.', section: 'colors' },
      { name: 'The Code Font Rule', body: 'Martian Mono is never used for sentences and Archivo is never used for codes. The split is the legibility contract: if a value changes every second (a countdown, a count), it is mono; if a human reads it as language, it is Archivo.', section: 'typography' },
      { name: 'The Weight Ceiling Rule', body: '700 is the maximum weight and is reserved for brand and OTP values. Ordinary emphasis is 600. Do not introduce 800 or 900.', section: 'typography' },
      { name: 'The Flat-By-Default Rule', body: 'A surface at rest has no shadow. Shadows appear only as a response to state: drawer open, dialog open, or the tag’s single lift. If a new component asks for a shadow, it probably wants a 1px rule instead.', section: 'elevation' },
      { name: 'The Tonal Staircase Rule', body: 'Depth is communicated by stepping surfaces (ground → surface → paper) and rules, not by blur. Never stack two shadows to create elevation.', section: 'elevation' },
    ],
    dos: [
      'Do use parcel yellow only for primary actions, unread arrival, focus, and OTP values.',
      'Do keep corners between 2px and 5px on controls; larger radii need a reason.',
      'Do separate surfaces with 1px steel rules and tonal steps (ground → surface → paper).',
      'Do run Martian Mono at 7.5–11.5px for labels/counts/codes and Archivo at 15px for reading text.',
      'Do use tabular figures wherever time or counts appear.',
      'Do respect `prefers-reduced-motion`: replace the scanline with an instant state change.',
      'Do keep thread metadata bilingual-ready and localized.',
    ],
    donts: [
      'Don’t use cards with shadows or rounded tiles for inbox rows; the ledger is a list of rules.',
      'Don’t introduce a second accent or gradient backgrounds.',
      'Don’t use vermilion for anything but destructive/expired/error states.',
      'Don’t set font weights above 700 or introduce new font families.',
      'Don’t animate entrances with bounce or scale; 120ms opacity/background is the house motion, plus the one signature scanline.',
      'Don’t turn a single screen’s composition (the parcel tag, the ledger) into a component-wide default; they are patterns of this product.',
      'Don’t canonize housekeeping defects as design rules (see defects note).',
    ],
  },
};

fs.writeFileSync('/home/runner/tempmail/.impeccable/design.json', JSON.stringify(sidecar, null, 2));
console.log('written', Object.keys(sidecar).join(','));

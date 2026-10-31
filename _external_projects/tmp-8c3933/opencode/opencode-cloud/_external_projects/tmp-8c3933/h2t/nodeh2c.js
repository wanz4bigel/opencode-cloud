// Hakim HTTP/2: Node pakai nghttp2 + HPACK yang ketat. Kalau h2dos lolos di sini,
// frame dan blok header-nya sah. Server ini juga menghitung request & mencatat
// setiap galat protokol.
const http2 = require('node:http2');

let req = 0;
const errs = new Map();
const rec = (e) => {
  const k = `${e.code || ''} ${e.message || e}`.trim();
  errs.set(k, (errs.get(k) || 0) + 1);
};

const srv = http2.createServer({
  allowHTTP1: false,
  settings: { headerTableSize: 65536, maxConcurrentStreams: 100, initialWindowSize: 65535 },
});

srv.on('stream', (stream, headers) => {
  req++;
  const path = headers[':path'];
  stream.respond({ ':status': 200, 'content-type': 'text/plain', 'x-n': String(req) });
  stream.end('ok ' + path + '\n');
  stream.on('error', rec);
});

srv.on('session', (session) => {
  session.on('error', rec);
  session.on('close', () => {});
});

srv.on('sessionError', rec);
srv.on('error', (e) => {
  // galat listen (port nyangkut) harus langsung mati, bukan diabaikan
  if (e.code === 'EADDRINUSE') {
    console.log('FATAL port 8090 dipakai: ' + e.message);
    process.exit(1);
  }
  rec(e);
});

// laporan berkala ke stdout supaya bisa dibaca dari shell
setInterval(() => {
  const e = [...errs.entries()].map(([k, v]) => `${k} x${v}`).join(' | ') || '-';
  console.log(`node h2c: req=${req} err=${e}`);
}, 2000);

process.on('SIGTERM', () => {
  console.log(`RINGKASAN req=${req} err=${JSON.stringify([...errs.entries()])}`);
  process.exit(0);
});

srv.listen(8090, '127.0.0.1', () => console.log('node h2c siap di 127.0.0.1:8090'));

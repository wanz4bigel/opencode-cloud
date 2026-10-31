// Server HTTP/2 sederhana untuk menguji h2dos: TLS di :8443, h2c cleartext di :8080.
const http2 = require('node:http2');
const fs = require('node:fs');

let ok = 0, errs = 0;
function handler(stream, headers) {
  if (headers[':method'] === 'POST') stream.on('data', () => {});
  stream.on('error', () => {});
  stream.respond({ ':status': 200, 'content-type': 'text/plain', 'x-n': String(++ok) });
  stream.end('ok');
}

const tls = http2.createSecureServer({
  key: fs.readFileSync('/tmp/h2t/key.pem'),
  cert: fs.readFileSync('/tmp/h2t/cert.pem'),
  allowHTTP1: false,
  settings: { maxConcurrentStreams: 64 },
});
tls.on('stream', handler);
tls.on('session', (s) => s.on('error', () => errs++));
tls.on('error', () => errs++);
tls.listen(8443, '127.0.0.1');

const clear = http2.createServer();
clear.on('stream', handler);
clear.on('session', (s) => s.on('error', () => errs++));
clear.on('error', () => errs++);
clear.listen(8080, '127.0.0.1', () => console.log('h2 siap: tls/8443 h2c/8080'));

setInterval(() => console.log(`req=${ok} sessionErr=${errs}`), 2000);

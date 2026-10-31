import net from 'node:net';

const host = '127.0.0.1';
const port = 2525;
const rcpt = process.argv[2] || 'smoke@angin.test';

const message = [
  'From: "Angin Test" <sender@example.com>',
  `To: <${rcpt}>`,
  'Subject: Kode verifikasi 482913',
  'Date: Sat, 31 Oct 2026 12:00:00 +0000',
  'Message-ID: <smoke-test-1@example.com>',
  'MIME-Version: 1.0',
  'Content-Type: multipart/mixed; boundary="MIXED"',
  '',
  '--MIXED',
  'Content-Type: multipart/alternative; boundary="ALT"',
  '',
  '--ALT',
  'Content-Type: text/plain; charset="utf-8"',
  '',
  'Halo! Kode verifikasi Anda adalah 482913. Kode berlaku 10 menit.',
  '',
  '--ALT',
  'Content-Type: text/html; charset="utf-8"',
  '',
  '<div style="font-family:Arial,sans-serif;padding:24px;background:#f5f2e9">',
  '<h1 style="color:#12324a">Verifikasi akun</h1>',
  '<p>Gunakan kode berikut untuk masuk:</p>',
  '<p style="font-size:32px;letter-spacing:6px;font-weight:bold;color:#c2410c">482913</p>',
  '<img src="https://example.com/pixel.png" width="1" height="1" alt="">',
  '<p><a href="https://example.com/verify">Buka halaman verifikasi</a></p>',
  '</div>',
  '',
  '--ALT--',
  '',
  '--MIXED',
  'Content-Type: text/plain; charset="utf-8"; name="catatan.txt"',
  'Content-Disposition: attachment; filename="catatan.txt"',
  'Content-Transfer-Encoding: base64',
  '',
  Buffer.from('Lampiran uji Angin.\n').toString('base64'),
  '',
  '--MIXED--',
  '',
].join('\r\n');

const socket = net.createConnection({ host, port });
let buffer = '';
const waiters = [];
let connected = false;

const flush = () => {
  while (waiters.length) {
    const waiter = waiters[0];
    const match = waiter.regex.exec(buffer);
    if (!match) break;
    buffer = buffer.slice(match.index + match[0].length);
    waiters.shift();
    waiter.resolve(match[0]);
  }
};

const expect = (regex, label) =>
  new Promise((resolve, reject) => {
    const waiter = { regex, resolve, reject };
    waiters.push(waiter);
    flush();
    setTimeout(() => {
      const index = waiters.indexOf(waiter);
      if (index >= 0) {
        waiters.splice(index, 1);
        reject(new Error(`timeout waiting for ${label}; buffer=${JSON.stringify(buffer)}`));
      }
    }, 5000);
  });

let step = 0;
const steps = async () => {
  await expect(/^220[^\r\n]*\r\n/, 'greeting');
  step = 1;
  socket.write(`EHLO smoke.test\r\n`);
  await expect(/^250[^\r\n]*\r\n(?:250[^\r\n]*\r\n)*/, 'ehlo');
  socket.write(`MAIL FROM:<sender@example.com>\r\n`);
  await expect(/^250[^\r\n]*\r\n/, 'mail from');
  socket.write(`RCPT TO:<${rcpt}>\r\n`);
  await expect(/^250[^\r\n]*\r\n/, 'rcpt');
  socket.write('DATA\r\n');
  await expect(/^354[^\r\n]*\r\n/, 'data');
  socket.write(message.replace(/\r\n\./g, '\r\n..') + '.\r\n');
  const done = await expect(/^250[^\r\n]*\r\n/, 'queued');
  console.log('SMTP queued:', done.trim());
  socket.write('QUIT\r\n');
  await expect(/^221[^\r\n]*\r\n/, 'quit');
  socket.end();
};

socket.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  flush();
});
socket.on('error', (error) => {
  console.error('socket error:', error);
  process.exit(1);
});
socket.on('connect', () => {
  connected = true;
  steps().catch((error) => {
    console.error('step failed after', step, error.message);
    process.exit(1);
  });
});
setTimeout(() => {
  if (!connected) console.error('never connected');
}, 4000);

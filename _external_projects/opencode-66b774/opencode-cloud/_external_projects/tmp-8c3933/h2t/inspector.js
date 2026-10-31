// Inspektur frame HTTP/2 (h2c murni): mencatat setiap byte yang masuk dan
// membongkar kepala frame-nya. Dipakai untuk memotret apa yang dikirim h2dos.
const net = require('node:net');

const TY = {
  0: 'DATA', 1: 'HEADERS', 2: 'PRIORITY', 3: 'RST_STREAM', 4: 'SETTINGS',
  5: 'PUSH_PROMISE', 6: 'PING', 7: 'GOAWAY', 8: 'WINDOW_UPDATE',
  9: 'CONTINUATION',
};

let conn = 0;
const srv = net.createServer((s) => {
  const id = ++conn;
  let buf = Buffer.alloc(0);
  let prefaceOK = false;
  let bytes = 0;
  const frames = [];
  s.on('data', (d) => {
    bytes += d.length;
    buf = Buffer.concat([buf, d]);
    if (!prefaceOK) {
      if (buf.length < 24) return;
      const p = buf.subarray(0, 24).toString('latin1');
      if (p === 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n') {
        prefaceOK = true;
        buf = buf.subarray(24);
      } else {
        console.log(`konek ${id}: PREFACE TIDAK SAH -> ${JSON.stringify(p)}`);
        return;
      }
    }
    while (buf.length >= 9) {
      const len = (buf[0] << 16) | (buf[1] << 8) | buf[2];
      const type = buf[3], flags = buf[4];
      const stream = buf.readUInt32BE(5) & 0x7fffffff;
      if (buf.length < 9 + len) break;
      const payload = buf.subarray(9, 9 + len);
      frames.push({ type, flags, len, stream });
      if (type === 1) {
        console.log(`konek ${id}: HEADERS stream=${stream} flags=0x${flags.toString(16)} len=${len}\n    blok: ${payload.subarray(0, Math.min(40, len)).toString('hex')}`);
      } else if (type === 7) {
        console.log(`konek ${id}: GOAWAY ${payload.toString('hex')}`);
      }
      buf = buf.subarray(9 + len);
    }
  });
  s.on('close', () => {
    const byType = {};
    for (const f of frames) {
      const k = `${TY[f.type] || 'T' + f.type}/0x${f.flags.toString(16)}`;
      byType[k] = (byType[k] || 0) + 1;
    }
    console.log(`konek ${id}: preface=${prefaceOK ? 'ya' : 'TIDAK'} byte=${bytes} frame=${JSON.stringify(byType)}`);
  });
  s.on('error', () => {});
});

srv.listen(8091, '127.0.0.1', () => console.log('inspektur siap di 127.0.0.1:8091'));

import fs from 'node:fs';

const dir = '/home/runner/telegram-spam-bot/src';
const src = fs.readFileSync(`${dir}/index.js`, 'utf8');
const marker = 'const bot = new Bot(config.token);';
const idx = src.indexOf(marker);
if (idx === -1) throw new Error('marker not found');

const header = src.slice(0, idx);
const body = src.slice(idx + marker.length).replace(/\s+$/, '\n');

// blok cek token pindah ke index.js
const checkStart = header.indexOf('if (!config.token');
const checkEnd = header.indexOf('process.exit(1);') + 'process.exit(1);'.length;
const newHeader = header.slice(0, checkStart).trimEnd();

// indent badan createApp
const indented = body
  .split('\n')
  .map((line) => (line.trim() ? `  ${line}` : ''))
  .join('\n');

const app = `${newHeader}

/**
 * Bikin bot dan semua wiring-nya.
 * Kasih \`fetch\` palsu (buat test) kalau gak mau nyentuh api.telegram.org.
 */
export function createApp({ token = config.token, fetch } = {}) {
  const bot = new Bot(token, fetch ? { client: { fetch } } : undefined);
${indented}
  return { bot, start: main, shutdown, getStats, HANDLERS, canControl, COMMANDS };
}
`.replace(/\n\n+/g, '\n\n');

fs.writeFileSync(`${dir}/app.js`, app);
console.log('app.js ditulis:', app.split('\n').length, 'baris');

import fs from 'node:fs';
const t = fs.readFileSync('node_modules/grammy/out/core/client.js', 'utf8').split('\n');
console.log(t.slice(18, 70).map((l, i) => `${19 + i}: ${l}`).join('\n'));
console.log('=== payload.js ===');
const p = fs.readFileSync('node_modules/grammy/out/core/payload.js', 'utf8').split('\n');
console.log(p.slice(0, 60).map((l, i) => `${1 + i}: ${l}`).join('\n'));

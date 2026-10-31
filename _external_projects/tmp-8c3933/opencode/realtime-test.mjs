import fs from 'node:fs';
import { spawn } from 'node:child_process';

const WD = 'http://localhost:9515';
const call = async (method, path, body) => {
  const response = await fetch(`${WD}${path}`, {
    method, headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.value?.error) throw new Error(`${method} ${path}: ${JSON.stringify(data)}`);
  return data.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const boxRes = await fetch('http://localhost:3000/api/mailboxes', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ localPart: 'realtime' }),
});
const box = await boxRes.json();
console.log('mailbox', box.mailbox.address);

const session = await call('POST', '/session', {
  capabilities: { alwaysMatch: { browserName: 'chrome', 'goog:chromeOptions': {
    binary: '/usr/bin/chromium', args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
  } } },
});
const sid = session.sessionId;
const exec = (script, args = []) => call('POST', `/session/${sid}/execute/sync`, { script, args });
const nav = async (url, wait = 1200) => { await call('POST', `/session/${sid}/url`, { url }); await sleep(wait); };
try {
  await call('POST', `/session/${sid}/window/rect`, { width: 1440, height: 1000, x: 0, y: 0 });
  await nav('http://localhost:5173/');
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]);`, [JSON.stringify([{
    id: box.mailbox.id, address: box.mailbox.address, token: box.token,
    domain: box.mailbox.domain, isDemo: false,
    createdAt: box.mailbox.createdAt, expiresAt: box.mailbox.expiresAt,
  }])]);
  await nav(`http://localhost:5173/inbox/${box.mailbox.id}`, 1600);
  const before = await exec(`return { rows: document.querySelectorAll('.msg-row').length, realtime: document.querySelector('.mail-list__status')?.innerText };`);
  console.log('before', before);
  const child = spawn('node', ['/tmp/opencode/send-test.mjs', box.mailbox.address], { stdio: 'inherit' });
  await new Promise((resolve) => child.on('exit', resolve));
  await sleep(2200);
  const after = await exec(`return {
    rows: document.querySelectorAll('.msg-row').length,
    unread: document.querySelector('.msg-row.is-unread')?.innerText.slice(0,120),
    toast: document.querySelector('.toast')?.innerText,
    signal: document.querySelector('.msg-row.is-arrived') !== null,
    title: document.title,
  };`);
  console.log('after', after);
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
}

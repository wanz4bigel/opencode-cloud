process.env.BOT_TOKEN = '123:test';
const { createApp } = await import('/home/runner/telegram-spam-bot/src/app.js');
const state = await import('/home/runner/telegram-spam-bot/src/state.js');

const CHAT = { id: -100, type: 'supergroup' };
const json = (v) => ({ ok: true, status: 200, json: async () => v });
const calls = [];
let mid = 1000;
const fakeFetch = async (url, options) => {
  const method = new URL(url).pathname.split('/').pop();
  const body = typeof options?.body === 'string' ? JSON.parse(options.body) : {};
  calls.push(`${method}: ${String(body.text ?? '').slice(0, 40)}`);
  if (method === 'getMe') return json({ ok: true, result: { id: 777, is_bot: true, username: 't', first_name: 'S' } });
  if (method === 'sendMessage' || method === 'editMessageText') {
    return json({ ok: true, result: { message_id: mid++, date: 0, chat: CHAT, text: body.text } });
  }
  return json({ ok: true, result: true });
};

const app = createApp({ token: '123:test', fetch: fakeFetch });
await app.bot.init();
for (const [f, v] of Object.entries({ chaos: false, autoReact: false, autoSticker: false, preset: 'normal' })) {
  state.setSetting(-100, f, v);
}

let uid = 0;
const send = (text, from = { id: 1, is_bot: false, first_name: 'U' }) =>
  app.bot.handleUpdate({ update_id: ++uid, message: { message_id: ++uid, date: 0, chat: CHAT, from, text } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dump = (label) => {
  console.log(`\n== ${label} ==`);
  for (const c of calls.splice(0)) console.log('   ' + c);
  console.log('   settings:', JSON.stringify(state.getSettings(-100)));
};

await send('/chaos on');
await sleep(4000);
dump('/chaos on');

await send('ada yang mau duel gak');
await sleep(1200);
dump('pesan biasa');

process.exit(0);

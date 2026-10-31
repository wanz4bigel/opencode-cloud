process.env.BOT_TOKEN = '123:test';
process.env.CHAOS_DEFAULT = 'off';

const dir = '/home/runner/telegram-spam-bot/src';
const { createApp } = await import(`${dir}/app.js`);
const spam = await import(`${dir}/spam.js`);

process.on('unhandledRejection', (e) => console.log('!! unhandledRejection:', e?.message ?? e));
process.on('uncaughtException', (e) => console.log('!! uncaughtException:', e?.message ?? e));

const CHAT = { id: -100, type: 'supergroup', title: 'g' };
const USER = { id: 1, is_bot: false, first_name: 'U' };
const json = (v) => ({ ok: v.ok !== false, status: 200, json: async () => v });

const log = [];
let mid = 1000;
const fakeFetch = async (url, options) => {
  const method = new URL(url).pathname.split('/').pop();
  const body = options?.body ? JSON.parse(options.body) : {};
  log.push({ method, text: body.text });
  if (method === 'getMe') {
    return json({ ok: true, result: { id: 777, is_bot: true, username: 't', first_name: 'S' } });
  }
  if (method === 'sendMessage' || method === 'editMessageText') {
    return json({ ok: true, result: { message_id: mid++, date: 0, chat: CHAT, text: body.text } });
  }
  return json({ ok: true, result: true });
};

const app = createApp({ token: '123:test', fetch: fakeFetch });
await app.bot.init();

let uid = 0;
const send = async (text) => {
  try {
    await app.bot.handleUpdate({
      update_id: ++uid,
      message: { message_id: ++uid, date: 0, chat: CHAT, from: USER, text },
    });
  } catch (err) {
    console.log(`!! handleUpdate('${text}') nolak:`, err?.message ?? err);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dump = (label) => {
  console.log(`\n== ${label} ==`);
  for (const e of log.splice(0)) console.log(`   ${e.method}: ${JSON.stringify((e.text ?? '').slice(0, 60))}`);
  console.log('   active job:', spam.getActiveJob(-100)?.total ?? 'nggak ada');
};

await send('/spam 3 --delay=150');
await sleep(1200);
dump('/spam 3');

await send('/spam 2 woi woi');
await sleep(900);
dump('/spam 2 woi woi');

await send('/help');
await sleep(300);
dump('/help');

await send('/chaos on');
await sleep(1500);
dump('/chaos on');

await send('halo');
await sleep(600);
dump('pesan biasa');

process.exit(0);

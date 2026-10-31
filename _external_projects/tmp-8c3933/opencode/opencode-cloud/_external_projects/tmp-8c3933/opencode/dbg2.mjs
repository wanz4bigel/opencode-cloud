process.env.BOT_TOKEN = '123:test';
const { createApp } = await import('/home/runner/telegram-spam-bot/src/app.js');
const json = (v) => ({ ok: true, status: 200, json: async () => v });

const CHAT = { id: -100, type: 'supergroup' };
const fakeFetch = async (url, options) => {
  const method = new URL(url).pathname.split('/').pop();
  if (method === 'getMe') {
    return json({ ok: true, result: { id: 777, is_bot: true, username: 't', first_name: 'S' } });
  }
  console.log(`\n### ${method}`);
  console.log('option keys:', Object.keys(options));
  console.log('headers:', JSON.stringify(options.headers));
  console.log('body type:', typeof options.body, 'asyncIter:', typeof options.body === 'object' && Symbol.asyncIterator in options.body);
  let raw = '';
  if (typeof options.body === 'string') raw = options.body;
  else if (options.body && Symbol.asyncIterator in options.body) {
    for await (const c of options.body) raw += Buffer.from(c).toString('utf8');
  }
  console.log('raw body:', JSON.stringify(raw.slice(0, 400)));
  return json({ ok: true, result: { message_id: 5, date: 0, chat: CHAT, text: 'x' } });
};

const app = createApp({ token: '123:test', fetch: fakeFetch });
await app.bot.init();
await app.bot.handleUpdate({
  update_id: 1,
  message: { message_id: 1, date: 0, chat: CHAT, from: { id: 1, is_bot: false, first_name: 'U' }, text: '/help' },
});
process.exit(0);

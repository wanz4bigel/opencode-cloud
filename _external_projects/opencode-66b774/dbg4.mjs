process.env.BOT_TOKEN = '123:test';
process.env.ADMIN_IDS = '111';
const { createApp } = await import('/home/runner/telegram-spam-bot/src/app.js');

const json = (v) => ({ ok: true, status: 200, json: async () => v });
const seen = [];
let stop = false;
const fakeFetch = async (url, options) => {
  const method = new URL(url).pathname.split('/').pop();
  seen.push(method);
  if (method === 'getMe') {
    return json({
      ok: true,
      result: { id: 777, is_bot: true, username: 'spam_test_bot', first_name: 'S', supports_guest_queries: true },
    });
  }
  if (method === 'getUpdates') {
    if (stop) {
      await new Promise((r) => setTimeout(r, 800));
      throw new Error('polling ditutup');
    }
    return json({ ok: true, result: [] });
  }
  return json({ ok: true, result: true });
};

const app = createApp({ token: '123:test', fetch: fakeFetch });
app.start().catch((err) => console.log('start error:', err?.message ?? err));
setTimeout(async () => {
  stop = true;
  await app.shutdown('TEST');
  console.log('metode yang dipanggil:', [...new Set(seen)].join(', '));
  process.exit(0);
}, 1500);

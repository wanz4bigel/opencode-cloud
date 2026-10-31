process.env.BOT_TOKEN = '123:test';
const { createApp } = await import('/home/runner/telegram-spam-bot/src/app.js');
const json = (v) => ({ ok: true, status: 200, json: async () => v });

const fakeFetch = async (url) => {
  const method = new URL(url).pathname.split('/').pop();
  if (method === 'getMe') {
    return json({ ok: true, result: { id: 777, is_bot: true, username: 't', first_name: 'S', supports_guest_queries: true } });
  }
  if (method === 'getUpdates') {
    // long poll beneran: nahan 25 detik kayak Telegram
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 25_000);
      const bye = () => {
        clearTimeout(t);
        reject(new Error('koneksi ditutup'));
      };
      process.once('SIGTERM', () => {});
      return bye;
    });
  }
  return json({ ok: true, result: [] });
};

const app = createApp({ token: '123:test', fetch: fakeFetch });
const t0 = Date.now();
app.start().catch((err) => console.log('start reject:', err?.message ?? err));
setTimeout(() => {
  process.kill(process.pid, 'SIGTERM');
  console.log(`SIGTERM dikirim pada +${Date.now() - t0}ms`);
}, 1200);

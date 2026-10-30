// Strata relay: Cloudflare Worker + Durable Object (hibernatable WebSocket).
// Agent (sandbox) connects to /_agent?k=AGENT_TOKEN and proxies to 127.0.0.1:8081.
// Protocol (verified live):
//   DO -> agent : {"type":"req","id","method","path","headers"[, "body":b64]}
//                 {"type":"chunk","id","data":b64}
//                 {"type":"end","id"}
//   agent -> DO : {"type":"res","id","status","headers"}
//                 {"type":"chunk","id","data":b64}
//                 {"type":"end","id"}

const MAX_BODY = 64 * 1024 * 1024;
const CHUNK = 16 * 1024;
const MAX_PENDING = 16;
const HEADER_WAIT_MS = 45_000;
const IDLE_MS = 180_000;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-max-age": "86400",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS, ...extra },
  });
}

function b64(bytes) {
  let s = "";
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += 8192) {
    s += String.fromCharCode.apply(null, view.subarray(i, i + 8192));
  }
  return btoa(s);
}

function unb64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class Relay {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.pending = new Map();
    this.waiting = 0;
    this.dropped = 0;
    this.startedAt = Date.now();
  }

  agentSocket() {
    const socks = this.state.getWebSockets("agent");
    return socks.length ? socks[socks.length - 1] : null;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/_agent") {
      if (request.headers.get("upgrade") !== "websocket") {
        return new Response("expected websocket", { status: 400 });
      }
      if (url.searchParams.get("k") !== this.env.AGENT_TOKEN) {
        return new Response("forbidden", { status: 403 });
      }
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1], ["agent"]);
      // koneksi baru: batalkan sisa request lama
      for (const [id, p] of this.pending) {
        try { p.fail(502, "agent reconnected"); } catch (_) {}
        this.pending.delete(id);
      }
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (url.pathname === "/_reset") {
      if (url.searchParams.get("k") !== this.env.AGENT_TOKEN) {
        return new Response("forbidden", { status: 403 });
      }
      for (const ws of this.state.getWebSockets("agent")) {
        try { ws.close(1012, "reset"); } catch (_) {}
      }
      return json({ ok: true, closed: true });
    }

    if (url.pathname === "/_health") {
      const ws = this.agentSocket();
      return json({
        agent: !!ws,
        connected_s: ws ? Math.round((Date.now() - this.startedAt) / 1000) : 0,
        pending: this.pending.size,
        waiting: this.waiting,
        dropped: this.dropped,
      });
    }

    return this.proxy(request, url);
  }

  async proxy(request, url) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const key = this.env.STRATA_API_KEY;
    const auth = request.headers.get("authorization") || "";
    if (key && auth !== `Bearer ${key}`) {
      return json({ error: { message: "API key salah", type: "invalid_api_key" } }, 401);
    }

    if (this.pending.size >= MAX_PENDING) {
      return json({ error: { message: "terlalu banyak permintaan", type: "rate_limit" } }, 429);
    }

    // tunggu agent sampai 10 detik
    let ws = this.agentSocket();
    if (!ws) {
      const until = Date.now() + 10_000;
      this.waiting++;
      try {
        while (Date.now() < until) {
          await new Promise((r) => setTimeout(r, 250));
          ws = this.agentSocket();
          if (ws) break;
        }
      } finally {
        this.waiting--;
      }
    }
    if (!ws) {
      this.dropped++;
      return json({
        error: { message: "agent sandbox belum tersambung, coba lagi", type: "relay_error" },
        retry_after_ms: 2000,
      }, 503);
    }

    let body = new Uint8Array(0);
    if (request.method !== "GET" && request.method !== "HEAD") {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_BODY) {
        return json({ error: { message: "body terlalu besar", type: "too_large" } }, 413);
      }
      body = new Uint8Array(buf);
    }

    const id = crypto.randomUUID();
    const headers = {};
    for (const [k, v] of request.headers) {
      if (k === "host" || k === "cf-connecting-ip" || k === "cf-ray" || k === "cf-visitor" ||
          k === "x-forwarded-proto" || k === "content-length") continue;
      headers[k] = v;
    }

    const reqFrame = { type: "req", id, method: request.method, path: url.pathname + url.search, headers };
    const frames = [JSON.stringify(reqFrame)];
    for (let i = 0; i < body.length; i += CHUNK) {
      frames.push(JSON.stringify({ type: "chunk", id, data: b64(body.subarray(i, i + CHUNK)) }));
    }
    frames.push(JSON.stringify({ type: "end", id }));

    let resolveHead;
    const head = new Promise((res, rej) => {
      resolveHead = { res, rej };
    });

    let streamCtl;
    const stream = new ReadableStream({
      start(ctl) { streamCtl = ctl; },
      cancel: () => {
        const p = this.pending.get(id);
        if (p && ws) {
          try { ws.send(JSON.stringify({ type: "cancel", id })); } catch (_) {}
        }
        this.pending.delete(id);
      },
    });

    const idle = setTimeout(() => {
      const p = this.pending.get(id);
      if (p) { p.fail(504, "timeout"); this.pending.delete(id); }
    }, IDLE_MS);

    this.pending.set(id, {
      write: (u8) => { try { streamCtl.enqueue(u8); } catch (_) {} },
      head: (status, hdrs) => resolveHead.res({ status, hdrs }),
      end: () => { clearTimeout(idle); try { streamCtl.close(); } catch (_) {} },
      fail: (status, message) => {
        clearTimeout(idle);
        resolveHead.rej(new Error(message));
        try { streamCtl.error(new Error(message)); } catch (_) {}
      },
    });

    try {
      for (const f of frames) ws.send(f);
    } catch (e) {
      this.pending.delete(id);
      clearTimeout(idle);
      return json({ error: { message: "agent terputus", type: "relay_error" } }, 503);
    }

    let head2;
    try {
      head2 = await head;
    } catch (e) {
      clearTimeout(idle);
      return json({ error: { message: String(e.message || e), type: "relay_error" } }, 502);
    }

    const outHeaders = new Headers(head2.hdrs || {});
    outHeaders.set("access-control-allow-origin", "*");
    outHeaders.set("cache-control", "no-cache");
    if (!outHeaders.has("content-type")) outHeaders.set("content-type", "application/json");

    return new Response(request.method === "HEAD" ? null : stream, {
      status: head2.status,
      headers: outHeaders,
    });
  }

  async webSocketMessage(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    } catch (_) {
      return;
    }
    const id = msg.id;
    const p = this.pending.get(id);
    if (!p) return;
    if (msg.type === "res") {
      p.head(msg.status || 200, msg.headers || {});
    } else if (msg.type === "chunk") {
      try { p.write(unb64(msg.data)); } catch (_) {}
    } else if (msg.type === "end") {
      p.end();
      this.pending.delete(id);
    }
  }

  async webSocketClose(ws, code, reason) {
    for (const [id, p] of this.pending) {
      try { p.fail(502, "agent terputus"); } catch (_) {}
      this.pending.delete(id);
    }
    try { ws.close(code, reason); } catch (_) {}
  }

  async webSocketError(ws, error) {
    await this.webSocketClose(ws, 1011, "ws error");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/_health" || url.pathname === "/_agent" || url.pathname === "/_reset") {
      const stub = env.RELAY.get(env.RELAY.idFromName(env.DO_NAME || "main"));
      return stub.fetch(request);
    }
    const stub = env.RELAY.get(env.RELAY.idFromName(env.DO_NAME || "main"));
    return stub.fetch(request);
  },
};

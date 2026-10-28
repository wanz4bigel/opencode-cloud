/**
 * Strata relay — Worker + Durable Object.
 *
 *   internet --443--> Cloudflare edge --> Worker --> DO (WebSocket) --> agent sandbox --> 127.0.0.1:8081
 *
 * Prinsip: kalau agent sedang reconnect, request ditahan sebentar (bukan
 * langsung 503), dan tiap request punya watchdog supaya tidak nyangkut.
 */

const MAX_FRAME = 32 * 1024;
const MAX_PENDING = 16;
const HEAD_TIMEOUT_MS = 20_000;
const IDLE_TIMEOUT_MS = 120_000;
const AGENT_WAIT_MS = 10_000;

const HOP = new Set([
  "connection", "keep-alive", "transfer-encoding", "upgrade",
  "proxy-connection", "te", "trailer", "host", "content-length",
]);

function toB64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  }
  return btoa(s);
}

function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type, x-api-key, anthropic-version, anthropic-beta",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-max-age": "86400",
};

function json(obj, status, extra = {}) {
  return Response.json(obj, { status, headers: { ...CORS, ...extra } });
}

// Ganti nilai ini setiap deploy besar: memaksa instance Durable Object baru,
// karena instance lama tetap menjalankan kode lama selama agent tersambung.
const DO_NAME = "main-2026-10-28a";

export default {
  async fetch(request, env) {
    const id = env.RELAY.idFromName(DO_NAME);
    return env.RELAY.get(id).fetch(request);
  },
};

export class Relay {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.ws = null;
    this.pending = new Map();
    this.waiters = [];
    this.connectedAt = 0;
    this.dropped = 0;
  }

  // ---------------------------------------------------------------- agent side

  resolveWaiters() {
    const list = this.waiters;
    this.waiters = [];
    for (const fn of list) fn(true);
  }

  waitForAgent(ms) {
    if (this.ws) return Promise.resolve(true);
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        resolve(ok);
      };
      this.waiters.push(finish);
      setTimeout(() => {
        const i = this.waiters.indexOf(finish);
        if (i >= 0) this.waiters.splice(i, 1);
        finish(!!this.ws);
      }, ms);
    });
  }

  acceptAgent(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    if (this.ws) {
      try { this.ws.close(1012, "replaced"); } catch (_) {}
    }
    this.ws = server;
    this.connectedAt = Date.now();

    server.addEventListener("message", (ev) => this.onAgentMessage(ev.data));
    server.addEventListener("close", () => {
      if (this.ws === server) {
        this.ws = null;
        this.failAll("agent terputus");
      }
    });
    server.addEventListener("error", () => {
      if (this.ws === server) {
        this.ws = null;
        this.failAll("agent error");
      }
    });

    this.resolveWaiters();
    return new Response(null, { status: 101, webSocket: client });
  }

  send(obj) {
    if (!this.ws) return false;
    try { this.ws.send(JSON.stringify(obj)); return true; } catch (_) { return false; }
  }

  failAll(reason) {
    for (const [id, entry] of this.pending) {
      this.pending.delete(id);
      entry.clear();
      if (!entry.headDone) entry.finishHead(502, { "content-type": "application/json" });
      try { entry.controller.error(new Error(reason)); } catch (_) {}
    }
  }

  onAgentMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    const entry = this.pending.get(msg.id);
    if (!entry) return;
    entry.touch();

    switch (msg.type) {
      case "res": {
        const headers = {};
        for (const [k, v] of Object.entries(msg.headers || {})) {
          if (!HOP.has(k.toLowerCase())) headers[k.toLowerCase()] = v;
        }
        entry.finishHead(msg.status || 502, headers);
        break;
      }
      case "chunk":
        if (!entry.headDone) entry.finishHead(200, {});
        try { entry.controller.enqueue(fromB64(msg.data)); } catch (_) {}
        break;
      case "done":
        if (!entry.headDone) entry.finishHead(502, { "content-type": "application/json" });
        this.finish(msg.id, entry);
        break;
      case "error":
        if (!entry.headDone) {
          entry.finishHead(502, { "content-type": "application/json" });
          try {
            entry.controller.enqueue(new TextEncoder().encode(
              JSON.stringify({ error: { message: msg.message, type: "agent_error" } })));
          } catch (_) {}
        }
        this.finish(msg.id, entry);
        break;
    }
  }

  finish(id, entry) {
    this.pending.delete(id);
    entry.clear();
    try { entry.controller.close(); } catch (_) {}
  }

  // ------------------------------------------------------------- client side

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/_agent") {
      const token = request.headers.get("x-agent-token") || url.searchParams.get("k");
      if (token !== this.env.AGENT_TOKEN) return new Response("forbidden", { status: 403 });
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected websocket", { status: 400 });
      }
      return this.acceptAgent(request);
    }

    if (url.pathname === "/_reset" && request.method === "POST") {
      if (url.searchParams.get("k") !== this.env.AGENT_TOKEN) {
        return new Response("forbidden", { status: 403 });
      }
      this.failAll("reset manual");
      try { this.ws?.close(1012, "reset"); } catch (_) {}
      this.ws = null;
      return json({ ok: true, dropped: this.dropped }, 200);
    }

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === "/_health") {
      return json({
        agent: !!this.ws,
        connected_s: this.connectedAt ? Math.round((Date.now() - this.connectedAt) / 1000) : 0,
        pending: this.pending.size,
        waiting: this.waiters.length,
        dropped: this.dropped,
      }, 200);
    }

    if (url.pathname.startsWith("/v1/")) {
      const key = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
        || request.headers.get("x-api-key") || "";
      if (key !== this.env.STRATA_API_KEY) {
        return json({ error: { message: "invalid api key", type: "auth_error" } }, 401);
      }
    }

    if (!(await this.waitForAgent(AGENT_WAIT_MS))) {
      this.dropped++;
      return json({
        error: { message: "agent sandbox belum tersambung, coba lagi", type: "relay_error" },
        retry_after_ms: 2000,
      }, 503, { "retry-after": "2" });
    }

    if (this.pending.size >= MAX_PENDING) {
      return json({
        error: { message: "terlalu banyak request berjalan", type: "relay_busy" },
        retry_after_ms: 1000,
      }, 429, { "retry-after": "1" });
    }

    return this.proxy(request, url);
  }

  async proxy(request, url) {
    const id = crypto.randomUUID();
    let finishHead;
    let idleTimer = null;

    const entry = {
      headDone: false,
      controller: null,
      status: 502,
      headers: {},
      finishHead: (status, headers) => {
        if (entry.headDone) return;
        entry.headDone = true;
        entry.status = status;
        entry.headers = { ...headers };
        finishHead(entry);
      },
      clear: () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = null;
      },
      touch: () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => entry.abort("idle"), IDLE_TIMEOUT_MS);
      },
      abort: (why) => {
        const e = this.pending.get(id);
        if (!e) return;
        this.pending.delete(id);
        e.clear();
        this.send({ type: "cancel", id });
        if (!e.headDone) {
          e.headDone = true;
          e.status = 504;
          e.headers = { "content-type": "application/json" };
          finishHead(e);
          try {
            e.controller.enqueue(new TextEncoder().encode(
              JSON.stringify({ error: { message: `timeout (${why})`, type: "relay_timeout" } })));
          } catch (_) {}
        }
        try { e.controller.close(); } catch (_) {}
      },
    };

    const headPromise = new Promise((resolve) => { finishHead = resolve; });
    const stream = new ReadableStream({
      start: (c) => { entry.controller = c; },
      cancel: () => {
        const e = this.pending.get(id);
        if (!e) return;
        this.pending.delete(id);
        e.clear();
        this.send({ type: "cancel", id });
      },
    });

    this.pending.set(id, entry);
    entry.touch();

    const headers = {};
    for (const [k, v] of request.headers) {
      if (!HOP.has(k.toLowerCase())) headers[k] = v;
    }
    this.send({ type: "req", id, method: request.method, path: url.pathname + url.search, headers });

    if (request.body) {
      const reader = request.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (let i = 0; i < value.length; i += MAX_FRAME) {
            this.send({ type: "chunk", id, data: toB64(value.subarray(i, i + MAX_FRAME)) });
          }
        }
      } catch (_) { /* klien putus saat upload */ }
    }
    this.send({ type: "end", id });

    const timer = new Promise((r) => setTimeout(() => r("timeout"), HEAD_TIMEOUT_MS));
    const winner = await Promise.race([headPromise, timer]);
    if (winner === "timeout") {
      const e = this.pending.get(id);
      if (e) e.abort("head");
      return json({ error: { message: "agent tidak menjawab", type: "relay_timeout" } }, 504);
    }

    const status = entry.status || 200;
    const outHeaders = new Headers({ ...(entry.headers || {}), ...CORS });
    if (!outHeaders.has("content-type")) outHeaders.set("content-type", "application/json");
    return new Response(request.method === "HEAD" ? null : stream, { status, headers: outHeaders });
  }
}

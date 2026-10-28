/**
 * Strata relay — Worker + Durable Object.
 *
 *   internet --443--> Cloudflare edge --> Worker --> DO (WebSocket) --> agent di sandbox --> 127.0.0.1:8081
 *
 * Semua trafik keluar dari sandbox lewat WebSocket di port 443, jadi molab
 * (yang memblokir 7844) tidak jadi masalah.
 */

const MAX_FRAME = 128 * 1024;          // byte mentah per frame WS
const HEAD_TIMEOUT_MS = 30_000;        // tunggu status+header dari agent

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

export default {
  async fetch(request, env) {
    const id = env.RELAY.idFromName("main");
    return env.RELAY.get(id).fetch(request);
  },
};

export class Relay {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.ws = null;
    this.pending = new Map();
  }

  // ---------------------------------------------------------------- agent side

  acceptAgent(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    if (this.ws) {
      try { this.ws.close(1012, "replaced"); } catch (_) {}
    }
    this.ws = server;

    server.addEventListener("message", (ev) => this.onAgentMessage(ev.data));
    server.addEventListener("close", () => {
      if (this.ws === server) this.ws = null;
      this.failAll("agent terputus");
    });
    server.addEventListener("error", () => {
      if (this.ws === server) this.ws = null;
      this.failAll("agent error");
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  send(obj) {
    if (!this.ws) return false;
    try { this.ws.send(JSON.stringify(obj)); return true; } catch (_) { return false; }
  }

  failAll(reason) {
    for (const [id, entry] of this.pending) {
      this.pending.delete(id);
      if (!entry.headDone) entry.finishHead(502, { "content-type": "application/json" });
      try { entry.controller.error(new Error(reason)); } catch (_) {}
    }
  }

  onAgentMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    const entry = this.pending.get(msg.id);
    if (!entry) return;

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
        this.pending.delete(msg.id);
        try { entry.controller.close(); } catch (_) {}
        break;
      case "error":
        if (!entry.headDone) {
          entry.finishHead(502, { "content-type": "application/json" });
          try { entry.controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: msg.message }))); } catch (_) {}
        }
        this.pending.delete(msg.id);
        try { entry.controller.close(); } catch (_) {}
        break;
    }
  }

  // ------------------------------------------------------------- client side

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/_agent") {
      const token = request.headers.get("x-agent-token") || url.searchParams.get("k");
      if (token !== this.env.AGENT_TOKEN) {
        return new Response("forbidden", { status: 403 });
      }
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected websocket", { status: 400 });
      }
      return this.acceptAgent(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === "/_health") {
      return Response.json({ agent: !!this.ws, pending: this.pending.size }, { headers: CORS });
    }

    if (url.pathname.startsWith("/v1/")) {
      const key = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
        || request.headers.get("x-api-key") || "";
      if (key !== this.env.STRATA_API_KEY) {
        return Response.json({ error: { message: "invalid api key", type: "auth_error" } },
          { status: 401, headers: CORS });
      }
    }

    if (!this.ws) {
      return Response.json({ error: { message: "sandbox agent offline", type: "relay_error" } },
        { status: 503, headers: { ...CORS, "retry-after": "5" } });
    }

    return this.proxy(request, url);
  }

  async proxy(request, url) {
    const id = crypto.randomUUID();
    let finishHead;
    const entry = {
      headDone: false,
      controller: null,
      finishHead: (status, headers) => {
        if (entry.headDone) return;
        entry.headDone = true;
        entry.status = status;
        entry.headers = { ...headers, ...CORS };
        finishHead(entry);
      },
    };

    const headPromise = new Promise((resolve) => { finishHead = resolve; });
    const stream = new ReadableStream({
      start: (c) => { entry.controller = c; },
      cancel: () => {
        this.pending.delete(id);
        this.send({ type: "cancel", id });
      },
    });
    this.pending.set(id, entry);

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
      } catch (_) { /* client putus */ }
    }
    this.send({ type: "end", id });

    const timer = new Promise((r) => setTimeout(() => r("timeout"), HEAD_TIMEOUT_MS));
    const winner = await Promise.race([headPromise, timer]);
    if (winner === "timeout" && !entry.headDone) {
      this.pending.delete(id);
      this.send({ type: "cancel", id });
      return Response.json({ error: { message: "agent timeout", type: "relay_error" } },
        { status: 504, headers: CORS });
    }

    const status = entry.status || 200;
    const outHeaders = new Headers(entry.headers || CORS);
    if (!outHeaders.has("content-type")) outHeaders.set("content-type", "application/json");
    return new Response(request.method === "HEAD" ? null : stream, { status, headers: outHeaders });
  }
}

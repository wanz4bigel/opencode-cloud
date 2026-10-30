#!/usr/bin/env python3
"""Agent relay: WebSocket Cloudflare DO  <->  engine lokal 127.0.0.1:8081.

Protokol (terverifikasi dari luar):
  DO  -> agent : {"type":"req","id","method","path","headers"[,"body"]}
                 {"type":"chunk","id","data":b64}      (body request, opsional)
                 {"type":"end","id"}                    (akhir body request)
                 {"type":"cancel","id"}                 (klien putus)
  agent -> DO  : {"type":"res","id","status","headers"}
                 {"type":"chunk","id","data":b64}
                 {"type":"end","id"}
"""
import asyncio
import base64
import json
import os
import signal
import sys
import time

import aiohttp
from websockets.asyncio.client import connect

WS_URL = os.environ.get("RELAY_URL", "wss://ai.wanz4bigel.dpdns.org/_agent")
TOKEN = os.environ.get("AGENT_TOKEN", "")
UPSTREAM = os.environ.get("UPSTREAM", "http://127.0.0.1:8081")
CHUNK = 16 * 1024

DROP_REQ = {"host", "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailer", "transfer-encoding", "upgrade", "content-length",
            "accept-encoding", "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor",
            "x-forwarded-proto", "x-forwarded-for", "x-real-ip", "cdn-loop"}
DROP_RES = {"connection", "keep-alive", "transfer-encoding", "content-encoding",
            "content-length", "date", "server", "set-cookie"}


def log(*a):
    print(time.strftime("[%H:%M:%S]"), *a, flush=True)


def filt(headers, drop):
    return {k: v for k, v in headers.items() if k.lower() not in drop}


class Agent:
    def __init__(self, session):
        self.session = session
        self.ws = None
        self.tasks = {}

    async def send(self, obj):
        await self.ws.send(json.dumps(obj))

    async def handle(self, rid, method, path, headers, body):
        url = UPSTREAM + path
        h = filt(headers, DROP_REQ)
        try:
            async with self.session.request(method, url, headers=h, data=body or None,
                                            allow_redirects=False) as resp:
                await self.send({"type": "res", "id": rid, "status": resp.status,
                                 "headers": filt(dict(resp.headers), DROP_RES)})
                sent = 0
                async for chunk in resp.content.iter_chunked(CHUNK):
                    if not chunk:
                        continue
                    await self.send({"type": "chunk", "id": rid,
                                     "data": base64.b64encode(chunk).decode()})
                    sent += len(chunk)
                await self.send({"type": "end", "id": rid})
                log("%s %s -> %s (%d B)" % (method, path, resp.status, sent))
        except asyncio.CancelledError:
            log("%s %s dibatalkan" % (method, path))
            raise
        except Exception as e:
            log("%s %s GAGAL %s: %s" % (method, path, type(e).__name__, str(e)[:120]))
            try:
                await self.send({"type": "res", "id": rid, "status": 502,
                                 "headers": {"content-type": "application/json"}})
                await self.send({"type": "chunk", "id": rid,
                                 "data": base64.b64encode(
                                     json.dumps({"error": str(e)[:200]}).encode()).decode()})
                await self.send({"type": "end", "id": rid})
            except Exception:
                pass

    async def run(self):
        url = "%s?k=%s" % (WS_URL, TOKEN)
        async with connect(url, open_timeout=20, ping_interval=15, ping_timeout=60,
                           max_size=None) as ws:
            self.ws = ws
            log("tersambung ke relay")
            pending = {}
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                except ValueError:
                    continue
                t = msg.get("type")
                rid = msg.get("id")
                if t == "req":
                    pending[rid] = {"method": msg.get("method", "GET"),
                                    "path": msg.get("path", "/"),
                                    "headers": msg.get("headers") or {},
                                    "body": base64.b64decode(msg["body"]) if msg.get("body") else b""}
                elif t == "chunk" and rid in pending:
                    pending[rid]["body"] += base64.b64decode(msg.get("data") or "")
                elif t == "end" and rid in pending:
                    p = pending.pop(rid)
                    task = asyncio.create_task(
                        self.handle(rid, p["method"], p["path"], p["headers"], p["body"]))
                    self.tasks[rid] = task
                    task.add_done_callback(lambda _t, r=rid: self.tasks.pop(r, None))
                elif t == "cancel" and rid in self.tasks:
                    self.tasks[rid].cancel()
            log("relay menutup koneksi")


async def main():
    async with aiohttp.ClientSession(auto_decompress=True,
                                     timeout=aiohttp.ClientTimeout(total=None, sock_connect=10,
                                                                   sock_read=600)) as session:
        agent = Agent(session)
        backoff = 2
        while True:
            try:
                await agent.run()
                backoff = 2
            except asyncio.CancelledError:
                raise
            except Exception as e:
                log("error %s: %s" % (type(e).__name__, str(e)[:150]))
            log("sambung ulang dalam %ds" % backoff)
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass

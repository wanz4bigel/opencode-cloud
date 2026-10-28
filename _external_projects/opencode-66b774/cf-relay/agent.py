#!/usr/bin/env python3
"""Agent relay untuk Strata: WebSocket keluar (443) -> HTTP 127.0.0.1:8081.

Dijalankan di dalam sandbox. Sambung ke Worker, lalu teruskan request yang
datang lewat WebSocket ke server Strata lokal. Reconnect otomatis.
"""
from __future__ import annotations

import asyncio
import base64
import http.client
import json
import os
import sys
import threading
import time

import websockets

LOCAL_HOST = os.environ.get("LOCAL_HOST", "127.0.0.1")
LOCAL_PORT = int(os.environ.get("LOCAL_PORT", "8081"))
RELAY_URL = os.environ["RELAY_URL"]          # wss://ai.wanz4bigel.dpdns.org/_agent
AGENT_TOKEN = os.environ["AGENT_TOKEN"]
CHUNK = 64 * 1024

DROP = {"host", "connection", "content-length", "transfer-encoding",
        "accept-encoding", "keep-alive", "upgrade"}


class Bridge:
    def __init__(self) -> None:
        self.loop = asyncio.get_running_loop()
        self.out: asyncio.Queue[str] = asyncio.Queue()
        self.bodies: dict[str, bytearray] = {}
        self.heads: dict[str, dict] = {}

    # dipanggil dari thread mana pun
    def emit(self, obj: dict) -> None:
        try:
            self.loop.call_soon_threadsafe(self.out.put_nowait, json.dumps(obj))
        except RuntimeError:
            pass

    def forward(self, head: dict) -> None:
        def work() -> None:
            rid = head["id"]
            body = bytes(self.bodies.pop(rid, b""))
            headers = {k: v for k, v in (head.get("headers") or {}).items()
                       if k.lower() not in DROP}
            conn = http.client.HTTPConnection(LOCAL_HOST, LOCAL_PORT, timeout=3600)
            try:
                conn.request(head["method"], head["path"], body=body or None, headers=headers)
                resp = conn.getresponse()
                self.emit({"type": "res", "id": rid, "status": resp.status,
                           "headers": dict(resp.getheaders())})
                while True:
                    block = resp.read1(CHUNK) if hasattr(resp, "read1") else resp.read(CHUNK)
                    if not block:
                        break
                    self.emit({"type": "chunk", "id": rid,
                               "data": base64.b64encode(block).decode()})
            except Exception as exc:  # noqa: BLE001
                self.emit({"type": "error", "id": rid, "message": f"{type(exc).__name__}: {exc}"})
            finally:
                try:
                    conn.close()
                except Exception:  # noqa: BLE001
                    pass
                self.emit({"type": "done", "id": rid})

        threading.Thread(target=work, daemon=True).start()

    async def sender(self, ws) -> None:
        while True:
            msg = await self.out.get()
            await ws.send(msg)


async def session(ws) -> None:
    bridge = Bridge()
    pump = asyncio.create_task(bridge.sender(ws))
    print(f"[{time.strftime('%H:%M:%S')}] agent terhubung", flush=True)
    try:
        async for raw in ws:
            if isinstance(raw, bytes):
                continue
            try:
                msg = json.loads(raw)
            except ValueError:
                continue
            kind = msg.get("type")
            rid = msg.get("id")
            if kind == "req":
                bridge.bodies[rid] = bytearray()
                bridge.heads[rid] = msg
            elif kind == "chunk":
                bridge.bodies.setdefault(rid, bytearray()).extend(base64.b64decode(msg["data"]))
            elif kind == "end":
                head = bridge.heads.pop(rid, None)
                if head is not None:
                    bridge.forward(head)
            elif kind == "cancel":
                bridge.bodies.pop(rid, None)
                bridge.heads.pop(rid, None)
    finally:
        pump.cancel()


async def main() -> None:
    backoff = 1
    while True:
        try:
            async with websockets.connect(RELAY_URL, ping_interval=20, ping_timeout=30,
                                          max_size=None, open_timeout=20) as ws:
                backoff = 1
                await session(ws)
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001
            print(f"[{time.strftime('%H:%M:%S')}] terputus: {type(exc).__name__}: {exc}",
                  file=sys.stderr, flush=True)
        await asyncio.sleep(backoff)
        backoff = min(backoff * 2, 15)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass

#!/usr/bin/env python3
"""Penulis /marimo/llm/status.json — dipakai dashboard marimo untuk progress realtime."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import time

MODEL_DIR = "/home/marimo/models/sc117/IQ3_S"
TOTAL_BYTES = 83_863_586_496          # shard1 + shard2
PHASE_FILE = "/marimo/llm/phase"
OUT = "/marimo/llm/status.json"
KEY = open("/marimo/llm/api_key.txt").read().strip() if os.path.exists("/marimo/llm/api_key.txt") else ""

LABEL = {
    "start": "menyiapkan",
    "strata": "memasang Strata",
    "download": "mengunduh model",
    "aux": "mengunduh runtime",
    "prep": "menyiapkan berkas",
    "launch": "memuat model ke GPU",
    "relay": "menyambung ke Cloudflare",
    "done": "selesai",
}


def du(path: str) -> int:
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def ram_gb() -> float:
    try:
        with open("/proc/meminfo") as fh:
            info = {line.split(":")[0]: int(line.split()[1]) for line in fh if ":" in line}
        return round((info["MemTotal"] - info["MemAvailable"]) / 1024 / 1024, 1)
    except Exception:  # noqa: BLE001
        return 0.0


def vram_gb() -> float:
    try:
        out = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=3).stdout.strip().splitlines()
        return round(int(out[0]) / 1024, 1) if out else 0.0
    except Exception:  # noqa: BLE001
        return 0.0


def http_code(url: str, timeout: int = 3) -> int:
    try:
        out = subprocess.run(
            ["curl", "-s", "-m", str(timeout), "-o", "/dev/null", "-w", "%{http_code}",
             url, "-H", f"Authorization: Bearer {KEY}"],
            capture_output=True, text=True, timeout=timeout + 3).stdout.strip()
        return int(out or 0)
    except Exception:  # noqa: BLE001
        return 0


def main() -> None:
    t0 = time.time()
    last_bytes, last_t = 0, t0
    speed = 0.0
    while True:
        try:
            phase = open(PHASE_FILE).read().strip() or "start"
        except OSError:
            phase = "start"

        downloading = phase in ("download", "aux")
        size = du(MODEL_DIR) if phase in ("download", "aux", "prep", "launch") else TOTAL_BYTES
        now = time.time()
        if not downloading:
            speed = 0.0
            last_bytes, last_t = size, now
        elif now - last_t >= 2:
            inst = (size - last_bytes) / (now - last_t) / 1e6
            speed = inst if inst >= 0 else speed
            last_bytes, last_t = size, now

        pct = 100.0 if phase in ("done",) else min(99.9, size / TOTAL_BYTES * 100)
        eta = int((TOTAL_BYTES - size) / (speed * 1e6)) if speed > 1 and size < TOTAL_BYTES else 0

        server = public = 0
        if phase in ("launch", "relay", "done"):
            server = http_code("http://127.0.0.1:8081/v1/models")
        if phase in ("relay", "done"):
            public = http_code("https://ai.wanz4bigel.dpdns.org/v1/models", 5)

        state = {
            "t": time.strftime("%H:%M:%S"),
            "elapsed_s": int(now - t0),
            "phase": phase,
            "phase_label": LABEL.get(phase, phase),
            "model_gb": round(size / 1e9, 1),
            "total_gb": round(TOTAL_BYTES / 1e9, 1),
            "pct": round(pct, 1),
            "speed_mbps": round(speed, 0),
            "eta_s": eta,
            "ram_gb": ram_gb(),
            "vram_gb": vram_gb(),
            "server": server,
            "public": public,
        }
        tmp = OUT + ".tmp"
        with open(tmp, "w") as fh:
            json.dump(state, fh)
        os.replace(tmp, OUT)
        time.sleep(2)


if __name__ == "__main__":
    main()

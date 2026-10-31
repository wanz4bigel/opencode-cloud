#!/usr/bin/env python3
"""Tulis /marimo/llm/status.json tiap 2 detik untuk dashboard marimo."""
import json
import os
import pathlib
import subprocess
import time
from collections import deque

TOTAL_BYTES = 85_570_000_000          # shard1 + shard2 + mmproj
MODEL_DIR = "/home/marimo/models/sc117"
OUT = "/marimo/llm/status.json"
KEY = "sk-strata-d71951f458683d6a913c18fb1e31e4b3"

LABELS = {
    "start": "mulai",
    "strata": "memasang Strata",
    "download": "mengunduh model",
    "aux": "mengunduh runtime",
    "prep": "menyiapkan data",
    "launch": "memuat model ke GPU",
    "relay": "menyambung relay",
    "done": "selesai",
}


def du(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def ram_gb():
    info = {}
    with open("/proc/meminfo") as fh:
        for line in fh:
            k, _, v = line.partition(":")
            info[k] = int(v.split()[0])
    return (info["MemTotal"] - info["MemAvailable"]) / 1024 / 1024


def vram_gb():
    try:
        out = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=3).stdout.split()
        return int(out[0]) / 1024 if out else 0.0
    except Exception:
        return 0.0


def http_code(url, timeout=2):
    try:
        return int(subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", str(timeout),
             url, "-H", "Authorization: Bearer " + KEY],
            capture_output=True, text=True, timeout=timeout + 2).stdout.strip() or 0)
    except Exception:
        return 0


def read_phase():
    try:
        return pathlib.Path("/marimo/llm/phase").read_text().strip()
    except OSError:
        return "start"


def main():
    start = time.time()
    hist = deque(maxlen=60)          # (t, bytes)
    while True:
        try:
            now = time.time()
            size = du(MODEL_DIR)
            hist.append((now, size))
            # kecepatan = jendela 10 detik terakhir
            while len(hist) > 2 and now - hist[0][0] > 10:
                hist.popleft()
            t0, b0 = hist[0]
            speed = (size - b0) / max(now - t0, 0.001) / 1e6 if len(hist) > 1 else 0.0
            speed = max(speed, 0.0)
            phase = read_phase()
            pct = min(size / TOTAL_BYTES * 100, 100.0)
            remain = max(TOTAL_BYTES - size, 0)
            eta = int(remain / (speed * 1e6)) if speed > 1 else 0
            if phase in ("aux", "prep", "launch", "relay", "done"):
                eta = 0
            status = {
                "t": time.strftime("%H:%M:%S", time.gmtime()),
                "elapsed_s": int(now - start),
                "phase": phase,
                "phase_label": LABELS.get(phase, phase),
                "model_gb": round(size / 1e9, 1),
                "total_gb": round(TOTAL_BYTES / 1e9, 1),
                "pct": round(pct, 1),
                "speed_mbps": round(speed, 1),
                "eta_s": eta,
                "ram_gb": round(ram_gb(), 1),
                "vram_gb": round(vram_gb(), 1),
                "server": http_code("http://127.0.0.1:8081/v1/models"),
                "public": http_code("https://ai.wanz4bigel.dpdns.org/v1/models", 5),
            }
            tmp = OUT + ".tmp"
            pathlib.Path(tmp).write_text(json.dumps(status))
            os.replace(tmp, OUT)
        except Exception:
            pass
        time.sleep(2)


if __name__ == "__main__":
    main()

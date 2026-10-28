import json
import pathlib

import marimo as mo

refresh = mo.ui.refresh(default_interval="2s")

try:
    s = json.loads(pathlib.Path("/marimo/llm/status.json").read_text())
except Exception:
    s = {}

pct = float(s.get("pct") or 0)
filled = int(round(pct / 100 * 30))
bar = "█" * filled + "░" * (30 - filled)
eta = int(s.get("eta_s") or 0)
eta_txt = f"{eta // 60}m{eta % 60:02d}s" if eta else "—"
live = s.get("public") == 200
key = pathlib.Path("/marimo/llm/api_key.txt").read_text().strip() if pathlib.Path("/marimo/llm/api_key.txt").exists() else ""

mo.vstack([
    mo.md(f"""
# IQ3_S (SC117 abliterated) — {'LIVE' if live else 'sedang dibangun'}

| | |
|---|---|
| **Base URL** | `https://ai.wanz4bigel.dpdns.org/v1` |
| **API key** | `{key}` |
| **Model** | `swift-1.5-iq3_s` · 262.144 konteks · KV int8 |
| **Fase** | **{s.get('phase_label', '—')}** · {s.get('elapsed_s', 0)} detik |
| **Unduhan** | `{bar}` {pct:.1f}% · {s.get('model_gb', 0)} / {s.get('total_gb', 0)} GB · {int(s.get('speed_mbps') or 0)} MB/s · ETA {eta_txt} |
| **RAM / VRAM** | {s.get('ram_gb', 0)} GB / {s.get('vram_gb', 0)} GB |
| **Server lokal / publik** | {s.get('server', 0)} / {s.get('public', 0)} |
| **Diperbarui** | {s.get('t', '—')} |

Model ada di `/home/marimo/models/sc117` (disk, bukan `/dev/shm`), jadi RAM lega.

Kalau sandbox mati: **Relaunch** di molab → `bash /marimo/llm/pipeline.sh`.
Dashboard ini akan menampilkan progres unduhan secara langsung.
"""),
    refresh,
])

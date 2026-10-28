#!/usr/bin/env bash
# get-ip.sh - cuma nampilin public IP runner (satu baris), buat di-step lain.
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"
ip="$(get_public_ip || true)"
[ -n "$ip" ] || die "Semua endpoint pengecekan IP gagal / tidak ada akses internet."
printf '%s\n' "$ip"

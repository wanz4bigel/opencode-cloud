package main

import (
	"bytes"
	"fmt"
	"os"

	"golang.org/x/net/http2/hpack"
)

// Bandingkan: blok HPACK susunan kita vs susunan encoder rujukan x/net,
// lalu dekode kedua-duanya. Kalau rujukan bisa membacanya, blok kita sah.
func main() {
	mine, err := os.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	fields := [][2]string{
		{":method", "GET"},
		{":scheme", "https"},
		{":authority", "127.0.0.1:9444"},
		{":path", "/x"},
		{"accept-language", "en-US,en;q=0.9"},
		{"accept", "*/*"},
		{"user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"},
		{"accept-encoding", "gzip, deflate, br, zstd"},
	}
	var buf bytes.Buffer
	e := hpack.NewEncoder(&buf)
	for _, f := range fields {
		if err := e.WriteField(hpack.HeaderField{Name: f[0], Value: f[1]}); err != nil {
			fmt.Println("ERR", err)
			return
		}
	}
	ref := buf.Bytes()
	fmt.Printf("rujukan %d byte: % X\n", len(ref), ref)
	fmt.Printf("milikku %d byte: % X\n", len(mine), mine)

	fmt.Println("--- dekode rujukan:")
	dec(ref)
	fmt.Println("--- dekode milikku:")
	dec(mine)
}

func dec(b []byte) {
	var got []string
	d := hpack.NewDecoder(1<<20, func(hf hpack.HeaderField) {
		v := hf.Value
		if len(v) > 44 {
			v = v[:44] + "…"
		}
		got = append(got, hf.Name+"="+v)
	})
	// Suapkan per entri: pakai pemisah yang kita tahu dari panjang string.
	for k := 1; k <= len(b); k++ {
		if _, err := d.DecodeFull(b[:k]); err != nil {
			if k == len(b) {
				fmt.Printf("  ERROR di akhir (%d byte, %d entri): %v\n", k, len(got), err)
				return
			}
			continue
		}
	}
	for i, g := range got {
		fmt.Printf("  %2d %s\n", i+1, g)
	}
	fmt.Printf("  OK %d entri\n", len(got))
}

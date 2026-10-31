package main

import (
	"fmt"
	"os"

	"golang.org/x/net/http2/hpack"
)

// Dekodeer rujukan: kalau blok hasil h2dos bisa dibaca di sini, blok itu sah.
func main() {
	b, err := os.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	var got []hpack.HeaderField
	d := hpack.NewDecoder(1<<20, func(hf hpack.HeaderField) { got = append(got, hf) })
	if _, err := d.DecodeFull(b); err != nil {
		fmt.Printf("INVALID: %v (%d entri terbaca sebelum gagal)\\n", err, len(got))
		return
	}
	for i, hf := range got {
		v := hf.Value
		if len(v) > 52 {
			v = v[:52] + "…"
		}
		fmt.Printf("  %2d %s: %s\\n", i+1, hf.Name, v)
	}
	fmt.Printf("VALID: %d entri, %d byte\\n", len(got), len(b))
}

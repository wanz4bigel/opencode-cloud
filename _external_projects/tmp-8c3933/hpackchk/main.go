package main

import (
	"bytes"
	"fmt"
	"io"
	"os"

	"golang.org/x/net/http2/hpack"
)

// Dekode blok HPACK secara bertahap memakai hpack.Decoder sebagai io.Reader
// (buffer tumbuh), sehingga satu pemanggilan menelusuri seluruh blok.
func main() {
	b, err := os.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	var n int
	d := hpack.NewDecoder(1<<20, func(hf hpack.HeaderField) {
		n++
		v := hf.Value
		if len(v) > 46 {
			v = v[:46] + "…"
		}
		fmt.Printf("  %2d %s = %s\n", n, hf.Name, v)
	})
	r := bytes.NewReader(b)
	for r.Len() > 0 {
		if _, err := io.ReadAll(io.LimitReader(d, int64(r.Len()))); err != nil {
			fmt.Printf("ERROR setelah %d entri (%d byte tersisa): %v\n", n, r.Len(), err)
			return
		}
		chunk := make([]byte, r.Len())
		if _, err := r.Read(chunk); err != nil {
			break
		}
		if _, err := d.Write(chunk); err != nil {
			fmt.Printf("ERROR tulis: %v\n", err)
			return
		}
	}
	for {
		if _, err := io.ReadAll(io.LimitReader(d, 1<<20)); err != nil {
			fmt.Printf("ERROR (loop) setelah %d entri: %v\n", n, err)
			return
		}
		break
	}
	fmt.Printf("VALID: %d entri dekode penuh\n", n)
}

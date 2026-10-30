// Server HTTP/2 pembanding memakai net/http (Go) yang sangat ketat soal protokol.
// /big mengembalikan 512 KB agar efek "memory pinning" dari serangan bisa terlihat.
package main

import (
	"fmt"
	"log"
	"net/http"
	"runtime"
	"strings"
	"sync/atomic"
	"time"
)

var hits atomic.Int64

func main() {
	big := strings.Repeat("x", 512*1024)
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		_, _ = fmt.Fprintf(w, "proto=%s method=%s n=%d\n", r.Proto, r.Method, len(r.Header))
	})
	mux.HandleFunc("/big", func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		_, _ = fmt.Fprint(w, big)
	})
	go func() {
		for range time.Tick(2 * time.Second) {
			var ms runtime.MemStats
			runtime.ReadMemStats(&ms)
			log.Printf("gosrv req=%d heap=%.1fMB goroutine=%d", hits.Load(), float64(ms.HeapAlloc)/1e6, runtime.NumGoroutine())
		}
	}()
	s := &http.Server{Addr: "127.0.0.1:9443", Handler: mux, ReadHeaderTimeout: 10 * time.Second}
	log.Fatal(s.ListenAndServeTLS("/tmp/h2t/cert.pem", "/tmp/h2t/key.pem"))
}

// Server HTTP/2 rujukan (x/net/http2) dengan log frame opsional (H2DEBUG=1),
// dipakai untuk memvalidasi kepatuhan protokol h2dos.
package main

import (
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"runtime"
	"strings"
	"sync/atomic"
	"time"

	"golang.org/x/net/http2"
)

var hits atomic.Int64

func main() {
	dbg := os.Getenv("H2DEBUG") != ""
	var w io.Writer = io.Discard
	if dbg {
		w = os.Stdout
	}
	logger := log.New(w, "h2 ", log.Lmicroseconds)

	big := strings.Repeat("x", 512*1024)
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		fmt.Fprintf(rw, "proto=%s n=%d\n", r.Proto, len(r.Header))
	})
	mux.HandleFunc("/big", func(rw http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		fmt.Fprint(rw, big)
	})
	go func() {
		for range time.Tick(2 * time.Second) {
			var ms runtime.MemStats
			runtime.ReadMemStats(&ms)
			log.Printf("gosrv req=%d heap=%.1fMB goroutine=%d", hits.Load(), float64(ms.HeapAlloc)/1e6, runtime.NumGoroutine())
		}
	}()

	ln, err := net.Listen("tcp", "127.0.0.1:9443")
	if err != nil {
		log.Fatal(err)
	}
	cert, err := tls.LoadX509KeyPair("/tmp/h2t/cert.pem", "/tmp/h2t/key.pem")
	if err != nil {
		log.Fatal(err)
	}
	tlsCfg := &tls.Config{Certificates: []tls.Certificate{cert}, NextProtos: []string{"h2"}}
	h2s := &http2.Server{DebugLog: logger}
	log.Println("gosrv h2 di 127.0.0.1:9443")
	for {
		c, err := ln.Accept()
		if err != nil {
			log.Fatal(err)
		}
		tc := tls.Server(c, tlsCfg)
		if err := tc.Handshake(); err != nil {
			c.Close()
			continue
		}
		go http2.ServeConn(tc, mux, h2s)
	}
}

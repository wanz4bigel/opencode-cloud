package main

import (
	"fmt"
	"net/http"
	"sync/atomic"
)

var n int64

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		c := atomic.AddInt64(&n, 1)
		fmt.Fprintf(w, "ok %d\n", c)
	})
	http.ListenAndServe("127.0.0.1:9445", nil)
}

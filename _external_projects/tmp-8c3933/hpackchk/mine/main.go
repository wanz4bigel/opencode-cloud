package main

import (
	"fmt"
	"os"
	"strings"
)

var staticTable = [63][2]string{
	{}, {":authority", ""}, {":method", "GET"}, {":method", "POST"}, {":method", "HEAD"},
	{":path", "/"}, {":path", "/index.html"}, {":scheme", "http"}, {":scheme", "https"},
	{":status", "200"}, {":status", "204"}, {":status", "206"}, {":status", "304"},
	{":status", "400"}, {":status", "404"}, {":status", "500"},
	{"accept-charset", ""}, {"accept-encoding", "gzip, deflate"}, {"accept-language", ""},
	{"accept-ranges", ""}, {"accept", ""}, {"access-control-allow-origin", ""}, {"age", ""},
	{"allow", ""}, {"authorization", ""}, {"cache-control", ""}, {"content-disposition", ""},
	{"content-encoding", ""}, {"content-language", ""}, {"content-length", ""},
	{"content-location", ""}, {"content-range", ""}, {"content-type", ""}, {"cookie", ""},
	{"date", ""}, {"etag", ""}, {"expect", ""}, {"expires", ""}, {"from", ""}, {"host", ""},
	{"if-match", ""}, {"if-modified-since", ""}, {"if-none-match", ""}, {"if-range", ""},
	{"if-unmodified-since", ""}, {"last-modified", ""}, {"link", ""}, {"location", ""},
	{"max-forwards", ""}, {"proxy-authenticate", ""}, {"proxy-authorization", ""},
	{"range", ""}, {"referer", ""}, {"refresh", ""}, {"retry-after", ""}, {"server", ""},
	{"set-cookie", ""}, {"strict-transport-security", ""}, {"transfer-encoding", ""},
	{"user-agent", ""}, {"vary", ""}, {"via", ""}, {"www-authenticate", ""},
}

func hpackStr(b []byte, s string) []byte {
	if len(s) < 128 {
		b = append(b, byte(len(s)))
		return append(b, s...)
	}
	n := len(s)
	b = append(b, byte(1<<7|(n&0x7f)))
	n >>= 7
	for n > 0 {
		b = append(b, byte(n&0x7f))
		n >>= 7
	}
	return append(b, s...)
}

func hpackField(b []byte, name, value string) []byte {
	idx := 0
	nl := strings.ToLower(name)
	for i := 1; i < 62; i++ {
		if staticTable[i][0] == nl {
			idx = i
			break
		}
	}
	b = append(b, byte(0x10|idx))
	if idx == 0 {
		b = hpackStr(b, nl)
	}
	return hpackStr(b, value)
}

func main() {
	b := make([]byte, 0, 256)
	b = append(b, 0x12)                                     // :method GET
	b = append(b, 0x17, 0x05, 'h', 't', 't', 'p', 's')      // :scheme https
	b = hpackField(b, ":authority", "example.com")          //
	b = hpackField(b, "user-agent", "Mozilla/5.0 (X11; Linux x86_64) h2dos/1.0")
	b = hpackField(b, "accept", "*/*")
	b = hpackField(b, "accept-encoding", "gzip, deflate")
	b = hpackField(b, ":path", "/x?q=1")
	os.WriteFile("mine.bin", b, 0o644)
	fmt.Printf("milikku %d byte\n", len(b))
}

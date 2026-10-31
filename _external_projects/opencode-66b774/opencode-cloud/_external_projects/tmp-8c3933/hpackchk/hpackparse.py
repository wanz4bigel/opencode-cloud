import sys

names = """:authority|:method GET|:method POST|:method HEAD|:path /|:path /index.html|:scheme http|:scheme https|:status 200|:status 204|:status 206|:status 304|:status 400|:status 404|:status 500|accept-charset|accept-encoding gzip, deflate|accept-language|accept-ranges|accept|access-control-allow-origin|age|allow|authorization|cache-control|content-disposition|content-encoding|content-language|content-length|content-location|content-range|content-type|cookie|date|etag|expect|expires|from|host|if-match|if-modified-since|if-none-match|if-range|if-unmodified-since|last-modified|link|location|max-forwards|proxy-authenticate|proxy-authorization|range|referer|refresh|retry-after|server|set-cookie|strict-transport-security|transfer-encoding|user-agent|vary|via|www-authenticate""".split("|")
STATIC = [None] * 63
for i, n in enumerate(names, start=1):
    STATIC[i] = n


def integer(b, i, p):
    mask = (1 << p) - 1
    n = b[i] & mask
    i += 1
    if n < mask:
        return n, i
    sh = 7
    while True:
        c = b[i]
        i += 1
        n += (c & 0x7F) << sh
        if not c & 0x80:
            break
        sh += 7
    return n, i


def string(b, i):
    pre = b[i]
    ln, i = integer(b, i, 7)
    if pre & 0x80:
        return "[huffman]", i + ln
    return b[i:i + ln].decode("latin1"), i + ln


def parse(b, out=None):
    i = 0
    res = []
    while i < len(b):
        f = b[i]
        if f & 0x80:                      # 1xxxxxxx indexed
            i += 1
            idx = f & 0x3F
            if idx == 0x3F:
                idx, i = integer(b, i, 6)
            res.append(f"indexed {idx} {STATIC[idx]}")
        elif f & 0x40:                    # 01xxxxxx incremental
            i += 1
            ni = f & 0x3F
            if ni == 0x3F:
                ni, i = integer(b, i, 6)
            if ni == 0:
                nm, i = string(b, i)
            else:
                nm = STATIC[ni]
            v, i = string(b, i)
            res.append(f"incr    {ni:2d} {nm} = {v[:44]}")
        elif f & 0x80 == 0 and f & 0xC0 == 0:   # 0000xxxx / 0001xxxx literal
            i += 1
            ni = f & 0x0F
            if ni == 0x0F:
                ni, i = integer(b, i, 4)
            if ni == 0:
                nm, i = string(b, i)
            else:
                nm = STATIC[ni]
            v, i = string(b, i)
            res.append(f"literal {ni:2d} {nm} = {v[:44]}")
        else:                             # 10xxxxxx never indexed
            i += 1
            ni = f & 0x0F
            if ni == 0x0F:
                ni, i = integer(b, i, 4)
            if ni == 0:
                nm, i = string(b, i)
            else:
                nm = STATIC[ni]
            v, i = string(b, i)
            res.append(f"never   {ni:2d} {nm} = {v[:44]}")
    return res, i


if __name__ == "__main__":
    b = open(sys.argv[1], "rb").read()
    res, end = parse(b)
    for r in res:
        print("  " + r)
    print(f"total {len(b)} byte, parser berhenti di {end}, entri {len(res)}")

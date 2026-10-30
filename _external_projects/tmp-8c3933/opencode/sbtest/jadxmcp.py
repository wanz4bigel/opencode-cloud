#!/usr/bin/env python3
"""MCP-over-HTTP client for jadx-headless-mcp (port 8099)."""
import json, sys, urllib.request

URL = "http://127.0.0.1:8099/mcp"
SID = None

def rpc(method, params=None, nid=1, is_notification=False):
    global SID
    body = {"jsonrpc": "2.0", "id": nid, "method": method}
    if params is not None:
        body["params"] = params
    if is_notification:
        del body["id"]
    req = urllib.request.Request(URL, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream"})
    if SID:
        req.add_header("Mcp-Session-Id", SID)
    with urllib.request.urlopen(req, timeout=600) as r:
        sid = r.headers.get("Mcp-Session-Id")
        if sid:
            SID = sid
        raw = r.read().decode()
    # SSE or plain json
    if raw.startswith("event:") or "\ndata:" in raw or raw.startswith("data:"):
        for line in raw.splitlines():
            if line.startswith("data:"):
                return json.loads(line[5:].strip())
    return json.loads(raw) if raw.strip() else None

def init():
    r = rpc("initialize", {"protocolVersion": "2024-11-05", "capabilities": {},
        "clientInfo": {"name": "rea-cli", "version": "1"}}, nid=0)
    rpc("notifications/initialized", {}, is_notification=True)
    return r

def call(tool, args):
    r = rpc("tools/call", {"name": tool, "arguments": args}, nid=2)
    if "error" in r:
        return {"_error": r["error"]}
    res = r.get("result", {})
    texts = [c.get("text", "") for c in res.get("content", []) if c.get("type") == "text"]
    return {"text": "\n".join(texts), "isError": res.get("isError", False)}

if __name__ == "__main__":
    init()
    cmd = sys.argv[1]
    if cmd == "tools":
        r = rpc("tools/list", {}, nid=3)
        for t in r["result"]["tools"]:
            print("-", t["name"], ":", (t.get("description") or "")[:100].replace("\n", " "))
    elif cmd == "load":
        print(json.dumps(call("load_apk", {"path": sys.argv[2]}), indent=1)[:800])
    elif cmd == "class":
        r = call("get_class_source", {"class_name": sys.argv[2]})
        print(r.get("text", r))
    elif cmd == "method":
        r = call("get_method_by_name", {"class_name": sys.argv[2], "method_name": sys.argv[3]})
        print(r.get("text", r))
    elif cmd == "search":
        r = call("search_classes_by_keyword", {"keyword": sys.argv[2], "package": sys.argv[3] if len(sys.argv) > 3 else "com.shopee"})
        print(r.get("text", r))

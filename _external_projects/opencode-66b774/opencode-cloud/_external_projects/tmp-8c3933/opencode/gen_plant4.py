status = open('/tmp/opencode/status_loop.py').read()
pipe = open('/tmp/opencode/pipeline_v4.sh').read()

body = '''
import os, subprocess
open("/marimo/llm/status_loop.py", "w").write(STATUS)
open("/marimo/llm/pipeline.sh", "w").write(PIPE)
os.chmod("/marimo/llm/pipeline.sh", 0o755)
open("/marimo/llm/phase", "w").write("done")


def sh(c, t=60):
    r = subprocess.run(["bash", "-c", c], capture_output=True, text=True, timeout=t)
    return (r.stdout + r.stderr).strip()


print("status_loop.py:", len(STATUS), "byte | pipeline.sh:", len(PIPE), "byte")
print(sh("pkill -f '[s]tatus_loop.py'; nohup python3 /marimo/llm/status_loop.py > /marimo/llm/status.log 2>&1 & sleep 6; cat /marimo/llm/status.json"))
import marimo as _m
print("marimo:", _m.__version__)
'''

open('/tmp/opencode/plant4.py', 'w').write(
    "STATUS = " + repr(status) + "\nPIPE = " + repr(pipe) + "\n" + body)
print("plant4.py siap")

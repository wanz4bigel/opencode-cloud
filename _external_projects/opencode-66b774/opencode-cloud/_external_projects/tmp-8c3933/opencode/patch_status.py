
import subprocess, time
# ganti pengukuran: seluruh folder model (termasuk .cache hf yang sedang menulis)
cmd = r"""
python3 - <<'PY'
import re
p = '/marimo/llm/status_loop.py'
s = open(p).read()
s = s.replace('MODEL_DIR = "/home/marimo/models/sc117/IQ3_S"',
              'MODEL_DIR = "/home/marimo/models/sc117"')
open(p, 'w').write(s)
print("MODEL_DIR ->", [l for l in s.splitlines() if l.startswith("MODEL_DIR")][0])
PY
"""
r = subprocess.run(["bash","-c",cmd], capture_output=True, text=True)
print(r.stdout.strip(), r.stderr.strip())
subprocess.run(["pkill","-f","[s]tatus_loop.py"])
time.sleep(1)
p = subprocess.Popen(["python3","/marimo/llm/status_loop.py"],
                     stdout=open("/marimo/llm/status.log","ab"),
                     stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
time.sleep(6)
print("pid:", p.pid)
print(open("/marimo/llm/status.json").read())

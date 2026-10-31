const fs = require('fs');
const [,, name, start, dest] = process.argv;
const acts = [{ step_id: 's1', action: 'wait_for_timeout', duration_ms: 3500 }];
if (dest) {
  acts.push({ step_id: 's2', action: 'goto', destination: { url: dest }, wait_until: 'load' });
  acts.push({ step_id: 's3', action: 'wait_for_timeout', duration_ms: 3500 });
}
fs.writeFileSync(`sce-${name}.json`, JSON.stringify({
  start_url: { url: start },
  browser: { mode: 'launch', executable_path: '/usr/bin/google-chrome' },
  actions: acts,
}, null, 1));

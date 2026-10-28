const fs = require("node:fs");
const path = "src/db.js";
const lines = fs.readFileSync(path, "utf8").split("\n");

const start = lines.findIndex((l) => l.startsWith("const CATEGORY_SEED = ["));
const reseedAt = lines.findIndex((l) => l.startsWith("export function reseed"));
if (start < 0 || reseedAt < 0) throw new Error("penanda tidak ketemu");

let tail = reseedAt + 1;
while (tail < lines.length && lines[tail] !== "}") tail += 1;
if (tail >= lines.length) throw new Error("akhir reseed tidak ketemu");

const block = fs.readFileSync("/tmp/seed-block.txt", "utf8");
const reseed = fs.readFileSync("/tmp/seed-reseed.txt", "utf8");

fs.writeFileSync(path, [...lines.slice(0, start), block, reseed, ...lines.slice(tail + 1)].join("\n"), "utf8");
console.log(`ganti baris ${start + 1}-${tail + 1} (${tail + 1 - start} baris) -> seed baru`);

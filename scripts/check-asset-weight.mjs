import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public");
const maxBytes = 500 * 1024;
const oversized = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    const bytes = (await stat(fullPath)).size;
    if (bytes > maxBytes) oversized.push(`${path.relative(process.cwd(), fullPath)} (${bytes} bytes)`);
  }
}

await walk(root);
if (oversized.length > 0) {
  console.error(`Public assets must be at most ${maxBytes} bytes:\n${oversized.join("\n")}`);
  process.exit(1);
}
console.log("Public asset weight check passed.");

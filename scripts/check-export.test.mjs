import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const exported = resolve(root, "out");
const run = (path) =>
  spawnSync(
    process.execPath,
    [resolve(root, "scripts/check-export.mjs"), path],
    { encoding: "utf8" },
  );

test("the actual build passes", () => {
  const result = run(exported);
  assert.equal(result.status, 0, result.stderr);
});

const htmlPaths = [
  "index.html",
  "projects/ilog/index.html",
  "projects/lorekeeper/index.html",
  "projects/matching-ssafy/index.html",
  "print/index.html",
  "404.html",
];
const references = (path) =>
  [
    ...readFileSync(resolve(exported, path), "utf8").matchAll(
      /(?:src|href)="(\/_next\/static\/[^"?]+)(?:[^"]*)"/g,
    ),
  ].map((match) => match[1].slice(1));
const homeAssets = new Set(references("index.html"));
const printAsset = references("print/index.html").find(
  (path) => path.endsWith(".js") && !homeAssets.has(path),
);
assert(printAsset, "The print page must exercise a route-specific JS asset");
const assets = [
  printAsset,
  ...[".css", ".woff2"].map((ext) =>
    references("print/index.html").find((path) => path.endsWith(ext)),
  ),
];
assert(assets.every(Boolean));
for (const path of [...htmlPaths, "_headers", ...assets]) {
  for (const damage of ["missing", "empty", "changed"]) {
    test(`${path}: rejects ${damage} output`, () => {
      const temporary = mkdtempSync(
        resolve(tmpdir(), "portfolio-export-test-"),
      );
      try {
        cpSync(exported, temporary, { recursive: true });
        const target = resolve(temporary, path);
        const original = readFileSync(target);
        if (damage === "missing") rmSync(target);
        else if (damage === "empty") writeFileSync(target, "");
        else {
          const changed = Buffer.from(original);
          changed[Math.floor(changed.length / 2)] ^= 1;
          writeFileSync(target, changed);
        }
        const result = run(temporary);
        assert.equal(result.status, 1, result.stdout);
        assert(result.stderr.includes(path), result.stderr);
        assert.deepEqual(readFileSync(resolve(exported, path)), original);
      } finally {
        rmSync(temporary, { recursive: true, force: true });
      }
    });
  }
}

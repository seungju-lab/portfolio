import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { root, sha256 } from "./pdf-artifact.mjs";

const port = 8791;
const url = `http://127.0.0.1:${port}/portfolio.pdf`;
const target = path.join(root, "out/portfolio.pdf");
const original = await readFile(target);
assert.equal(
  sha256(original),
  sha256(await readFile(path.join(root, "public/portfolio.pdf"))),
);
let child;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function stop() {
  if (!child) return;
  const processToStop = child;
  child = null;
  const exited = new Promise((resolve) => processToStop.once("exit", resolve));
  if (processToStop.exitCode !== null) return;
  process.kill(-processToStop.pid, "SIGTERM");
  await exited;
}
async function start(expected) {
  child = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/wrangler/bin/wrangler.js"),
      "dev",
      "--local",
      "--port",
      String(port),
      "--inspector-port",
      "0",
    ],
    {
      cwd: root,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    },
  );
  let logs = "";
  child.stdout.on("data", (data) => (logs += data));
  child.stderr.on("data", (data) => (logs += data));
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (
        response.status === 200 &&
        sha256(Buffer.from(await response.arrayBuffer())) === sha256(expected)
      )
        return;
    } catch {
      // Retry while the local asset server starts.
    }
    await pause(200);
  }
  throw new Error("Asset server not ready: " + logs);
}
try {
  await start(original);
  const initial = await fetch(url);
  const oldEtag = initial.headers.get("etag");
  assert(oldEtag);
  const unchanged = await fetch(url, { headers: { "If-None-Match": oldEtag } });
  assert.equal(unchanged.status, 304);
  await stop();
  const changed = Buffer.concat([
    original,
    Buffer.from("\n% cache-refresh-fixture\n"),
  ]);
  await writeFile(target, changed);
  await start(changed);
  const updated = await fetch(url, { headers: { "If-None-Match": oldEtag } });
  assert.equal(updated.status, 200);
  assert.equal(
    updated.headers.get("cache-control"),
    "public, max-age=0, must-revalidate",
  );
  assert.equal(
    sha256(Buffer.from(await updated.arrayBuffer())),
    sha256(changed),
  );
  const newEtag = updated.headers.get("etag");
  assert.notEqual(newEtag, oldEtag);
  const revalidated = await fetch(url, {
    headers: { "If-None-Match": newEtag },
  });
  assert.equal(revalidated.status, 304);
  const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-cache";
  await mkdir(out, { recursive: true });
  await writeFile(
    path.join(out, "cache-results.json"),
    JSON.stringify(
      {
        environment:
          "Wrangler local Workers Assets; server restart models an asset version replacement",
        originalSha256: sha256(original),
        fixtureSha256: sha256(changed),
        oldEtag,
        newEtag,
        unchangedStatus: unchanged.status,
        updatedStatus: updated.status,
        revalidatedStatus: revalidated.status,
        publicArtifactUntouched: true,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Passed: same URL 304 → replaced bytes 200/new ETag → 304; original export restored.",
  );
} finally {
  await writeFile(target, original);
  await stop();
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");
export async function sourceDigest(directory = root) {
  const files = [
    "package.json",
    "pnpm-lock.yaml",
    "next.config.ts",
    "tsconfig.json",
    "scripts/generate-pdf.mjs",
    "scripts/pdf-artifact.mjs",
    "scripts/serve-export.mjs",
  ];
  async function walk(relative) {
    for (const entry of await readdir(path.join(directory, relative), {
      withFileTypes: true,
    })) {
      const name = `${relative}/${entry.name}`;
      if (name === "public/portfolio.pdf") continue;
      if (entry.isDirectory()) await walk(name);
      else files.push(name);
    }
  }
  await walk("src");
  await walk("public");
  const hash = createHash("sha256");
  for (const name of files.sort())
    hash
      .update(name)
      .update("\0")
      .update(await readFile(path.join(directory, name)))
      .update("\0");
  return hash.digest("hex");
}
export async function checkArtifact(directory = root) {
  const manifest = JSON.parse(
    await readFile(path.join(directory, "scripts/pdf-manifest.json"), "utf8"),
  );
  assert.equal(
    manifest.sourceSha256,
    await sourceDigest(directory),
    "PDF source changed: run pnpm pdf:generate and review the PDF",
  );
  const pdf = await readFile(path.join(directory, "public/portfolio.pdf"));
  assert.equal(
    sha256(pdf),
    manifest.pdfSha256,
    "PDF artifact changed: run pnpm pdf:generate",
  );
  assert(
    pdf.subarray(0, 5).equals(Buffer.from("%PDF-")),
    "Invalid PDF artifact",
  );
  return manifest;
}

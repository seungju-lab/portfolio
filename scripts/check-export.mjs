import { readFileSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = resolve(process.argv[2] ?? resolve(projectRoot, "out"));

function readRequired(relativePath) {
  const path = resolve(outputRoot, relativePath);
  if (!path.startsWith(`${outputRoot}${sep}`)) {
    throw new Error(`Asset path escapes output directory: ${relativePath}`);
  }
  let stat;
  try {
    stat = statSync(path);
  } catch {
    throw new Error(`Missing required export: ${relativePath}`);
  }
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`Required export must be a nonempty file: ${relativePath}`);
  }
  return readFileSync(path, "utf8");
}

try {
  const pages = [readRequired("index.html"), readRequired("404.html")];
  const headers = readRequired("_headers");
  const expectedHeaders = readFileSync(
    resolve(projectRoot, "public/_headers"),
    "utf8",
  );
  if (headers !== expectedHeaders) {
    throw new Error("Exported _headers differs from public/_headers");
  }

  const assets = new Set();
  for (const page of pages) {
    if (!/<html[\s>]/i.test(page)) {
      throw new Error("Required HTML export is not an HTML document");
    }
    for (const [, reference] of page.matchAll(
      /(?:src|href)=["']([^"']+)["']/g,
    )) {
      if (!reference.startsWith("/_next/static/")) continue;
      const path = decodeURIComponent(
        new URL(reference, "https://portfolio.invalid").pathname,
      ).slice(1);
      readRequired(path);
      assets.add(path);
    }
  }
  for (const extension of [".js", ".css"]) {
    if (![...assets].some((path) => path.endsWith(extension))) {
      throw new Error(
        `Exported HTML must reference browser ${extension} assets`,
      );
    }
  }
  console.log(
    `Static export verified: index.html, 404.html, _headers and ${assets.size} referenced assets`,
  );
} catch (error) {
  console.error(`Static export validation failed: ${error.message}`);
  process.exitCode = 1;
}

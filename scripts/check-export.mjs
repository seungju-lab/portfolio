import { readFileSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = resolve(process.argv[2] ?? resolve(projectRoot, "out"));
const buildRoot = resolve(projectRoot, ".next");
const pages = [
  ["index.html", "index.html"],
  ["projects/ilog/index.html", "projects/ilog.html"],
  ["projects/lorekeeper/index.html", "projects/lorekeeper.html"],
  ["projects/matching-ssafy/index.html", "projects/matching-ssafy.html"],
  ["print/index.html", "print.html"],
  ["404.html", "_not-found.html"],
];

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
  return readFileSync(path);
}

function compareBuild(relativePath, buildPath) {
  const exported = readRequired(relativePath);
  let original;
  try {
    original = readFileSync(resolve(buildRoot, buildPath));
  } catch {
    throw new Error(
      `Missing build reference: ${buildPath}; run pnpm build first`,
    );
  }
  if (!exported.equals(original)) {
    throw new Error(`Export differs from build reference: ${relativePath}`);
  }
  return exported;
}

try {
  const headers = readRequired("_headers");
  if (!headers.equals(readFileSync(resolve(projectRoot, "public/_headers")))) {
    throw new Error("Exported _headers differs from public/_headers");
  }

  const assets = new Set();
  function verifyAsset(reference, base = "https://portfolio.invalid/") {
    const url = new URL(reference, base);
    if (
      url.origin !== "https://portfolio.invalid" ||
      !url.pathname.startsWith("/_next/static/")
    )
      return;
    const path = decodeURIComponent(url.pathname).slice(1);
    if (assets.has(path)) return path;
    const content = compareBuild(path, path.slice("_next/".length));
    assets.add(path);
    if (path.endsWith(".css")) {
      for (const [, value] of content
        .toString("utf8")
        .matchAll(/url\(([^)]+)\)/g)) {
        verifyAsset(value.trim().replace(/^["']|["']$/g, ""), url.href);
      }
    }
    return path;
  }

  for (const [path, source] of pages) {
    const page = compareBuild(path, `server/app/${source}`).toString("utf8");
    if (
      !/^<!doctype html>/i.test(page) ||
      !/<html[\s>]/i.test(page) ||
      !/<body[\s>]/i.test(page) ||
      !/<\/body>\s*<\/html>\s*$/i.test(page)
    ) {
      throw new Error(`Invalid HTML document: ${path}`);
    }
    const references = new Set();
    for (const [, reference] of page.matchAll(
      /(?:src|href)=["']([^"']+)["']/g,
    )) {
      const asset = verifyAsset(reference);
      if (asset) references.add(asset);
    }
    for (const extension of [".js", ".css"]) {
      if (![...references].some((asset) => asset.endsWith(extension))) {
        throw new Error(`${path} must reference browser ${extension} assets`);
      }
    }
  }
  console.log(
    `Static export verified: ${pages.length} HTML pages, _headers and ${assets.size} referenced assets match the build`,
  );
} catch (error) {
  console.error(`Static export validation failed: ${error.message}`);
  process.exitCode = 1;
}

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { root, sha256, sourceDigest } from "./pdf-artifact.mjs";
import { serveExport } from "./serve-export.mjs";
import {
  education,
  introduction,
  projects,
  workingPractice,
} from "../src/content/portfolio.ts";
import { projectDetails } from "../src/content/project-details.ts";

// Build only the website here: pnpm build checks the previous PDF for freshness.
const before = await sourceDigest();
const build = spawnSync(
  process.execPath,
  [path.join(root, "node_modules/next/dist/bin/next"), "build"],
  { cwd: root, stdio: "inherit" },
);
assert.equal(build.status, 0, "Website build failed");
const server = await serveExport(path.join(root, "out"));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(server.url + "/print/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  const bytes = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    tagged: true,
    outline: true,
  });
  const loading = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
  });
  const pdf = await loading.promise;
  assert.equal(
    pdf.numPages,
    8,
    "Review changed pagination before changing the accepted 8-page contract",
  );
  const texts = [],
    links = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const p = await pdf.getPage(n);
    const content = await p.getTextContent();
    texts.push(content.items.map((i) => i.str ?? "").join(""));
    links.push(
      ...(await p.getAnnotations()).filter((a) => a.subtype === "Link"),
    );
  }
  const normalize = (text) => text.replace(/[\s\u00ad]/g, "");
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Object.values(value ?? {}).flatMap(strings);
  const fullText = normalize(texts.join(""));
  for (const expected of strings([
    introduction,
    education,
    workingPractice,
    ...projects.map(({ slug }) => {
      const d = projectDetails[slug];
      return [
        d.overview,
        d.architecture,
        d.challenges,
        d.results,
        d.limitations,
        d.reflection,
      ];
    }),
  ]))
    assert(
      fullText.includes(normalize(expected)),
      `Missing PDF content: ${expected}`,
    );
  for (const href of [
    "https://github.com/ju1115",
    ...projects.flatMap(({ slug }) => [
      `https://portfolio.seungju.dev/projects/${slug}/`,
      ...projectDetails[slug].repositories.map((r) => r.href),
    ]),
  ])
    assert(
      links.some((a) => a.url === href),
      `Missing PDF link: ${href}`,
    );
  assert.equal(
    links.filter((a) => a.dest).length,
    3,
    "Missing internal TOC destinations",
  );
  assert.equal(
    await sourceDigest(),
    before,
    "Source changed while generating; retry",
  );
  const manifest = {
    sourceSha256: before,
    pdfSha256: sha256(bytes),
    pages: pdf.numPages,
    chromium: browser.version(),
  };
  await loading.destroy();
  await writeFile(path.join(root, "public/portfolio.pdf"), bytes);
  await writeFile(path.join(root, "out/portfolio.pdf"), bytes);
  await writeFile(
    path.join(root, "scripts/pdf-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    `Generated ${manifest.pages} pages; full content and links verified; ${manifest.pdfSha256}`,
  );
} finally {
  await browser?.close();
  await server.close();
}

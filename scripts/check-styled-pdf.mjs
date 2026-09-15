import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {
  education,
  introduction,
  projects,
  workingPractice,
} from "../src/content/portfolio.ts";
import { projectDetails } from "../src/content/project-details.ts";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const pdfjs = process.env.PDFJS_DIR;
assert(pdfjs, "Set PDFJS_DIR to an installed pdfjs-dist directory");
const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-styled-pdf";
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
await page.goto((process.env.BASE_URL ?? "http://127.0.0.1:3002") + "/print/", {
  waitUntil: "networkidle",
});
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: path.join(out, "portfolio.pdf"),
  preferCSSPageSize: true,
  printBackground: true,
  tagged: true,
  outline: true,
});
const html = `<!doctype html><html><head><link rel="stylesheet" href="/_pdfjs/web/pdf_viewer.css"><style>html,body{margin:0;height:100%}#viewerContainer{position:absolute;inset:0;overflow:auto}</style></head><body><div id="viewerContainer"><div id="viewer" class="pdfViewer"></div></div><script type="module">
import * as pdfjsLib from '/_pdfjs/build/pdf.mjs';globalThis.pdfjsLib=pdfjsLib;
const {EventBus,PDFLinkService,PDFFindController,PDFViewer}=await import('/_pdfjs/web/pdf_viewer.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc='/_pdfjs/build/pdf.worker.mjs';
const bus=new EventBus(),links=new PDFLinkService({eventBus:bus,externalLinkTarget:2}),find=new PDFFindController({eventBus:bus,linkService:links});
const viewer=new PDFViewer({container:document.getElementById('viewerContainer'),eventBus:bus,linkService:links,findController:find});links.setViewer(viewer);
bus.on('pagesinit',()=>viewer.currentScaleValue='page-width');
const pdf=await pdfjsLib.getDocument({url:'/portfolio.pdf',cMapUrl:'/_pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/_pdfjs/standard_fonts/',wasmUrl:'/_pdfjs/wasm/'}).promise;
viewer.setDocument(pdf);links.setDocument(pdf);Object.assign(window,{pdf,viewer,bus,find});
</script></body></html>`;
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let data,
      type = "text/html";
    if (url.pathname === "/") data = html;
    else if (url.pathname === "/portfolio.pdf") {
      data = await fs.readFile(path.join(out, "portfolio.pdf"));
      type = "application/pdf";
    } else {
      assert(url.pathname.startsWith("/_pdfjs/"));
      const filename = path.resolve(
        pdfjs,
        "." + url.pathname.slice("/_pdfjs".length),
      );
      assert(filename.startsWith(path.resolve(pdfjs) + "/"));
      data = await fs.readFile(filename);
      type = filename.endsWith(".mjs")
        ? "text/javascript"
        : filename.endsWith(".css")
          ? "text/css"
          : "application/octet-stream";
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(
    () => window.pdf && document.querySelector(".annotationLayer a"),
  );
  const structure = await page.evaluate(async () => {
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const p = await pdf.getPage(n),
        a = await p.getAnnotations();
      const canvas = document.createElement("canvas"),
        v = p.getViewport({ scale: 0.2 });
      canvas.width = v.width;
      canvas.height = v.height;
      await p.render({ canvasContext: canvas.getContext("2d"), viewport: v })
        .promise;
      const text = await p.getTextContent();
      const size = p.getViewport({ scale: 1 });
      pages.push({
        number: n,
        corner: [...canvas.getContext("2d").getImageData(2, 2, 1, 1).data],
        text: text.items.map((i) => i.str).join(""),
        overflowingText: text.items
          .filter((i) => i.str?.trim())
          .filter(
            (i) =>
              i.transform[4] < -1 ||
              i.transform[4] + i.width > size.width + 1 ||
              i.transform[5] < -1 ||
              i.transform[5] > size.height + 1,
          )
          .map((i) => i.str),
        links: a
          .filter((i) => i.subtype === "Link")
          .map((i) => ({ id: i.id, url: i.url, dest: i.dest })),
      });
    }
    return { pages, total: pdf.numPages };
  });
  assert(
    structure.total >= 8 && structure.total <= 9,
    `Expected the accepted 8–9 page layout, got ${structure.total}`,
  );
  for (const p of structure.pages) {
    assert.deepEqual(
      p.corner,
      [15, 23, 42, 255],
      `page ${p.number} background`,
    );
    assert(p.text.length > 50, `blank page ${p.number}`);
    assert.deepEqual(p.overflowingText, [], `page ${p.number} text bounds`);
  }
  const normalize = (s) => s.replace(/[\s\u00ad]/g, "");
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Object.values(value ?? {}).flatMap(strings);
  const fullText = normalize(structure.pages.map((p) => p.text).join(""));
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
  ])) {
    assert(fullText.includes(normalize(expected)), `PDF missing: ${expected}`);
  }
  const links = structure.pages.flatMap((p) => p.links);
  for (const url of [
    "https://portfolio.seungju.dev/projects/ilog/",
    "https://portfolio.seungju.dev/projects/lorekeeper/",
    "https://portfolio.seungju.dev/projects/matching-ssafy/",
    "https://github.com/ju1115",
    ...projects.flatMap(({ slug }) =>
      projectDetails[slug].repositories.map((r) => r.href),
    ),
  ])
    assert(
      links.some((a) => a.url === url),
      url,
    );
  const contents = structure.pages[0].links.filter((a) => a.dest);
  assert.equal(contents.length, 3);
  const navigation = [];
  for (const annotation of contents) {
    await page.evaluate(() => (viewer.currentPageNumber = 1));
    const destination = await page.evaluate(async (dest) => {
      if (typeof dest === "string") dest = await pdf.getDestination(dest);
      return typeof dest[0] === "number"
        ? dest[0] + 1
        : (await pdf.getPageIndex(dest[0])) + 1;
    }, annotation.dest);
    await page.locator(`[data-annotation-id="${annotation.id}"] a`).click();
    await page.waitForFunction(
      (n) => viewer.currentPageNumber === n,
      destination,
    );
    navigation.push({ dest: annotation.dest, page: destination });
  }
  const externalClicks = [];
  for (const url of [
    "https://portfolio.seungju.dev/projects/ilog/",
    "https://github.com/ju1115/ilog",
    "https://github.com/ju1115",
  ]) {
    const number = structure.pages.find((p) =>
      p.links.some((a) => a.url === url),
    ).number;
    await page.evaluate((n) => (viewer.currentPageNumber = n), number);
    const external = page.locator(`.annotationLayer a[href="${url}"]`);
    const popupWait = page.waitForEvent("popup");
    await external.first().click();
    const popup = await popupWait;
    const resolved =
      url === "https://github.com/ju1115/ilog"
        ? "https://github.com/seungju-lab/ilog"
        : url;
    await popup.waitForURL(resolved);
    assert.equal(popup.url(), resolved);
    externalClicks.push({ href: url, resolved });
    await popup.close();
  }
  await page.bringToFront();
  await page.evaluate(() => {
    viewer.currentPageNumber = 1;
    bus.dispatch("find", {
      source: window,
      type: "",
      query: "PreserveHostHeader",
      phraseSearch: true,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: false,
      matchDiacritics: false,
    });
  });
  await page.waitForFunction(() => find.pageMatches.some((a) => a.length > 0));
  const matches = await page.evaluate(() =>
    find.pageMatches
      .map((a, i) => ({ page: i + 1, count: a.length }))
      .filter((a) => a.count),
  );
  assert(matches.length);
  await page.evaluate(() => (viewer.currentPageNumber = 1));
  await page.waitForFunction(() =>
    document
      .querySelector('.page[data-page-number="1"] .textLayer')
      ?.textContent.includes("이승주"),
  );
  const selected = await page.evaluate(() => {
    const layer = document.querySelector(
      '.page[data-page-number="1"] .textLayer',
    );
    const range = document.createRange();
    range.selectNodeContents(layer);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    return getSelection().toString();
  });
  assert(selected.includes("이승주"));
  assert(selected.includes("ILOG"));
  await page.screenshot({ path: path.join(out, "pdf-viewer.png") });
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, "viewer-results.json"),
    JSON.stringify(
      {
        pdfjsVersion: "6.3.289",
        pages: structure.total,
        navigation,
        externalClicks,
        search: matches,
        textSelection: true,
        fullContentPreserved: true,
        textWithinPageBounds: true,
        pageBackgrounds: structure.pages.map((p) => p.corner),
        annotations: links,
      },
      null,
      2,
    ),
  );
  console.log(
    `Passed: ${structure.total} navy PDF pages; 3 actual viewer TOC clicks; external link popup; Korean text selection and keyword search.`,
  );
} finally {
  await browser.close();
  server.close();
}

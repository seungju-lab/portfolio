import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { projects, introduction, education } from "../src/content/portfolio.ts";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.BASE_URL ?? "http://localhost:3001";
const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-project-regression";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (
    r.status() >= 400 &&
    ["document", "script", "stylesheet", "font"].includes(
      r.request().resourceType(),
    )
  )
    errors.push(`${r.status()} ${r.url()}`);
});
const results = [];
const normalize = (text) => text.replace(/\s/g, "");
async function open(route) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}
async function checkBounds() {
  const bounds = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    clipped: [...document.querySelectorAll("main *, .portfolio-identity *")]
      .filter((e) => {
        const style = getComputedStyle(e);
        return (
          !e.closest(".visually-hidden") &&
          style.clipPath !== "inset(50%)" &&
          e.getBoundingClientRect().width &&
          style.display !== "inline" &&
          ((["hidden", "clip"].includes(style.overflowX) &&
            e.scrollWidth > e.clientWidth + 1) ||
            (["hidden", "clip"].includes(style.overflowY) &&
              e.scrollHeight > e.clientHeight + 1))
        );
      })
      .map((e) => e.className || e.tagName),
  }));
  assert.equal(bounds.overflow, false, JSON.stringify(bounds));
  assert.deepEqual(bounds.clipped, []);
  return bounds;
}
try {
  for (const width of [1440, 1024, 1023, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const project of projects) {
      await open(`/projects/${project.slug}/`);
      const before = await page
        .locator(".diagram-node-name")
        .first()
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const after = await page
        .locator(".diagram-node-name")
        .first()
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
      assert.equal(after, before * 2);
      const bounds = await checkBounds();
      for (const link of await page
        .locator(".repository-links a, .case-navigation a")
        .all()) {
        await link.focus();
        assert(await link.evaluate((e) => e === document.activeElement));
        assert((await link.boundingBox()).height >= 44);
      }
      if (width === 390)
        await page.screenshot({
          path: `${out}/${project.slug}-zoom-200.png`,
          fullPage: true,
        });
      results.push({
        slug: project.slug,
        width,
        textScale: 2,
        diagramFont: after,
        ...bounds,
      });
    }
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await open("/");
    const text = normalize(await page.locator("main").innerText());
    for (const expected of [
      ...introduction,
      ...projects.map((p) => p.summary),
      ...education.flatMap((e) => e.description),
    ])
      assert(text.includes(normalize(expected)));
    assert.equal(await page.locator("a.project-entry").count(), 3);
    await checkBounds();
    await page.locator('a[href="/projects/ilog/"]').click();
    await page.waitForURL("**/projects/ilog/", { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.activeElement?.id === "project-heading",
    );
    await page.locator('a[href="/#projects"]').click();
    await page.waitForURL(base + "/#projects", { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const top = document
        .getElementById("projects")
        .getBoundingClientRect().top;
      const expected = Math.min(
        document.documentElement.scrollHeight - innerHeight,
        Math.max(0, top + scrollY - (innerWidth >= 1024 ? 96 : 80)),
      );
      return Math.abs(scrollY - expected) < 2;
    });
    await page.locator('a[href="/print/"]').click();
    await page.waitForURL("**/print/", { waitUntil: "networkidle" });
    await checkBounds();
    const paragraphs = await page
      .locator(".print-article-section p")
      .allTextContents();
    assert.deepEqual(
      paragraphs,
      projects.flatMap((p) =>
        p.print.groups.flatMap((g) => g.sections.flatMap((s) => s.paragraphs)),
      ),
    );
    assert.equal(await page.locator(".print-button").isEnabled(), true);
    results.push({
      width,
      homeCopy: true,
      homeDetailReturn: true,
      printParagraphs: paragraphs.length,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open("/");
  await page.locator('.section-navigation a[href="#projects"]').click();
  await page.waitForFunction(
    () => document.activeElement?.id === "projects-heading",
  );
  await page.locator('.section-navigation a[href="#education"]').press("Enter");
  await page.waitForFunction(
    () => document.activeElement?.id === "education-heading",
  );
  await page.goBack();
  await page.waitForFunction(() => location.hash === "#projects");
  await page.goForward();
  await page.waitForFunction(() => location.hash === "#education");
  results.push({ homeNavigationHistory: true });

  await open("/print/");
  await page.evaluate(() => {
    document.querySelector(".print-button").focus({ preventScroll: true });
    scrollTo({ top: 850, behavior: "instant" });
    window.printEvents = [];
    addEventListener("beforeprint", () =>
      window.printEvents.push("beforeprint"),
    );
    addEventListener("afterprint", () => window.printEvents.push("afterprint"));
  });
  const pdf = `${out}/portfolio.pdf`;
  await page.pdf({
    path: pdf,
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
  });
  await page.waitForFunction(
    () =>
      Math.abs(scrollY - 850) < 2 &&
      document.activeElement?.classList.contains("print-button"),
  );
  const events = await page.evaluate(() => window.printEvents);
  assert.deepEqual(events, ["beforeprint", "afterprint"]);
  const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
  assert.match(info, /Pages:\s+4\b/);
  const size = info.match(/Page size:\s+([\d.]+) x ([\d.]+) pts \(A4\)/);
  assert(size, "PDF must identify A4 paper");
  assert(Math.abs(Number(size[1]) - 595.28) < 1);
  assert(Math.abs(Number(size[2]) - 841.89) < 1);
  const pdfText = execFileSync("pdftotext", ["-layout", pdf, "-"], {
    encoding: "utf8",
  });
  const pages = pdfText.split("\f").filter((p) => p.trim());
  assert.equal(pages.length, 4);
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const text = normalize(pages[i + 1]);
    for (const expected of project.print.groups.flatMap((g) =>
      g.sections.flatMap((s) => s.paragraphs),
    ))
      assert(
        text.includes(normalize(expected)),
        `${project.slug}: missing PDF text`,
      );
    for (const repository of project.print.repositories)
      assert(text.includes(normalize(repository.href)));
  }
  fs.writeFileSync(`${out}/pdfinfo.txt`, info);
  fs.writeFileSync(`${out}/pdf-text.txt`, pdfText);
  await page.screenshot({ path: `${out}/print-web-1440.png`, fullPage: true });
  results.push({
    pdfPages: 4,
    paper: "A4",
    printEvents: events,
    restoredScrollY: await page.evaluate(() => scrollY),
    restoredFocus: "print-button",
  });
  // Exercise the UI's exception/retry path without a native print dialog.
  await page.evaluate(() => {
    window.print = () => {
      throw new Error("test unavailable");
    };
  });
  await page.locator(".print-button").click();
  assert.match(
    await page.locator(".print-error").innerText(),
    /인쇄 창을 열지 못했습니다/,
  );
  await page.evaluate(() => {
    window.print = () => {
      dispatchEvent(new Event("beforeprint"));
      dispatchEvent(new Event("afterprint"));
    };
  });
  await page.locator(".print-button").click();
  await page.waitForFunction(
    () => document.querySelector(".print-error").textContent === "",
  );
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        browser: browser.version(),
        results,
        assetAndPageErrors: errors,
        printExceptionRetry: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed: 15 text-200% views; home/print copy and navigation; A4 four-page PDF, print events, reading restoration and error retry.",
  );
} finally {
  await browser.close();
}

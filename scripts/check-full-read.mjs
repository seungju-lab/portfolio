import assert from "node:assert/strict";
import fs from "node:fs";
import { projects, introduction, education } from "../src/content/portfolio.ts";
import { projectDetails } from "../src/content/project-details.ts";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.BASE_URL ?? "http://localhost:3001";
const output = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-full-read";
fs.mkdirSync(output, { recursive: true });
const normalize = (value) => value.replace(/\s/g, "");
const strings = (value) =>
  typeof value === "string"
    ? [value]
    : Object.values(value ?? {}).flatMap(strings);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = [];
async function open(route) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}
async function bounds() {
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    clipped: [...document.querySelectorAll("main *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          !element.closest(".visually-hidden") &&
          style.display !== "inline" &&
          element.getBoundingClientRect().width &&
          ((["hidden", "clip"].includes(style.overflowX) &&
            element.scrollWidth > element.clientWidth + 1) ||
            (["hidden", "clip"].includes(style.overflowY) &&
              element.scrollHeight > element.clientHeight + 1))
        );
      })
      .map((element) => element.className || element.tagName),
  }));
  assert.equal(result.overflow, false, JSON.stringify(result));
  assert.deepEqual(result.clipped, []);
  return result;
}
try {
  for (const width of [1440, 1024, 1023, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await open("/print/");
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(
      await page.locator(".print-project .detail-heading").count(),
      12,
    );
    assert.equal(
      await page.locator(".print-project .detail-heading:not(h3)").count(),
      0,
    );
    assert.equal(await page.locator(".system-diagram").count(), 3);
    assert.equal(
      await page
        .locator(".print-portrait")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
      true,
    );
    assert.equal(
      await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map(
          (element) => element.id,
        );
        return ids.length === new Set(ids).size;
      }),
      true,
      "Document anchors must be unique",
    );
    for (const project of projects) {
      const detail = projectDetails[project.slug];
      const content = normalize(
        await page.locator(`#${project.slug}`).innerText(),
      );
      for (const expected of strings([
        detail.overview,
        detail.architecture,
        detail.challenges,
        detail.results,
        detail.limitations,
        detail.reflection,
      ]))
        assert(
          content.includes(normalize(expected)),
          `${project.slug}: missing ${expected}`,
        );
      assert.equal(
        await page.locator(`#${project.slug} .repository-links a`).count(),
        detail.repositories.length + 1,
      );
    }
    const text = normalize(await page.locator("main").innerText());
    for (const expected of [
      ...introduction,
      ...education.flatMap((entry) => entry.description),
    ])
      assert(text.includes(normalize(expected)));
    results.push({ width, textScale: 1, ...(await bounds()) });
    if ([1440, 390, 320].includes(width))
      await page.screenshot({
        path: `${output}/full-read-${width}.png`,
        fullPage: true,
      });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    results.push({ width, textScale: 2, ...(await bounds()) });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open("/print/");
  for (const project of projects) {
    await page.locator(`.print-contents a[href="#${project.slug}"]`).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      (slug) => location.hash === `#${slug}`,
      project.slug,
    );
    await page.waitForFunction(
      (slug) =>
        Math.abs(
          document.getElementById(slug).getBoundingClientRect().top - 48,
        ) < 3,
      project.slug,
    );
  }
  await page.goBack();
  await page.waitForFunction(() => location.hash === "#lorekeeper");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.evaluate(() => location.hash), "#lorekeeper");
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await touch.newPage();
  await mobile.goto(base + "/print/", { waitUntil: "networkidle" });
  await mobile.locator('.print-contents a[href="#ilog"]').tap();
  await mobile.waitForFunction(() => location.hash === "#ilog");
  await touch.close();
  for (const project of projects) {
    await open(`/projects/${project.slug}/`);
    assert.equal(await page.locator(".detail-section > h2").count(), 4);
    assert.equal(await page.locator("h4").count(), 0);
    await bounds();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${output}/web-results.json`,
    JSON.stringify(
      {
        results,
        contentParity: true,
        uniqueAnchors: true,
        keyboardHistoryReload: true,
        touchContents: true,
        detailHeadingRegression: true,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `Full-read verified: ${results.length} layouts, full copy, diagrams, anchors, keyboard/history/touch and detail headings`,
  );
} finally {
  await browser.close();
}

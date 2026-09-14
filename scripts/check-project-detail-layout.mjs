const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
import fs from "node:fs";
import assert from "node:assert/strict";
const dir = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-detail-layout";
fs.mkdirSync(dir, { recursive: true });
const baseURL = process.env.BASE_URL ?? "http://localhost:3001";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (response) => {
  if (
    response.status() >= 400 &&
    ["document", "script", "stylesheet", "font"].includes(
      response.request().resourceType(),
    )
  )
    errors.push(`${response.status()} ${response.url()}`);
});
const results = [];
for (const width of [1440, 1024, 1023, 390, 320]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const slug of ["ilog", "lorekeeper", "matching-ssafy"]) {
    await page.goto(baseURL + "/projects/" + slug + "/", {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(
      await page.locator(".detail-section > h2").allTextContents(),
      ["프로젝트 개요", "아키텍처", "문제 해결", "결과"],
    );
    assert.deepEqual(
      await page
        .locator(".detail-section")
        .evaluateAll((es) => es.map((e) => e.id)),
      ["overview", "architecture", "challenges", "results"],
    );
    assert.equal(await page.locator(".result-item").count(), 2);
    assert.equal(await page.locator(".detail-list li").count(), 7);
    assert.equal(await page.locator(".detail-skills li").count(), 3);
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      heading: parseFloat(
        getComputedStyle(document.querySelector(".detail-section > h2"))
          .fontSize,
      ),
      columns: getComputedStyle(
        document.querySelector(".detail-results"),
      ).gridTemplateColumns.split(" ").length,
      nav: getComputedStyle(document.querySelector(".project-navigation"))
        .display,
      clipped: [...document.querySelectorAll(".detail-section *")]
        .filter(
          (e) =>
            !e.closest(".visually-hidden") &&
            e.getBoundingClientRect().width &&
            e.scrollWidth > e.clientWidth + 1 &&
            getComputedStyle(e).display !== "inline",
        )
        .map((e) => e.className || e.tagName),
    }));
    assert.equal(
      layout.overflow,
      false,
      JSON.stringify({ width, slug, layout }),
    );
    assert.equal(layout.heading, width >= 1024 ? 24 : 22);
    assert.equal(layout.columns, width >= 1024 ? 2 : 1);
    if (width < 1024) assert.equal(layout.nav, "none");
    assert.deepEqual(
      layout.clipped,
      [],
      JSON.stringify({ width, slug, layout }),
    );
    const text = await page.locator("main").innerText();
    for (const excluded of ["도식 명세", "편집 근거", "코드 미반영"])
      assert(!text.includes(excluded));
    assert.equal(await page.locator(".system-diagram").count(), 1);
    assert.equal(
      await page
        .locator(
          ".system-diagram a, .system-diagram button, .system-diagram [tabindex]",
        )
        .count(),
      0,
    );
    const typography = await page
      .locator(".diagram-node-name")
      .evaluateAll((es) => es.map((e) => getComputedStyle(e).fontSize));
    assert(typography.every((s) => s === "14px"));
    const ax = await page.locator(".system-diagram").ariaSnapshot();
    assert(
      ax.includes("figure") && ax.includes("listitem") && ax.includes("담당"),
    );
    assert(!ax.includes("↓") && !ax.includes("↕"));
    fs.writeFileSync(dir + "/" + slug + "-" + width + "-accessibility.yml", ax);
    await page.screenshot({
      path: dir + "/" + slug + "-" + width + ".png",
      fullPage: true,
    });
    await page
      .locator(".system-diagram")
      .screenshot({ path: dir + "/" + slug + "-" + width + "-diagram.png" });
    results.push({ slug, width, ...layout });
  }
}
for (const route of ["/", "/print/"]) {
  await page.goto(baseURL + route, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".detail-section").count(), 0);
  results.push({ route, title: await page.title() });
}
assert.deepEqual(errors, []);
fs.writeFileSync(dir + "/results.json", JSON.stringify(results, null, 2));
console.log(
  "Browser passed: 15 detail views and accessible diagrams, headings, lists, results, typography, wrapping, and home/print availability.",
);
await browser.close();

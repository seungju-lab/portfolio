import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.BASE_URL ?? "http://localhost:3001";
const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-project-anchors";
fs.mkdirSync(out, { recursive: true });
const aliases = {
  overview: "overview",
  architecture: "architecture",
  challenges: "challenges",
  results: "results",
  scope: "overview",
  implementation: "challenges",
  verification: "results",
};
const browser = await chromium.launch();
const failures = [],
  results = [];
async function landing(page, id) {
  await page.waitForFunction(
    (id) => {
      const heading = document.getElementById(id + "-heading");
      if (!heading) return false;
      const offset = innerWidth >= 1024 ? 96 : 80;
      const expected = Math.min(
        document.documentElement.scrollHeight - innerHeight,
        Math.max(0, heading.getBoundingClientRect().top + scrollY - offset),
      );
      return (
        document.activeElement === heading &&
        Math.abs(scrollY - expected) < 2 &&
        document
          .querySelector('.project-navigation [aria-current="location"]')
          ?.getAttribute("href") ===
          "#" + id
      );
    },
    id,
    { timeout: 8000 },
  );
  assert.equal(new URL(page.url()).hash, "#" + id);
  assert.equal(
    await page
      .locator('.project-navigation [aria-current="location"]')
      .getAttribute("href"),
    "#" + id,
  );
}
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (r) => {
    if (
      r.status() >= 400 &&
      ["script", "stylesheet", "font", "document"].includes(
        r.request().resourceType(),
      )
    )
      failures.push(`${r.status()} ${r.url()}`);
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of ["ilog", "lorekeeper", "matching-ssafy"]) {
      for (const [hash, id] of Object.entries(aliases)) {
        await page.goto("about:blank");
        await page.goto(`${base}/projects/${slug}/#${hash}`, {
          waitUntil: "networkidle",
        });
        await landing(page, id);
        await page.reload({ waitUntil: "networkidle" });
        await landing(page, id);
        results.push({
          slug,
          width,
          hash,
          target: id,
          direct: true,
          reload: true,
        });
      }
      console.log(`Direct/reload anchors passed: ${slug} ${width}px`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/projects/ilog/", { waitUntil: "networkidle" });
  const nav = (id) => page.locator(`.project-navigation a[href="#${id}"]`);
  await nav("architecture").click();
  await landing(page, "architecture");
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: "instant" }));
  const architectureY = await page.evaluate(() => scrollY);
  await nav("challenges").focus();
  await page.keyboard.press("Enter");
  await landing(page, "challenges");
  await page.goBack();
  await page.waitForFunction((y) => Math.abs(scrollY - y) < 2, architectureY);
  assert.equal(
    await page
      .locator(".project-navigation [aria-current]")
      .getAttribute("href"),
    "#architecture",
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".project-navigation [aria-current]")
        ?.getAttribute("href") === "#challenges",
  );
  await nav("results").click();
  await nav("overview").click();
  await landing(page, "overview");
  await nav("results").click();
  await page.mouse.wheel(0, -180);
  await page.waitForTimeout(600);
  assert.notEqual(
    await page.evaluate(() => document.activeElement?.id),
    "results-heading",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await nav("architecture").click();
  await landing(page, "architecture");
  const len = await page.evaluate(() => history.length);
  await page.evaluate(() => {
    location.hash = "#scope";
  });
  await landing(page, "overview");
  assert.equal(await page.evaluate(() => history.length), len + 1);
  await nav("results").click();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.locator('.section-navigation a[href="#projects"]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".section-navigation [aria-current]")
        ?.getAttribute("href") === "#projects",
  );
  assert.equal(await page.locator(".project-navigation").count(), 0);
  results.push({
    desktop: true,
    click: true,
    keyboard: true,
    backForward: true,
    rapidNavigation: true,
    wheelInterruption: true,
    reducedMotion: true,
    legacySameDocument: true,
    pageExitAndHome: true,
  });
  const touch = await browser.newPage({
    viewport: { width: 390, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  touch.on("pageerror", (e) => failures.push(e.message));
  await touch.goto(base + "/projects/ilog/#architecture", {
    waitUntil: "networkidle",
  });
  await landing(touch, "architecture");
  assert.equal(await touch.locator(".project-navigation").isVisible(), false);
  for (let i = 0; i < 8; i++) {
    await touch.keyboard.press("Tab");
    assert.equal(
      await touch.evaluate(
        () => !!document.activeElement?.closest(".project-navigation"),
      ),
      false,
    );
  }
  await touch.locator(".case-navigation a").tap();
  await touch.waitForURL("**/projects/lorekeeper/", {
    waitUntil: "networkidle",
  });
  await touch.waitForFunction(
    () => document.activeElement?.id === "project-heading",
  );
  results.push({
    mobile: true,
    directAnchor: true,
    hiddenNavExcludedFromTab: true,
    touchPageExit: true,
  });
  assert.deepEqual(failures, []);
  fs.writeFileSync(
    out + "/results.json",
    JSON.stringify({ results, assetAndPageErrors: failures }, null, 2),
  );
  console.log(
    "Passed: 42 direct + 42 reload anchor cases; desktop interaction/history and mobile focus/exit scenarios; no asset/page errors.",
  );
} finally {
  await browser.close();
}

import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { sha256 } from "./pdf-artifact.mjs";

const base = process.env.BASE_URL ?? "http://127.0.0.1:8787";
const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-pdf-links";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: "chromium",
  env: { ...process.env, LANG: "C.UTF-8", LC_ALL: "C.UTF-8" },
});
const errors = [],
  views = [],
  actions = [];
try {
  const context = await browser.newContext();
  const response = await context.request.get(base + "/portfolio.pdf");
  assert.equal(response.status(), 200);
  assert.match(response.headers()["content-type"], /application\/pdf/);
  assert.equal(
    response.headers()["cache-control"],
    "public, max-age=0, must-revalidate",
  );
  assert(!response.headers()["content-disposition"]?.includes("attachment"));
  const bytes = await response.body();
  assert.equal(sha256(bytes), sha256(await readFile("public/portfolio.pdf")));
  const etag = response.headers().etag;
  assert(etag);
  const conditional = await context.request.get(base + "/portfolio.pdf", {
    headers: { "If-None-Match": etag },
  });
  assert.equal(conditional.status(), 304);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 1024, 1023, 768, 390, 320]) {
    for (const scale of [1, 2]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (scale === 2)
        await page.evaluate(() => {
          const sizes = [...document.querySelectorAll("body *")].map((el) => [
            el,
            parseFloat(getComputedStyle(el).fontSize),
          ]);
          for (const [el, size] of sizes) el.style.fontSize = `${size * 2}px`;
        });
      const links = page.locator(".profile-links a");
      assert.equal(await links.count(), 4);
      assert.deepEqual(await links.allTextContents(), [
        "GitHub (새 탭)",
        "전체 열람",
        "PDF 다운로드",
        "PDF 보기 (새 탭)",
      ]);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        rows: [...document.querySelectorAll(".profile-links > li")].map(
          (el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, height: r.height };
          },
        ),
        links: [...document.querySelectorAll(".profile-links a")].map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, right: r.right, y: r.y, height: r.height };
        }),
      }));
      assert.equal(
        layout.overflow,
        false,
        JSON.stringify({ width, scale, layout }),
      );
      assert.equal(layout.rows.length, 3);
      for (const link of layout.links) {
        assert(link.height >= 44);
        assert(link.x >= 0 && link.right <= width + 1);
      }
      if (scale === 1)
        assert.equal(
          layout.links[1].y,
          layout.links[2].y,
          "second row remains together",
        );
      await links.first().focus();
      for (let i = 0; i < 4; i++) {
        assert(
          await links.nth(i).evaluate((el) => el === document.activeElement),
        );
        assert.equal(
          await links
            .nth(i)
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          "solid",
        );
        if (i < 3) await page.keyboard.press("Tab");
      }
      const icon = page.locator(".icon-download");
      await links.nth(2).hover();
      assert.equal(
        await icon.evaluate((el) => getComputedStyle(el).transform),
        "none",
      );
      if ([1440, 390, 320].includes(width)) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.activeElement?.blur());
        await page.waitForFunction(() =>
          [...document.querySelectorAll(".profile-links a")].every(
            (link) =>
              getComputedStyle(link).color ===
                getComputedStyle(document.documentElement)
                  .getPropertyValue("--color-heading")
                  .trim() ||
              getComputedStyle(link).color === "rgb(226, 232, 240)",
          ),
        );
        await page.screenshot({
          path: path.join(out, `home-${width}-${scale}x.png`),
        });
        await page
          .locator(".profile-links")
          .screenshot({ path: path.join(out, `links-${width}-${scale}x.png`) });
      }
      views.push({ width, scale, ...layout });
    }
  }
  for (const touch of [false, true]) {
    const ctx = await browser.newContext({
      viewport: { width: touch ? 390 : 1440, height: 1000 },
      hasTouch: touch,
      isMobile: touch,
    });
    const p = await ctx.newPage();
    await p.goto(base, { waitUntil: "networkidle" });
    await p.evaluate(() => {
      window.print = () => {
        throw new Error("Download must not print");
      };
    });
    const activate = (locator) =>
      touch ? locator.tap() : locator.press("Enter");
    const downloadWait = p.waitForEvent("download");
    await activate(p.getByRole("link", { name: "PDF 다운로드", exact: true }));
    const download = await downloadWait;
    assert.equal(download.suggestedFilename(), "이승주-포트폴리오.pdf");
    const destination = path.join(
      out,
      `download-${touch ? "touch" : "keyboard"}.pdf`,
    );
    await download.saveAs(destination);
    assert.equal(sha256(await readFile(destination)), sha256(bytes));
    const popupWait = p.waitForEvent("popup");
    await activate(
      p.getByRole("link", { name: "PDF 보기 (새 탭)", exact: true }),
    );
    const popup = await popupWait;
    await popup.waitForURL(base + "/portfolio.pdf");
    await popup.close();
    const githubWait = p.waitForEvent("popup");
    await activate(
      p.getByRole("link", { name: "GitHub (새 탭)", exact: true }),
    );
    const github = await githubWait;
    await github.waitForURL("https://github.com/ju1115");
    await github.close();
    await activate(p.getByRole("link", { name: "전체 열람", exact: true }));
    await p.waitForURL(base + "/print/", { waitUntil: "networkidle" });
    assert.equal(await p.locator(".print-toolbar a").count(), 1);
    assert.equal(
      await p
        .locator(
          ".print-toolbar button, .print-action, #print-help, .print-error",
        )
        .count(),
      0,
    );
    await p.screenshot({
      path: path.join(out, `print-${touch ? 390 : 1440}.png`),
    });
    await p.emulateMedia({ media: "print" });
    assert.equal(await p.locator(".print-toolbar").isVisible(), false);
    assert.equal(await p.locator(".print-document").isVisible(), true);
    actions.push({
      input: touch ? "touch" : "keyboard",
      filename: download.suggestedFilename(),
      pdfSha256: sha256(bytes),
      pdfNewTab: true,
      githubNewTab: true,
      fullReadSameTab: true,
    });
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(out, "results.json"),
    JSON.stringify(
      {
        browser: browser.version(),
        headers: response.headers(),
        conditionalStatus: conditional.status(),
        views,
        actions,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Passed: 12 responsive views, 4-link keyboard order, keyboard/touch actions, same PDF bytes and filename, PDF 200/MIME/cache/304.",
  );
} finally {
  await browser.close();
}

import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.BASE_URL ?? "http://localhost:3001";
const out = process.env.EVIDENCE_DIR ?? "/tmp/portfolio-project-links";
fs.mkdirSync(out, { recursive: true });
const projects = [
  {
    slug: "ilog",
    title: "ILOG",
    repositories: [["GitHub 저장소", "https://github.com/ju1115/ilog"]],
  },
  {
    slug: "lorekeeper",
    title: "Lorekeeper",
    repositories: [
      [
        "백엔드 저장소",
        "https://github.com/soma-lorekeeper/lorekeeper-backend",
      ],
      [
        "프론트엔드 저장소",
        "https://github.com/soma-lorekeeper/lorekeeper-frontend",
      ],
    ],
  },
  {
    slug: "matching-ssafy",
    title: "Matching SSAFY",
    repositories: [
      ["GitHub 저장소", "https://github.com/ju1115/Matching_SSAFY"],
    ],
  },
];
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const [i, project] of projects.entries()) {
      await page.goto(`${base}/projects/${project.slug}/`, {
        waitUntil: "networkidle",
      });
      const external = await page
        .locator(".repository-links a")
        .evaluateAll((es) =>
          es.map((e) => ({
            text: e.textContent.replace(/\s+/g, " ").trim(),
            href: e.href,
            target: e.target,
            rel: e.rel,
            height: e.getBoundingClientRect().height,
          })),
        );
      assert.equal(external.length, project.repositories.length);
      for (const [j, [label, href]] of project.repositories.entries()) {
        assert.equal(external[j].text, label + " (새 탭)");
        assert.equal(external[j].href, href);
        assert.equal(external[j].target, "_blank");
        assert(external[j].rel.includes("noreferrer"));
        assert(external[j].height >= 44);
        assert.equal(await page.locator(`a[href="${href}"]`).count(), 1);
      }
      const expected = [
        i > 0
          ? [
              "이전 프로젝트 · " + projects[i - 1].title,
              "/projects/" + projects[i - 1].slug + "/",
            ]
          : null,
        i < 2
          ? [
              "다음 프로젝트 · " + projects[i + 1].title,
              "/projects/" + projects[i + 1].slug + "/",
            ]
          : null,
      ].filter(Boolean);
      const links = await page
        .locator(".case-navigation a")
        .evaluateAll((es) =>
          es.map((e) => [
            e.textContent.replace(/\s+/g, " ").trim(),
            e.getAttribute("href"),
          ]),
        );
      assert.deepEqual(links, expected);
      assert.equal(
        await page.locator(".case-navigation .icon-back").count(),
        i > 0 ? 1 : 0,
      );
      assert.equal(
        await page.locator(".case-navigation .icon-arrow").count(),
        i < 2 ? 1 : 0,
      );
      assert.equal(await page.locator('a[href="/#projects"]').count(), 1);
      const geometry = await page
        .locator(".case-navigation a")
        .evaluateAll((es) =>
          es.map((e) => {
            const b = e.getBoundingClientRect();
            return { height: b.height, right: b.right, width: innerWidth };
          }),
        );
      assert(geometry.every((e) => e.height >= 44 && e.right <= e.width));
      await page
        .locator(".case-navigation")
        .screenshot({ path: `${out}/${project.slug}-${width}-navigation.png` });
      results.push({
        slug: project.slug,
        width,
        links: links.length,
        external: external.length,
      });
    }
    await page.close();
  }
  for (const input of ["mouse", "keyboard", "touch"]) {
    console.log(`Checking ${input} project transitions`);
    const context = await browser.newContext({
      viewport: { width: input === "touch" ? 390 : 1440, height: 1000 },
      hasTouch: input === "touch",
      isMobile: input === "touch",
    });
    const page = await context.newPage();
    await page.goto(base + "/projects/ilog/", { waitUntil: "networkidle" });
    const next = page.locator(".case-navigation a");
    await next.scrollIntoViewIfNeeded();
    if (input === "keyboard") await next.focus();
    const before = await page.evaluate(() => scrollY);
    await Promise.all([
      page.waitForURL("**/projects/lorekeeper/", { waitUntil: "networkidle" }),
      input === "keyboard"
        ? next.press("Enter")
        : input === "touch"
          ? next.tap()
          : next.click(),
    ]);
    await page.waitForFunction(
      () => document.activeElement?.id === "project-heading" && scrollY === 0,
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.getAttribute("href")),
      input === "touch"
        ? "https://github.com/soma-lorekeeper/lorekeeper-backend"
        : "#overview",
    );
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForFunction((y) => Math.abs(scrollY - y) < 3, before);
    await page.goForward({ waitUntil: "networkidle" });
    assert((await page.title()).includes("Lorekeeper"));
    const prev = page.locator(".case-navigation a").first();
    await Promise.all([
      page.waitForURL("**/projects/ilog/", { waitUntil: "networkidle" }),
      input === "touch" ? prev.tap() : prev.click(),
    ]);
    await page.waitForFunction(
      () => document.activeElement?.id === "project-heading" && scrollY === 0,
    );
    results.push({
      input,
      arrivalFocus: true,
      nextTab: true,
      historyRestoration: true,
      previous: true,
    });
    await context.close();
  }
  fs.writeFileSync(out + "/results.json", JSON.stringify(results, null, 2));
  console.log(
    "Passed: 9 link layouts; mouse, keyboard and touch project transitions, arrival focus, next Tab, and history restoration.",
  );
} finally {
  await browser.close();
}

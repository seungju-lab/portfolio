import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const browser = await chromium.launch({
  headless: false,
  env: { ...process.env, DISPLAY: process.env.DISPLAY ?? ":99" },
});
const context = await browser.newContext();
const page = await context.newPage();
const cdp = await browser.newBrowserCDPSession();
let seq = 0;
function remote(session, method, params = {}) {
  return new Promise(async (resolve, reject) => {
    const id = ++seq;
    const receive = (event) => {
      if (event.sessionId !== session) return;
      const data = JSON.parse(event.message);
      if (data.id !== id) return;
      cdp.off("Target.receivedMessageFromTarget", receive);
      data.error ? reject(data.error) : resolve(data.result);
    };
    cdp.on("Target.receivedMessageFromTarget", receive);
    await cdp.send("Target.sendMessageToTarget", {
      sessionId: session,
      message: JSON.stringify({ id, method, params }),
    });
  });
}
try {
  await page.goto(
    (process.env.BASE_URL ?? "http://127.0.0.1:3002") + "/print/",
    { waitUntil: "networkidle" },
  );
  const results = [];
  for (const mode of ["button", "keyboard"]) {
    await page.evaluate(() => {
      window.events = [];
      window.addEventListener("beforeprint", () => events.push("beforeprint"), {
        once: true,
      });
      window.addEventListener("afterprint", () => events.push("afterprint"), {
        once: true,
      });
      scrollTo(0, 850);
      document.querySelector(".print-button").focus({ preventScroll: true });
    });
    if (mode === "button")
      await page.evaluate(() =>
        setTimeout(() => document.querySelector(".print-button").click(), 50),
      );
    else {
      await page.bringToFront();
      execFileSync("xdotool", ["key", "--clearmodifiers", "ctrl+p"], {
        env: { ...process.env, DISPLAY: process.env.DISPLAY ?? ":99" },
      });
    }
    let target;
    for (let i = 0; i < 40; i++) {
      target = (await cdp.send("Target.getTargets")).targetInfos.find(
        (t) => t.url === "chrome://print/",
      );
      if (target) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    assert(target, "native print preview");
    const { sessionId } = await cdp.send("Target.attachToTarget", {
      targetId: target.targetId,
      flatten: false,
    });
    await new Promise((r) => setTimeout(r, 5000));
    const inspection = await remote(sessionId, "Runtime.evaluate", {
      expression: `(()=>{const all=[];function walk(root){for(const el of root.querySelectorAll('*')){if(el.tagName.includes('BUTTON'))all.push({text:el.textContent.trim(),class:el.className});if(el.shadowRoot)walk(el.shadowRoot);}}walk(document);return all;})()`,
      returnByValue: true,
    });
    console.log(mode, JSON.stringify(inspection.result.value));
    const cancel = await remote(sessionId, "Runtime.evaluate", {
      expression: `(()=>{function walk(root){for(const el of root.querySelectorAll('*')){if(el.matches('.cancel-button')){el.click();return true;}if(el.shadowRoot&&walk(el.shadowRoot))return true;}return false;}return walk(document);})()`,
      returnByValue: true,
    });
    assert(cancel.result.value, "native cancel clicked");
    await page.waitForFunction(
      () =>
        events.includes("afterprint") &&
        Math.abs(scrollY - 850) < 2 &&
        document.activeElement?.classList.contains("print-button"),
    );
    results.push({
      mode,
      events: await page.evaluate(() => events),
      scroll: await page.evaluate(() => scrollY),
      focus: await page.evaluate(() => document.activeElement.className),
    });
  }
  await fs.writeFile(
    process.env.NATIVE_RESULTS ?? "/tmp/portfolio-native-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}

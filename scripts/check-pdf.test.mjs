import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { checkArtifact, root } from "./pdf-artifact.mjs";

test("current PDF matches source and bytes", async () => {
  await checkArtifact();
});
for (const [name, change] of [
  [
    "changed content",
    async (dir) => {
      const p = path.join(dir, "src/content/portfolio.ts");
      await writeFile(p, (await readFile(p, "utf8")) + "\n// changed input\n");
    },
  ],
  [
    "new style input",
    (dir) =>
      writeFile(
        path.join(dir, "src/app/new-style.css"),
        "body { color: red; }\n",
      ),
  ],
  [
    "corrupted PDF",
    (dir) => writeFile(path.join(dir, "public/portfolio.pdf"), "%PDF-broken"),
  ],
  ["missing PDF", (dir) => rm(path.join(dir, "public/portfolio.pdf"))],
])
  test(`rejects ${name} without changing the working source`, async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "portfolio-pdf-fixture-"));
    try {
      for (const entry of [
        "src",
        "public",
        "scripts",
        "package.json",
        "pnpm-lock.yaml",
        "next.config.ts",
        "tsconfig.json",
      ])
        await cp(path.join(root, entry), path.join(dir, entry), {
          recursive: true,
        });
      await change(dir);
      await assert.rejects(checkArtifact(dir));
      await checkArtifact();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

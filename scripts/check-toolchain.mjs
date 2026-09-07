import { readFileSync } from "node:fs";

const nodeVersion = readFileSync(
  new URL("../.nvmrc", import.meta.url),
  "utf8",
).trim();
const { packageManager } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const pnpmVersion = packageManager.match(/^pnpm@(\d+\.\d+\.\d+)$/)?.[1];
const actualPnpm =
  process.env.npm_config_user_agent?.match(/^pnpm\/([^ ]+)/)?.[1];

if (
  !pnpmVersion ||
  process.versions.node !== nodeVersion ||
  actualPnpm !== pnpmVersion
) {
  console.error(
    `Use Node ${nodeVersion} and pnpm ${pnpmVersion}. Run nvm install && nvm use, then pnpm check.`,
  );
  process.exitCode = 1;
} else {
  console.log(`Toolchain verified: Node ${nodeVersion}, pnpm ${pnpmVersion}`);
}

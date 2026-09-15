import { checkArtifact } from "./pdf-artifact.mjs";
try {
  const manifest = await checkArtifact();
  console.log(`PDF current: ${manifest.pages} pages, ${manifest.pdfSha256}`);
} catch (error) {
  console.error(`PDF validation failed: ${error.message}`);
  process.exitCode = 1;
}

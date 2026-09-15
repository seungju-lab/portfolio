import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function serveExport(directory) {
  const root = path.resolve(directory);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".webp": "image/webp",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
  };
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const filename = path.resolve(
        root,
        "." +
          decodeURIComponent(url.pathname) +
          (url.pathname.endsWith("/") ? "index.html" : ""),
      );
      if (!filename.startsWith(root + path.sep))
        throw new Error("Invalid path");
      const bytes = await readFile(filename);
      response.writeHead(200, {
        "Content-Type":
          types[path.extname(filename)] ?? "application/octet-stream",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}

import { resolve } from "node:path";

const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const links = new Map();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function buildShortUrl(code) {
  const port = Number(process.env.PORT || 3000);
  const configuredBaseUrl = process.env.BASE_URL;
  if (configuredBaseUrl) return `${configuredBaseUrl.replace(/\/$/, "")}/${code}`;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/${code}`;
  return `http://localhost:${port}/${code}`;
}

function makeCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += base62[Math.floor(Math.random() * base62.length)];
  }
  return code;
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...extraHeaders
    }
  });
}

function isValidHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function serveStaticFile(requestPath) {
  const publicDir = process.env.PUBLIC_DIR;
  if (!publicDir) return null;

  const pathname = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = pathname.replace(/^\/+/, "").split("/").filter((part) => part && part !== "." && part !== "..");
  const target = safePath.length ? safePath.join("/") : "index.html";
  const fullPath = resolve(import.meta.dir, publicDir, target);
  const file = Bun.file(fullPath);
  if (await file.exists()) {
    const contentType = fullPath.endsWith(".html") ? "text/html; charset=utf-8" : undefined;
    return new Response(file, {
      headers: {
        ...corsHeaders,
        ...(contentType ? { "Content-Type": contentType } : {})
      }
    });
  }

  return null;
}

const server = Bun.serve({
  port: Number(process.env.PORT || 3000),
  fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (pathname === "/api/links") {
      if (request.method === "GET") {
        const items = Array.from(links.values()).map((entry) => ({
          code: entry.code,
          url: entry.url,
          shortUrl: entry.shortUrl,
          hits: entry.hits,
          createdAt: entry.createdAt
        }));
        return jsonResponse(items, 200);
      }

      if (request.method === "POST") {
        return (async () => {
          let body;
          try {
            body = await request.json();
          } catch {
            return jsonResponse({ error: "Invalid JSON body" }, 400);
          }

          if (!body || typeof body.url !== "string" || !isValidHttpUrl(body.url)) {
            return jsonResponse({ error: "Invalid URL" }, 400);
          }

          let code = makeCode();
          while (links.has(code)) {
            code = makeCode();
          }

          const createdAt = new Date().toISOString();
          const shortUrl = buildShortUrl(code);
          const record = { code, url: body.url, shortUrl, hits: 0, createdAt };
          links.set(code, record);

          return jsonResponse(record, 201);
        })();
      }
    }

    if (request.method === "GET") {
      const code = pathname.slice(1).split("/")[0];
      if (code && code !== "api" && code !== "favicon.ico") {
        const staticFile = process.env.PUBLIC_DIR ? serveStaticFile(pathname) : null;
        if (staticFile) {
          return staticFile;
        }

        const record = links.get(code);
        if (!record) {
          return jsonResponse({ error: "Not found" }, 404);
        }

        record.hits += 1;
        return Response.redirect(record.url, 302);
      }
    }

    if (request.method === "GET") {
      if (process.env.PUBLIC_DIR) {
        const staticFile = serveStaticFile(pathname);
        if (staticFile) {
          return staticFile;
        }
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  }
});

console.log(`Snip backend running on http://localhost:${server.port}`);

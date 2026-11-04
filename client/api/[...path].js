import http from "node:http";
import https from "node:https";

// Stream API requests through the Vercel origin so the refresh cookie stays
// same-site and GridFS downloads remain available at /api/files/:id.
export const config = { api: { bodyParser: false } };

const blockedHeaders = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host",
]);

export default function handler(req, res) {
  let target;
  try {
    const origin = new URL(process.env.API_ORIGIN || "");
    if (origin.protocol !== "https:") throw new Error("API_ORIGIN must use HTTPS");
    target = new URL(req.url || "/api", origin);
    if (!target.pathname.startsWith("/api/")) throw new Error("Invalid API path");
  } catch {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ message: "The API proxy is not configured. Set API_ORIGIN to the Render service URL." }));
  }

  const headers = {};
  for (const [name, value] of Object.entries(req.headers))
    if (!blockedHeaders.has(name.toLowerCase()) && value !== undefined) headers[name] = value;
  headers.host = target.host;
  headers["x-forwarded-host"] = req.headers.host || "";
  headers["x-forwarded-proto"] = "https";

  const transport = target.protocol === "https:" ? https : http;
  const upstream = transport.request(target, { method: req.method, headers }, (response) => {
    res.statusCode = response.statusCode || 502;
    for (const [name, value] of Object.entries(response.headers))
      if (!blockedHeaders.has(name.toLowerCase()) && value !== undefined) res.setHeader(name, value);
    response.pipe(res);
  });
  upstream.setTimeout(55_000, () => upstream.destroy(new Error("Upstream request timed out")));
  upstream.on("error", () => {
    if (res.headersSent) return res.destroy();
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ message: "The API service is unavailable. Please try again shortly." }));
  });
  req.on("aborted", () => upstream.destroy());
  req.pipe(upstream);
}

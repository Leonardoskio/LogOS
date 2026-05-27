import { createServer } from "node:http";
import { config } from "./config.js";
import { createShipment } from "./routes/spedizioni.js";

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    sendJson(res, 204);
    return;
  }

  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        data: {
          status: "ok",
          service: "logos-backend"
        }
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/spedizioni") {
      const body = await readJsonBody(req);
      const result = await createShipment(body, config);
      sendJson(res, 201, result);
      return;
    }

    sendJson(res, 404, {
      error: {
        code: "not_found",
        message: `Route not found: ${req.method} ${url.pathname}`
      }
    });
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, {
      error: {
        code: error.code || "internal_error",
        message: error.message || "Internal server error",
        field: error.field
      }
    });
  }
});

server.listen(config.port, () => {
  console.log(`LogOS backend listening on http://localhost:${config.port}`);
});

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    throw httpError(400, "invalid_json", "Request body must be valid JSON");
  }
}

function sendJson(res, statusCode, payload = null) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });

  if (payload === null) {
    res.end();
    return;
  }

  res.end(JSON.stringify(payload, null, 2));
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function httpError(statusCode, code, message, field) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}

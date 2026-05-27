import { createServer } from "node:http";
import { config } from "./config.js";
import { listDrivers, listDriverShipments, readDriver } from "./routes/autisti.js";
import { listCustomers, listCustomerShipments, readCustomer } from "./routes/clienti.js";
import { listTractors, listTractorShipments, readTractor } from "./routes/motrici.js";
import { createShipment, listShipments, readShipment } from "./routes/spedizioni.js";

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

    if (req.method === "GET" && url.pathname === "/api/spedizioni") {
      sendJson(res, 200, await listShipments(url.searchParams, config));
      return;
    }

    const shipmentMatch = url.pathname.match(/^\/api\/spedizioni\/([^/]+)$/);
    if (req.method === "GET" && shipmentMatch) {
      sendJson(res, 200, await readShipment(decodeURIComponent(shipmentMatch[1]), config));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/clienti") {
      sendJson(res, 200, await listCustomers(config));
      return;
    }

    const customerShipmentsMatch = url.pathname.match(/^\/api\/clienti\/([^/]+)\/spedizioni$/);
    if (req.method === "GET" && customerShipmentsMatch) {
      sendJson(res, 200, await listCustomerShipments(decodeURIComponent(customerShipmentsMatch[1]), config));
      return;
    }

    const customerMatch = url.pathname.match(/^\/api\/clienti\/([^/]+)$/);
    if (req.method === "GET" && customerMatch) {
      sendJson(res, 200, await readCustomer(decodeURIComponent(customerMatch[1]), config));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/autisti") {
      sendJson(res, 200, await listDrivers(config));
      return;
    }

    const driverShipmentsMatch = url.pathname.match(/^\/api\/autisti\/([^/]+)\/spedizioni$/);
    if (req.method === "GET" && driverShipmentsMatch) {
      sendJson(res, 200, await listDriverShipments(decodeURIComponent(driverShipmentsMatch[1]), config));
      return;
    }

    const driverMatch = url.pathname.match(/^\/api\/autisti\/([^/]+)$/);
    if (req.method === "GET" && driverMatch) {
      sendJson(res, 200, await readDriver(decodeURIComponent(driverMatch[1]), config));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/motrici") {
      sendJson(res, 200, await listTractors(config));
      return;
    }

    const tractorShipmentsMatch = url.pathname.match(/^\/api\/motrici\/([^/]+)\/spedizioni$/);
    if (req.method === "GET" && tractorShipmentsMatch) {
      sendJson(res, 200, await listTractorShipments(decodeURIComponent(tractorShipmentsMatch[1]), config));
      return;
    }

    const tractorMatch = url.pathname.match(/^\/api\/motrici\/([^/]+)$/);
    if (req.method === "GET" && tractorMatch) {
      sendJson(res, 200, await readTractor(decodeURIComponent(tractorMatch[1]), config));
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

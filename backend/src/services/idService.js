import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function generateShipmentId(activeVaultPath, dataOperativa) {
  const year = dataOperativa.slice(0, 4);
  const countersPath = path.join(activeVaultPath, ".logos", "counters.json");

  await mkdir(path.dirname(countersPath), { recursive: true });

  const counters = await readCounters(countersPath);
  counters.shipments ||= {};
  counters.shipments[year] ||= 0;
  counters.shipments[year] += 1;

  await writeFile(countersPath, `${JSON.stringify(counters, null, 2)}\n`, "utf8");

  return `SP-${year}-${String(counters.shipments[year]).padStart(5, "0")}`;
}

async function readCounters(countersPath) {
  try {
    const rawCounters = await readFile(countersPath, "utf8");
    return JSON.parse(rawCounters);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    if (error instanceof SyntaxError) {
      throw httpError(500, "counter_read_failed", "Counter file contains invalid JSON");
    }

    throw error;
  }
}

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

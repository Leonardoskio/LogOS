import { generateDailyReport } from "../services/aiService.js";

export async function createDailyReport(body, appConfig) {
  validateDailyReportRequest(body);

  return {
    data: await generateDailyReport(body.data, appConfig)
  };
}

function validateDailyReportRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "invalid_json", "Request body must be a JSON object");
  }

  if (body.data === undefined || body.data === null || body.data === "") {
    throw httpError(400, "missing_required_field", "Missing required field: data", "data");
  }

  if (!isIsoDate(body.data)) {
    throw httpError(400, "invalid_date", "data must use YYYY-MM-DD format", "data");
  }
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function httpError(statusCode, code, message, field) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}

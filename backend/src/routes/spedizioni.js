import { createShipmentNote, listShipmentNotes, readShipmentNote } from "../services/vaultService.js";

const REQUIRED_FIELDS = [
  "data_operativa",
  "cliente_id",
  "cliente_nome",
  "merce",
  "tipo_carico",
  "origine",
  "destinazione"
];

const VALID_CARGO_TYPES = new Set(["LQ", "FR", "SEC", "ADR", "GEN"]);
const VALID_SHIPMENT_STATUS = new Set([
  "richiesta",
  "programmata",
  "in_viaggio",
  "completata",
  "annullata"
]);

export async function createShipment(body, appConfig) {
  validateShipmentRequest(body);

  const shipmentInput = {
    ...body,
    stato: body.stato || "richiesta"
  };

  const createdShipment = await createShipmentNote(shipmentInput, appConfig);

  return {
    data: {
      type: "spedizione",
      id: createdShipment.id,
      data_operativa: createdShipment.data_operativa,
      cliente_id: createdShipment.cliente_id,
      cliente_nome: createdShipment.cliente_nome,
      tipo_carico: createdShipment.tipo_carico,
      stato: createdShipment.stato,
      file: createdShipment.file,
      path: createdShipment.path
    }
  };
}

export async function listShipments(queryParams, appConfig) {
  const filters = {};
  for (const field of ["id", "cliente_id", "autista_id", "motrice_id", "data_operativa", "stato", "tipo_carico"]) {
    const value = queryParams.get(field);
    if (value) filters[field] = value;
  }

  return {
    data: await listShipmentNotes(appConfig, filters)
  };
}

export async function readShipment(id, appConfig) {
  const shipment = await readShipmentNote(appConfig, id);

  return {
    data: shipment
  };
}

function validateShipmentRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "invalid_json", "Request body must be a JSON object");
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      throw httpError(400, "missing_required_field", `Missing required field: ${field}`, field);
    }
  }

  if (!isIsoDate(body.data_operativa)) {
    throw httpError(400, "invalid_date", "data_operativa must use YYYY-MM-DD format", "data_operativa");
  }

  if (!VALID_CARGO_TYPES.has(body.tipo_carico)) {
    throw httpError(400, "invalid_tipo_carico", "tipo_carico is not supported", "tipo_carico");
  }

  if (!isSlug(body.cliente_id)) {
    throw httpError(400, "invalid_id", "cliente_id must be a lowercase slug", "cliente_id");
  }

  if (body.autista_id !== undefined && body.autista_id !== "" && !isSlug(body.autista_id)) {
    throw httpError(400, "invalid_id", "autista_id must be a lowercase slug", "autista_id");
  }

  if (body.motrice_id !== undefined && body.motrice_id !== "" && !isPlateId(body.motrice_id)) {
    throw httpError(400, "invalid_id", "motrice_id must contain only uppercase letters, numbers or dashes", "motrice_id");
  }

  if (body.stato !== undefined && !VALID_SHIPMENT_STATUS.has(body.stato)) {
    throw httpError(400, "invalid_stato", "stato is not supported", "stato");
  }

  if (body.distanza_km !== undefined && !isValidNumber(body.distanza_km)) {
    throw httpError(400, "invalid_number", "distanza_km must be a number", "distanza_km");
  }
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isSlug(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isPlateId(value) {
  return typeof value === "string" && /^[A-Z0-9-]+$/.test(value);
}

function httpError(statusCode, code, message, field) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}

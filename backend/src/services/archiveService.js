const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre"
];

export function getArchiveDirectory(dataOperativa) {
  const [year, month, day] = dataOperativa.split("-");
  const monthIndex = Number(month) - 1;
  const monthName = MONTH_NAMES[monthIndex];

  if (!monthName) {
    throw httpError(400, "invalid_date", "data_operativa contains an invalid month", "data_operativa");
  }

  return `02 Archivio/${year}/${monthName}/${day}`;
}

export function buildShipmentFilename({ id, cliente_id, tipo_carico }) {
  return `${id}_${cliente_id}_${tipo_carico}.md`;
}

function httpError(statusCode, code, message, field) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}

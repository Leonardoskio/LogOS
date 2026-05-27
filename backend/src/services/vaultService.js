import { access, copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getArchiveDirectory, buildShipmentFilename } from "./archiveService.js";
import { generateShipmentId } from "./idService.js";

export async function createShipmentNote(shipmentInput, appConfig) {
  await ensureRuntimeVault(appConfig);

  const id = await generateShipmentId(appConfig.activeVaultPath, shipmentInput.data_operativa);
  const now = new Date().toISOString();
  const shipment = {
    type: "spedizione",
    id,
    stato: "richiesta",
    created_at: now,
    updated_at: now,
    autista_id: "",
    motrice_id: "",
    distanza_km: "",
    note: "",
    ...shipmentInput
  };

  const archiveDirectory = getArchiveDirectory(shipment.data_operativa);
  const file = buildShipmentFilename(shipment);
  const relativePath = `${archiveDirectory}/${file}`;
  const absolutePath = path.join(appConfig.activeVaultPath, relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  const template = await readTemplate(appConfig.vaultTemplatePath, "00 Template/Spedizione.md");
  const markdown = renderTemplate(template, shipment);

  try {
    await writeFile(absolutePath, markdown, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw httpError(409, "duplicate_id", `Shipment note already exists: ${relativePath}`);
    }
    throw httpError(500, "vault_write_failed", `Unable to write shipment note: ${error.message}`);
  }

  return {
    ...shipment,
    file,
    path: relativePath
  };
}

export async function listShipmentNotes(appConfig, filters = {}) {
  const archiveRoot = path.join(appConfig.activeVaultPath, "02 Archivio");
  const markdownFiles = await listMarkdownFiles(archiveRoot);
  const shipments = [];

  for (const absolutePath of markdownFiles) {
    const markdown = await readFile(absolutePath, "utf8");
    const frontmatter = parseFrontmatter(markdown);

    if (frontmatter.type !== "spedizione") continue;

    const relativePath = toVaultRelativePath(appConfig.activeVaultPath, absolutePath);
    shipments.push(toShipmentSummary(frontmatter, relativePath));
  }

  return shipments
    .filter((shipment) => matchesFilters(shipment, filters))
    .sort(sortShipments);
}

export async function readShipmentNote(appConfig, id) {
  const shipments = await listShipmentNotes(appConfig, { id });
  const shipment = shipments[0];

  if (!shipment) {
    throw httpError(404, "not_found", `Shipment not found: ${id}`);
  }

  const absolutePath = path.join(appConfig.activeVaultPath, shipment.path);
  const markdown = await readFile(absolutePath, "utf8");

  return {
    ...shipment,
    frontmatter: parseFrontmatter(markdown),
    markdown
  };
}

export async function listRelatedEntities(appConfig, relation) {
  const shipments = await listShipmentNotes(appConfig);
  const entities = new Map();

  for (const shipment of shipments) {
    const entity = getEntityFromShipment(shipment, relation);
    if (!entity) continue;

    const existing = entities.get(entity.id) || {
      ...entity,
      spedizioni_count: 0,
      ultima_spedizione_data: shipment.data_operativa || ""
    };

    existing.spedizioni_count += 1;
    if ((shipment.data_operativa || "") > (existing.ultima_spedizione_data || "")) {
      existing.ultima_spedizione_data = shipment.data_operativa;
    }

    entities.set(entity.id, existing);
  }

  return [...entities.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export async function readRelatedEntity(appConfig, relation, id) {
  const entities = await listRelatedEntities(appConfig, relation);
  const entity = entities.find((item) => item.id === id);

  if (!entity) {
    throw httpError(404, "not_found", `${relation} not found: ${id}`);
  }

  return entity;
}

async function ensureRuntimeVault(appConfig) {
  await mkdir(appConfig.activeVaultPath, { recursive: true });
  await ensureTemplateCopied(appConfig, "00 Template/Spedizione.md");
}

async function ensureTemplateCopied(appConfig, relativePath) {
  const targetPath = path.join(appConfig.activeVaultPath, relativePath);

  try {
    await access(targetPath);
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(path.join(appConfig.vaultTemplatePath, relativePath), targetPath);
}

async function readTemplate(vaultTemplatePath, relativePath) {
  try {
    return await readFile(path.join(vaultTemplatePath, relativePath), "utf8");
  } catch (error) {
    throw httpError(500, "vault_read_failed", `Unable to read template: ${error.message}`);
  }
}

function renderTemplate(template, data) {
  const withFrontmatter = replaceFrontmatterValues(template, data);
  return withFrontmatter.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, key) => {
    return formatMarkdownValue(data[key]);
  });
}

async function listMarkdownFiles(directoryPath) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...await listMarkdownFiles(entryPath));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(entryPath);
      }
    }

    return files;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw httpError(500, "vault_read_failed", `Unable to read vault archive: ${error.message}`);
  }
}

function parseFrontmatter(markdown) {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = {};
  for (const line of frontmatterMatch[1].split("\n")) {
    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    frontmatter[match[1]] = parseYamlValue(match[2]);
  }

  return frontmatter;
}

function parseYamlValue(value) {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function toShipmentSummary(frontmatter, relativePath) {
  return {
    type: "spedizione",
    id: frontmatter.id || "",
    data_operativa: frontmatter.data_operativa || "",
    cliente_id: frontmatter.cliente_id || "",
    cliente_nome: frontmatter.cliente_nome || "",
    tipo_carico: frontmatter.tipo_carico || "",
    autista_id: frontmatter.autista_id || "",
    motrice_id: frontmatter.motrice_id || "",
    stato: frontmatter.stato || "",
    path: relativePath
  };
}

function toVaultRelativePath(activeVaultPath, absolutePath) {
  return path.relative(activeVaultPath, absolutePath).split(path.sep).join("/");
}

function matchesFilters(shipment, filters) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (shipment[key] !== value) return false;
  }

  return true;
}

function sortShipments(a, b) {
  const dateCompare = String(b.data_operativa).localeCompare(String(a.data_operativa));
  if (dateCompare !== 0) return dateCompare;
  return String(a.id).localeCompare(String(b.id));
}

function getEntityFromShipment(shipment, relation) {
  if (relation === "clienti" && shipment.cliente_id) {
    return {
      type: "cliente",
      id: shipment.cliente_id,
      nome: shipment.cliente_nome || shipment.cliente_id
    };
  }

  if (relation === "autisti" && shipment.autista_id) {
    return {
      type: "autista",
      id: shipment.autista_id
    };
  }

  if (relation === "motrici" && shipment.motrice_id) {
    return {
      type: "motrice",
      id: shipment.motrice_id,
      targa: shipment.motrice_id
    };
  }

  return null;
}

function replaceFrontmatterValues(template, data) {
  const frontmatterMatch = template.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return template;

  const renderedFrontmatter = frontmatterMatch[1]
    .split("\n")
    .map((line) => {
      const fieldMatch = line.match(/^([a-zA-Z0-9_]+):\s*$/);
      if (!fieldMatch) return line;

      const key = fieldMatch[1];
      return `${key}: ${formatYamlValue(data[key])}`;
    })
    .join("\n");

  return template.replace(frontmatterMatch[0], `---\n${renderedFrontmatter}\n---`);
}

function formatYamlValue(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(String(value));
}

function formatMarkdownValue(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

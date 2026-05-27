import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
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

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendSrcDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(backendSrcDir, "..");
const repoRoot = path.resolve(backendRoot, "..");

loadEnvFile();

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  vaultTemplatePath: resolveBackendPath(process.env.VAULT_TEMPLATE_PATH || "../vault-template"),
  activeVaultPath: resolveBackendPath(process.env.ACTIVE_VAULT_PATH || "../vaults/demo-company"),
  aiProvider: process.env.AI_PROVIDER || "mock",
  timezone: process.env.LOGOS_TIMEZONE || "Europe/Rome"
};

function loadEnvFile() {
  const candidates = [
    path.join(repoRoot, ".env"),
    path.join(backendRoot, ".env")
  ];

  const envPath = candidates.find((candidate) => existsSync(candidate));
  if (!envPath) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function resolveBackendPath(value) {
  if (path.isAbsolute(value)) return value;
  return path.resolve(backendRoot, value);
}

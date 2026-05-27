import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { config } from "../src/config.js";
import { generateDailyReport } from "../src/services/aiService.js";
import { createShipmentNote } from "../src/services/vaultService.js";

const DEMO_SHIPMENTS = [
  {
    data_operativa: "2026-05-27",
    cliente_id: "azienda-bianchi",
    cliente_nome: "Azienda Bianchi",
    merce: "Liquido alimentare",
    tipo_carico: "LQ",
    origine: "Centro operativo Verona",
    destinazione: "Via Roma 12, Milano",
    autista_id: "mario-rossi",
    motrice_id: "AB123CD",
    distanza_km: 165,
    stato: "in_viaggio",
    note: "Scarico previsto entro le 10:00."
  },
  {
    data_operativa: "2026-05-27",
    cliente_id: "rossi-trasporti",
    cliente_nome: "Rossi Trasporti",
    merce: "Materiale secco pallettizzato",
    tipo_carico: "SEC",
    origine: "Centro operativo Verona",
    destinazione: "Interporto Bologna",
    autista_id: "luca-conti",
    motrice_id: "EF456GH",
    distanza_km: 145,
    stato: "programmata",
    note: "Controllare disponibilita ribalta prima della partenza."
  },
  {
    data_operativa: "2026-05-27",
    cliente_id: "verde-food",
    cliente_nome: "Verde Food",
    merce: "Prodotti refrigerati",
    tipo_carico: "FR",
    origine: "Centro operativo Verona",
    destinazione: "Magazzino Firenze Nord",
    autista_id: "sara-verdi",
    motrice_id: "IJ789KL",
    distanza_km: 236,
    stato: "completata",
    note: "Temperatura controllata durante il viaggio."
  },
  {
    data_operativa: "2026-05-28",
    cliente_id: "azienda-bianchi",
    cliente_nome: "Azienda Bianchi",
    merce: "Liquido industriale",
    tipo_carico: "ADR",
    origine: "Centro operativo Verona",
    destinazione: "Stabilimento Padova",
    autista_id: "mario-rossi",
    motrice_id: "AB123CD",
    distanza_km: 84,
    stato: "richiesta",
    note: "Verificare documentazione ADR prima della conferma."
  }
];

await seedDemoVault();

async function seedDemoVault() {
  assertSafeDemoPath(config.activeVaultPath);

  await rm(config.activeVaultPath, { recursive: true, force: true });
  await cp(config.vaultTemplatePath, config.activeVaultPath, {
    recursive: true,
    filter: (source) => !source.endsWith(`${path.sep}02 Archivio${path.sep}.gitkeep`)
  });

  const createdShipments = [];
  for (const shipment of DEMO_SHIPMENTS) {
    createdShipments.push(await createShipmentNote(shipment, config));
  }

  const report = await generateDailyReport("2026-05-27", config);

  console.log("LogOS demo vault generated.");
  console.log(`Vault: ${config.activeVaultPath}`);
  console.log(`Shipments: ${createdShipments.length}`);
  console.log(`Daily report: ${report.path}`);
  console.log("");
  console.log("Generated shipment notes:");
  for (const shipment of createdShipments) {
    console.log(`- ${shipment.id} -> ${shipment.path}`);
  }
}

function assertSafeDemoPath(activeVaultPath) {
  const normalizedPath = path.normalize(activeVaultPath);
  const expectedSuffix = path.join("vaults", "demo-company");

  if (!normalizedPath.endsWith(expectedSuffix)) {
    throw new Error(
      `Refusing to reset non-demo vault path: ${activeVaultPath}. Set ACTIVE_VAULT_PATH to ../vaults/demo-company for demo seeding.`
    );
  }
}

import { buildDailyReport } from "./mockAiProvider.js";
import { listShipmentNotes, saveAiReport } from "./vaultService.js";

export async function generateDailyReport(data, appConfig) {
  const shipments = await listShipmentNotes(appConfig, { data_operativa: data });
  const markdown = buildDailyReport({
    data,
    shipments
  });
  const path = await saveAiReport(appConfig, data, markdown);

  return {
    type: "report_giornaliero",
    data,
    provider: "mock",
    spedizioni_count: shipments.length,
    shipment_ids: shipments.map((shipment) => shipment.id),
    path,
    markdown
  };
}

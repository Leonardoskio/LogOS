export function buildDailyReport({ data, shipments }) {
  const normalizedShipments = [...shipments].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const customerCount = new Set(normalizedShipments.map((shipment) => shipment.cliente_id).filter(Boolean)).size;
  const tractorCount = new Set(normalizedShipments.map((shipment) => shipment.motrice_id).filter(Boolean)).size;
  const missingDriverCount = normalizedShipments.filter((shipment) => !shipment.autista_id).length;
  const missingTractorCount = normalizedShipments.filter((shipment) => !shipment.motrice_id).length;
  const openShipments = normalizedShipments.filter((shipment) => shipment.stato !== "completata").length;

  return [
    "---",
    "type: ai_report",
    "report_type: report_giornaliero",
    `data: "${data}"`,
    `spedizioni_count: ${normalizedShipments.length}`,
    "---",
    "",
    `# Report giornaliero - ${data}`,
    "",
    "## Sintesi",
    "",
    `- Spedizioni analizzate: ${normalizedShipments.length}`,
    `- Clienti coinvolti: ${customerCount}`,
    `- Motrici utilizzate: ${tractorCount}`,
    `- Spedizioni non completate: ${openShipments}`,
    "",
    "## Spedizioni",
    "",
    ...formatShipmentRows(normalizedShipments),
    "",
    "## Criticita rilevate",
    "",
    ...formatIssues(missingDriverCount, missingTractorCount, openShipments),
    "",
    "## Azioni consigliate",
    "",
    ...formatRecommendations(normalizedShipments, missingDriverCount, missingTractorCount, openShipments),
    "",
    "## Fonti",
    "",
    ...formatSources(normalizedShipments)
  ].join("\n");
}

function formatShipmentRows(shipments) {
  if (shipments.length === 0) {
    return ["Nessuna spedizione trovata per questa data."];
  }

  return shipments.map((shipment) => {
    const route = shipment.origine && shipment.destinazione
      ? `${shipment.origine} -> ${shipment.destinazione}`
      : "tratta non completa";

    return [
      `- ${shipment.id}`,
      `cliente: ${shipment.cliente_nome || shipment.cliente_id || "-"}`,
      `carico: ${shipment.tipo_carico || "-"}`,
      `stato: ${shipment.stato || "-"}`,
      `autista: ${shipment.autista_id || "non assegnato"}`,
      `motrice: ${shipment.motrice_id || "non assegnata"}`,
      `tratta: ${route}`
    ].join(" | ");
  });
}

function formatIssues(missingDriverCount, missingTractorCount, openShipments) {
  const issues = [];

  if (missingDriverCount > 0) {
    issues.push(`- ${missingDriverCount} spedizioni senza autista assegnato.`);
  }

  if (missingTractorCount > 0) {
    issues.push(`- ${missingTractorCount} spedizioni senza motrice assegnata.`);
  }

  if (openShipments > 0) {
    issues.push(`- ${openShipments} spedizioni risultano ancora non completate.`);
  }

  return issues.length > 0 ? issues : ["Nessuna criticita automatica rilevata dal mock."];
}

function formatRecommendations(shipments, missingDriverCount, missingTractorCount, openShipments) {
  if (shipments.length === 0) {
    return ["- Nessuna azione operativa: non ci sono spedizioni da analizzare."];
  }

  const recommendations = [
    "- Verificare che ogni spedizione abbia cliente, stato, autista e motrice coerenti prima della partenza."
  ];

  if (missingDriverCount > 0 || missingTractorCount > 0) {
    recommendations.push("- Completare le assegnazioni mancanti prima di considerare chiusa la pianificazione giornaliera.");
  }

  if (openShipments > 0) {
    recommendations.push("- Aggiornare lo stato delle spedizioni aperte a fine giornata per mantenere affidabile l'archivio.");
  }

  return recommendations;
}

function formatSources(shipments) {
  if (shipments.length === 0) {
    return ["- Nessuna nota sorgente."];
  }

  return shipments.map((shipment) => `- ${shipment.id}: ${shipment.path}`);
}

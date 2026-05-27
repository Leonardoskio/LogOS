import { listRelatedEntities, listShipmentNotes, readRelatedEntity } from "../services/vaultService.js";

export async function listTractors(appConfig) {
  return {
    data: await listRelatedEntities(appConfig, "motrici")
  };
}

export async function readTractor(id, appConfig) {
  return {
    data: await readRelatedEntity(appConfig, "motrici", id)
  };
}

export async function listTractorShipments(id, appConfig) {
  return {
    data: await listShipmentNotes(appConfig, { motrice_id: id })
  };
}

import { listRelatedEntities, listShipmentNotes, readRelatedEntity } from "../services/vaultService.js";

export async function listDrivers(appConfig) {
  return {
    data: await listRelatedEntities(appConfig, "autisti")
  };
}

export async function readDriver(id, appConfig) {
  return {
    data: await readRelatedEntity(appConfig, "autisti", id)
  };
}

export async function listDriverShipments(id, appConfig) {
  return {
    data: await listShipmentNotes(appConfig, { autista_id: id })
  };
}

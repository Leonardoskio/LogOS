import { listRelatedEntities, listShipmentNotes, readRelatedEntity } from "../services/vaultService.js";

export async function listCustomers(appConfig) {
  return {
    data: await listRelatedEntities(appConfig, "clienti")
  };
}

export async function readCustomer(id, appConfig) {
  return {
    data: await readRelatedEntity(appConfig, "clienti", id)
  };
}

export async function listCustomerShipments(id, appConfig) {
  return {
    data: await listShipmentNotes(appConfig, { cliente_id: id })
  };
}

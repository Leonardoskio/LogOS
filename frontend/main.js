const appState = {
  apiBaseUrl: "http://localhost:3000/api",
  backendConnected: false
};

const statusElement = document.querySelector("#system-status");
const shipmentForm = document.querySelector("#shipment-form");
const submitButton = document.querySelector("#submit-button");
const resultBox = document.querySelector("#result-box");
const refreshButton = document.querySelector("#refresh-button");
const activeFilterElement = document.querySelector("#active-filter");
const shipmentsList = document.querySelector("#shipments-list");
const customersList = document.querySelector("#customers-list");
const driversList = document.querySelector("#drivers-list");
const tractorsList = document.querySelector("#tractors-list");

checkBackendStatus().then(() => {
  if (appState.backendConnected) {
    loadOverview();
  } else {
    renderListMessage(shipmentsList, "Backend non collegato.");
    renderListMessage(customersList, "Backend non collegato.");
    renderListMessage(driversList, "Backend non collegato.");
    renderListMessage(tractorsList, "Backend non collegato.");
  }
});

if (shipmentForm) {
  shipmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitShipment(new FormData(shipmentForm));
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    loadOverview();
  });
}

async function checkBackendStatus() {
  try {
    const response = await fetch(`${appState.apiBaseUrl}/health`);
    appState.backendConnected = response.ok;
  } catch {
    appState.backendConnected = false;
  }

  renderBackendStatus();
}

async function submitShipment(formData) {
  setLoading(true);
  renderResult("Invio spedizione in corso...", "muted");

  try {
    const payload = buildShipmentPayload(formData);
    const response = await fetch(`${appState.apiBaseUrl}/spedizioni`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const apiError = responseBody.error || {};
      throw new Error(apiError.message || "Errore durante la creazione della spedizione");
    }

    renderCreatedShipment(responseBody.data);
    appState.backendConnected = true;
    renderBackendStatus();
    await loadOverview();
  } catch (error) {
    renderResult(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function buildShipmentPayload(formData) {
  const payload = {
    data_operativa: getValue(formData, "data_operativa"),
    cliente_id: getValue(formData, "cliente_id"),
    cliente_nome: getValue(formData, "cliente_nome"),
    merce: getValue(formData, "merce"),
    tipo_carico: getValue(formData, "tipo_carico"),
    origine: getValue(formData, "origine"),
    destinazione: getValue(formData, "destinazione"),
    stato: getValue(formData, "stato")
  };

  addOptionalText(payload, formData, "autista_id");
  addOptionalText(payload, formData, "motrice_id");
  addOptionalText(payload, formData, "note");

  const distanzaKm = getValue(formData, "distanza_km");
  if (distanzaKm !== "") {
    payload.distanza_km = Number(distanzaKm);
  }

  return payload;
}

function addOptionalText(payload, formData, field) {
  const value = getValue(formData, field);
  if (value !== "") {
    payload[field] = value;
  }
}

function getValue(formData, field) {
  return String(formData.get(field) || "").trim();
}

function renderBackendStatus() {
  if (!statusElement) return;

  statusElement.textContent = appState.backendConnected
    ? "Backend collegato"
    : "Backend non collegato";

  statusElement.classList.toggle("status-online", appState.backendConnected);
  statusElement.classList.toggle("status-offline", !appState.backendConnected);
}

function renderCreatedShipment(shipment) {
  if (!shipment) {
    renderResult("Risposta backend non valida.", "error");
    return;
  }

  resultBox.className = "result-box success";
  resultBox.innerHTML = `
    <dl>
      <div>
        <dt>ID</dt>
        <dd>${escapeHtml(shipment.id)}</dd>
      </div>
      <div>
        <dt>File</dt>
        <dd>${escapeHtml(shipment.file)}</dd>
      </div>
      <div>
        <dt>Path vault</dt>
        <dd>${escapeHtml(shipment.path)}</dd>
      </div>
      <div>
        <dt>Stato</dt>
        <dd>${escapeHtml(shipment.stato)}</dd>
      </div>
    </dl>
  `;
}

async function loadOverview() {
  renderListMessage(shipmentsList, "Caricamento spedizioni...");
  renderListMessage(customersList, "Caricamento clienti...");
  renderListMessage(driversList, "Caricamento autisti...");
  renderListMessage(tractorsList, "Caricamento motrici...");
  setActiveFilter("Tutte le spedizioni");

  try {
    const [shipments, customers, drivers, tractors] = await Promise.all([
      apiGet("/spedizioni"),
      apiGet("/clienti"),
      apiGet("/autisti"),
      apiGet("/motrici")
    ]);

    renderShipments(shipments.data || []);
    renderEntities(customersList, customers.data || [], "cliente");
    renderEntities(driversList, drivers.data || [], "autista");
    renderEntities(tractorsList, tractors.data || [], "motrice");
  } catch (error) {
    renderListMessage(shipmentsList, error.message, "error");
    renderListMessage(customersList, "-");
    renderListMessage(driversList, "-");
    renderListMessage(tractorsList, "-");
  }
}

async function loadRelatedShipments(type, id, label) {
  setActiveFilter(`${label}: ${id}`);
  renderListMessage(shipmentsList, "Caricamento spedizioni collegate...");

  const endpointByType = {
    cliente: `/clienti/${encodeURIComponent(id)}/spedizioni`,
    autista: `/autisti/${encodeURIComponent(id)}/spedizioni`,
    motrice: `/motrici/${encodeURIComponent(id)}/spedizioni`
  };

  try {
    const response = await apiGet(endpointByType[type]);
    renderShipments(response.data || []);
  } catch (error) {
    renderListMessage(shipmentsList, error.message, "error");
  }
}

async function apiGet(path) {
  const response = await fetch(`${appState.apiBaseUrl}${path}`);
  const body = await response.json();

  if (!response.ok) {
    const apiError = body.error || {};
    throw new Error(apiError.message || "Errore durante il caricamento dei dati");
  }

  return body;
}

function renderShipments(shipments) {
  if (!shipmentsList) return;

  if (shipments.length === 0) {
    renderListMessage(shipmentsList, "Nessuna spedizione trovata.");
    return;
  }

  shipmentsList.innerHTML = shipments.map((shipment) => `
    <article class="shipment-item">
      <div>
        <strong>${escapeHtml(shipment.id)}</strong>
        <span>${escapeHtml(shipment.cliente_nome || shipment.cliente_id)}</span>
      </div>
      <dl>
        <div>
          <dt>Data</dt>
          <dd>${escapeHtml(shipment.data_operativa)}</dd>
        </div>
        <div>
          <dt>Carico</dt>
          <dd>${escapeHtml(shipment.tipo_carico)}</dd>
        </div>
        <div>
          <dt>Autista</dt>
          <dd>${escapeHtml(shipment.autista_id || "-")}</dd>
        </div>
        <div>
          <dt>Motrice</dt>
          <dd>${escapeHtml(shipment.motrice_id || "-")}</dd>
        </div>
        <div>
          <dt>Stato</dt>
          <dd>${escapeHtml(shipment.stato)}</dd>
        </div>
      </dl>
      <small>${escapeHtml(shipment.path)}</small>
    </article>
  `).join("");
}

function renderEntities(container, entities, type) {
  if (!container) return;

  if (entities.length === 0) {
    renderListMessage(container, "Nessun dato.");
    return;
  }

  container.innerHTML = entities.map((entity) => {
    const title = entity.nome || entity.targa || entity.id;
    return `
      <button type="button" class="entity-button" data-type="${escapeHtml(type)}" data-id="${escapeHtml(entity.id)}">
        <span>${escapeHtml(title)}</span>
        <strong>${Number(entity.spedizioni_count || 0)}</strong>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".entity-button").forEach((button) => {
    button.addEventListener("click", () => {
      loadRelatedShipments(button.dataset.type, button.dataset.id, getEntityLabel(button.dataset.type));
    });
  });
}

function getEntityLabel(type) {
  const labels = {
    cliente: "Cliente",
    autista: "Autista",
    motrice: "Motrice"
  };

  return labels[type] || "Filtro";
}

function setActiveFilter(label) {
  if (activeFilterElement) {
    activeFilterElement.textContent = label;
  }
}

function renderListMessage(container, message, variant = "muted") {
  if (!container) return;
  container.className = container.className
    .replace(/\s?(error|muted)\b/g, "")
    .trim();
  container.classList.add(variant);
  container.textContent = message;
}

function renderResult(message, variant) {
  if (!resultBox) return;
  resultBox.className = `result-box ${variant}`;
  resultBox.textContent = message;
}

function setLoading(isLoading) {
  if (!submitButton) return;
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Creazione..." : "Crea spedizione";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };

    return replacements[character];
  });
}

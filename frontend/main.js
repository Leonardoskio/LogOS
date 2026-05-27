const appState = {
  apiBaseUrl: "http://localhost:3000/api",
  backendConnected: false
};

const statusElement = document.querySelector("#system-status");
const shipmentForm = document.querySelector("#shipment-form");
const submitButton = document.querySelector("#submit-button");
const resultBox = document.querySelector("#result-box");

checkBackendStatus();

if (shipmentForm) {
  shipmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitShipment(new FormData(shipmentForm));
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

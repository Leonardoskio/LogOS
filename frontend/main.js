const appState = {
  apiBaseUrl: "http://localhost:3000/api",
  backendConnected: false
};

const statusElement = document.querySelector("#system-status");

if (statusElement) {
  statusElement.textContent = appState.backendConnected
    ? "Backend collegato"
    : "Backend non collegato";
}

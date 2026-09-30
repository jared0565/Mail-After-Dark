const toggle = document.querySelector("#toggle");
const status = document.querySelector("#status");
let state;
let tabId;

function announce(text, error = false) {
  status.textContent = text;
  status.dataset.error = String(error);
}
function render() {
  document.querySelector("#site").textContent = state.hostname;
  toggle.setAttribute("aria-checked", String(state.enabled));
  document.querySelector("#mode-description").textContent = state.enabled ? "On for this website" : "Original appearance";
  announce(state.needsReload ? "Saved. Reload any open mail tabs that have not updated." :
    state.enabled ? "Remembered for this website, including when you return." : "Turn on to allow access to this website and soften your inbox.");
}
async function request(message) {
  const result = await chrome.runtime.sendMessage(message);
  if (!result?.ok) throw new Error(result?.error || "The extension did not respond. Please try again.");
  return result;
}

toggle.addEventListener("click", async () => {
  if (!state) return;
  toggle.disabled = true;
  try {
    const turnOn = !state.enabled;
    // Request directly in the click handler, before any asynchronous work.
    if (turnOn && !await chrome.permissions.request({ origins: [state.pattern] })) {
      announce("Site access was not granted. Dark mode is still off.");
      return;
    }
    announce("Updating your inbox…");
    state = await request({ type: "set-enabled", tabId, pattern: state.pattern, enabled: turnOn });
    render();
  } catch (error) {
    announce(error.message, true);
  } finally {
    toggle.disabled = false;
  }
});

try {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Open your webmail in a browser tab first.");
  tabId = tab.id;
  state = await request({ type: "status", tabId });
  render();
  toggle.disabled = false;
} catch (error) {
  document.querySelector("#site").textContent = "Unavailable on this page";
  announce(error.message, true);
}

(() => {
  const key = "__mailAfterDarkController";
  if (globalThis[key]) {
    globalThis[key].refresh();
    return;
  }
  let sheet = null;
  let revision = 0;
  let desired = false;
  let rootObserver = null;

  function apply(turnOn) {
    desired = turnOn;
    if (!turnOn) {
      rootObserver?.disconnect();
      rootObserver = null;
      sheet?.remove();
      sheet = null;
      return;
    }
    if (!document.documentElement) {
      if (!rootObserver) {
        rootObserver = new MutationObserver(() => {
          if (!document.documentElement) return;
          rootObserver.disconnect();
          rootObserver = null;
          apply(desired);
        });
        rootObserver.observe(document, { childList: true });
      }
      return;
    }
    if (!sheet?.isConnected) {
      sheet = document.createElement("style");
      sheet.textContent = globalThis.__mailAfterDarkCSS;
      document.documentElement.append(sheet);
    }
  }

  async function refresh() {
    const current = ++revision;
    try {
      const state = await chrome.runtime.sendMessage({ type: "frame-state" });
      if (current === revision) apply(state?.ok === true && state.enabled === true);
    } catch {
      if (current === revision) apply(false);
    }
  }
  globalThis[key] = { refresh };
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id === chrome.runtime.id && message?.type === "refresh-theme") {
      refresh().then(() => respond({ ok: true }));
      return true;
    }
  });
  // Also reconcile a document restored from the browser back/forward cache.
  addEventListener("pageshow", refresh);
  refresh();
})();

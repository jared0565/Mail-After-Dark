import { siteFor } from "./site.js";

// Store only opted-in host patterns. Registrations are a recoverable projection
// of those preferences. Serialize writes from multiple popup windows.
let writes = Promise.resolve();
function enqueue(task) {
  const result = writes.then(task);
  writes = result.catch(() => {});
  return result;
}

async function enabled(site) {
  const stored = await chrome.storage.local.get(site.id);
  return stored[site.id] === site.pattern && await chrome.permissions.contains({ origins: [site.pattern] });
}

function registration(site) {
  return {
    id: site.id, matches: [site.pattern], js: ["theme.js", "content.js"],
    runAt: "document_start", allFrames: true, matchOriginAsFallback: true,
    persistAcrossSessions: true
  };
}

async function refreshTabs(site, turnOn, activeId) {
  const tabs = await chrome.tabs.query({ url: site.pattern });
  if (Number.isInteger(activeId) && !tabs.some(tab => tab.id === activeId)) tabs.push({ id: activeId });
  const results = await Promise.allSettled(tabs.map(async tab => {
    if (!turnOn) {
      // Existing listeners survive unregistration and can undo the theme.
      await chrome.tabs.sendMessage(tab.id, { type: "refresh-theme" });
      return;
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true }, files: ["theme.js", "content.js"]
      });
    } catch {
      // An inaccessible cross-origin frame must not block the main reader.
      await chrome.scripting.executeScript({
        target: { tabId: tab.id }, files: ["theme.js", "content.js"]
      });
    }
  }));
  return results.some(result => result.status === "rejected");
}

async function handle(message, sender) {
  if (sender.id !== chrome.runtime.id) throw new Error("Invalid sender.");
  if (message?.type === "frame-state" && sender.tab) {
    let site;
    try { site = siteFor(sender.url); }
    catch {
      // about:blank/srcdoc/blob frames inherit their initiating origin.
      try { site = siteFor(sender.origin); } catch { return { enabled: false }; }
    }
    return { enabled: await enabled(site) };
  }
  // Content scripts may query their own state, but cannot change settings.
  if (sender.url !== chrome.runtime.getURL("popup.html")) {
    throw new Error("Settings are only available from the extension popup.");
  }
  if (!["status", "set-enabled"].includes(message?.type) || !Number.isInteger(message.tabId)) {
    throw new Error("Invalid request.");
  }
  const tab = await chrome.tabs.get(message.tabId);
  const site = siteFor(tab.url);
  if (message.type === "status") return { ...site, enabled: await enabled(site) };
  if (typeof message.enabled !== "boolean" || message.pattern !== site.pattern) {
    throw new Error("The tab changed. Reopen the extension and try again.");
  }
  return enqueue(async () => {
    const entries = await chrome.scripting.getRegisteredContentScripts({ ids: [site.id] });
    if (message.enabled) {
      if (!await chrome.permissions.contains({ origins: [site.pattern] })) {
        throw new Error("Allow access to this site to enable dark mode.");
      }
      if (!entries.length) await chrome.scripting.registerContentScripts([registration(site)]);
      await chrome.storage.local.set({ [site.id]: site.pattern });
    } else {
      if (entries.length) await chrome.scripting.unregisterContentScripts({ ids: [site.id] });
      await chrome.storage.local.remove(site.id);
    }
    const needsReload = await refreshTabs(site, message.enabled, tab.id);
    return { ...site, enabled: message.enabled, needsReload };
  });
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  handle(message, sender).then(
    result => respond({ ok: true, ...result }),
    error => respond({ ok: false, error: error.message || "Could not change dark mode." })
  );
  return true;
});

chrome.permissions.onRemoved.addListener(() => {
  enqueue(async () => {
    const entries = await chrome.scripting.getRegisteredContentScripts();
    for (const entry of entries) {
      if (entry.id.startsWith("mail-dark-") &&
          !await chrome.permissions.contains({ origins: entry.matches })) {
        await chrome.scripting.unregisterContentScripts({ ids: [entry.id] });
        await chrome.storage.local.remove(entry.id);
      }
    }
    const tabs = await chrome.tabs.query({});
    await Promise.allSettled(tabs.map(tab => chrome.tabs.sendMessage(tab.id, { type: "refresh-theme" })));
  }).catch(() => { /* Browser shutdown: permission checks still fail closed. */ });
});

// Recover registrations after extension updates or browser startup. This runs
// on worker startup too, so recovery is retried after an interrupted operation.
enqueue(async () => {
  await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  const preferences = await chrome.storage.local.get(null);
  const entries = await chrome.scripting.getRegisteredContentScripts();
  for (const entry of entries) {
    if (entry.id.startsWith("mail-dark-") && preferences[entry.id] !== entry.matches[0]) {
      await chrome.scripting.unregisterContentScripts({ ids: [entry.id] });
    }
  }
  for (const [id, pattern] of Object.entries(preferences)) {
    if (!id.startsWith("mail-dark-") || typeof pattern !== "string") continue;
    let site;
    try { site = siteFor(pattern); } catch { await chrome.storage.local.remove(id); continue; }
    if (site.id !== id || !await chrome.permissions.contains({ origins: [site.pattern] })) {
      await chrome.storage.local.remove(id);
      continue;
    }
    if (!entries.some(entry => entry.id === id)) {
      await chrome.scripting.registerContentScripts([registration(site)]);
      await refreshTabs(site, true);
    }
  }
}).catch(error => console.warn("Mail After Dark could not restore site preferences:", error.message));

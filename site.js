export function siteFor(rawUrl) {
  const url = new URL(rawUrl);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("Open your webmail in a normal browser tab first.");
  }
  if (url.hostname === "chromewebstore.google.com" ||
      (url.hostname === "chrome.google.com" && url.pathname.startsWith("/webstore")) ||
      url.hostname === "microsoftedge.microsoft.com") {
    throw new Error("Browser extension stores cannot be themed. Open your webmail instead.");
  }
  const pattern = `${url.protocol}//${url.hostname}/*`;
  const id = "mail-dark-" + Array.from(new TextEncoder().encode(pattern), byte => byte.toString(16).padStart(2, "0")).join("");
  return { pattern, id, hostname: url.hostname };
}

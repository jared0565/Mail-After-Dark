// Optional real-browser integration check. Uses an existing Playwright installation.
// Usage: node tests/browser-smoke.mjs <absolute-path-to-playwright-core/index.mjs>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("Pass the path to an existing playwright-core/index.mjs installation.");
const { chromium } = await import(pathToFileURL(resolve(process.argv[2])).href);
const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "output/playwright");
const extension = resolve(output, "extension");
await mkdir(extension, { recursive: true });
await mkdir(resolve(extension, "icons"), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await copyFile(resolve(root, `icons/icon-${size}.png`), resolve(extension, `icons/icon-${size}.png`));
}
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
// Pre-grant ONLY the local fixture host in the test copy. The shipped manifest
// retains optional permissions. Permission denial is tested in the unit suite.
manifest.host_permissions = ["http://127.0.0.1/*"];
await writeFile(resolve(extension, "manifest.json"), JSON.stringify(manifest));
for (const file of ["site.js", "background.js", "theme.js", "content.js", "popup.html", "popup.css", "popup.js"]) {
  await copyFile(resolve(root, file), resolve(extension, file));
}
const mail = `<!doctype html><html><head><title>Test mail</title></head><body style="background:white;color:black;font:16px Arial;padding:30px">
<h1>Inbox</h1><table><tr class="zA zE"><td><strong>Unread message</strong></td></tr></table>
<article style="background:white;color:#222;padding:30px"><h2>Your project update</h2><p id="copy">A readable HTML email with <a id="link" href="#">a link</a>.</p>
<img id="photo" alt="Test colour swatch" width="80" height="50" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='50'%3E%3Cpath fill='%23ff5500' d='M0 0h80v50H0z'/%3E%3C/svg%3E">
<textarea aria-label="Reply">Compose a reply</textarea><button>Send</button></article>
<iframe title="Embedded email" src="/frame"></iframe><iframe title="Inline email" srcdoc="<p>Inline message</p>"></iframe></body></html>`;
const server = createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.end(request.url === "/frame" ? "<html><body style='background:white'><p>Frame message</p></body></html>" : mail);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let context;
const profile = resolve(output, `profile-${Date.now()}`);
const launch = () => chromium.launchPersistentContext(profile, {
  channel: "chromium", headless: true, executablePath: process.argv[3] || undefined,
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
});
try {
  context = await launch();
  context.setDefaultTimeout(15000);
  const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
  const id = new URL(worker.url()).host;
  const reader = await context.newPage();
  await reader.goto(origin);
  const tabId = await worker.evaluate(async origin => (await chrome.tabs.query({ url: `${origin}/*` }))[0].id, origin);
  const popup = await context.newPage();
  await popup.setViewportSize({ width: 344, height: 464 });
  // A popup opened as a test tab needs the mail tab selected explicitly.
  await popup.addInitScript(tabId => {
    if (location.protocol === "chrome-extension:") {
      const query = chrome.tabs.query.bind(chrome.tabs);
      chrome.tabs.query = options => options.active ? Promise.resolve([{ id: tabId }]) : query(options);
    }
  }, tabId);
  await popup.goto(`chrome-extension://${id}/popup.html`);
  popup.on("pageerror", error => console.error("Popup error:", error.message));
  const toggle = popup.getByRole("switch");
  await toggle.waitFor();
  try { await popup.waitForFunction(() => !document.querySelector("#toggle").disabled); }
  catch (error) { console.error(await popup.locator("body").innerText()); throw error; }
  assert.equal(await toggle.getAttribute("aria-checked"), "false");
  await toggle.focus();
  await popup.keyboard.press("Space");
  await popup.waitForFunction(() => document.querySelector("#toggle").getAttribute("aria-checked") === "true");
  await reader.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(20, 24, 30)");
  assert.equal(await reader.locator("#link").evaluate(el => getComputedStyle(el).color), "rgb(159, 202, 255)");
  assert.equal(await reader.locator("#photo").evaluate(el => getComputedStyle(el).filter), "none");
  await popup.screenshot({ path: resolve(output, "popup.png") });
  await reader.screenshot({ path: resolve(output, "mail-dark.png") });

  await reader.reload();
  for (const frame of reader.frames()) {
    await frame.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(20, 24, 30)");
  }
  // Existing and newly inserted message elements inherit the theme.
  await reader.evaluate(() => {
    const p = document.createElement("p"); p.id = "dynamic"; p.style.color = "black"; p.textContent = "New message"; document.body.append(p);
  });
  assert.equal(await reader.locator("#dynamic").evaluate(el => getComputedStyle(el).color), "rgb(225, 230, 237)");
  await reader.emulateMedia({ media: "print" });
  assert.equal(await reader.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(255, 255, 255)");
  await reader.emulateMedia({ media: "screen" });
  const second = await context.newPage();
  await second.goto(origin);
  await second.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(20, 24, 30)");
  await toggle.click();
  await popup.waitForFunction(() => document.querySelector("#toggle").getAttribute("aria-checked") === "false");
  for (const page of [reader, second]) {
    await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(255, 255, 255)");
    for (const frame of page.frames()) {
      assert.equal(await frame.evaluate(() => document.querySelectorAll("style").length), 0);
    }
  }
  assert.equal(await worker.evaluate(async () => (await chrome.scripting.getRegisteredContentScripts()).length), 0);
  await toggle.click();
  await popup.waitForFunction(() => document.querySelector("#toggle").getAttribute("aria-checked") === "true");
  await context.close();
  context = await launch();
  context.setDefaultTimeout(15000);
  const restored = await context.newPage();
  await restored.goto(origin);
  try { await restored.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(20, 24, 30)"); }
  catch (error) {
    const restartedWorker = context.serviceWorkers()[0];
    console.error("Restart diagnostic", restartedWorker ? await restartedWorker.evaluate(async () => ({ scripts: await chrome.scripting.getRegisteredContentScripts(), permissions: await chrome.permissions.getAll() })) : "No service worker");
    throw error;
  }
  console.log("PASS: real extension load, keyboard toggle, link contrast, preserved images, dynamic mail, reload, browser restart, same-site/srcdoc frames, printing, multi-tab disable and stylesheet removal.");
} finally {
  await context?.close();
  await new Promise(resolve => server.close(resolve));
}

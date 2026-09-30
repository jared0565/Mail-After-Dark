// Capture the real extension with fictional mail; no external mailbox access.
// node scripts/capture-store-assets.mjs <playwright-core/index.mjs> [chromium.exe]
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

if (!process.argv[2]) throw new Error("Pass the path to an existing playwright-core/index.mjs.");
const { chromium } = await import(pathToFileURL(resolve(process.argv[2])).href);
const root = resolve(import.meta.dirname, "..");
const assets = resolve(root, "distribution/store-assets");
const work = resolve(root, "output/playwright/store-capture");
const extension = resolve(work, "extension");
await mkdir(assets, { recursive: true });
await mkdir(resolve(extension, "icons"), { recursive: true });
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
const origin = "https://mail.example.test";
// Only this capture copy pre-grants the fictional, intercepted mail host.
manifest.host_permissions = [`${origin}/*`];
await writeFile(resolve(extension, "manifest.json"), JSON.stringify(manifest));
for (const file of ["background.js", "site.js", "theme.js", "content.js", "popup.html", "popup.css", "popup.js"]) {
  await copyFile(resolve(root, file), resolve(extension, file));
}
for (const size of [16, 32, 48, 128]) {
  await copyFile(resolve(root, `icons/icon-${size}.png`), resolve(extension, `icons/icon-${size}.png`));
}
await copyFile(resolve(root, "icons/icon-128.png"), resolve(assets, "store-icon-128.png"));
const sample = await readFile(resolve(root, "distribution/sample-webmail.html"), "utf8");
const context = await chromium.launchPersistentContext(resolve(work, `profile-${Date.now()}`), {
  channel: "chromium", headless: true, executablePath: process.argv[3] || undefined,
  viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
});
context.setDefaultTimeout(15000);
try {
  await context.route(`${origin}/**`, route => route.fulfill({ contentType: "text/html", body: sample }));
  const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
  const extensionId = new URL(worker.url()).host;
  const reader = await context.newPage();
  await reader.goto(origin);
  const tabId = await worker.evaluate(async pattern => (await chrome.tabs.query({ url: pattern }))[0].id, `${origin}/*`);
  const popup = await context.newPage();
  // Test tab stands in for the toolbar popup; retain the actual mail tab target.
  await popup.addInitScript(tabId => {
    if (location.protocol !== "chrome-extension:") return;
    const query = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = options => options.active ? Promise.resolve([{ id: tabId }]) : query(options);
  }, tabId);
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForFunction(() => !document.querySelector("#toggle").disabled);
  await popup.getByRole("switch").click();
  await popup.waitForFunction(() => document.querySelector("#toggle").getAttribute("aria-checked") === "true");
  await reader.waitForFunction(() => getComputedStyle(document.body).backgroundColor === "rgb(20, 24, 30)");
  assert.equal(await reader.locator(".banner").evaluate(el => getComputedStyle(el).filter), "none");
  await reader.screenshot({ path: resolve(assets, "screenshot-01-dark-reader.png") });

  // Position the unchanged, live popup UI within an explanatory store canvas.
  // The added text is presentation material, not a simulated product control.
  await popup.addStyleTag({ content: `
    body { width:1280px; height:800px; background:#10171a; }
    main { position:absolute; left:790px; top:166px; width:344px; background:#14181e; border:1px solid #40514d; border-radius:10px; box-shadow:0 24px 65px #0005; }
    .store-copy { position:absolute; left:88px; top:178px; width:585px; color:#e8ede9; }
    .store-copy .kicker { font:600 12px 'Segoe UI',sans-serif;letter-spacing:3px;color:#b5dec4; }
    .store-copy h2 { font:normal 62px/1.12 Georgia,serif;letter-spacing:-2px;margin:30px 0 24px; }
    .store-copy p { font:20px/1.7 'Segoe UI',sans-serif;color:#b5c3bf;max-width:510px; }
    .store-copy .detail { margin-top:37px;padding-top:25px;border-top:1px solid #35483f;font-size:15px; }
    .store-note { position:absolute;bottom:45px;left:88px;font:12px 'Segoe UI',sans-serif;color:#8faaa0; }
  ` });
  await popup.evaluate(() => {
    const copy = document.createElement("section");
    copy.className = "store-copy";
    copy.innerHTML = '<div class="kicker">MAIL AFTER DARK</div><h2>Your inbox.<br>Your choice.</h2><p>Turn dark mode on for your webmail.<br>Your preference stays with the website.</p><p class="detail">One simple switch · Local preferences<br>No email collection · Free to use</p>';
    document.body.append(copy);
    const note = document.createElement("div");
    note.className = "store-note";
    note.textContent = "Actual extension interface shown on a fictional demo website.";
    document.body.append(note);
  });
  await popup.screenshot({ path: resolve(assets, "screenshot-02-site-toggle.png") });

  const promo = await context.newPage();
  await promo.setViewportSize({ width: 440, height: 280 });
  const icon = (await readFile(resolve(root, "icons/icon-128.png"))).toString("base64");
  await promo.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:440px;height:280px;background:#14181e;color:#e8ede9;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;padding:30px;gap:25px}img{width:104px;height:104px}small{font-size:10px;letter-spacing:2px;color:#b5dec4}h1{font:normal 35px/1.12 Georgia,serif;letter-spacing:-1px;margin:13px 0}p{font-size:12px;color:#b5c3bf;margin:0}.line{position:absolute;bottom:29px;left:32px;width:376px;height:2px;background:#b5dec4}
    </style></head><body><img src="data:image/png;base64,${icon}" alt=""><div><small>A QUIETER INBOX</small><h1>Mail<br>After Dark</h1><p>Dark mode for webmail.</p></div><div class="line"></div></body></html>`);
  await promo.screenshot({ path: resolve(assets, "promo-small-440x280.png") });
  for (const [file, width, height] of [
    ["store-icon-128.png", 128, 128], ["screenshot-01-dark-reader.png", 1280, 800],
    ["screenshot-02-site-toggle.png", 1280, 800], ["promo-small-440x280.png", 440, 280]
  ]) {
    const png = await readFile(resolve(assets, file));
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
    console.log(`${file}: ${width} x ${height}`);
  }
} finally { await context.close(); }

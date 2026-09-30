import test from "node:test";
import assert from "node:assert/strict";
import { siteFor } from "../site.js";

const registrations = new Map();
const granted = new Set();
const preferences = {};
let listener;
let removed;
let injections = 0;
const site = siteFor("https://mail.example.org/inbox");
globalThis.chrome = {
  storage: { local: {
    get: async key => key === null ? { ...preferences } : { [key]: preferences[key] },
    set: async values => Object.assign(preferences, values),
    remove: async key => { delete preferences[key]; },
    setAccessLevel: async () => {}
  } },
  runtime: { id: "test", getURL: file => `chrome-extension://test/${file}`, onMessage: { addListener: fn => { listener = fn; } } },
  scripting: {
    getRegisteredContentScripts: async filter => [...registrations.values()].filter(r => !filter?.ids || filter.ids.includes(r.id)),
    registerContentScripts: async entries => { for (const r of entries) { assert.ok(!registrations.has(r.id)); registrations.set(r.id, r); } },
    unregisterContentScripts: async ({ ids }) => { ids.forEach(id => registrations.delete(id)); },
    executeScript: async () => { injections++; }
  },
  permissions: {
    contains: async ({ origins }) => origins.every(p => granted.has(p)),
    onRemoved: { addListener: fn => { removed = fn; } }
  },
  tabs: {
    get: async () => ({ id: 1, url: "https://mail.example.org/inbox" }),
    query: async () => [{ id: 1 }],
    sendMessage: async () => ({ ok: true })
  }
};
await import("../background.js");
const popup = { id: "test", url: "chrome-extension://test/popup.html" };
const send = (message, sender = popup) => new Promise(resolve => listener(message, sender, resolve));
const set = on => send({ type: "set-enabled", tabId: 1, pattern: site.pattern, enabled: on });

test("permission denial, idempotent concurrent enable, disable and security boundaries", async () => {
  assert.equal((await set(true)).ok, false);
  assert.equal(registrations.size, 0);
  granted.add(site.pattern);
  const results = await Promise.all([set(true), set(true)]);
  assert.ok(results.every(r => r.ok && r.enabled));
  assert.equal(registrations.size, 1);
  assert.ok(injections > 0);
  assert.equal(registrations.get(site.id).persistAcrossSessions, true);
  assert.equal(registrations.get(site.id).allFrames, true);
  const frame = { id: "test", tab: { id: 1 }, url: "https://mail.example.org/message" };
  assert.equal((await send({ type: "frame-state" }, frame)).enabled, true);
  assert.equal((await send({ type: "frame-state" }, { ...frame, url: "about:blank", origin: "https://mail.example.org" })).enabled, true);
  assert.equal((await send({ type: "set-enabled", tabId: 1, pattern: site.pattern, enabled: false }, frame)).ok, false);
  assert.equal((await send({ type: "status", tabId: 1 }, { ...popup, id: "other" })).ok, false);
  assert.equal((await send({ type: "set-enabled", tabId: 1, pattern: "https://other.org/*", enabled: true })).ok, false);
  assert.equal((await set(false)).enabled, false);
  assert.equal(registrations.size, 0);
  assert.equal((await send({ type: "frame-state" }, frame)).enabled, false);
});

test("revoked permissions disable and remove persistent registrations", async () => {
  await set(true);
  granted.clear();
  assert.equal((await send({ type: "status", tabId: 1 })).enabled, false);
  removed();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(registrations.size, 0);
});

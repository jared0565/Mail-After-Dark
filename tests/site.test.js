import test from "node:test";
import assert from "node:assert/strict";
import { siteFor } from "../site.js";

test("Gmail account paths share one preference", () => {
  assert.deepEqual(siteFor("https://mail.google.com/mail/u/0/#inbox"), siteFor("https://mail.google.com/mail/u/1/#all"));
  assert.equal(siteFor("https://mail.google.com/mail/u/0/").pattern, "https://mail.google.com/*");
});
test("host scopes do not include sibling domains and distinguish schemes", () => {
  assert.notEqual(siteFor("https://mail.example.org").id, siteFor("https://example.org").id);
  assert.notEqual(siteFor("https://mail.example.org").id, siteFor("http://mail.example.org").id);
  assert.equal(siteFor("http://localhost:8080").pattern, "http://localhost/*");
});
test("unsupported and privileged pages fail closed", () => {
  for (const url of ["chrome://extensions", "edge://settings", "file:///email.html", "data:text/html,mail", "about:blank", "https://chromewebstore.google.com/detail/test", "https://microsoftedge.microsoft.com/addons", "not a url"]) {
    assert.throws(() => siteFor(url));
  }
});
test("credentials, queries and email paths are never retained", () => {
  const site = siteFor("https://user:password@mail.example.com/inbox/private-message?secret=abc");
  assert.equal(site.pattern, "https://mail.example.com/*");
  assert.doesNotMatch(JSON.stringify(site), /password|private-message|secret|abc/);
});

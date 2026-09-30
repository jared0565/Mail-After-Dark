# Mail After Dark

A dependency-free Chrome/Edge Manifest V3 extension with a per-website dark-mode toggle for Gmail and other webmail readers. Requires Chrome/Chromium 119+ or a compatible Edge version.

## Install

For the browser's normal **Add extension** installation flow, the extension needs a published store listing. The store-upload ZIP and publication instructions are described in [distribution/PUBLISHING.md](distribution/PUBLISHING.md). It has not been submitted or published yet. The steps below are for local development installation.

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder (the folder containing `manifest.json`).
4. Pin **Mail After Dark** from the browser's Extensions menu.
5. Open Gmail or your webmail website, click the extension, and turn on **Dark mode**. Approve access to that site when the browser asks.

Your choice survives reloads and browser restarts. Click the switch again to restore the site's appearance. Preferences apply to all accounts and pages on the chosen hostname, separately for HTTP and HTTPS. Browser host permissions cover all ports on that hostname.

## Privacy and permissions

- No external services, telemetry, remote code, dependencies, or email collection.
- `activeTab` identifies the tab when you open the popup. `scripting` applies the local theme. `storage` remembers opted-in website patterns locally and recovers them after extension updates; it contains no email data and is restricted to trusted extension contexts.
- Optional HTTP/HTTPS host permissions let you opt in on arbitrary webmail hosts. No permanent site access is granted on installation.
- Turning off unregisters automatic theming and removes its stylesheet in reachable open tabs. The browser retains the site permission so future toggles do not need repeated consent. Revoke it using the extension's **Details → Site access**, or uninstall the extension. Reload existing pages after uninstalling/reloading the extension.
- Only extension popup messages can change settings. Content scripts can request only their own site's state. Page content is never evaluated as code.

## Compatibility and limits

The extension styles the webmail interface as well as messages. Gmail-specific rules distinguish unread, hovered, and selected conversations; other readers use generic accessible dark colours. It is intended for browser-based webmail, not native mail apps.

Images, videos, canvases and SVGs retain their original colours; a white background baked into an image stays white. Branded HTML emails, CSS background images, inline `!important` colours, icon sprites and closed shadow roots may need provider-specific tuning. Disable the theme if a message becomes difficult to read. Avoid combining it with another dark-mode extension or a provider's native dark theme.

Matching same-site frames and inherited-origin frames are supported. Separate-domain or sandboxed readers may remain light; visit the frame's website directly and enable it there where possible. Reload a tab if it cannot update immediately. Browser internal pages, extension stores and built-in PDF viewers cannot be themed. A brief light flash can occur before the asynchronous state check completes. Screen-only CSS preserves original print styling.

## Development and validation

Run `npm test` (Node's built-in runner; no install required). Tests cover hostname scoping, URL rejection, permission denial/revocation, duplicate requests, and message authorization.

The optional browser integration check is `node tests/browser-smoke.mjs <path-to-playwright-core/index.mjs> [path-to-chromium-executable]`. It uses an existing Playwright installation, an isolated browser profile, and a local mail fixture. Its test-only extension copy pre-grants the local fixture host; the shipped manifest does not. Screenshots and profiles go under `output/playwright/`.

Manual acceptance: enable/disable on Gmail; open an HTML email, compose box and image attachment; navigate without reloading; reload and restart the browser; verify two tabs of the same host update; deny permission; remove site access; check keyboard toggle and printing. Provider compatibility should be checked against your own mail layout before broad deployment.

API references: [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions), [dynamic content scripts](https://developer.chrome.com/docs/extensions/reference/api/scripting).

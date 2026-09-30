# Native browser installation

## Recommended: store distribution

On ordinary Windows computers, Chrome's supported native installation route is the Chrome Web Store. Self-hosted installation requires enterprise policy. Edge offers Microsoft Edge Add-ons; self-hosted Windows installations also have managed-device restrictions. A ZIP or locally signed CRX is not a general-purpose one-click installer for these browsers.

The runtime package is `Mail-After-Dark-1.0.0-store.zip`. It contains the extension at the archive root, with PNG icons and no tests, browser profiles or development scripts. This is a **store upload package**, not a directly installable download. There is no store listing or installation link yet.

### Chrome
1. Register or sign in to your Chrome Web Store developer account.
2. Create a new item and upload the store ZIP.
3. Use STORE-LISTING.md for listing text and permission explanations. Provide your real publisher/support details.
4. Host PRIVACY.md at a public HTTPS URL under your control and add that URL to the listing. Review the policy against your publisher practices before submission.
5. Supply the required screenshot and promotional artwork; follow the current store specifications.
6. Choose **Unlisted** for installation through a shared link without search visibility, or choose Public if desired. Unlisted is not an access-control mechanism: anyone with the link can access it.
7. Complete disclosures and submit for review. After approval and publication, users install via the normal **Add to Chrome** confirmation. Developer mode is unnecessary for store installs.

### Edge
Submit the same ZIP in Microsoft Partner Center's Edge extension workflow, supply the required listing assets and disclosures, and complete store review. Publication provides the normal Edge Add-ons installation flow.

## Managed deployment

An organization can instead arrange signed CRX distribution with an HTTPS update manifest and browser management policies. This needs the organization's managed-device setup, hosting destination, and signing-key custody. No signing keys, registry changes or forced-install policies are created by this project.

## Rebuild

From PowerShell 7 on Windows, run `./scripts/build-icons.ps1` if regenerating icons, then `./scripts/package.ps1`. The package script checks that the manifest is at the ZIP root and lists included files. These scripts do not change the system execution policy.

## Official references

- [Chrome distribution restrictions](https://developer.chrome.com/docs/extensions/how-to/distribute)
- [Chrome publishing workflow](https://developer.chrome.com/docs/webstore/publish)
- [Chrome visibility options](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)
- [Chrome image requirements](https://developer.chrome.com/docs/webstore/images)
- [Edge publishing workflow](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)
- [Edge self-hosting requirements](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-manage-extensions-webstore)

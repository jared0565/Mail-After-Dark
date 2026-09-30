# Chrome Web Store form answers — version 1.0.0

## Single purpose
Provide a user-controlled dark visual theme for Gmail and other browser-based email readers, with an on/off preference remembered separately for each website.

## activeTab justification
When the user opens the extension popup, activeTab allows the extension to identify the current tab's website and display its dark-mode setting. This lets the user enable or disable the theme for that website. The extension does not extract email contents or credentials.

## scripting justification
The scripting permission runs bundled theme and content scripts on websites the user has explicitly approved. It applies or removes the dark appearance in open tabs and registers the bundled scripts to restore that appearance on future visits, including matching embedded email frames. No remotely hosted scripts are executed.

## storage justification
The storage permission saves enabled website patterns locally so the user's dark-mode choices survive reloads and browser restarts. Stored patterns contain the website scheme and hostname, not email contents, message paths or credentials. The settings are not synced or transmitted externally and are removed for a website when dark mode is disabled.

## Remote code
Select: No, I am not using remote code.

If an explanation field remains visible:
All executable JavaScript and theme styles are bundled in the extension package. The extension does not download or execute remote scripts, use remotely hosted libraries, or evaluate code received from external services.

## Optional host permission justification, if requested
Optional HTTP and HTTPS host access supports Gmail and user-selected webmail providers, including private or custom domains. Access is requested for a specific website only when the user enables dark mode there. It is used solely to apply the local visual theme and restore that website's saved setting.

## Data usage
Disclose Web history (or the corresponding category for domains/URLs). Tab and frame URLs are handled locally to determine the website, and opted-in website patterns are retained locally for the visible per-site setting. No data is sent externally. The extension does not extract message contents, credentials, payment details or personal communications. Do not declare that no user data is handled merely because there are no network requests: Google's disclosure rules cover local handling too.

Review and check the required certifications covering no sale or prohibited third-party transfer, no unrelated use or transfer, and no use for creditworthiness or lending. These statements match the current implementation; the publisher must personally attest to them.

Host the text in PRIVACY.md at a public HTTPS URL under the publisher's control and enter that URL in the privacy-policy field.

## Listing
Language: English, using the applicable English variant shown by the dashboard.

Category: Accessibility.

Icon and screenshots: see store-assets/UPLOAD-GUIDE.md. Upload each PNG in its corresponding dashboard field, even though the runtime ZIP already includes icons.

Detailed description: see STORE-LISTING.md, Detailed description section.

## Contact email
In the publisher's Settings/Account page, enter a monitored contact email, save it, request verification and follow the link sent to that inbox. Return to the dashboard and confirm it is verified. This is separate from entering an email in the listing text.

Save Draft after completing the listing and privacy forms, then recheck the publication blockers.

Sources: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy and https://developer.chrome.com/docs/webstore/program-policies/user-data-faq

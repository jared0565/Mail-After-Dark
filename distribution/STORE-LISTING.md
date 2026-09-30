# Store listing draft

## Name
Mail After Dark

## Short description
A private, per-site dark-mode toggle for Gmail and other webmail readers.

## Detailed description
Give your inbox a darker appearance with a simple switch.

Mail After Dark applies a local dark theme to Gmail and other browser-based email readers. Enable it on your webmail website and your choice is remembered across visits and browser restarts. Turn it off to return to the website's original appearance.

- One toggle per website.
- Website access requested only when you enable the theme.
- Photos and videos keep their original colours.
- Local settings, without email collection or analytics.
- Keyboard-accessible controls.
- Original email styling when printing.

The theme changes the mail interface as well as message backgrounds and text. Some branded emails, image backgrounds, or separately hosted embedded readers may remain light or need adjustments. It does not theme native desktop mail apps or browser PDF viewers. Avoid combining it with another dark-mode extension.

Independent extension; not affiliated with Google or Microsoft.

## Single purpose
Provide a user-controlled, per-website dark visual theme for browser-based email reading.

## Permission justifications
- activeTab: identify the website in the tab where the user opens the extension popup.
- scripting: apply and remove bundled theme scripts in user-approved websites and matching email frames.
- storage: remember enabled website patterns locally and recover theme registrations after browser restarts and updates. Email data is not stored.
- Optional HTTP/HTTPS host access: support user-selected webmail hosts, including private/custom domains. Access is requested per hostname when the user enables the theme; it is not granted to every website on installation.

## Data declarations to verify at submission
The implementation uses no remote code and transmits no user data externally. It does access tab/frame URLs locally and store enabled website patterns. Disclose this limited local handling under Web history (or the corresponding browsing-activity category), consistent with Google's User Data FAQ. It does not extract email contents or credentials. Link to the hosted privacy statement. The publisher must review and attest to the store's current disclosures.

## Reviewer instructions
No account is needed to test the generic theme. Open an ordinary HTTPS page, click the toolbar extension, enable dark mode and accept site access. Verify the page darkens, reload retains the theme, and disabling restores the original appearance. Gmail-specific checks require a reviewer-controlled Gmail account; do not provide personal credentials.

## Assets and publisher information
- Packaged icon: icons/icon-128.png. Edge logo candidate: icons/icon-300.png.
- Upload the two screenshots in store-assets/: the actual theme applied to fictional webmail and the actual extension popup on that demo website, with explanatory text.
- Upload store-assets/promo-small-440x280.png as the small promotional image. See store-assets/UPLOAD-GUIDE.md for the complete image-to-field mapping.
- Supply the actual publisher identity, contact details, support destination and hosted privacy-policy URL. These are not invented in this draft.

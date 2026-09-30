# Store image uploads

| Dashboard field | File | Dimensions |
| --- | --- | --- |
| Store icon | store-icon-128.png | 128 × 128 |
| Screenshots (first) | screenshot-01-dark-reader.png | 1280 × 800 |
| Screenshots (second) | screenshot-02-site-toggle.png | 1280 × 800 |
| Small promotional tile | promo-small-440x280.png | 440 × 280 |

Upload each PNG to its corresponding field, not the image ZIP itself.

The reader screenshot shows the actual extension theme applied to a fictional sample webmail page, clearly labelled as demo content. The toggle screenshot shows the actual running extension popup with explanatory text around it. Neither screenshot contains private messages or claims to be a live Gmail screenshot.

These are separate listing assets. The extension runtime/upload ZIP does not need to change to use them.

Regenerate with an existing Playwright installation:

`node scripts/capture-store-assets.mjs <path-to-playwright-core/index.mjs> [path-to-chromium]`

[Google's image specifications](https://developer.chrome.com/docs/webstore/images)

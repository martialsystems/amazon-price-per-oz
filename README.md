# Unit Price Sort for Amazon Search

Chrome extension from Martial Systems LLC. On an Amazon search page, Sort Now ranks listings by price per unit.

| Field | Detail |
|-------|--------|
| Publisher | Martial Systems LLC |
| Support | martialsys@gmail.com |
| Web | https://martialsys.net/ |
| Version | 2.3.4 |
| Privacy | [Privacy Policy](https://martialsystems.github.io/amazon-price-per-oz/privacy.html) |
| Terms | [Terms of Use](https://martialsystems.github.io/amazon-price-per-oz/terms.html) |
| License | Proprietary. See [LICENSE](LICENSE) and [Terms of Use](docs/TERMS_OF_USE.md). |

Amazon is a trademark of Amazon.com, Inc. or its affiliates. This product is not affiliated with, endorsed by, or sponsored by Amazon.

## Install

From a release:

1. Download the zip from the [latest release](https://github.com/martialsystems/amazon-price-per-oz/releases/latest).
2. Unzip it.
3. Open `chrome://extensions` and turn Developer mode on.
4. Choose **Load unpacked** and select the folder that contains `manifest.json`.

Load this repository folder the same way.

## Use

1. Pin the extension on the Chrome toolbar.
2. Open an Amazon search. Grocery and bulk listings are the pages that usually show a unit price.
3. Click **Sort Now** on the panel.
4. Read the badges, for example `#1 · $0.12/oz`.

Sort Now ranks a listing when Amazon shows a unit price, or when the title states a package size in ounces, fluid ounces, count, or sheets. Toilet paper ranks by price per sheet. A listing with no unit size, such as one coffee maker, stays in Amazon's order. For those results, use Amazon's **Sort by: Price · Low to High**.

### Controls

| Action | Result |
|--------|--------|
| Overlay **Disable** | Hides the panel and the badges. The toolbar shows **OFF**. |
| Click the pinned icon | Turns the overlay on or off on open Amazon tabs. |
| Icon badge **OFF** | The extension stays off until the next click. |
| Right-click the icon, then **Keep Alexa off** | Hides Amazon's on-page shopping assistant. The product page layout stays in place. The choice is saved. |
| Right-click the icon, then **Donate (Ko-fi)** | Opens https://ko-fi.com/martialgames. |

Unit-sort on/off lasts for the browser session. Keep Alexa off is one saved preference. The extension does not keep a shopping history.

## Privacy

- Listing text is read in the browser so the page can be ranked. It is not sent to Martial Systems LLC.
- The extension does not include an advertising or analytics SDK.
- Host access is limited to the Amazon domains named in `manifest.json`.
- The only saved preference is Keep Alexa off.

## Development

```bash
node tests/test_parse.js
node tests/test_copyright.js
./scripts/package_chrome_store.sh
./scripts/publish_github_release.sh
```

`package_chrome_store.sh` writes `dist/unit-price-sort-chrome.zip`. Store listing copy and the upload checklist are in [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md).

Copyright © 2026 Martial Systems LLC. All rights reserved.

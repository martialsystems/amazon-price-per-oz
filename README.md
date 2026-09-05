# Unit Price Sort for Amazon Search

**Martial Systems LLC** product: Chrome extension that ranks Amazon **search results** by **price per unit**.

| | |
|--|--|
| **Publisher** | Martial Systems LLC |
| **Support** | martialsys@gmail.com |
| **Web** | https://martialsys.net/ |
| **Version** | 2.3.1 |
| **License** | Proprietary: see [LICENSE](LICENSE) and [Terms](docs/TERMS_OF_USE.md) |

Not affiliated with Amazon.com, Inc.

## How to use (local / unpacked)

1. Load unpacked from this folder (`chrome://extensions` → Developer mode)
2. **Pin** the extension on the Chrome toolbar
3. Open an Amazon search (groceries work best)
4. Click **Sort Now** on the teal panel
5. Read badges like `#1 · $0.12/oz`

**When it helps:** Sort Now only ranks listings that have a real unit price (Amazon’s $/oz line, or a package size in the title). Listings without one are skipped. For single items that are effectively quantity 1 (a coffee maker, a lamp, etc.), use Amazon’s own **Sort by: Price · Low to High** instead.

### Enable / disable

| Action | Result |
|--------|--------|
| Overlay **Disable** | Hides panel + badges; toolbar shows **OFF** |
| **Click pinned icon** | Toggles ON/OFF on all open Amazon tabs |
| Icon badge **OFF** | Extension is disabled until you click again |
| **Right-click** icon → **Keep Alexa off** | Checkbox: hide Alexa-for-Shopping UI (persists until unchecked) |
| **Right-click** icon → **Donate (Ko-fi)** | Opens https://ko-fi.com/martialgames |

Unit-sort ON/OFF is in-memory for the browser session only. **Keep Alexa off** is a single boolean preference (not shopping data).

## Publish (Releases only)

Public GitHub is a landing page. Source stays on the private `src` remote.

```bash
./scripts/install_dev_hooks.sh
./scripts/push_private_source.sh
./scripts/publish_public_landing.sh
./scripts/publish_github_release.sh
```

Details: [docs/DEV_REMOTES.md](docs/DEV_REMOTES.md).

## Chrome Web Store upload

Full paste kit + checklist: **[docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md)**

```bash
./scripts/package_chrome_store.sh
# → dist/unit-price-sort-chrome.zip  (and versioned copy)
```

Upload that zip in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

**Hosted legal (for Store Console):**

- Privacy: https://martialsystems.github.io/amazon-price-per-oz/privacy.html  
- Terms: https://martialsystems.github.io/amazon-price-per-oz/terms.html  

Markdown originals: [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md), [docs/TERMS_OF_USE.md](docs/TERMS_OF_USE.md).

## Privacy (summary)

- No shopping data sent to Martial Systems LLC
- No ads / analytics SDKs
- Host access only to listed Amazon domains
- Optional local preference: Keep Alexa off (boolean only)

## Design

| Choice | Why |
|--------|-----|
| Manual **Sort Now** | No auto DOM thrash; wait until results are ready |
| Strict search tiles only | `[data-component-type="s-search-result"][data-asin]` |
| Nested cards dropped | Avoids HierarchyRequestError |
| Sibling `appendChild` only | Cheap reorder; badges still apply if move fails |
| Amazon unit price first | `($0.82 / fluid ounce)`, etc. |
| Title size fallback | When Amazon omits unit price |

## Files

```
manifest.json          # MV3 product manifest
src/                   # background + content script/CSS
icons/                 # 16 / 48 / 128
store/                 # Hostable privacy.html + terms.html
docs/                  # Legal + Store kit (Markdown)
scripts/package_chrome_store.sh
LICENSE
README.md
```

© 2026 Martial Systems LLC. All rights reserved.

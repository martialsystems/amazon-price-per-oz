# Amazon Unit Price Sort

Chrome extension that ranks Amazon **search results** by **price per unit**.

## How to use

1. Load unpacked from this folder (`chrome://extensions` → Developer mode)
2. **Pin** the extension on the Chrome toolbar
3. Open an Amazon search (groceries work best)
4. Click **Sort Now** on the teal panel
5. Read badges like `#1 · $0.12/oz`

### Enable / disable

| Action | Result |
|--------|--------|
| Overlay **Disable** | Hides panel + badges; toolbar shows **OFF** |
| **Click pinned icon** | Toggles ON/OFF on all open Amazon tabs |
| Icon badge **OFF** | Extension is disabled until you click again |
| **Right-click** icon → **Keep Alexa off** | Checkbox: hide Alexa-for-Shopping popup/sidebar (stays until you uncheck) |
| **Right-click** icon → **Donate (Ko-fi)** | Opens https://ko-fi.com/martialgames |

Unit-sort ON/OFF is in-memory for the browser session only. **Keep Alexa off** is a single boolean preference (not shopping data).

## Design (v2 — efficient)

| Choice | Why |
|--------|-----|
| Manual **Sort Now** | No MutationObserver sort loops; wait until results are ready |
| Strict search tiles only | `[data-component-type="s-search-result"][data-asin]` |
| Nested cards dropped | Avoids HierarchyRequestError |
| Sibling `appendChild` only | Cheap reorder; try/catch; badges still apply if move fails |
| Amazon unit price first | `($0.82 / fluid ounce)`, `($133.29 / 100 Sheets)` |
| Title size fallback | When Amazon omits unit price |
| No storage / no network | Privacy |

## Privacy

- No `storage` permission
- No `localStorage` / `chrome.storage`
- No analytics or remote calls

## Privacy / Store

**Martial Systems LLC** · martialsys@gmail.com · https://martialsys.net/

- [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) — short policy (host as HTTPS URL for Chrome Web Store)
- [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) — minimal listing paste text

## Files

```
manifest.json
src/background.js
src/content.js
src/content.css
icons/
docs/
README.md
```


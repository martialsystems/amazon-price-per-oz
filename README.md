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

State is in-memory for the browser session only (not written as shopping data).

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

## Legal / Chrome Web Store

**Publisher:** Martial Systems LLC · **Support:** martialsys@gmail.com · **Site:** https://martialsys.net/  
**Docs effective:** August 4, 2026 · **Governing law:** Indiana, USA

| Doc | Purpose |
|-----|---------|
| [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) | Privacy policy — host as public HTTPS URL for the Store |
| [docs/TERMS_OF_USE.md](docs/TERMS_OF_USE.md) | Terms, disclaimers, liability limits |
| [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) | Listing copy, data-safety answers, upload checklist |

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


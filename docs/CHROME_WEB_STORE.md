# Chrome Web Store: Martial Systems LLC product kit

**Product:** Unit Price Sort for Amazon Search  
**Publisher:** Martial Systems LLC  
**Version:** 2.4.0  
**Support email:** martialsys@gmail.com  
**Homepage:** https://martialsys.net/  
**Source package:** run `scripts/package_chrome_store.sh` → `dist/unit-price-sort-chrome.zip`

---

## Before you click Publish

1. **Chrome Web Store developer account** registered (one-time fee).
2. Publisher / trader name: **Martial Systems LLC**.
3. Support email that receives mail: **martialsys@gmail.com**.
4. **Host Privacy + Terms over HTTPS** (Store requires a privacy policy URL).

### Host legal pages (HTTPS)

| Option | URLs |
|--------|------|
| **GitHub Pages (ready)** | Privacy: `https://martialsystems.github.io/amazon-price-per-oz/privacy.html` · Terms: `https://martialsystems.github.io/amazon-price-per-oz/terms.html` |
| **Your site (preferred long-term)** | Upload `store/privacy.html` + `store/terms.html` (or `docs/*.html`) to martialsys.net |

Paste the HTTPS privacy URL into the Store Console (required). Terms optional but recommended.

Also in-repo Markdown: `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`.

---

## 1. Upload package

```bash
cd /path/to/amazon-price-per-oz
./scripts/package_chrome_store.sh
# → dist/unit-price-sort-chrome.zip
```

In [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):

1. **New item** → upload the zip  
2. Fill listing fields below  
3. Privacy practices (section 3)  
4. Submit for review  

**Zip contents (runtime only):** `manifest.json`, `src/`, `icons/`. The zip does not include `.git`, docs, or node_modules.

---

## 2. Store listing copy (paste)

### Name (max 75)

```
Unit Price Sort for Amazon Search
```

### Short description (max 132)

```
Sort Amazon search by price per unit. Click Sort Now. No shopping data sold.
```

### Detailed description

```
Unit Price Sort helps you compare Amazon search listings by price per unit (for example, per ounce or per count).

A product of Martial Systems LLC.

HOW TO USE
1. Install and pin the extension.
2. Open an Amazon search results page (groceries and bulk items work best).
3. Click “Sort Now” on the on-page panel.
4. See ranked badges such as “#1 · $0.12/oz”.
5. Click the toolbar icon anytime to show or hide the overlay (badge shows OFF when disabled).
6. Right-click the icon → “Donate (Ko-fi)” if you want to support development.

WHAT IT DOES
• Reads unit prices Amazon already shows (e.g. “$0.82 / fluid ounce”), when available
• Otherwise estimates unit price from package size in the title when possible
• Ranks results and labels them so cheaper unit prices are easier to spot
• Optionally reorders sibling result cards in your browser view

PRIVACY
• Does not sell your data
• Does not use advertising analytics SDKs
• Does not send your shopping activity to a developer backend
• Does not request broad “all websites” access. Host access is limited to the listed Amazon domains
• Does not write extension storage. No product or search history is saved.

IMPORTANT DISCLAIMERS
• Not affiliated with Amazon.com, Inc. or its affiliates.
• Unit prices can be wrong or incomplete. Always verify on the product page before you buy.
• Amazon page changes may temporarily break sorting until the extension is updated.

Developer: Martial Systems LLC
Support: martialsys@gmail.com
Web: https://martialsys.net/
Privacy Policy: https://martialsystems.github.io/amazon-price-per-oz/privacy.html
Terms of Use: https://martialsystems.github.io/amazon-price-per-oz/terms.html
```

### Category

**Shopping**

### Language

English (United States)

### Official URL (homepage)

```
https://martialsys.net/
```

---

## 3. Privacy practices / data safety (match the code)

| Console question | Answer |
|------------------|--------|
| Collects user data? | **No** personal shopping data to developer servers. The extension does not write extension storage. |
| Personally identifiable information | **No** |
| Health / financial / auth | **No** |
| Web history | **No** (Amazon pages only; not sent to us) |
| User activity | **No** (not uploaded) |
| Website content | Processed **locally** only to rank unit prices; **not** transmitted to developer |
| Used for ads / sale of data | **No** |
| Remote code | **No** |

**If asked about local storage / preferences:**  
The extension does not write extension storage. No product IDs, prices, or queries are stored. Versions before 2.4.0 saved one on/off preference. This version does not read it.

### Host permission justification

```
Required to read product titles, prices, and unit-price text already shown on Amazon search pages, and to display ranking badges and optionally reorder result cards in the user’s tab. No shopping data is sent to Martial Systems LLC.
```

### `contextMenus` permission justification

```
Provides the extension icon menu item Donate, which opens the support link.
```

### Single purpose

```
The extension’s single purpose is to help users compare unit prices on Amazon search result pages by ranking and labeling listings by price per unit.
```

---

## 4. Assets checklist

| Asset | Status / notes |
|-------|----------------|
| Icon 16 / 48 / 128 | `icons/` present |
| Screenshots (1280×800 or 640×400) | **You capture** on a grocery search with Sort Now badges + overlay |
| Optional promo 440×280 | Optional |
| Small promo tile 440×280 | Optional |
| Marquee 1400×560 | Optional |

Capture tips: pin extension, search something like “olive oil 1 liter”, Sort Now, crop clean UI, no personal account email in shot.

---

## 5. Contact block

| Field | Value |
|-------|--------|
| Developer | Martial Systems LLC |
| Email | martialsys@gmail.com |
| Homepage | https://martialsys.net/ |
| Jurisdiction | Indiana, United States |

Confirm **Active** status on [INBiz Business Search](https://bsd.sos.in.gov/publicbusinesssearch) before payout/tax forms if Google asks for business verification. Use the registered agent address on tax forms when a form requires it. The public privacy page does not include that address.

---

## 6. Pre-submit test plan

- [ ] Fresh profile install from zip  
- [ ] Grocery search → Sort Now → sensible badges  
- [ ] Sparse unit prices → status text, no crash  
- [ ] Toolbar OFF / ON  
- [ ] Overlay Disable = toolbar OFF  
- [ ] Drag overlay title  
- [ ] Donate opens Ko-fi  
- [ ] Non-Amazon site → no overlay  
- [ ] No uncaught extension errors on a normal search  

---

## 7. Versioning

Bump `manifest.json` `version` before each Store upload (Chrome rejects reusing the same version on an existing item).

---

## 8. Trademark note

Amazon is a trademark of Amazon.com, Inc. or its affiliates. Listing copy states non-affiliation. Do not use Amazon logos in Store creatives unless you have rights.

Copyright © 2026 Martial Systems LLC. All rights reserved.

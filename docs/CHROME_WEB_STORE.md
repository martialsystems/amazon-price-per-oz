# Chrome Web Store — listing & compliance kit

Fill bracketed fields before upload. Host **Privacy Policy** and **Terms** at public HTTPS URLs (GitHub Pages, your site, etc.) and paste those URLs into the Store Console.

**Not legal advice.** Confirm current Chrome Web Store Program Policies before submission.

---

## 1. Developer account checklist

- [ ] Pay one-time Chrome Web Store developer registration fee  
- [ ] Verify developer email / 2FA  
- [ ] Decide publisher name (personal or company)  
- [ ] Host Privacy Policy URL (required for many listings; strongly recommended even with no collection)  
- [ ] Optional: Terms of Use URL  
- [ ] Prepare 128×128 icon (you have `icons/icon128.png`)  
- [ ] Prepare screenshots (1280×800 or 640×400): search page + overlay + badges  
- [ ] Optional: small promo tile 440×280  

---

## 2. Suggested Store listing copy

### Name (max 75 characters)

```
Unit Price Sort for Amazon Search
```

*(Avoid leading with “Amazon” alone if trademark review is a concern; descriptive “for Amazon Search” is common for compatibility.)*

### Short description (max 132 characters)

```
Sort Amazon search results by price per unit. Click Sort Now. No shopping data collected or sold.
```

### Detailed description

```
Unit Price Sort helps you compare Amazon search listings by price per unit (for example, per ounce or per count).

HOW TO USE
1. Install and pin the extension.
2. Open an Amazon search results page (groceries and bulk items work best).
3. Click “Sort Now” on the on-page panel.
4. See ranked badges such as “#1 · $0.12/oz”.
5. Click the toolbar icon anytime to show or hide the overlay (badge shows OFF when disabled).

WHAT IT DOES
• Reads unit prices Amazon already shows (e.g. “$0.82 / fluid ounce”), when available
• Otherwise estimates unit price from package size in the title when possible
• Ranks results and labels them so cheaper unit prices are easier to spot
• Optionally reorders sibling result cards in your browser view

PRIVACY
• Does not sell your data
• Does not use advertising analytics SDKs
• Does not send your shopping activity to a developer backend
• Does not request broad “all websites” access—only listed Amazon domains
• Enable/disable state is kept only as temporary session UI state in the browser

IMPORTANT DISCLAIMERS
• Not affiliated with Amazon.
• Unit prices can be wrong or incomplete—always verify on the product page before you buy.
• Amazon page changes may temporarily break sorting until the extension is updated.

Support: [YOUR EMAIL]
Privacy Policy: [HTTPS URL TO PRIVACY_POLICY]
```

### Category

**Shopping** (or Productivity)

### Language

English (United States) — add locales later if needed.

---

## 3. Privacy practices (Store “Data safety” / declarations)

Answer consistently with the real code:

| Store question (paraphrased) | Suggested answer |
|------------------------------|------------------|
| Does the extension collect user data? | **No** (no remote collection). If the form forces categories, state only that data is processed **ephemerally on-device** and not transmitted. |
| Data used for ads? | **No** |
| Data sold? | **No** |
| Data shared with third parties? | **No** (except as inherent to visiting Amazon/Google) |
| Encryption in transit? | N/A if no developer transmission; do not claim collection + encryption |
| Can users request deletion? | N/A for shopping datasets; support email for correspondence |

**Permissions justification (Console text boxes):**

**Host permissions (Amazon domains only):**  
“Required to read product titles, prices, and unit-price text already shown on Amazon search pages and to display ranking badges / optionally reorder result cards in the user’s tab. No data is sent to the developer.”

**No `storage` permission:**  
Do not claim chrome.storage if unused.

**Service worker / action:**  
“Used so the toolbar icon can enable or disable the on-page overlay without collecting browsing history.”

---

## 4. Single purpose statement

```
The extension’s single purpose is to help users compare unit prices on Amazon search result pages by ranking and labeling listings by price per unit.
```

---

## 5. Remote code / networking attestation

- Extension does **not** load remote code.  
- Extension does **not** call developer APIs.  
- Content scripts are packaged with the extension.

If the Store asks about remote code: **No.**

---

## 6. Trademark / branding notes (practical)

- Prefer Store name like **“Unit Price Sort for Amazon Search”** rather than implying official Amazon status.  
- In screenshots, avoid Amazon logos as your brand mark; showing the Amazon page UI in context of the feature is usually OK as a functional screenshot—follow current Google policies.  
- Description must say **not affiliated with Amazon**.

Amazon’s brand guidelines are separate; when in doubt, use generic wording (“supported shopping sites including Amazon search pages”).

---

## 7. Support & distribution

| Field | Value |
|-------|--------|
| Support email | [YOUR EMAIL] — must work |
| Homepage | optional GitHub repo or site |
| Marketing URL | optional |

---

## 8. Pre-submit test plan (do this)

- [ ] Fresh Chrome profile, install from package  
- [ ] Grocery search with unit prices → Sort Now → badges sensible  
- [ ] Search with few unit prices → status message, no crash  
- [ ] Toolbar toggle OFF → overlay gone; ON → returns  
- [ ] Overlay Disable matches toolbar OFF  
- [ ] Drag overlay title  
- [ ] Non-Amazon site → no overlay  
- [ ] Product detail page → no harmful breakage  
- [ ] Console free of uncaught extension errors on a normal search  

---

## 9. Package for upload

```bash
# From the extension root — exclude .git if you zip by hand
zip -r unit-price-sort.zip manifest.json src icons README.md -x "*.DS_Store"
```

Or use Chrome “Pack extension” only if you manage keys carefully (Store upload usually wants a zip of the unpacked directory).

Upload the zip in Chrome Web Store Developer Dashboard → New item / new package.

---

## 10. After publishing

- Monitor support email  
- When Amazon breaks selectors, ship a version bump quickly  
- Keep Privacy Policy URL live forever (or update Store if moved)  
- Increment `manifest.json` version on every upload  

---

## 11. Documents to publish on the web

| File in repo | Publish as |
|--------------|------------|
| `docs/PRIVACY_POLICY.md` | `https://[yoursite]/privacy` (HTML or rendered Markdown) |
| `docs/TERMS_OF_USE.md` | `https://[yoursite]/terms` |
| This file | Keep private or in repo; not required on the web |

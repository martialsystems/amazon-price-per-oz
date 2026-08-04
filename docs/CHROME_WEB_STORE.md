# Chrome Web Store — listing & compliance kit

**Publisher:** Martial Systems LLC  
**Support email:** martialsys@gmail.com  
**Site:** https://martialsys.net/  
**Docs effective:** August 4, 2026  

Host **Privacy Policy** and **Terms** at public HTTPS URLs and paste them into the Store Console.

Suggested public URLs (after you publish the Markdown or HTML):

- Privacy: `https://martialsys.net/privacy` *(or GitHub Pages / raw rendered page)*  
- Terms: `https://martialsys.net/terms`

---

## 1. Developer account checklist

- [ ] Chrome Web Store developer registration (one-time fee)
- [ ] Publisher display name: **Martial Systems LLC**
- [ ] Support email: **martialsys@gmail.com** (must receive mail)
- [ ] Host Privacy Policy URL
- [ ] Optional: Terms of Use URL
- [ ] Icon 128×128 (`icons/icon128.png`)
- [ ] Screenshots: search + overlay + badges
- [ ] Optional promo tile 440×280

---

## 2. Store listing copy (ready to paste)

### Name

```
Unit Price Sort for Amazon Search
```

### Short description

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
• Enable/disable state is temporary session UI state in the browser only

IMPORTANT DISCLAIMERS
• Not affiliated with Amazon.com, Inc. or its affiliates.
• Unit prices can be wrong or incomplete—always verify on the product page before you buy.
• Amazon page changes may temporarily break sorting until the extension is updated.

Developer: Martial Systems LLC
Support: martialsys@gmail.com
Web: https://martialsys.net/
Privacy Policy: [PASTE YOUR HOSTED PRIVACY URL]
Terms of Use: [PASTE YOUR HOSTED TERMS URL]
```

### Category

**Shopping**

### Language

English (United States)

---

## 3. Privacy practices / data safety (match the code)

| Topic | Answer |
|-------|--------|
| Collect user data to developer servers? | **No** |
| Used for ads? | **No** |
| Sold? | **No** |
| Shared with third parties for ads? | **No** |
| Remote code? | **No** |

**Host permissions justification:**

> Required to read product titles, prices, and unit-price text already shown on Amazon search pages and to display ranking badges and optionally reorder result cards in the user’s tab. No shopping data is sent to Martial Systems LLC.

**Toolbar / service worker:**

> Used so the toolbar icon can enable or disable the on-page overlay. No browsing history is uploaded.

---

## 4. Single purpose

```
The extension’s single purpose is to help users compare unit prices on Amazon search result pages by ranking and labeling listings by price per unit.
```

---

## 5. Contact block (Store + support)

| Field | Value |
|-------|--------|
| Developer | Martial Systems LLC |
| Email | martialsys@gmail.com |
| Homepage | https://martialsys.net/ |
| Jurisdiction | Indiana, United States |

---

## 6. Pre-submit test plan

- [ ] Fresh profile install
- [ ] Grocery search → Sort Now → sensible badges
- [ ] Sparse unit prices → status text, no crash
- [ ] Toolbar OFF / ON
- [ ] Overlay Disable = toolbar OFF
- [ ] Drag overlay title
- [ ] Non-Amazon site → no overlay
- [ ] No uncaught extension errors on a normal search

---

## 7. Package

```bash
cd /path/to/amazon-price-per-oz
zip -r unit-price-sort.zip manifest.json src icons README.md -x "*.DS_Store" -x "**/.git/**"
```

---

## 8. Verification notes (filled for this release)

| Item | Status |
|------|--------|
| Legal name | **Martial Systems LLC** (as provided by developer) |
| Public email | **martialsys@gmail.com** — matches contact on https://martialsys.net/ |
| Site | **https://martialsys.net/** — company / research site lists Martial Systems LLC and same email |
| Effective date | **August 4, 2026** |
| Governing law | **Indiana, USA** |
| Indiana SOS business search | Not independently confirmed in this workspace (INBiz requires interactive search). Confirm “Active” status on [INBiz Business Search](https://bsd.sos.in.gov/publicbusinesssearch) before Store payout / tax forms if required. |
| Street address | Not published on martialsys.net; email-only contact is acceptable for privacy policy. Use your registered agent address on IRS/Chrome developer tax forms if Google asks—not required on the public policy page. |

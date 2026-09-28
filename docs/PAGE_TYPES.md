# Amazon page types (getCards)

`getCards()` selects search tiles only:

`[data-component-type="s-search-result"][data-asin]`

Visible tiles with ASIN length ≥ 5. Nested tiles (ATC faceouts inside another tile) are dropped.

There is no browse/deals/bestsellers card strategy.

## Supported (search tiles)

| Type | URL pattern | Card DOM | Notes |
|------|-------------|----------|--------|
| **Search results** | `/s?k=…`, `/s?…` | `[data-component-type="s-search-result"][data-asin]` | Primary target. Unit prices like `($0.82 /  fluid ounce)`. |
| **Department search** | `/s?k=…&rh=n:…` | Same selector | Same widget as organic search, only if those tiles exist. |
| **Grocery search** | `/s?k=…&i=grocery` | Same selector | Best unit-price coverage. |

`isSearchPage()` is a URL/DOM hint (`/s`, `?k=`, or an `s-search-result` / `.s-main-slot` node). Sort still runs only on `getCards()` tiles.

## Not supported

| Type | URL pattern | Why |
|------|-------------|-----|
| **Browse / storefront** | `/b?node=…` | No `s-search-result[data-asin]` tiles. `getCards()` returns empty. |
| **Today’s Deals** | `/gp/goldbox`, deals | Same: not search tiles. |
| **Best Sellers** | `/Best-Sellers/zgbs`, `/zgbs/…` | Same: ranked lists are not search tiles. |
| **Product detail** | `/dp/ASIN`, `/gp/product/` | Single item; nothing to sort. |
| **Home / gateway** | `/` | No listing to sort. |
| **Random pages with product links** | anything else | No `/dp/` climb, no `.dcl-product`, no `#gridItemRoot`. |

## Failure mode that was fixed

On `/b?node=…` (e.g. OTC disco), there are **hundreds of `/dp/` links** and **zero** `s-search-result` nodes.
Old fallback treated random ancestors of those links as “cards” and reordered them.

**Rule:** only `s-search-result[data-asin]` tiles. Empty card list means no sort.

## Unit-price string formats observed

- `($0.82 /  fluid ounce)`: spaces around `/`
- `($5.13 /  ounce)`
- `($133.29 / 100 Sheets)`: quantity in the unit side (toilet paper)
- `$0.38 $0.38 /100 Sheets`: search-tile `a-offscreen` often repeats the price
- `($7.75/count)`: compact form

Copyright © 2026 Martial Systems LLC. All rights reserved.

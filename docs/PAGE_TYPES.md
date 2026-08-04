# Amazon page types (probed 2026-08)

Offline HTML samples were fetched from live Amazon.com to classify layouts.
Bot-stripped pages may lack prices; structure signals still hold in a real browser.

## Supported (full sort + badges)

| Type | URL pattern | Card DOM | Notes |
|------|-------------|----------|--------|
| **Search results** | `/s?k=…`, `/s?…` | `[data-component-type="s-search-result"][data-asin]`, `.s-main-slot .s-result-item[data-asin]`, often `role="listitem"` | Primary target. Unit prices like `($0.82 /  fluid ounce)`. |
| **Department search** | `/s?k=…&rh=n:…` | Same as search | Same widget as organic search. |
| **Grocery search** | `/s?k=…&i=grocery` | Same as search | Best unit-price coverage. |

## Supported (badge + sort only within same parent)

| Type | URL pattern | Card DOM | Notes |
|------|-------------|----------|--------|
| **Browse / storefront** | `/b?node=…` | `.dcl-product`, `.a-cardui.dcl-product` | OTC disco etc. Carousels — **must not** reorder across the whole page. |
| **Today’s Deals** | `/gp/goldbox`, deals | `.dcl-product` | Similar storefront cards. |

## Limited / best-effort

| Type | URL pattern | Card DOM | Notes |
|------|-------------|----------|--------|
| **Best Sellers** | `/Best-Sellers/zgbs`, `/zgbs/…` | `.zg-grid-general-faceout`, `#gridItemRoot`, `[id^=p13n-asin-index]` | Ranked lists; unit price rare. Badge if price+size found. |

## Intentionally ignored

| Type | URL pattern | Why |
|------|-------------|-----|
| **Product detail** | `/dp/ASIN`, `/gp/product/` | Single item; nothing to sort. |
| **Home / gateway** | `/` | No listing to sort; `/dp/` links everywhere would break the page. |
| **Random pages with product links** | anything else | Aggressive “climb from `/dp/`” was breaking browse pages. |

## Failure mode that was fixed

On `/b?node=…` (e.g. OTC disco), there are **hundreds of `/dp/` links** and **zero** `s-search-result` nodes.
Old fallback treated random ancestors of those links as “cards” and reordered them → broken layout / weird errors.

**Rule:** only use search-result strategies on search URLs; use `dcl-product` only on browse/deals; never body-wide `/dp/` climb.

## Unit-price string formats observed

- `($0.82 /  fluid ounce)` — spaces around `/`
- `($5.13 /  ounce)`
- `($133.29 / 100 Sheets)` — quantity in the unit side
- `($7.75/count)` — compact form

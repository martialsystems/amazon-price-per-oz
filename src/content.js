/**
 * Amazon Price Per Unit Sort — lean hybrid
 * - Manual "Sort Now" (no auto DOM thrash)
 * - Amazon unit-price strings + title-size fallback
 * - Badges + safe sibling reorder only
 * - Session toggle only; nothing saved / no network
 */
(function () {
  "use strict";

  let enabled = true;
  let overlay = null;
  let lastHref = location.href;

  function setEnabledLocal(next) {
    enabled = !!next;
    if (!enabled) {
      clearBadges();
      removeOverlay();
    } else {
      ensureOverlay();
    }
  }

  function syncEnabledToBackground(next) {
    try {
      chrome.runtime.sendMessage(
        { type: "ppu-set-enabled", enabled: !!next },
        () => {
          void chrome.runtime.lastError;
        }
      );
    } catch (_) {}
  }

  function pullEnabledFromBackground(cb) {
    try {
      chrome.runtime.sendMessage({ type: "ppu-get-enabled" }, (res) => {
        if (chrome.runtime.lastError || !res) {
          cb?.(enabled);
          return;
        }
        setEnabledLocal(!!res.enabled);
        cb?.(enabled);
      });
    } catch (_) {
      cb?.(enabled);
    }
  }

  // ---- units --------------------------------------------------------------

  function normUnit(u) {
    return String(u || "")
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** qty of `unit` → amount in base kind (oz | fl oz | count) */
  function toBase(qty, unit) {
    const u = normUnit(unit);
    if (!Number.isFinite(qty) || qty <= 0) return null;

    if (u === "oz" || u === "ounce" || u === "ounces") return { n: qty, kind: "oz" };
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds")
      return { n: qty * 16, kind: "oz" };
    if (u === "g" || u === "gram" || u === "grams") return { n: qty / 28.3495, kind: "oz" };
    if (u === "kg" || u === "kilogram" || u === "kilograms")
      return { n: (qty * 1000) / 28.3495, kind: "oz" };

    if (
      u === "fl oz" ||
      u === "floz" ||
      u === "fluid oz" ||
      u === "fluid ounce" ||
      u === "fluid ounces"
    )
      return { n: qty, kind: "fl oz" };
    if (u === "ml" || u === "milliliter" || u === "millilitre" || u === "milliliters")
      return { n: qty / 29.5735, kind: "fl oz" };
    if (u === "l" || u === "liter" || u === "litre" || u === "liters")
      return { n: (qty * 1000) / 29.5735, kind: "fl oz" };

    if (
      /^(count|ct|each|ea|sheet|sheets|capsule|capsules|tablet|tablets|softgel|softgels|pack|packs|can|cans|wipe|wipes|piece|pieces)$/.test(
        u
      )
    )
      return { n: qty, kind: "count" };

    return null;
  }

  const UNIT_RE =
    "(?:fl(?:uid)?\\.?\\s*oz|floz|fluid\\s*ounces?|ounces?|oz|lbs?|pounds?|kg|g|grams?|ml|l|lit(?:er|re)s?|count|ct|each|ea|sheets?|capsules?|tablets?|softgels?|packs?|cans?|wipes?|pieces?)";

  function fmt(ppu, kind) {
    const d = ppu < 0.01 ? 4 : ppu < 1 ? 3 : 2;
    const k = kind === "count" ? "ea" : kind;
    return `$${ppu.toFixed(d)}/${k}`;
  }

  /** Amazon strings: ($0.82 /  fluid ounce), ($133.29 / 100 Sheets), $0.19/ounce */
  function parseAmazonUnit(text) {
    if (!text) return null;
    const t = text.replace(/\u00a0/g, " ");
    const re = /\(?\s*\$\s*([\d,]+(?:\.\d+)?)\s*\/\s*([^)\n]{1,40}?)\)?/g;
    let best = null;
    let m;
    while ((m = re.exec(t))) {
      const price = parseFloat(m[1].replace(/,/g, ""));
      if (!Number.isFinite(price) || price <= 0) continue;
      let unitStr = m[2].trim().replace(/\s+/g, " ");
      let qty = 1;
      const qm = unitStr.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})$`, "i"));
      if (qm) {
        qty = parseFloat(qm[1]);
        unitStr = qm[2];
      }
      const base = toBase(qty, unitStr);
      if (!base) continue;
      const ppu = price / base.n;
      if (!Number.isFinite(ppu) || ppu <= 0) continue;
      // prefer mass/volume over count when both appear
      if (!best || (best.kind === "count" && base.kind !== "count") || ppu < best.ppu) {
        best = { ppu, kind: base.kind, label: fmt(ppu, base.kind), src: "amazon" };
      }
    }
    return best;
  }

  function parseSize(text) {
    if (!text) return null;
    const t = text.replace(/\u00a0/g, " ");

    // 6 lb 10 oz
    let m = t.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\s+(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\b/i);
    if (m) {
      const n = parseFloat(m[1]) * 16 + parseFloat(m[2]);
      if (n > 0) return { n, kind: "oz" };
    }

    // 29 oz … 4 Pack
    m = t.match(
      new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})\\b[\\s\\S]{0,50}?\\b(?:pack\\s+of\\s+)?(\\d+)\\s*(?:packs?|count|ct|cans?)\\b`,
        "i"
      )
    );
    if (m) {
      const packs = parseFloat(m[3]);
      if (packs > 1) {
        const b = toBase(parseFloat(m[1]) * packs, m[2]);
        if (b) return b;
      }
    }

    // 4 x 29 oz
    m = t.match(new RegExp(`(\\d+)\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})\\b`, "i"));
    if (m) {
      const b = toBase(parseFloat(m[1]) * parseFloat(m[2]), m[3]);
      if (b) return b;
    }

    // plain 16 oz / 60 capsules
    m = t.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})\\b`, "i"));
    if (m) {
      const b = toBase(parseFloat(m[1]), m[2]);
      if (b) return b;
    }
    return null;
  }

  function cardPrice(card) {
    // Main list price only — skip tiny unit-price lines
    for (const el of card.querySelectorAll(".a-price .a-offscreen")) {
      const nearby = (el.parentElement?.parentElement?.textContent || "").slice(0, 60);
      if (/\/\s*(oz|ounce|fl|count|sheet)/i.test(nearby) && nearby.length < 50) continue;
      const n = parseFloat(String(el.textContent).replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
    const whole = card.querySelector(".a-price-whole");
    if (whole) {
      const w = whole.textContent.replace(/[^0-9]/g, "") || "0";
      const f = (card.querySelector(".a-price-fraction")?.textContent || "00").replace(
        /[^0-9]/g,
        ""
      );
      const n = parseFloat(`${w}.${f}`);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  function unitPriceFor(card) {
    const blob = (card.innerText || "").slice(0, 1200);
    const fromAmz = parseAmazonUnit(blob);
    if (fromAmz) return fromAmz;

    const price = cardPrice(card);
    if (!price) return null;
    const title =
      card.querySelector("h2")?.innerText ||
      card.querySelector("h2 span")?.textContent ||
      "";
    const size = parseSize(title) || parseSize(blob);
    if (!size) return null;
    const ppu = price / size.n;
    if (!Number.isFinite(ppu) || ppu <= 0 || ppu > price * 1.01) return null;
    return { ppu, kind: size.kind, label: fmt(ppu, size.kind), src: "computed" };
  }

  // ---- cards --------------------------------------------------------------

  function isSearchPage() {
    return (
      /\/s(?:\/|$)/.test(location.pathname) ||
      /[?&]k=/.test(location.search) ||
      !!document.querySelector(
        '[data-component-type="s-search-result"][data-asin], .s-main-slot'
      )
    );
  }

  function getCards() {
    const raw = [
      ...document.querySelectorAll(
        '[data-component-type="s-search-result"][data-asin]'
      ),
    ].filter((el) => {
      const a = el.getAttribute("data-asin");
      return a && a.length >= 5 && el.offsetParent !== null;
    });

    // drop nested tiles (ATC faceouts etc.)
    return raw.filter((el) => !raw.some((other) => other !== el && other.contains(el)));
  }

  // ---- badges -------------------------------------------------------------

  function clearBadges() {
    document.querySelectorAll(".ppu-badge").forEach((el) => el.remove());
    document.querySelectorAll("[data-ppu-rank]").forEach((el) => {
      el.removeAttribute("data-ppu-rank");
      el.style.removeProperty("outline");
    });
  }

  function badge(card, label, rank) {
    let el = card.querySelector(".ppu-badge");
    if (!el) {
      el = document.createElement("div");
      el.className = "ppu-badge";
      card.appendChild(el);
    }
    el.textContent = rank != null ? `#${rank} · ${label}` : label;
    if (rank != null) {
      card.setAttribute("data-ppu-rank", String(rank));
      if (rank === 1) card.style.outline = "2px solid #14b8a6";
      else card.style.removeProperty("outline");
    }
  }

  // ---- sort (click only) --------------------------------------------------

  function sortKey(info) {
    // oz / fl oz first tier, then count
    const tier = info.kind === "count" ? 1 : info.kind === "oz" || info.kind === "fl oz" ? 0 : 2;
    return tier * 1e12 + info.ppu;
  }

  /**
   * Move only direct siblings under the same parent.
   * Falls back to badges-only if anything looks unsafe.
   */
  function reorderSiblings(items) {
    const byParent = new Map();
    for (const it of items) {
      const p = it.card.parentElement;
      if (!p || it.card.parentNode !== p) continue;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(it);
    }

    let moved = 0;
    for (const [parent, group] of byParent) {
      if (group.length < 2) continue;

      // every card must still be a direct child
      const ok = group.every((g) => g.card.parentElement === parent);
      if (!ok) continue;

      // no card may contain another
      let nested = false;
      for (let i = 0; i < group.length && !nested; i++) {
        for (let j = 0; j < group.length; j++) {
          if (i !== j && group[i].card.contains(group[j].card)) {
            nested = true;
            break;
          }
        }
      }
      if (nested) continue;

      try {
        // appendChild moves existing children to end — preserves parent, cheap
        for (const g of group) parent.appendChild(g.card);
        moved += group.length;
      } catch (_) {
        /* leave Amazon's order; badges still applied */
      }
    }
    return moved;
  }

  function sortNow() {
    if (!enabled) return;

    clearBadges();
    const cards = getCards();
    if (cards.length < 2) {
      setStatus("Need at least 2 product cards");
      return;
    }

    const scored = [];
    const skipped = [];
    for (const card of cards) {
      const info = unitPriceFor(card);
      if (info) scored.push({ card, info });
      else skipped.push(card);
    }

    if (scored.length === 0) {
      setStatus(`No unit prices · ${cards.length} products seen`);
      return;
    }

    scored.sort((a, b) => sortKey(a.info) - sortKey(b.info) || 0);

    // Rank badges first (always useful)
    scored.forEach((s, i) => badge(s.card, s.info.label, i + 1));

    // Then try physical reorder among siblings only
    const ordered = [...scored, ...skipped.map((card) => ({ card, info: null }))];
    // group: with price already sorted; append skipped after within each parent via reorder
    const withPriceOnly = scored;
    const nMoved = reorderSiblings(withPriceOnly);

    // push skipped (no unit price) after sorted siblings when possible
    if (skipped.length) {
      const byParent = new Map();
      for (const card of skipped) {
        const p = card.parentElement;
        if (!p) continue;
        if (!byParent.has(p)) byParent.set(p, []);
        byParent.get(p).push(card);
      }
      for (const [parent, group] of byParent) {
        try {
          for (const c of group) {
            if (c.parentElement === parent) parent.appendChild(c);
          }
        } catch (_) {}
      }
    }

    const how = nMoved > 0 ? "Sorted" : "Ranked";
    setStatus(
      `${how} ${scored.length} by unit price` +
        (skipped.length ? ` · ${skipped.length} skipped` : "")
    );
  }

  // ---- overlay ------------------------------------------------------------

  // In-memory only (tab session) — not written to disk
  let dragPos = null; // { left, top } after user drags
  let dragCleanup = null;

  function setStatus(msg) {
    const el = overlay?.querySelector("#ppu-status");
    if (el) el.textContent = msg;
  }

  function removeOverlay() {
    if (dragCleanup) {
      try {
        dragCleanup();
      } catch (_) {}
      dragCleanup = null;
    }
    if (overlay) {
      try {
        overlay.remove();
      } catch (_) {}
      overlay = null;
    }
  }

  /** Drag via title bar only. Pointer events; no storage; O(1) move. */
  function makeDraggable(panel, handle) {
    let ox = 0;
    let oy = 0;
    let dragging = false;

    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      // switch from right-anchored CSS to left/top for free placement
      panel.style.left = r.left + "px";
      panel.style.top = r.top + "px";
      panel.style.right = "auto";
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      handle.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!dragging) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);
      let left = e.clientX - ox;
      let top = e.clientY - oy;
      if (left < 0) left = 0;
      else if (left > maxX) left = maxX;
      if (top < 0) top = 0;
      else if (top > maxY) top = maxY;
      panel.style.left = left + "px";
      panel.style.top = top + "px";
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      try {
        handle.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      dragPos = {
        left: parseFloat(panel.style.left) || 0,
        top: parseFloat(panel.style.top) || 0,
      };
    };

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);

    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
  }

  function ensureOverlay() {
    if (!enabled || !isSearchPage()) {
      removeOverlay();
      return;
    }
    if (overlay?.isConnected) return;

    overlay = document.createElement("div");
    overlay.id = "ppu-overlay";
    overlay.innerHTML = `
      <div class="ppu-title" id="ppu-drag">Unit price sort</div>
      <div id="ppu-status" class="ppu-status">Click Sort when results look ready</div>
      <button type="button" id="ppu-sort" class="ppu-btn ppu-btn-primary">Sort Now</button>
      <button type="button" id="ppu-disable" class="ppu-btn ppu-btn-muted">Disable</button>
    `;
    document.body.appendChild(overlay);

    if (dragPos) {
      overlay.style.left = dragPos.left + "px";
      overlay.style.top = dragPos.top + "px";
      overlay.style.right = "auto";
    }

    const handle = overlay.querySelector("#ppu-drag");
    dragCleanup = makeDraggable(overlay, handle);

    overlay.querySelector("#ppu-sort").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      sortNow();
    });
    overlay.querySelector("#ppu-disable").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Sync toolbar badge + other Amazon tabs
      syncEnabledToBackground(false);
      setEnabledLocal(false);
    });
  }

  // Toolbar pin-click (and other tabs) → enable/disable
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "ppu-set-enabled") {
        setEnabledLocal(!!msg.enabled);
      }
    });
  } catch (_) {}

  // ---- boot (minimal observers) -------------------------------------------

  function tick() {
    if (location.href !== lastHref) {
      lastHref = location.href;
      clearBadges();
      // recreate overlay only if still enabled
      removeOverlay();
    }
    if (enabled) ensureOverlay();
  }

  function init() {
    // Match toolbar toggle state before showing overlay
    pullEnabledFromBackground(() => {
      tick();
    });
    // Light polling for SPA navigations only — no MutationObserver sort loops
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

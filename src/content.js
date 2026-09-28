/**
 * Unit Price Sort for Amazon Search
 * Copyright (c) 2026 Martial Systems LLC. All rights reserved.
 *
 * Lean hybrid: manual Sort Now, Amazon unit-price + title fallback,
 * badges + safe sibling reorder, session unit-sort toggle,
 * optional Keep Alexa off (stored boolean only). No shopping data / no network.
 */
(function () {
  "use strict";

  let enabled = true;
  let alexaOff = false;
  let overlay = null;
  let lastHref = location.href;
  let alexaMo = null;
  let alexaReapTimer = null;

  // Known Alexa-for-Shopping / Rufus / copilot shells (Amazon renames often)
  const ALEXA_SELECTORS = [
    ".rufus-container",
    ".rufus-panel-container",
    ".rufus-chat-container",
    ".rufus-conversation-container",
    ".rufus-conversation-container-inner",
    ".rufus-container-peek-view",
    ".rufus-panel-header-container",
    ".rufus-view-filler",
    ".nav-rufus-disco",
    ".nav-rufus-content",
    "#nav-flyout-rufus",
    "#nav-rufus-disc-txt",
    '[id^="nav-rufus"]',
    ".copilot-modal-container",
    ".copilot-chat-root",
    "aside[data-copilot-chat-root]",
    "div[data-copilot-name]",
    '[class*="rufus-panel"]',
    '[class*="rufus-chat"]',
    '[class*="alexa-shopping"]',
    "#ask-alexa",
    '[id*="AlexaShopping"]',
  ].join(",");

  // Never hide these: hiding #dp / #a-page / main is what "moves the page back".
  const ALEXA_PROTECTED_IDS = new Set([
    "a-page",
    "pageContent",
    "search",
    "dp",
    "nav-main",
    "nav-belt",
    "navbar",
    "dp-container",
    "ppd",
    "centerCol",
    "leftCol",
    "rightCol",
    "navFooter",
    "s-refinements",
    "hmenu-canvas",
    "ppu-overlay",
  ]);

  function setEnabledLocal(next) {
    enabled = !!next;
    if (!enabled) {
      clearBadges();
      removeOverlay();
    } else {
      ensureOverlay();
    }
  }

  function applyAlexaOff(next) {
    alexaOff = !!next;
    try {
      document.documentElement.classList.toggle("ppu-alexa-off", alexaOff);
    } catch (_) {}
    if (alexaOff) {
      startAlexaWatch();
      reapAlexa();
    } else {
      stopAlexaWatch();
    }
  }

  function isAlexaProtected(el) {
    if (!el || el === document.body || el === document.documentElement) return true;
    if (el.id && ALEXA_PROTECTED_IDS.has(el.id)) return true;
    if (el.getAttribute && el.getAttribute("role") === "main") return true;
    if (el.closest && el.closest("#ppu-overlay, #nav-main, #hmenu-canvas, #s-refinements"))
      return true;
    return false;
  }

  function nodeText(el) {
    return String(el && (el.innerText || el.textContent) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function looksLikeAskAlexaCard(el) {
    if (!el || el.nodeType !== 1) return false;
    const t = nodeText(el);
    if (!t || t.length > 2500) return false;
    const hasTitle = /\bask alexa\b/i.test(t);
    const hasElse = /ask something else/i.test(t);
    const hasChip = /why you might like this/i.test(t);
    if (hasTitle && (hasElse || hasChip)) return true;
    if (hasElse && hasChip) return true;
    if (hasTitle && t.length <= 40) return true;
    return false;
  }

  function alexaHideTarget(start) {
    if (!start || start.nodeType !== 1 || isAlexaProtected(start)) return null;
    let el = start;
    let found = null;
    for (let i = 0; i < 16; i++) {
      if (isAlexaProtected(el)) break;
      if (looksLikeAskAlexaCard(el)) found = el;
      const p = el.parentElement;
      if (!p || isAlexaProtected(p)) break;
      el = p;
    }
    if (found) return found;
    const fallback = start;
    return isAlexaProtected(fallback) ? null : fallback;
  }

  function isAskAlexaSeedText(raw) {
    const t = String(raw || "")
      .replace(/\s+/g, " ")
      .trim();
    return /^ask alexa$/i.test(t) || /^ask something else$/i.test(t);
  }

  function isAskAlexaHeading(el) {
    if (!el || el.nodeType !== 1) return false;
    const label = String(el.getAttribute?.("aria-label") || el.getAttribute?.("alt") || "")
      .replace(/\s+/g, " ")
      .trim();
    if (isAskAlexaSeedText(label)) return true;
    return isAskAlexaSeedText(nodeText(el));
  }

  function hideAlexaNode(el) {
    if (!el || el.nodeType !== 1) return;
    if (isAlexaProtected(el)) return;
    try {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
      el.setAttribute("data-ppu-alexa-hidden", "1");
    } catch (_) {}
  }

  function hideAskAlexaCards() {
    const seeds = [];
    const seen = new Set();
    function addSeed(el) {
      if (!el || el.nodeType !== 1 || seen.has(el)) return;
      seen.add(el);
      seeds.push(el);
    }
    try {
      if (document.body) {
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = tw.nextNode())) {
          if (isAskAlexaSeedText(n.nodeValue) && n.parentElement) addSeed(n.parentElement);
        }
      }
    } catch (_) {}
    try {
      document.querySelectorAll("[aria-label], [alt]").forEach((el) => {
        if (
          isAskAlexaSeedText(el.getAttribute("aria-label")) ||
          isAskAlexaSeedText(el.getAttribute("alt"))
        ) {
          addSeed(el);
        }
      });
    } catch (_) {}
    for (const el of seeds) {
      const target = alexaHideTarget(el);
      if (target) hideAlexaNode(target);
    }
  }

  function withScrollPinned(fn) {
    let x = 0;
    let y = 0;
    try {
      x = window.scrollX;
      y = window.scrollY;
    } catch (_) {}
    try {
      fn();
    } finally {
      try {
        if (window.scrollX !== x || window.scrollY !== y) window.scrollTo(x, y);
      } catch (_) {}
    }
  }

  function reapAlexa() {
    if (!alexaOff) return;
    withScrollPinned(() => {
      try {
        document.querySelectorAll(ALEXA_SELECTORS).forEach(hideAlexaNode);
      } catch (_) {}
      try {
        hideAskAlexaCards();
      } catch (_) {}
    });
  }

  function startAlexaWatch() {
    if (alexaMo) return;
    try {
      alexaMo = new MutationObserver(() => {
        if (alexaReapTimer) return;
        alexaReapTimer = setTimeout(() => {
          alexaReapTimer = null;
          reapAlexa();
        }, 200);
      });
      alexaMo.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch (_) {
      alexaMo = null;
    }
  }

  function stopAlexaWatch() {
    if (alexaMo) {
      try {
        alexaMo.disconnect();
      } catch (_) {}
      alexaMo = null;
    }
    if (alexaReapTimer) {
      clearTimeout(alexaReapTimer);
      alexaReapTimer = null;
    }
    // Undo inline hides so Amazon can show the assistant again without a full reload
    try {
      document.querySelectorAll("[data-ppu-alexa-hidden='1']").forEach((el) => {
        el.style.removeProperty("display");
        el.style.removeProperty("visibility");
        el.style.removeProperty("pointer-events");
        el.removeAttribute("data-ppu-alexa-hidden");
      });
    } catch (_) {}
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
        if ("alexaOff" in res) applyAlexaOff(!!res.alexaOff);
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

  function parseNum(s) {
    const n = parseFloat(String(s).replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  /** qty of `unit` → amount in base kind (oz | fl oz | sheet | count) */
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
    if (
      u === "ml" ||
      u === "milliliter" ||
      u === "millilitre" ||
      u === "milliliters" ||
      u === "millilitres"
    )
      return { n: qty / 29.5735, kind: "fl oz" };
    if (u === "l" || u === "liter" || u === "litre" || u === "liters" || u === "litres")
      return { n: (qty * 1000) / 29.5735, kind: "fl oz" };

    if (u === "sheet" || u === "sheets") return { n: qty, kind: "sheet" };

    if (
      /^(count|ct|each|ea|capsule|capsules|tablet|tablets|softgel|softgels|pack|packs|can|cans|wipe|wipes|piece|pieces)$/.test(
        u
      )
    )
      return { n: qty, kind: "count" };

    return null;
  }

  const UNIT_RE =
    "(?:fl(?:uid)?\\.?\\s*oz|floz|fluid\\s*ounces?|ounces?|oz|lbs?|pounds?|kilograms?|kg|grams?|g|millilit(?:er|re)s?|ml|lit(?:er|re)s?|l|count|ct|each|ea|sheets?|capsules?|tablets?|softgels?|packs?|cans?|wipes?|pieces?)";

  function fmt(ppu, kind) {
    const d = ppu < 0.01 ? 4 : ppu < 1 ? 3 : 2;
    const k = kind === "count" ? "ea" : kind;
    return `$${ppu.toFixed(d)}/${k}`;
  }

  function kindTier(kind) {
    if (kind === "oz" || kind === "fl oz") return 0;
    if (kind === "sheet" || kind === "count") return 1;
    return 2;
  }

  /** Sort: mass/volume, then sheet/count (same tier), else last; then ppu.
   * Do not pack ppu into `tier * 1e12`: ULP at 1e12 is ~0.000122, so
   * $0.0024/sheet vs $0.0025/sheet compare equal and Sort Now does not move. */
  function cmpInfo(a, b) {
    const ta = kindTier(a.kind);
    const tb = kindTier(b.kind);
    if (ta !== tb) return ta - tb;
    return a.ppu - b.ppu;
  }

  function kindRank(kind) {
    if (kind === "oz" || kind === "fl oz") return 0;
    if (kind === "sheet") return 1;
    if (kind === "count") return 2;
    return 3;
  }

  /** Amazon strings: ($0.82 /  fluid ounce), ($133.29 / 100 Sheets), $0.19/ounce */
  function parseAmazonUnit(text) {
    if (!text) return null;
    const t = text.replace(/\u00a0/g, " ");
    // Required UNIT_RE token (optional leading qty). `)` terminates; do not
    // lazily eat one char after `/` with optional `)`.
    const re = new RegExp(
      `\\(?\\s*\\$\\s*([\\d,]+(?:\\.\\d+)?)\\s*/\\s*(?:(\\d+(?:\\.\\d+)?)\\s*)?(${UNIT_RE})(?=\\s*\\)|\\b)`,
      "gi"
    );
    let best = null;
    let m;
    while ((m = re.exec(t))) {
      const price = parseFloat(m[1].replace(/,/g, ""));
      if (!Number.isFinite(price) || price <= 0) continue;
      const qty = m[2] != null && m[2] !== "" ? parseNum(m[2]) : 1;
      const unitStr = m[3].trim().replace(/\s+/g, " ");
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const base = toBase(qty, unitStr);
      if (!base) continue;
      const ppu = price / base.n;
      if (!Number.isFinite(ppu) || ppu <= 0) continue;
      const betterKind = !best || kindRank(base.kind) < kindRank(best.kind);
      const sameKindCheaper = best && kindRank(base.kind) === kindRank(best.kind) && ppu < best.ppu;
      if (betterKind || sameKindCheaper) {
        best = { ppu, kind: base.kind, label: fmt(ppu, base.kind), src: "amazon" };
      }
    }
    return best;
  }

  function parseSize(text) {
    if (!text) return null;
    const t = text.replace(/\u00a0/g, " ");
    const hits = [];
    const NUM = "(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)";

    function consider(b) {
      if (b && Number.isFinite(b.n) && b.n > 0) hits.push({ n: b.n, kind: b.kind });
    }

    function firstPackRolls(text) {
      const re =
        /([\d,]+)\s*(?:family\s+)?(?:super\s+)?(?:mega\s+|double\s+|triple\s+|xl\s+)?rolls?\b/gi;
      let rm;
      while ((rm = re.exec(text))) {
        const before = text.slice(Math.max(0, rm.index - 16), rm.index).toLowerCase();
        if (/\bregular\s*$/.test(before)) continue;
        if (/=\s*$/.test(before)) continue;
        const n = parseNum(rm[1]);
        if (n > 1) return n;
      }
      const caseOf = /(?:case|pack)\s+of\s+([\d,]+)/i.exec(text);
      if (caseOf) {
        const n = parseNum(caseOf[1]);
        if (n > 1) return n;
      }
      return null;
    }

    // 6 lb 10 oz
    const lbOzRe =
      /(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\s+(\d+(?:\.\d+)?)\s*[- ]?\s*(?:oz|ounces?)\b/gi;
    let m;
    while ((m = lbOzRe.exec(t))) {
      const n = parseFloat(m[1]) * 16 + parseFloat(m[2]);
      consider({ n, kind: "oz" });
    }

    // 4 x 29 oz: pack factor only when written as N x size
    const nxRe = new RegExp(
      `${NUM}\\s*[x×]\\s*${NUM}\\s*[- ]?(${UNIT_RE})\\b`,
      "gi"
    );
    while ((m = nxRe.exec(t))) {
      consider(toBase(parseNum(m[1]) * parseNum(m[2]), m[3]));
    }

    // Every number[- ]unit token (16-ounce, 16 oz, 16oz, 37,840 sheets)
    const tokRe = new RegExp(`${NUM}\\s*[- ]?(${UNIT_RE})\\b`, "gi");
    const tokens = [];
    while ((m = tokRe.exec(t))) {
      const b = toBase(parseNum(m[1]), m[2]);
      if (b) tokens.push(b);
    }
    for (const tok of tokens) consider(tok);

    const perRoll = new RegExp(`${NUM}\\s*sheets?\\s+per\\s+roll\\b`, "i").exec(t);
    const rolls = firstPackRolls(t);
    if (perRoll && rolls) {
      consider({ n: parseNum(perRoll[1]) * rolls, kind: "sheet" });
    }

    // Multiply mass/volume/sheets for an explicit pack factor ("4 pack", "pack of 4", "case of 96")
    const packRe =
      /(?:(\d+)\s*-?\s*packs?\b|\bpack(?:s)?\s+of\s+(\d+)\b|\bcase\s+of\s+(\d+)\b)/gi;
    let packFactor = null;
    while ((m = packRe.exec(t))) {
      const n = parseFloat(m[1] || m[2] || m[3]);
      if (n > 1) packFactor = n;
    }
    if (packFactor) {
      for (const tok of tokens) {
        if (tok.kind !== "count") consider({ n: tok.n * packFactor, kind: tok.kind });
      }
    }

    if (!hits.length) return null;
    hits.sort((a, b) => {
      const ra = kindRank(a.kind);
      const rb = kindRank(b.kind);
      if (ra !== rb) return ra - rb;
      return b.n - a.n;
    });
    return { n: hits[0].n, kind: hits[0].kind };
  }

  function cardPrice(card) {
    // Main list price only. Skip tiny unit-price lines.
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
    if (!Number.isFinite(ppu) || ppu <= 0) return null;
    if ((size.kind === "count" || size.kind === "sheet") && size.n <= 1) return null;
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
        // appendChild moves existing children to the end and keeps the parent.
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
      setStatus(
        `No unit prices · ${cards.length} products seen · use Amazon price sort for single items`
      );
      return;
    }

    scored.sort((a, b) => cmpInfo(a.info, b.info));

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

  // In-memory only (tab session). Not written to disk.
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
      <div class="ppu-note">Only sorts when a unit price exists (oz, fl oz, sheets, count). Toilet paper ranks by price per sheet. For single items like a coffee maker, use Amazon’s Sort by: Price · Low to High.</div>
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

  // Toolbar pin-click / context menu → enable/disable + Alexa preference
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "ppu-set-enabled") {
        setEnabledLocal(!!msg.enabled);
      }
      if (msg.type === "ppu-set-alexa-off") {
        applyAlexaOff(!!msg.alexaOff);
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
      if (alexaOff) reapAlexa();
    }
    if (enabled) ensureOverlay();
    if (alexaOff) reapAlexa();
  }

  function init() {
    // Match toolbar toggle state before showing overlay
    pullEnabledFromBackground(() => {
      tick();
    });
    // Light polling for SPA navigations only. No MutationObserver sort loops.
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "../src/content.js"), "utf8");
const start = src.indexOf("// ---- units");
const end = src.indexOf("// ---- cards");
assert.ok(start >= 0 && end > start, "units block missing from content.js");
const code =
  src.slice(start, end) +
  "\nmodule.exports = { toBase, parseSize, parseAmazonUnit, cmpInfo, kindTier, fmt, UNIT_RE };";
const mod = { exports: {} };
vm.runInNewContext(code, {
  module: mod,
  exports: mod.exports,
  Number,
  String,
  Math,
  RegExp,
});
const { toBase, parseSize, parseAmazonUnit, cmpInfo, kindTier } = mod.exports;

function section(name) {
  console.log("  " + name);
}

section("toBase litres / millilitres");
assert.strictEqual(toBase(1000, "ml").kind, "fl oz");
assert.ok(Math.abs(toBase(1000, "millilitres").n - toBase(1, "litre").n) < 1e-6);
assert.ok(Math.abs(toBase(1, "litres").n - toBase(1000, "millilitre").n) < 1e-6);
assert.strictEqual(toBase(16, "oz").kind, "oz");

section("parseSize prefers mass/volume over count");
const mixed = parseSize("12 oz (100 count)");
assert.ok(mixed);
assert.strictEqual(mixed.kind, "oz");
assert.strictEqual(mixed.n, 12);

section("parseSize hyphen ounce");
const hyphen = parseSize("16-ounce bottle");
assert.ok(hyphen);
assert.strictEqual(hyphen.kind, "oz");
assert.strictEqual(hyphen.n, 16);

section("parseSize pack factor only when explicit");
const pack = parseSize("29 oz, 4 pack");
assert.ok(pack);
assert.strictEqual(pack.kind, "oz");
assert.strictEqual(pack.n, 116);
const nx = parseSize("4 x 29 oz");
assert.ok(nx);
assert.strictEqual(nx.kind, "oz");
assert.strictEqual(nx.n, 116);
const notPack = parseSize("100 count capsules");
assert.ok(notPack);
assert.strictEqual(notPack.kind, "count");
assert.strictEqual(notPack.n, 100);

section("guard: count of 1 is skipped by unitPriceFor logic");
const one = parseSize("1 each");
assert.ok(!one || one.n <= 1);

section("shipping: no ppu > price*1.01 guard");
assert.equal(/ppu > price\s*\*\s*1\.01/.test(src), false);
assert.equal(/amazon\.de/.test(src), false);
assert.equal(/amazon\.co\.uk/.test(fs.readFileSync(path.join(__dirname, "../manifest.json"), "utf8")), false);

section("lazy /[^)]{1,40}?/ cannot parse Amazon unit prices");
assert.equal(/\(\[\^\)\\n\]\{1,40\}\?\)/.test(src), false);

section("Amazon TP unit is price per sheet, including live a-offscreen duplicates");
const tpLive = [
  "$0.07 $0.07 /100 Sheets",
  "$0.09 $0.09 /100 Sheets",
  "$0.20 $0.20 /100 Sheets",
  "($0.64 /100 Sheets)",
  "$0.38 $0.38 / 100 Sheets)",
  "($133.29 / 100 Sheets)",
  "$7.97 ($0.64 /100 Sheets)",
];
for (const line of tpLive) {
  const u = parseAmazonUnit(line);
  assert.ok(u, "parseAmazonUnit failed on " + line);
  assert.strictEqual(u.kind, "sheet", line);
  assert.ok(u.label.endsWith("/sheet"), u.label + " for " + line);
}
const cheap = parseAmazonUnit("$0.07 $0.07 /100 Sheets");
const mid = parseAmazonUnit("$0.20 $0.20 /100 Sheets");
const dear = parseAmazonUnit("($0.64 /100 Sheets)");
assert.ok(Math.abs(cheap.ppu - 0.0007) < 1e-9);
assert.ok(Math.abs(mid.ppu - 0.002) < 1e-9);
assert.ok(Math.abs(dear.ppu - 0.0064) < 1e-9);
assert.ok(cmpInfo(cheap, mid) < 0);
assert.ok(cmpInfo(mid, dear) < 0);

section("sheet ranks with count, not after it, and below mass");
const oz = parseAmazonUnit("$0.19/ounce");
const cap = parseAmazonUnit("($7.75/count)");
assert.ok(oz && cap && cheap);
assert.ok(cmpInfo(oz, cheap) < 0, "oz should outrank sheet");
assert.strictEqual(kindTier(cheap.kind), kindTier(cap.kind));
assert.ok(cmpInfo(cheap, cap) < 0);

section("1e12 packed keys cannot rank $/sheet");
assert.equal(/return tier \* 1e12/.test(src), false);
assert.ok(/function cmpInfo/.test(src));
assert.ok(
  1e12 + 0.0024 === 1e12 + 0.0025,
  "IEEE proof: adjacent $/100-sheet steps collide when packed"
);

section("Keep Alexa off hides Ask Alexa without deguttering #dp");
const css = fs.readFileSync(path.join(__dirname, "../src/content.css"), "utf8");
assert.equal(/html\.ppu-alexa-off #dp\b/.test(css), false, "must not zero #dp");
assert.equal(/html\.ppu-alexa-off #a-page\b/.test(css), false, "must not zero #a-page");
assert.equal(/html\.ppu-alexa-off #search\b/.test(css), false, "must not zero #search");
assert.equal(/html\.ppu-alexa-off main\b/.test(css), false, "must not zero main");
assert.equal(/html\.ppu-alexa-off \[role="main"\]/.test(css), false);
assert.equal(/padding-left:\s*0\s*!important/.test(css), false, "must not steal page padding");
assert.equal(/margin-left:\s*0\s*!important/.test(css), false, "must not steal page margin");
assert.ok(/ask alexa/i.test(src));
assert.ok(/isAlexaProtected/.test(src));
assert.ok(/alexaHideTarget/.test(src));
assert.ok(/withScrollPinned/.test(src));
assert.ok(/hideAskAlexaCards/.test(src));
assert.ok(/createTreeWalker/.test(src));
assert.ok(/ask something else/i.test(src));
assert.ok(/"dp"/.test(src) && /centerCol/.test(src) && /ppd/.test(src));
assert.equal(/b\.classList\.remove\(c\)/.test(src), false, "must not strip body dock classes");
assert.equal(/\[id\*="rufus"\]/.test(src), false, "wildcard rufus id hides the page");
assert.equal(/\[id\*="ask-alexa"\]/.test(src), false, "wildcard ask-alexa id can be the column");
const manifest = fs.readFileSync(path.join(__dirname, "../manifest.json"), "utf8");
assert.ok(/"all_frames"\s*:\s*true/.test(manifest));

section("alexaHideTarget stops at #dp and hides the Ask Alexa card");
const hStart = src.indexOf("const ALEXA_PROTECTED_IDS");
const hEnd = src.indexOf("function hideAlexaNode");
assert.ok(hStart >= 0 && hEnd > hStart, "alexa helpers missing");
const ctx = { Set, String, document: { body: {}, documentElement: {} } };
vm.runInNewContext(src.slice(hStart, hEnd), ctx);
assert.equal(typeof ctx.alexaHideTarget, "function");
function el(spec) {
  return {
    id: spec.id || "",
    nodeType: 1,
    className: spec.className || "",
    parentElement: spec.parent || null,
    hasAttribute(name) {
      return !!(spec.attrs && Object.prototype.hasOwnProperty.call(spec.attrs, name));
    },
    getAttribute(name) {
      return spec.attrs ? spec.attrs[name] : null;
    },
    closest() {
      return null;
    },
    innerText: spec.text || "",
    textContent: spec.text || "",
  };
}
const dp = el({ id: "dp" });
const card = el({
  id: "ask-card",
  className: "a-section",
  parent: dp,
  text: "Ask Alexa What are the main scent notes? Why you might like this Ask something else",
});
const heading = el({ text: "Ask Alexa", parent: card });
assert.strictEqual(ctx.alexaHideTarget(heading), card);
assert.strictEqual(ctx.alexaHideTarget(dp), null);
assert.ok(ctx.isAskAlexaSeedText("Ask Alexa"));
assert.ok(ctx.isAskAlexaSeedText("Ask something else"));
assert.ok(ctx.looksLikeAskAlexaCard(card));
const fat = el({
  id: "center-chunk",
  parent: dp,
  text: "Ask Alexa " + "x".repeat(3000) + " Ask something else",
});
const fatHeading = el({ text: "Ask Alexa", parent: fat });
assert.strictEqual(ctx.alexaHideTarget(fatHeading), fatHeading);
assert.ok(
  !ctx.isAskAlexaHeading(
    el({ text: "Ask Alexa about this huge block of chips and more text" })
  )
);

section("grocery oz / fl oz still parse");
const cologne = parseAmazonUnit("$13.99 ($4.14 / fluid ounce)");
assert.ok(cologne);
assert.strictEqual(cologne.kind, "fl oz");
assert.ok(Math.abs(cologne.ppu - 4.14) < 1e-9);
const fl = parseAmazonUnit("($0.82 /  fluid ounce)");
assert.ok(fl);
assert.strictEqual(fl.kind, "fl oz");
assert.ok(Math.abs(fl.ppu - 0.82) < 1e-9);
assert.ok(cmpInfo(fl, cheap) < 0);

section("prefer /100 Sheets over /Count on the same card");
const mixedUnit = parseAmazonUnit("$12.00 ($1.50 / Count) ($0.64 /100 Sheets)");
assert.ok(mixedUnit);
assert.strictEqual(mixedUnit.kind, "sheet");
assert.ok(Math.abs(mixedUnit.ppu - 0.0064) < 1e-9);

section("parseSize multiplies sheets by pack/rolls, not capsule counts");
const perRoll = parseSize(
  "Charmin Ultra Soft, 24 Mega Rolls = 123 Regular Rolls, 244 Sheets Per Roll"
);
assert.ok(perRoll);
assert.strictEqual(perRoll.kind, "sheet");
assert.strictEqual(perRoll.n, 24 * 244);
const packSheets = parseSize("Scott ComfortPlus, 231 sheets (Pack of 12)");
assert.ok(packSheets);
assert.strictEqual(packSheets.kind, "sheet");
assert.strictEqual(packSheets.n, 231 * 12);
const caseSheets = parseSize("1000 Sheets (Case of 96 Rolls)");
assert.ok(caseSheets);
assert.strictEqual(caseSheets.kind, "sheet");
assert.strictEqual(caseSheets.n, 1000 * 96);
const total = parseSize("80 Rolls of 473 Sheets, 37,840 Sheet Total");
assert.ok(total);
assert.strictEqual(total.kind, "sheet");
assert.strictEqual(total.n, 37840);
const stillCaps = parseSize("100 count capsules");
assert.ok(stillCaps);
assert.strictEqual(stillCaps.kind, "count");
assert.strictEqual(stillCaps.n, 100);

console.log("ok: " + module.filename);

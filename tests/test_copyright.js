"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const NOTICE = "Copyright © 2026 Martial Systems LLC. All rights reserved.";
const SKIP_DIRS = new Set([".git", "dist", "node_modules"]);

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(root, []);
const pages = files.filter((p) => p.endsWith(".html") || p.endsWith(".md"));
assert.ok(pages.length >= 10, `expected the html and markdown pages, found ${pages.length}`);

const banned = [
  "Source is not published",
  "We do not publish source code",
  "amazon-price-per-oz-src",
  "publish_public_landing",
  "push_private_source",
];

for (const file of pages) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(NOTICE), `${rel} is missing the copyright notice`);
  for (const phrase of banned) {
    assert.ok(!text.includes(phrase), `${rel} still says "${phrase}"`);
  }
}

const license = fs.readFileSync(path.join(root, "LICENSE"), "utf8");
assert.ok(
  license.startsWith("Copyright (c) 2026 Martial Systems LLC. All rights reserved."),
  "LICENSE notice"
);

const scripts = files.filter((p) => p.startsWith(path.join(root, "scripts")) && p.endsWith(".sh"));
for (const file of scripts) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  for (const phrase of banned) {
    assert.ok(!text.includes(phrase), `${rel} still says "${phrase}"`);
  }
}

console.log(`copyright notice present on ${pages.length} pages`);

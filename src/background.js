/**
 * Unit Price Sort for Amazon Search — Martial Systems LLC
 * Copyright (c) 2026 Martial Systems LLC. All rights reserved.
 *
 * Toolbar click toggles overlay on Amazon tabs.
 * Right-click action menu: Keep Alexa off (persisted) + Donate (Ko-fi).
 * Unit-sort ON/OFF is session memory only (SW may reset to ON).
 * Alexa-off is a single boolean preference (not shopping data).
 */
"use strict";

let enabled = true;
let alexaOff = false;

const DONATE_URL = "https://ko-fi.com/martialgames";
const ALEXA_KEY = "alexaOff";

const AMAZON_URLS = [
  "*://*.amazon.com/*",
  "*://*.amazon.co.uk/*",
  "*://*.amazon.ca/*",
  "*://*.amazon.com.au/*",
  "*://*.amazon.de/*",
];

function applyBadge() {
  const on = enabled;
  chrome.action.setBadgeText({ text: on ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#57534e" });
  chrome.action.setTitle({
    title: on
      ? "Unit Price Sort · ON (click to disable)"
      : "Unit Price Sort · OFF (click to enable)",
  });
}

function sendToAmazonTabs(message) {
  chrome.tabs.query({ url: AMAZON_URLS }, (tabs) => {
    if (chrome.runtime.lastError) return;
    for (const tab of tabs) {
      if (tab.id == null) continue;
      chrome.tabs.sendMessage(tab.id, message, () => {
        void chrome.runtime.lastError;
      });
    }
  });
}

function broadcastEnabled(enabledVal) {
  sendToAmazonTabs({ type: "ppu-set-enabled", enabled: enabledVal });
}

function broadcastAlexaOff(alexaOffVal) {
  sendToAmazonTabs({ type: "ppu-set-alexa-off", alexaOff: alexaOffVal });
}

function setEnabled(next) {
  enabled = !!next;
  applyBadge();
  broadcastEnabled(enabled);
}

function setAlexaOff(next) {
  alexaOff = !!next;
  try {
    chrome.storage.local.set({ [ALEXA_KEY]: alexaOff });
  } catch (_) {}
  try {
    chrome.contextMenus.update(
      "ppu-alexa-off",
      { checked: alexaOff },
      () => {
        void chrome.runtime.lastError;
      }
    );
  } catch (_) {}
  broadcastAlexaOff(alexaOff);
}

function loadAlexaPref(done) {
  try {
    chrome.storage.local.get({ [ALEXA_KEY]: false }, (res) => {
      if (chrome.runtime.lastError) {
        alexaOff = false;
        done?.();
        return;
      }
      alexaOff = !!res[ALEXA_KEY];
      done?.();
    });
  } catch (_) {
    alexaOff = false;
    done?.();
  }
}

// Pin + click toolbar icon (no popup, so this fires)
chrome.action.onClicked.addListener(() => {
  setEnabled(!enabled);
});

// Right-click extension icon → Keep Alexa off + Donate
function ensureContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      /* menu API unavailable in rare contexts */
    }
    chrome.contextMenus.create(
      {
        id: "ppu-alexa-off",
        title: "Keep Alexa off",
        type: "checkbox",
        checked: alexaOff,
        contexts: ["action"],
      },
      () => {
        void chrome.runtime.lastError;
      }
    );
    chrome.contextMenus.create(
      {
        id: "ppu-donate",
        title: "Donate (Ko-fi)",
        contexts: ["action"],
      },
      () => {
        void chrome.runtime.lastError;
      }
    );
  });
}

function bootMenus() {
  loadAlexaPref(() => {
    ensureContextMenu();
    // Tabs already open (e.g. after SW restart) need the stored preference
    broadcastAlexaOff(alexaOff);
  });
}

chrome.runtime.onInstalled.addListener(bootMenus);
chrome.runtime.onStartup.addListener(bootMenus);
bootMenus();

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "ppu-donate") {
    chrome.tabs.create({ url: DONATE_URL });
    return;
  }
  if (info.menuItemId === "ppu-alexa-off") {
    // info.checked is the new checkbox state after the click
    setAlexaOff(!!info.checked);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "ppu-get-enabled") {
    sendResponse({ enabled, alexaOff });
    return true;
  }

  if (msg.type === "ppu-set-enabled") {
    setEnabled(!!msg.enabled);
    sendResponse({ enabled, alexaOff });
    return true;
  }

  if (msg.type === "ppu-toggle") {
    setEnabled(!enabled);
    sendResponse({ enabled, alexaOff });
    return true;
  }

  if (msg.type === "ppu-get-alexa-off") {
    sendResponse({ alexaOff });
    return true;
  }

  if (msg.type === "ppu-set-alexa-off") {
    setAlexaOff(!!msg.alexaOff);
    sendResponse({ alexaOff });
    return true;
  }
});

applyBadge();

/**
 * Unit Price Sort for Amazon Search
 * Copyright (c) 2026 Martial Systems LLC. All rights reserved.
 *
 * Toolbar click toggles overlay on Amazon tabs.
 * Right-click action menu: Donate (Ko-fi).
 * Unit-sort ON/OFF is session memory only (SW may reset to ON).
 */
"use strict";

let enabled = true;

const DONATE_URL = "https://ko-fi.com/martialgames";

const AMAZON_URLS = [
  "*://*.amazon.com/*",
  "*://*.amazon.ca/*",
  "*://*.amazon.com.au/*",
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

function setEnabled(next) {
  enabled = !!next;
  applyBadge();
  broadcastEnabled(enabled);
}

// Pin + click toolbar icon (no popup, so this fires)
chrome.action.onClicked.addListener(() => {
  setEnabled(!enabled);
});

// Right-click extension icon → Donate
function ensureContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      /* menu API unavailable in rare contexts */
    }
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

chrome.runtime.onInstalled.addListener(ensureContextMenu);
chrome.runtime.onStartup.addListener(ensureContextMenu);
ensureContextMenu();

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "ppu-donate") {
    chrome.tabs.create({ url: DONATE_URL });
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "ppu-get-enabled") {
    sendResponse({ enabled });
    return true;
  }

  if (msg.type === "ppu-set-enabled") {
    setEnabled(!!msg.enabled);
    sendResponse({ enabled });
    return true;
  }

  if (msg.type === "ppu-toggle") {
    setEnabled(!enabled);
    sendResponse({ enabled });
    return true;
  }
});

applyBadge();

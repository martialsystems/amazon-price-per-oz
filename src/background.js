/**
 * Toolbar click toggles overlay on Amazon tabs.
 * State lives in memory for this browser session only (SW may reset to ON).
 * No shopping data, no disk writes, no network.
 */
"use strict";

let enabled = true;

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

function broadcast(enabledVal) {
  chrome.tabs.query({ url: AMAZON_URLS }, (tabs) => {
    if (chrome.runtime.lastError) return;
    for (const tab of tabs) {
      if (tab.id == null) continue;
      chrome.tabs.sendMessage(
        tab.id,
        { type: "ppu-set-enabled", enabled: enabledVal },
        () => {
          // content script may be missing on non-matched frames — ignore
          void chrome.runtime.lastError;
        }
      );
    }
  });
}

function setEnabled(next) {
  enabled = !!next;
  applyBadge();
  broadcast(enabled);
}

// Pin + click toolbar icon (no popup, so this fires)
chrome.action.onClicked.addListener(() => {
  setEnabled(!enabled);
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

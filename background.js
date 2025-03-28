// background.js
chrome.tabs.onCreated.addListener(() => {
    chrome.tabs.query({}, function(tabs) {
        chrome.storage.local.set({ openTabs: tabs }, () => {
            console.log("Tabs updated after creation");
        });
    });
});

chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({}, function(tabs) {
        chrome.storage.local.set({ openTabs: tabs }, () => {
            console.log("Tabs updated after removal");
        });
    });
});

// Optional: You can also listen to when the extension starts up (onInstalled) and fetch open tabs:
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({}, function(tabs) {
        chrome.storage.local.set({ openTabs: tabs }, () => {
            console.log("Tabs updated");
        });
    });
});
const _app_title = "Browsing Data Tool";

function isYoutube(url) {
    let link = new URL(url);
    if (link.hostname === "www.youtube.com" || link.hostname === "youtube.com") return true;
    return false;
}

function screenShotInject(_tabID) {
    chrome.scripting.executeScript({
        target: { tabId: _tabID, allFrames: false },
        files: ["./scripts/inject-screenshot.js"],
    });
}

function screenShotInject2(_tabID) {
    chrome.scripting.executeScript({
        target: { tabId: _tabID, allFrames: false },
        files: ["./scripts/inject-screenshot-button.js"],
    });
}

async function normalNotification(title, message, submessage) {
    await chrome.notifications.create(
        "notification1",
        {
            type: "basic",
            iconUrl: "./images/32.png",
            title: title,
            message: message,
            contextMessage: submessage,
            priority: 0,
        }
    );
}

export { _app_title, isYoutube, screenShotInject, screenShotInject2, normalNotification }
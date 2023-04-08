import * as ScreenshotFiles from "./scripts/screenshotStorage.js"

const filter = { url: [{ hostEquals: "www.youtube.com", pathEquals: "/watch" }, { hostEquals: "www.youtube.com", pathEquals: "/live" }] };
function injectScript(details) {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId, allFrames: false },
        files: ["./scripts/content-scripts/inject-screenshot-button.js"],
    });
}


/**
 * Inject element when page update
 */
chrome.webNavigation.onCompleted.addListener(injectScript, filter);
chrome.webNavigation.onHistoryStateUpdated.addListener(injectScript, filter);


/**
 * Shortcuts
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === "youtube-screen-shot") {
        if (!Utils.isYoutube(tab.url)) {
            Utils.normalNotification(Utils._app_title, "截圖功能僅能在 Youtube 頁面上執行。", "");
            return;
        }
        const response = await chrome.tabs.sendMessage(tab.id, { command: "screenshot" });
        // console.log(response);
    }
});



/**
 * Monitor communication
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // console.log(request);
    if (request.message === "download") {
        await ScreenshotFiles.download(request.payload);
        sendResponse(true);
        return true;
    }
    else if (request.message === "saveScreenshot") {
        await ScreenshotFiles.set(request.payload);
        sendResponse(true);
        return true;
    }
    else if (request.message === "delete") {
        // console.log("start delete");
        await ScreenshotFiles.remove(request.payload);
        // console.log("end delete");
        sendResponse(true);
        return true;
    }
});

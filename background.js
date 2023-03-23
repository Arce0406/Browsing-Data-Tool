// import * as MenuAPI from "./scripts/contextMenu.js";
import * as Utils from "./scripts/utils.js";
import * as ScreenshotFiles from "./scripts/screenshotStorage"

const filter = { url: [{ hostEquals: "www.youtube.com", pathEquals: "/watch" }, { hostEquals: "www.youtube.com", pathEquals: "/live" }] };
function injectScript(details) { Utils.screenShotInject2(details.tabId); }

/**
 * Click extension icon
 */
chrome.action.onClicked.addListener(function (tab) {
  if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
});

/**
 * Inject element when page update
 */
chrome.webNavigation.onCompleted.addListener(injectScript, filter);
chrome.webNavigation.onHistoryStateUpdated.addListener(injectScript, filter);
// chrome.webNavigation.onDOMContentLoaded.addListener(function(details){console.log('Navigation onDOMContentLoaded', details);})
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { console.log('tabs.onUpdated', changeInfo.status) });

/**
 * Shortcuts
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  // console.log(`Command: ${command}, Tab: ${tab.title}`);
  if (command === "youtube-screen-shot") {
    if (!Utils.isYoutube(tab.url)) {
      Utils.normalNotification(Utils._app_title, "截圖功能僅能在 Youtube 頁面上執行。", "");
      return;
    }
    const response = await chrome.tabs.sendMessage(tab.id, { command: "screenshot" });
    console.log(response);
  }
});

/**
 * Monitor communication
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "setNotify") {
    // NotifyAPI.Permission();
    NotifyAPI.normalNotification(
      request.notification.title,
      request.notification.header,
      request.notification.subheader
    );
    sendResponse(true);
    return true;
  }
  else if (request.message === "hello") {
    sendResponse(true);
    return true;
  }
  else if (request.message === "download") {
    ScreenshotFiles.download(request.payload);
    sendResponse(true);
    return true;
  }
});

/**
 * Update option page when screenshot storage changes
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`);
  }
});


/**
 *  Add menu items
 */
// MenuAPI.createScreenShotButton();
// MenuAPI.createYoutubeTabGroup();

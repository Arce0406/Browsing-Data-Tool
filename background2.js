// import * as ScreenshotBackgroundWorker from "./background-only/screenshot.js"
import * as Utils from "./scripts/utils.js";
import * as ScreenshotFiles from "./scripts/screenshotStorage.js"
import * as UserSettingStorage from "./scripts/settingStorage.js";

/**
 * Click extension icon to open option page.
 */
chrome.action.onClicked.addListener(function (tab) {
  if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
});

/**
 * Monitor storage changes
 * 1. Update option page when screenshot storage changes
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
    // console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, `Old value was "${oldValue}", new value is "${newValue}".`);
  }
});

/**
 * Inject element when page update
 */
const host = "www.youtube.com";
const filter = { url: [{ hostEquals: host, pathEquals: "/watch" }, { hostEquals: host, pathEquals: "/live" }] };
function injectScript(details) {
  chrome.scripting.executeScript({
    target: { tabId: details.tabId, allFrames: false },
    files: ["./scripts/content-scripts/inject-screenshot-button.js", "./scripts/content-scripts/inject-timeline-button.js"],
  }).then(() => console.log("script injected"));
}
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
  if (request.message === "setNotify") {
    // NotifyAPI.Permission();
    NotifyAPI.normalNotification(request.notification.title, request.notification.header, request.notification.subheader
    );
    sendResponse(true);
    return true;
  }
  else if (request.message === "download") {
    await ScreenshotFiles.download(request.payload);
    sendResponse(true);
    return true;
  }
  else if (request.message === "saveScreenshot") {
    await ScreenshotFiles.set(request.payload);
    sendResponse(true);
    return true;
  }
  else if (request.message === "saveUserSetting") {
    await UserSettingStorage.set(request.payload);
    sendResponse(true);
    return true;
  }
  // else if (request.message === "getUserSetting") {
  //   const setting = await UserSettingStorage.get();
  //   console.log(setting[UserSettingStorage.key], Date.now());
  //   sendResponse({ "result": setting[UserSettingStorage.key] });
  //   return true;
  // }
  else if (request.message === "delete") {
    // console.log("start delete");
    await ScreenshotFiles.remove(request.payload);
    // console.log("end delete");
    sendResponse(true);
    return true;
  }
  else if (request.message === "youtubeEnded") {
    // console.log("start delete");
    await ScreenshotFiles.remove(request.payload);
    // console.log("end delete");
    sendResponse(true);
    return true;
  }
});
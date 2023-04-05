// import * as MenuAPI from "./background-only/contextMenu.js";
import * as Utils from "./scripts/utils.js";
import * as ScreenshotFiles from "./scripts/screenshotStorage.js"
import * as UserSettingStorage from "./scripts/settingStorage.js";

const filter = { url: [{ hostEquals: "www.youtube.com", pathEquals: "/watch" }, { hostEquals: "www.youtube.com", pathEquals: "/live" }] };
function injectScript(details) {
  chrome.scripting.executeScript({
    target: { tabId: details.tabId, allFrames: false },
    files: ["./scripts/content-scripts/inject-screenshot-button.js"],
  });
}

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
});

/**
 * Update option page when screenshot storage changes
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
    // console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, `Old value was "${oldValue}", new value is "${newValue}".`);
  }
});


/**
 *  Add menu items
 */
// MenuAPI.createScreenShotButton();
// MenuAPI.createYoutubeTabGroup();


async function test() {
  await chrome.storage.local.remove("test");
  const result = await chrome.storage.local.get(null);
  console.log(result);
}

// test();
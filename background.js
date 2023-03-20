import * as MenuAPI from "./scripts/contextMenu.js";
import * as Utils from "./scripts/utils.js";
import * as FileSysten from "./scripts/fileSystem.js"

/**
 * 快捷指令
 */
chrome.commands.onCommand.addListener((command, tab) => {
  // console.log(`Command: ${command}, Tab: ${tab.title}`);
  if (command === "youtube-screen-shot") {
    if (!Utils.isYoutube(tab.url)) {
      Utils.normalNotification(Utils._app_title, "截圖功能僅能在 Youtube 頁面上執行。", "");
      return;
    }
    Utils.screenShotInject2(tab.id);
  }
});

/**
 * 監聽前台指令
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
  else if (request.message === "file") {
    FileSysten.download(request.url);
    sendResponse(true);
    return true;
  }
});


MenuAPI.createScreenShotButton();
MenuAPI.createYoutubeTabGroup();
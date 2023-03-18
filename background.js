import * as MenuAPI from "./scripts/contextMenu.js";

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
});

MenuAPI.createScreenShotButton();
MenuAPI.createYoutubeTabGroup();
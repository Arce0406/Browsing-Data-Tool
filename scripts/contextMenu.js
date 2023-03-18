
const _app_title = "Browsing Data Tool";

async function createYoutubeTabGroup() {

    /**
     * Add tabs to group
     * @param {TabGroup?} g 
     * @param {Tab[]} tabs 
     * @returns {TabGroup} TabGroup
     */
    async function addGroup(gid, tabs) {
        const tabids = tabs.map(x => x.id);
        const options = { tabIds: tabids };
        // console.log(tabids);
        if (gid) {
            options.groupId = gid;
        }
        const groupId = await chrome.tabs.group(options);
        const group = await chrome.tabGroups.update(groupId, {
            collapsed: true,
            color: "red",
            title: "Youtube"
        });
        return group;
    }

    /**
     * Get all tabs
     * @returns {Tab[]} Tabs
     */
    async function getTabs() {
        let queryInfo = {
            url: ["*://*.youtube.com/*", "*://youtu.be/*"],
            groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
        };
        const t = await chrome.tabs.query(queryInfo);
        return t;
    }

    /**
     * Get all tab groups
     * @returns {TabGroup[]} Tab Group Array
     */
    async function getTabGroups() {
        const queryInfo = {
            // collapsed: false,
            color: "red",
            title: "Youtube"
        };
        const g = await chrome.tabGroups.query(queryInfo);
        return g;
    }

    let menu_id = "run_youtube_tabs_grouper";
    chrome.contextMenus.create({
        type: "normal",
        id: menu_id,
        title: "將 Youtube 分頁集中到同一個分頁群組",
        contexts: ["all"],
    });
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId != menu_id) {
            return;
        }

        const groups = await getTabGroups();
        let gid;
        if (groups.length == 1) { gid = groups[0].id; }
        else if (groups.length > 1) { gid = groups[0].id; }

        const tabs = await getTabs();
        if (tabs.length == 0) {
            await normalNotification(_app_title, "沒有 Youtube 分頁。", "");
            return;
        }

        const result = await addGroup(gid, tabs);
        if (result) { await normalNotification(_app_title, "已將所有 Youtube 頁面移動到 Youtube 分頁群組。", ""); }
        else { await normalNotification(_app_title, "發生錯誤。", ""); }
    });
}

function createScreenShotButton() {
    let menu_id = "run_screen_shot";
    chrome.contextMenus.create({
        type: "normal",
        id: menu_id,
        title: "截圖當前Youtube畫面",
        contexts: ["all"],
    });
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === menu_id) {
            let link = new URL(info.pageUrl);
            if (link.hostname === "www.youtube.com" || link.hostname === "youtube.com") {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id, allFrames: false },
                    files: ["./scripts/screenshot_inject.js"],
                });
                //
            } else {
                normalNotification(
                    _app_title,
                    "截圖功能僅能在 Youtube 頁面上執行。",
                    ""
                );
            }
            // info.pageUrl, link.hostname
        }
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

export { createYoutubeTabGroup, createScreenShotButton };
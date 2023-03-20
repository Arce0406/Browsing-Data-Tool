/**
 * 每一次截圖，將圖顯示在畫面上(然後Pop-out)
 * 並將截圖傳回後端，透過 chrome.downloads 下載到電腦上
 */


const _key = "youtube_screenshots";

// const default_format = {
//     "user_setting": {},
//     "screenshots": [{
//         "id": id,
//         "title": title,
//         "width": resizeToWidth,
//         "height": resizeToHeight,
//         "blob": blob
//     }]
// };

async function set(user_setting, screenshot) {

    chrome.storage.local.set({ _key: value }).then(() => {
        console.log("Value is set to " + value);
    });

}

async function get() {
    const result = chrome.storage.local.get([_key]);
    console.log("Value currently is " + result.key);
    return result;
}

async function download(url) {
    const downloadOptions = {
        "url": url,
        "saveAs": false,
        "filename": "456"
    };
    const downloadId = await chrome.downloads.download(downloadOptions);
    console.log(downloadId);
}

export { set, get, download }
/**
 * 每一次截圖，將圖顯示在畫面上(然後Pop-out)
 * 並將截圖傳回後端，透過 chrome.downloads 下載到電腦上
 */

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

import * as FileSysten from "./scripts/fileSystem.js";
const _key = "youtube_screenshots";


function save(dataURL) {

}

function get(id) {

}

async function getAll() {
    const obj = await FileSysten.get(_key);
    return obj;
}


/**
 * 
 * @param {*} url 
 */
async function download(payload) {
    const downloadOptions = {
        "url": payload.dataURL,
        "saveAs": false,
        "filename": `${payload.created.toISOString()}.png`
    };
    const downloadId = await chrome.downloads.download(downloadOptions);
    if (!downloadId) console.log(chrome.runtime.lastError);
    console.log(downloadId);
}

export { save, get, download }
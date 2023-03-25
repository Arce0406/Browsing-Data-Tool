/**
 * 每一次截圖，將圖顯示在畫面上(然後Pop-out)
 * 並將截圖傳回後端，透過 chrome.downloads 下載到電腦上
 */

const default_user_setting = {
    "download_path": "",
    "background": {
        "mode": "dark"
    }
};

import * as FileSysten from "./fileSystem.js";
const _key = "honeybees_club";//"youtube_screenshots";

async function usage(ks) {
    const result = await FileSysten.usage(ks);
    return result;
}

async function set(payload) {
    let orignal_datas = await get(_key);

    if (!orignal_datas) { orignal_datas = {}; }
    if (!orignal_datas[_key]) { orignal_datas[_key] = {}; }
    if (!orignal_datas[_key]["user_setting"]) { orignal_datas[_key]["user_setting"] = default_user_setting; };
    if (!orignal_datas[_key]["screenshots"]) { orignal_datas[_key]["screenshots"] = []; }

    orignal_datas[_key].screenshots.push(payload);
    // console.log(orignal_datas[_key].screenshots.length);

    await FileSysten.set(orignal_datas);
}

async function get(key) {
    const obj = await FileSysten.get(key);
    // console.log(`${key}: `, obj);
    return obj;
}

async function getAll() {
    const obj = await FileSysten.getAll(null);
    // console.log("All: ", obj);
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
        "conflictAction": "prompt",
        "filename": `${payload.created.substring(0, 19).replaceAll(":", "_").replace("Z", "")}.png`
    };
    const downloadId = await chrome.downloads.download(downloadOptions);
    if (!downloadId) console.log(chrome.runtime.lastError);
    // console.log(downloadId);
}

async function remove(payload) {
    // console.log("delete...");
    let orignal_datas = await get(_key);
    if (!orignal_datas[_key] || !orignal_datas[_key]["screenshots"]) return;

    const result = orignal_datas[_key]["screenshots"]
        .filter(shot => !(shot.created === payload.created && shot.title === payload.title && shot.channel.name === payload.channel.name));
    // console.log(result);
    orignal_datas[_key]["screenshots"] = result;
    await FileSysten.set(orignal_datas);
}

async function clear() {
    const result = await FileSysten.clear();
    return result;
}

export { usage, set, get, getAll, download, remove, clear }
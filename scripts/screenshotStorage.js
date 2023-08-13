/**
 * 每一次截圖，將圖顯示在畫面上(然後Pop-out)
 * 並將截圖傳回後端，透過 chrome.downloads 下載到電腦上
 */

import * as FileSysten from "./fileSystem.js";
// import { key } from "./settingStorage.js";
const _key_youtube_screenshot = "honeybeesclub_youtube_screenshots";

async function init() {
    let orignal_datas = await get();
    if (!orignal_datas || !orignal_datas[_key_youtube_screenshot]) {
        orignal_datas = {};
        orignal_datas[_key_youtube_screenshot] = [];
        await FileSysten.set(orignal_datas);
    }
}

async function usage() {
    const result = await FileSysten.usage(_key_youtube_screenshot);
    return result;
}

async function set(payload) {
    let orignal_datas = await get();
    orignal_datas[_key_youtube_screenshot].push(payload);

    await FileSysten.set(orignal_datas);
}

async function get() {
    return await FileSysten.get(_key_youtube_screenshot);
}

/**
 * 
 * @param {*} url 
 */
async function download(payload) {
    const downloadId = await chrome.downloads.download({
        "url": payload.dataURL,
        "saveAs": false,
        "conflictAction": "prompt",
        "filename": `${payload.created.substring(0, 19).replaceAll(":", "_").replace("Z", "")}.png`
    });
    if (!downloadId) console.log(chrome.runtime.lastError);
    // console.log(downloadId);
}

async function remove(payload) {
    let orignal_datas = await get();
    if (!orignal_datas) return;
    orignal_datas = orignal_datas[_key_youtube_screenshot];
    orignal_datas = orignal_datas
        .filter(shot => !(shot.created === payload.created && shot.title === payload.title && shot.channel.name === payload.channel.name));
    const obj = {};
    obj[_key_youtube_screenshot] = orignal_datas;
    await FileSysten.set(obj);
}

async function clear() {
    const empty = {};
    empty[_key_youtube_screenshot] = [];
    // const result = await FileSysten.clear();    
    // await set(empty);
    await FileSysten.set(empty);
    // return result;    
}

export { _key_youtube_screenshot as key, init, usage, set, get, download, remove, clear }
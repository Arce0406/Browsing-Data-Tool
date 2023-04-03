const default_user_setting = {
    "download": {
        "type": "manual", // auto | manual
        "path": ""
    },
    "background": "dark",
};

import * as FileSysten from "./fileSystem.js";
const _key_user_setting = "honeybeesclub_user_setting";

async function init() {
    let orignal_datas = await get();
    if (!orignal_datas || !orignal_datas[_key_user_setting]) {
        orignal_datas = {};
        orignal_datas[_key_user_setting] = default_user_setting;
        await FileSysten.set(orignal_datas);
    }
}

async function usage() {
    const result = await FileSysten.usage(_key_user_setting);
    return result;
}

async function set(payload) {
    let orignal_datas = await get(_key_user_setting);
    orignal_datas[_key_user_setting] = payload;
    await FileSysten.set(orignal_datas);
}

async function get() {
    return await FileSysten.get(_key_user_setting);
}

async function reset() {
    const result = await FileSysten.clear();
    return result;
}

export { _key_user_setting as key, init, usage, set, get, reset }
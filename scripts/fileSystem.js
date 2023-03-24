/**
 * Access API for chrome.storage.local
 */

/**
 * Set object by object
 * @param {*} obj
 * @returns {*} result
 */
async function set(obj) {
    const r = await chrome.storage.local.set(obj);
    return r;
}

/**
 * 
 * @param {String[]} ks 
 * @returns {*} result
 */
async function get(ks) {
    const result = await chrome.storage.local.get(ks);
    return result;
}

/**
 * Get all items in chrome.storage.local
 * @returns 
 */
async function getAll() {
    const result = await chrome.storage.local.get(null);
    return result;
}

async function remove(ks) {
    const result = await chrome.storage.local.remove(ks);
    return result;
}

async function clear() {
    const result = await chrome.storage.local.clear();
    return result;
}

async function usage(ks) {
    const result = await chrome.storage.local.getBytesInUse(ks);
    return result;
}

export { set, get, getAll, remove, clear, usage }
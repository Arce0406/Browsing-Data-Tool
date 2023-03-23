/**
 * 
 * @param {String} k 
 * @param {String} v 
 * @returns {*} result
 */
async function set(k, v) {
    const r = chrome.storage.local.set({ k: v });
    return r;
}

/**
 * 
 * @param {String[]} ks 
 * @returns {*} result
 */
async function get(ks) {
    const result = chrome.storage.local.get(ks);
    return result;
}

export { set, get }
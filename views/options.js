import * as ScreenshotStorage from "../scripts/screenshotStorage.js";
import * as UserSettingStorage from "../scripts/settingStorage.js";

const area = document.getElementById("main-area");
const usageP = document.getElementById("usage");
const modal_preview = document.getElementById("modal-preview");
const modal_preview_img = document.getElementById("modal-preview-img");
const filter_channel = document.getElementById("select-channel");
const hint_text = document.getElementById("loading");
const btn_mode = document.getElementById("btn-mode");
const input_downloadType_auto = document.getElementById("downloadType1");
const input_downloadType_manual = document.getElementById("downloadType2");
const input_downloadPath = document.getElementById("downloadPath");
let userSetting, storageData, usageBytes;
let mode = "dark"; // dark / light


document.addEventListener("DOMContentLoaded", init);

async function init() {
    await ScreenshotStorage.init();
    await UserSettingStorage.init();

    const date1 = Date.now();
    await getScreenshots();
    await getUserSettings();
    onSettingsLoad();
    screenshots();
    buttons();
    filters();
    modals();
    const date2 = Date.now();
    console.log("done.", Math.abs(date2 - date1));
}

/**
 * 取得資料
 */
async function getScreenshots() {
    storageData = await ScreenshotStorage.get();
    storageData = storageData[ScreenshotStorage.key];
    usageBytes = await ScreenshotStorage.usage();
    if (storageData) storageData = storageData.reverse();
}

async function getUserSettings() {
    userSetting = await UserSettingStorage.get();
    userSetting = userSetting[UserSettingStorage.key];
}

function onSettingsLoad() {
    input_downloadPath.value = userSetting.download.path;
    input_downloadType_auto.checked = (userSetting.download.type === "auto" ? true : false);
    input_downloadType_manual.checked = (userSetting.download.type === "manual" ? true : false);

    function onDownloadTypeChange(e) {
        if (input_downloadType_auto.checked && !input_downloadType_manual.checked) {
            input_downloadPath.disabled = false;
        } else {
            input_downloadPath.disabled = true;
        }
    }
    input_downloadType_auto.addEventListener("change", onDownloadTypeChange);
    input_downloadType_manual.addEventListener("change", onDownloadTypeChange);
    onDownloadTypeChange();

    if (userSetting.background === "dark") {
        setDark();
    }
    else {
        setLight();
    }
}

// Convert dataURL to blob
function dataURLtoBlob(dataURL) {
    let arr = dataURL.split(','), mimeType = arr[0].match(/:(.*?);/)[1],
        byteString = atob(arr[1]), n = byteString.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = byteString.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mimeType });
}

/* Click Events */

async function onDelete(element, payload) {
    element.addEventListener("click", async function () {
        const yes = confirm('確定要刪除嗎？');
        if (!yes) return;
        await ScreenshotStorage.remove(payload);
        await init();
    });
}

async function onCopy(element, blobType, blob) {
    element.addEventListener("click", async function () {
        await navigator.clipboard.write([new ClipboardItem({ [blobType]: blob })]);
    });
}

async function onDowmload(element, payload) {
    element.addEventListener("click", async function (e) {
        await chrome.runtime.sendMessage({ "message": "download", "payload": payload });
    });
}

async function onPreview(element, dataURL) {
    element.addEventListener("click", function (e) {
        modal_preview_img.setAttribute("src", dataURL);
        modal_preview.classList.toggle("is-active");
    });
}

// Item Clone
function createItem(payload) {
    const date = payload.created.substring(0, 10);
    const ce = document.querySelector(".sample_item_3").cloneNode(true);
    ce.classList.remove("sample_item_3");
    ce.style.display = "block";
    ce.setAttribute("data-datetime", date);
    ce.setAttribute("data-channel", payload.channel.name);
    /*
    ce
    .children[0]：figure
        .children[0]：card-image
            .children[0]：img
    .children[1]：overlay
    .children[2]：flex content 1
        .children[0]：button delete
        .children[1]：button expand
    .children[3]：flex content 2、columns
        .children[0]：column
            .children[0]：content
                .children[0]：title
                .children[1]：time
        .children[1]：column
            .children[0]：button copy
            .children[1]：button download
    */
    /// image
    const blob = dataURLtoBlob(payload.dataURL, payload.mimeType);
    ce.children[0].children[0].setAttribute("src", window.URL.createObjectURL(blob));

    /// title
    ce.children[3].children[0].children[0].children[0].textContent = payload.channel.name;

    /// date
    ce.children[3].children[0].children[0].children[1].setAttribute("datetime", date);
    ce.children[3].children[0].children[0].children[1].textContent = date;

    /// delete
    onDelete(ce.children[2].children[0], payload);

    /// preview
    onPreview(ce.children[2].children[1], payload.dataURL);

    // copy
    onCopy(ce.children[3].children[1].children[0], blob.type, blob);

    /// download
    onDowmload(ce.children[3].children[1].children[1], payload);

    return (ce);
}

// Create ui
function screenshots() {
    const length = storageData.length;

    if (!storageData || length <= 0) {
        hint_text.textContent = "No data.";
        return;
    }

    // sort
    storageData.sort(function (a, b) {
        return b.created - a.created;
    });

    // clear dom
    while (area.firstChild) {
        area.removeChild(area.lastChild);
    }

    const fragment = document.createDocumentFragment();
    for (let y = 0; y < length; y++) {
        fragment.appendChild(createItem(storageData[y]));
    }
    area.appendChild(fragment);
    hint_text.style.display = "none";
    usageP.textContent = `${length} Shots．${Math.round(usageBytes / 1024 / 1024)} MB`;
    console.log("clone end.");
}


/**
 * Controls
 */

function modals() {
    function closeModal($el) {
        $el.classList.remove('is-active');
    }

    function onCloseActionTrigger(e) {
        const m = e.currentTarget.closest('.modal');
        closeModal(m);
    }

    function onOpenModalTrigger(e) {
        document.getElementById(e.currentTarget.dataset.target).classList.toggle("is-active");
    }

    (document.querySelectorAll(".modal-button") || []).forEach((trigger) => {
        if (!trigger.dataset.target) return;
        trigger.removeEventListener("click", onOpenModalTrigger);
        trigger.addEventListener("click", onOpenModalTrigger);
    });

    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach((trigger) => {
        trigger.removeEventListener('click', onCloseActionTrigger);
        trigger.addEventListener('click', onCloseActionTrigger);
    });
}


function setDark() {
    btn_mode.children[0].children[0].textContent = "light_mode";
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    mode = "dark";
}

function setLight() {
    btn_mode.children[0].children[0].textContent = "dark_mode";
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    mode = "light";
}

function buttons() {
    btn_mode.addEventListener("click", function (e) {
        if (document.body.classList.contains("dark-mode")) {
            setLight();
        }
        else {
            // if (document.body.classList.contains("light-mode")) 
            setDark();
        }
    });

    document.getElementById("btn-sort").addEventListener("click", function (e) {
        e.currentTarget.children[0].children[0].classList.toggle("rotated");
        // document.querySelectorAll(".screen")
        const children = area.children;
        for (var i = 1; i < children.length; i++) {
            area.insertBefore(area.childNodes[i], area.firstChild);
        }
    });

    const form = document.getElementById("form-setting");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        // for (const entry of data) {
        //     console.log(`${entry[0]}=${entry[1]}`);
        // }
        const download_type = data.get("download_type");
        const download_path = data.get("download_path");

        await UserSettingStorage.set({
            "download": {
                "type": download_type ? download_type : "manual", // auto | manual
                "path": download_path ? download_path : ""
            },
            "background": mode,
        });

        await getUserSettings();

    }, false);

    document.getElementById("btn-delete-all").addEventListener("click", async function (e) {
        const yes = confirm('確定要刪除所有的截圖嗎？此操作將無法復原，請先確保已經下載完畢需要的截圖。');
        if (!yes) return;
        await ScreenshotStorage.clear();
    });
}


function filters() {
    if (!storageData["honeybees_club"] || !storageData["honeybees_club"]["screenshots"]) return;

    // auto complated
    // https://www.w3schools.com/howto/howto_js_autocomplete.asp    
    function onFilterChange(e) {
        // `.screenshot[data-channel]:not([data-channel='${e.target.value}'])`
        const val = e.target.value;
        const array = (document.querySelectorAll(`.screenshot[data-channel]`) || []);
        if (val === "all") {
            array.forEach((shot) => {
                shot.style.display = "block";
            });
        } else {
            array.forEach((shot) => {
                shot.style.display = "block";
                if (shot.getAttribute("data-channel") != val) {
                    shot.style.display = "none";
                }
            });
        }
    }

    while (filter_channel.firstChild) {
        filter_channel.removeChild(filter_channel.lastChild);
    }

    const fragment = document.createDocumentFragment();

    const opt = document.createElement("option");
    opt.text = "All channels";
    opt.value = "all";
    fragment.appendChild(opt);

    const names = [...new Set(storageData["honeybees_club"]["screenshots"].map(x => x.channel.name))];
    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.text = name;
        fragment.appendChild(option);
    });
    // console.log(names);
    filter_channel.appendChild(fragment);
    // filter_channel.removeEventListener("selectionchange", onFilterChange);
    filter_channel.addEventListener("change", onFilterChange);
}
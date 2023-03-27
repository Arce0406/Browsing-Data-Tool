import * as ShotFileSysten from "../../scripts/screenshotStorage.js";

const area = document.getElementById("area");
const usageP = document.getElementById("usage");
const modal_preview = document.getElementById("modal-preview");
const modal_preview_img = document.getElementById("modal-preview-img");
const filter_channel = document.getElementById("select-channel");
let storageData, usageBytes;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    console.log("init...", new Date());
    // if (window.Worker) {} 
    await getData();
    await render();
    channelFilter();
    buttons();
    console.log("done.", new Date());
}

/**
 * Screenshot 相關
 */

async function getData() {
    storageData = await ShotFileSysten.getAll();
    usageBytes = await ShotFileSysten.usage();
    storageData["honeybees_club"]["screenshots"] = storageData["honeybees_club"]["screenshots"].reverse();
    // console.log(storageData["honeybees_club"]["screenshots"]);
}

async function render() {

    const fragment = document.createDocumentFragment();

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    function dataURItoBlob(dataURI, mimeType) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = mimeType ? mimeType : 'image/png'; //dataURI.split(',')[0].split(':')[1].split(';')[0];
        // console.log(mimeString)
        // write the bytes of the string to a typed array
        const len = byteString.length;
        const ia = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        // let ia = Uint8Array.from(Array.from(byteString).map(letter => letter.charCodeAt(0)));

        return (new Blob([ia], { type: mimeString }));
    }

    function createHeader(date) {
        const ce = document.querySelector(".sample_header").cloneNode(true);
        ce.classList.remove("sample_header");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        // console.log(ce.firstChild.nextSibling, ce.children[0])
        // ce.children[0].textContent = date;
        ce.firstChild.nextSibling.textContent = date;
        fragment.appendChild(ce);
    }

    function createItem(date, payload) {
        const ce = document.querySelector(".sample_item").cloneNode(true);
        // console.log(ce.children);
        ce.classList.remove("sample_item");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        // console.log(ce.firstChild.nextSibling.firstChild.nextSibling, ce.children[0])
        // ce.children[0].children[0].setAttribute("src", payload.dataURL);
        // ce.firstChild.nextSibling.firstChild.nextSibling.setAttribute("src", payload.dataURL);
        ce.firstChild.nextSibling.firstChild.nextSibling.setAttribute("src", window.URL.createObjectURL(dataURLtoBlob(payload.dataURL, payload.mimeType)));
        ce.setAttribute("data-channel-name", payload.channel.name);

        // delete
        // ce.children[2].children[0].children[0]
        // ce.getElementsByClassName("delete-button")[0]
        ce.querySelector(".delete-button").addEventListener("click", async function (e) {
            const yes = confirm('確定要刪除嗎？');
            if (!yes) return;
            await ShotFileSysten.remove(payload);
            await init();
        });

        // copy
        // ce.children[2].children[1].children[0]
        ce.querySelector(".copy-button").addEventListener("click", async function (e) {
            await chrome.runtime.sendMessage({ "message": "download", "payload": payload });
        });

        // download
        // ce.children[2].children[2].children[0]
        ce.querySelector(".dowmload-button").addEventListener("click", async function (e) {
            await chrome.runtime.sendMessage({ "message": "download", "payload": payload });
        });
        // preview
        // ce.children[2].children[3].children[0]
        ce.querySelector(".preview-button").addEventListener("click", function (e) {
            modal_preview_img.setAttribute("src", payload.dataURL);
            modal_preview.classList.toggle("is-active");
        });
        // console.log(ce.children[1].children[2].children[0]);

        fragment.appendChild(ce);
    }

    function modals() {
        function closeModal($el) {
            $el.classList.remove('is-active');
        }

        // Add a click event on various child elements to close the parent modal
        (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
            const $target = $close.closest('.modal');

            $close.addEventListener('click', () => {
                closeModal($target);
            });
        });
    }

    while (area.firstChild) {
        area.removeChild(area.lastChild);
    }

    if (!storageData && !storageData["honeybees_club"]) {
        return;
    }

    // console.log(res["honeybees_club"]["screenshots"]);
    // console.log(res["honeybees_club"]["user_setting"]);

    // 以date為key，reduce成新物件
    const screenshots_by_date = storageData["honeybees_club"]["screenshots"].reduce((groups, item) => {
        const date = item.created.substring(0, 10);
        // if (!groups[date]) { groups[date] = []; }
        // groups[date].push(item);
        groups[date] === undefined ? groups[date] = [] : groups[date].push(item);
        return groups;
    }, {});

    // 更新使用量
    usageP.textContent = `${storageData["honeybees_club"]["screenshots"].length} Shots．${Math.round(usageBytes / 1024 / 1024)} MB`;

    const dateStrings = Object.keys(screenshots_by_date);
    const dlength = dateStrings.length;
    for (let x = 0; x < dlength; x++) {
        const dateStr = dateStrings[x];
        createHeader(dateStr);
        const slength = screenshots_by_date[dateStr].length;
        for (let y = 0; y < slength; y++) {
            // const item = screenshots_by_date[dateStr][y];
            createItem(dateStr, screenshots_by_date[dateStr][y]);
        }
    }
    // console.log("append start...");
    area.appendChild(fragment);
    // console.log('render finish.');
    modals();
}


/**
 * Filter
 */

function buttons() {
    document.getElementById("btn-mode").addEventListener("click", function (e) {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode")
        }
        else {
            // if (document.body.classList.contains("light-mode")) 
            document.body.classList.remove("light-mode");
            document.body.classList.add("dark-mode")
        }
    });
}

function channelFilter() {
    // auto complated
    // https://www.w3schools.com/howto/howto_js_autocomplete.asp

    while (filter_channel.firstChild) {
        filter_channel.removeChild(filter_channel.lastChild);
    }

    const fragment = document.createDocumentFragment();

    const opt = document.createElement("option");
    opt.text = "Filter by channel name";
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
}


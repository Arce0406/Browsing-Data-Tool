import * as ShotFileSysten from "../../scripts/screenshotStorage.js";

const area = document.getElementById("main-area");
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

    buttons();
    filters();
    modals();
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
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    function dataURItoBlob(dataURI, mimeType) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = mimeType ? mimeType : 'image/png';
        let len = byteString.length;
        const u8arr = new Uint8Array(len);
        while (len--) {
            u8arr[len] = byteString.charCodeAt(len);
        }
        // let ia = Uint8Array.from(Array.from(byteString).map(letter => letter.charCodeAt(0)));

        return (new Blob([u8arr], { type: mimeString }));
    }

    function createHeader(date) {
        const ce = document.querySelector(".sample_header").cloneNode(true);
        ce.classList.remove("sample_header");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        // ce.children[0].textContent = date;
        // ce.firstChild.nextSibling.textContent = date;
        fragment.appendChild(ce);
    }

    async function createItem(date, payload) {
        const ce = document.querySelector(".sample_item").cloneNode(true);
        ce.classList.remove("sample_item");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        // ce.children[0].children[0].setAttribute("src", payload.dataURL);
        // ce.firstChild.nextSibling.firstChild.nextSibling.setAttribute("src", payload.dataURL);
        const blob = dataURLtoBlob(payload.dataURL, payload.mimeType);
        ce.children[0].children[0].setAttribute("src", window.URL.createObjectURL(blob));
        // if(payload.lowQualityDataURL){
        //     console.log(payload.dataURL);
        //     console.log(payload.lowQualityDataURL);
        //     console.log(blobURL);
        // }
        ce.setAttribute("data-channel-name", payload.channel.name);

        // delete
        // ce.children[2].children[0].children[0]
        // ce.getElementsByClassName("delete-button")
        // ce.querySelector(".delete-button")
        ce.children[2].children[0].children[0].addEventListener("click", async function (e) {
            const yes = confirm('確定要刪除嗎？');
            if (!yes) return;
            await ShotFileSysten.remove(payload);
            await init();
        });

        // copy
        // ce.children[2].children[1].children[0]
        // ce.querySelector(".copy-button")
        ce.children[2].children[1].children[0].addEventListener("click", async function (e) {
            navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        });

        // download
        // ce.children[2].children[2].children[0]
        // ce.querySelector(".dowmload-button")
        ce.children[2].children[2].children[0].addEventListener("click", async function (e) {
            await chrome.runtime.sendMessage({ "message": "download", "payload": payload });
        });

        // preview
        // ce.children[2].children[3].children[0]
        // ce.querySelector(".preview-button")
        ce.children[2].children[3].children[0].addEventListener("click", function (e) {
            modal_preview_img.setAttribute("src", payload.dataURL);
            modal_preview.classList.toggle("is-active");
        });
        // console.log(ce.children[1].children[2].children[0]);

        fragment.appendChild(ce);
    }

    while (area.firstChild) {
        area.removeChild(area.lastChild);
    }

    if (!storageData && !storageData["honeybees_club"]) {
        return;
    }

    // console.log(storageData["honeybees_club"]["screenshots"]);
    // console.log(storageData["honeybees_club"]["user_setting"]);

    // 以date為key，reduce成新物件
    const screenshots_by_date = storageData["honeybees_club"]["screenshots"].reduce((groups, item) => {
        const date = item.created.substring(0, 10);
        if (!groups[date]) { groups[date] = []; }
        groups[date].push(item);
        return groups;
    }, {});


    const dateStrings = Object.keys(screenshots_by_date);
    const dlength = dateStrings.length;
    for (let x = 0; x < dlength; x++) {
        const dateStr = dateStrings[x];
        createHeader(dateStr);
        const slength = screenshots_by_date[dateStr].length;
        for (let y = 0; y < slength; y++) {
            createItem(dateStr, screenshots_by_date[dateStr][y]);
        }
    }

    // console.log("append start...");
    document.getElementById("loading").style.display = "none";
    // 加入images
    area.appendChild(fragment);    
    // 更新使用量
    usageP.textContent = `${storageData["honeybees_club"]["screenshots"].length} Shots．${Math.round(usageBytes / 1024 / 1024)} MB`;
    // console.log('render finish.');
    modals();
}


/**
 * Controls
 */

function modals() {
    function closeModal($el) {
        $el.classList.remove('is-active');
    } 
    
    function onclick(e) {
        const m = e.currentTarget.closest('.modal');
        closeModal(m);
    }

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach((trigger) => {        
        trigger.removeEventListener('click',onclick);
        trigger.addEventListener('click', onclick);
    });
}

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

function filters() {
    // auto complated
    // https://www.w3schools.com/howto/howto_js_autocomplete.asp

    function onFilterChange(e){

    }

    while (filter_channel.firstChild) {
        filter_channel.removeChild(filter_channel.lastChild);
    }

    const fragment = document.createDocumentFragment();

    const opt = document.createElement("option");
    opt.text = "Filter by channel name";
    opt.addEventListener("selectionchange", onFilterChange);
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
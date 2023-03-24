import * as FileSysten from "../../scripts/fileSystem.js";

const area = document.getElementById("area");
const usageP = document.getElementById("usage");
const modal_preview = document.getElementById("modal-preview");
const modal_preview_img = document.getElementById("modal-preview-img");
const filter_channel = document.getElementById("select-channel");
let storageData, usageBytes;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    console.log("init...");
    await getData();
    await render();
    channelFilter();
}

async function getData() {
    storageData = await FileSysten.getAll();
    usageBytes = await FileSysten.usage();
    console.log(storageData);
}

async function render() {

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
        if (!groups[date]) { groups[date] = []; }
        groups[date].push(item);
        return groups;
    }, {});

    // 更新使用量
    usageP.textContent = `${storageData["honeybees_club"]["screenshots"].length} Shots．${Math.round(usageBytes / 1024 / 1024)} Megabyte (MB)`;

    const keys = Object.keys(screenshots_by_date);
    for (let x = 0; x < keys.length; x++) {
        const key = keys[x];
        createHeader(key);
        for (let y = 0; y < screenshots_by_date[key].length; y++) {
            const item = screenshots_by_date[key][y];
            createItem(item);
        }
    }
    // console.log('render finish.');
    modals();
}

function channelFilter() {
    // auto complated
    // https://www.w3schools.com/howto/howto_js_autocomplete.asp

    while (filter_channel.firstChild) {
        filter_channel.removeChild(filter_channel.lastChild);
    }

    const opt = document.createElement("option");
    opt.text = "Filter by channel name";
    filter_channel.appendChild(opt);

    const names = [...new Set(storageData["honeybees_club"]["screenshots"].map(x => x.channel.name))];
    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.text = name;
        filter_channel.appendChild(option);
    });
    // console.log(names);
}

function createHeader(t) {
    const ce = document.querySelector(".sample_header").cloneNode(true);
    ce.classList.remove("sample_header");
    ce.style.display = "block";
    ce.children[0].textContent = t;
    area.appendChild(ce);
}

function createItem(t) {
    const ce = document.querySelector(".sample_item").cloneNode(true);
    // console.log(ce.children);
    ce.classList.remove("sample_item");
    ce.style.display = "block";
    ce.children[0].children[0].setAttribute("src", t.dataURL);
    ce.setAttribute("data-channel-name", t.channel.name);

    // delete
    ce.children[2].children[0].children[0].addEventListener("click", async function (e) {
        await chrome.runtime.sendMessage({ "message": "delete", "payload": t });
        console.log("delete finish.");
        await init();
    });
    // download
    ce.children[2].children[1].children[0].addEventListener("click", async function (e) {
        await chrome.runtime.sendMessage({ "message": "download", "payload": t });
    });
    // preview
    ce.children[2].children[2].children[0].addEventListener("click", function (e) {
        modal_preview_img.setAttribute("src", t.dataURL);
        modal_preview.classList.toggle("is-active");
    });
    // console.log(ce.children[1].children[2].children[0]);

    area.appendChild(ce);
}

function modals() {
    // console.log('modals.');

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
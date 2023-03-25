import * as ShotFileSysten from "../../scripts/screenshotStorage.js";

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
    buttons();
}

/**
 * Screenshot 相關
 */

async function getData() {
    storageData = await ShotFileSysten.getAll();
    usageBytes = await ShotFileSysten.usage();
    // console.log(storageData["honeybees_club"]["screenshots"].length);
}

async function render() {

    function createHeader(date) {
        const ce = document.querySelector(".sample_header").cloneNode(true);
        ce.classList.remove("sample_header");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        ce.children[0].textContent = date;
        area.appendChild(ce);
    }

    function createItem(date, payload) {
        const ce = document.querySelector(".sample_item").cloneNode(true);
        // console.log(ce.children);
        ce.classList.remove("sample_item");
        ce.setAttribute("data-datetime", date);
        ce.style.display = "block";
        ce.children[0].children[0].setAttribute("src", payload.dataURL);
        ce.setAttribute("data-channel-name", payload.channel.name);

        // delete
        ce.children[2].children[0].children[0].addEventListener("click", async function (e) {
            const yes = confirm('確定要刪除嗎？');
            if (!yes) return;

            await ShotFileSysten.remove(payload);
            console.log("delete finish.");
            await init();
        });
        // download
        ce.children[2].children[1].children[0].addEventListener("click", async function (e) {
            await chrome.runtime.sendMessage({ "message": "download", "payload": payload });
        });
        // preview
        ce.children[2].children[2].children[0].addEventListener("click", function (e) {
            modal_preview_img.setAttribute("src", payload.dataURL);
            modal_preview.classList.toggle("is-active");
        });
        // console.log(ce.children[1].children[2].children[0]);

        area.appendChild(ce);
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
        if (!groups[date]) { groups[date] = []; }
        groups[date].push(item);
        return groups;
    }, {});

    // 更新使用量
    usageP.textContent = `${storageData["honeybees_club"]["screenshots"].length} Shots．${Math.round(usageBytes / 1024 / 1024)} Megabyte (MB)`;

    const dateStrings = Object.keys(screenshots_by_date);
    for (let x = 0; x < dateStrings.length; x++) {
        const dateStr = dateStrings[x];
        createHeader(dateStr);
        for (let y = 0; y < screenshots_by_date[dateStr].length; y++) {
            const item = screenshots_by_date[dateStr][y];
            createItem(dateStr, item);
        }
    }
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


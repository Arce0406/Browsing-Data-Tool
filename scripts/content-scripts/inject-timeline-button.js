/**
 * Mointer message from extension
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request.command);
    if (request.command === "timeline") {
        main();
        const result = ""; // await screenshot();
        sendResponse({ result: result });
        return true;
    }
});


function main() {
    createFloatTimelinePanel();
    generateTimelineAppendButton();
}
main();

/**
 * Storage Data
 */

function _getStoargeKey() {
    const urlParams = new URLSearchParams(window.location.search);
    return `honeybeesclub_youtube_timeline_${urlParams.get("v")}`;
}

async function readTimelineDataFromStorage() {
    const key = _getStoargeKey();
    const result = await chrome.storage.local.get(key);
    refershTimelinePanel(result[key]);
}

async function setTimelineDataToStoarge() {
    const obj = {};
    const key = _getStoargeKey();
    const data = _getAllTimelineItmes();
    obj[key] = data;
    const r = await chrome.storage.local.set(obj);
    return r;
}

/**
 * Player Button & Tooltip
 */

function customButtonToolTip(text, isDisplay) {
    const div1 = document.createElement("div");
    div1.setAttribute("aria-live", "polite");
    div1.setAttribute("data-layer", "4")
    div1.style.maxWidth = "300px";
    if (isDisplay) div1.style.display = "block";
    else div1.style.display = "none";
    div1.style.top = "0px";
    div1.style.left = "0px";
    div1.className = "ytp-tooltip ytp-rounded-tooltip ytp-bottom";

    const div1_1 = document.createElement("div");
    div1_1.className = "ytp-tooltip-text-wrapper";
    div1_1.setAttribute("aria-hidden", "true")

    const span = document.createElement("span");
    span.className = "ytp-tooltip-text ytp-tooltip-text-no-title";
    // span.style.color = "#eee !important";
    span.style.setProperty("color", "#eee", "important");
    span.style.setProperty("font-size", "13px");
    span.textContent = text;

    // const div1_2 = document.createElement("div");
    // div1_2.className = "ytp-tooltip-bg";

    // const div1_2_1 = document.createElement("div");
    // div1_2_1.className = "ytp-tooltip-duration";

    div1_1.appendChild(span);
    // div1_2.appendChild(div1_2_1);
    div1.appendChild(div1_1);
    // div1.appendChild(div1_2);
    return div1;
}

function generateTimelineAppendButton() {
    // console.log("createTimelineAppendButton...");
    const _id = "ytb-timeline-append-button";
    if (document.getElementById(_id) === null) {
        const svg_id = "447";
        const ytbTimelineButton = document.createElement("button");
        ytbTimelineButton.className = `${_id} ytp-button ytp-settings-button`;
        ytbTimelineButton.id = _id;
        ytbTimelineButton.setAttribute("data-title-no-tooltip", "Take a Screenshot");
        ytbTimelineButton.setAttribute("aria-label", "時間軸鍵盤快速鍵↑");
        ytbTimelineButton.setAttribute("aria-keyshortcuts", "↑");
        ytbTimelineButton.setAttribute("aria-pressed", "false");
        ytbTimelineButton.innerHTML = `<svg height="100%" width="100%" fill-opacity="1" version="1.1" viewBox="-8 -8 40 40"><use class="ytp-svg-shadow" xlink:href="#ytp-id-${svg_id}"></use><path d="M12,14A6,6,0,1,0,6,8,6,6,0,0,0,12,14ZM12,3.8A4.2,4.2,0,1,1,7.8,8,4.2,4.2,0,0,1,12,3.8Zm2.61,3.4H12.8V5H11.2V8.8h3.41ZM20,20V17H18v3H13V17H11v3H6V17H4v3H1v2H23V20Z" fill="#fff" id="ytp-id-${svg_id}"/></svg>`;

        const ytpRightControls = document.querySelector("#movie_player .ytp-right-controls");
        ytpRightControls.insertBefore(ytbTimelineButton, ytpRightControls.childNodes[1]);

        const tooltip = customButtonToolTip("時間軸 (Ctrl + ↑ )", true);
        const btn = document.getElementById(_id);
        btn.addEventListener("click", async (e) => {
            const v = document.querySelector(".video-stream.html5-main-video");
            const currentTime = v.currentTime;
            const input_timestamp = document.getElementById("timeline-timestamp");
            input_timestamp.value = new Date(currentTime * 1000).toISOString().substring(11, 19);
            input_timestamp.setAttribute("data-current-time", currentTime);
            toggleTimelineFloatPanel();
        });
        btn.addEventListener("mouseover", function (e) {
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left - 25 + 'px';
            tooltip.style.top = rect.top - 40 + 'px';
            document.body.appendChild(tooltip);
        });

        btn.addEventListener("mouseleave", function (e) {
            document.body.removeChild(tooltip);
        });
    }
}

/**
 * Float Panel
 */

function _getTimelimePanelID() {
    return "yt-timeline-float-panel";
}

function _getAllTimelineItmes() {
    return Array
        .from((document.querySelectorAll("#yt-timelines .yt-timeline") || []))
        .map(x => ({ "timestamp": x.getAttribute("data-time"), "title": x.getAttribute("data-title"), "current": x.getAttribute("data-current-time") }));
    // .map(x => `${x.getAttribute("data-time")} ${x.getAttribute("data-title")}`)    
}

function _createTimelineButton() {
    const btn = document.createElement("button");
    btn.style.backgroundColor = "white";
    btn.style.borderColor = "transparent";
    btn.style.color = "#0a0a0a";
    btn.style.cursor = "pointer";
    btn.style.justifyContent = "center";
    btn.style.display = "inline-flex";
    btn.style.textAlign = "center";
    btn.style.alignItems = "center";
    btn.style.whiteSpace = "nowrap";
    // btn.style.lineHeight = "1.5";
    btn.style.height = "2.5em";
    // btn.style.padding = "1em";
    return btn;
}

function _createTimelineItme(time, currentTime, title) {
    const div = document.createElement("div");
    div.className = "yt-timeline";
    div.setAttribute("data-time", time);
    div.setAttribute("data-current-time", currentTime);
    div.setAttribute("data-title", title);
    div.style.display = "flex";
    div.style.alignItems = "center";

    const a = document.createElement("a");
    const urlParams = new URLSearchParams(window.location.search);
    a.href = `https://youtu.be/${urlParams.get("v")}?t=${Math.floor(currentTime)}`;
    a.textContent = time;

    const p = document.createElement("p");
    p.style.marginLeft = "0.5rem"
    p.textContent = title;

    const btn_wrapper = document.createElement("div");
    btn_wrapper.style.display = "flex";
    btn_wrapper.style.alignItems = "center";
    btn_wrapper.style.flexGrow = "1";
    btn_wrapper.style.justifyContent = "flex-end";
    btn_wrapper.style.marginBottom = "-0.5rem";

    const btn = _createTimelineButton();
    btn.style.color = "#f14668";
    btn.style.marginBottom = "0.5rem";
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" height="16" width="16"><path d="M261 936q-24.75 0-42.375-17.625T201 876V306h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438V306ZM367 790h60V391h-60v399Zm166 0h60V391h-60v399ZM261 306v570-570Z" /></svg>`;
    btn.addEventListener("click", function () {
        if (confirm("確定要刪除此項 timestamp ? (刪除後將無法復原)")) {
            document.getElementById("yt-timelines").removeChild(div);
            setTimelineDataToStoarge();
        }
    });

    btn_wrapper.appendChild(btn);
    div.appendChild(a);
    div.appendChild(p);
    div.appendChild(btn_wrapper);

    return div;
}

function _createFloatTimelineHeader() {
    const header = document.createElement("div");
    header.id = "yt-timeline-header";
    header.style.display = "flex";
    header.style.justifyContent = "center";
    header.style.alignItems = "center";

    const p = document.createElement("p");
    p.style.flexGrow = "1";
    p.style.display = "block";
    p.style.color = "#363636";
    p.style.fontSize = "1rem";
    p.style.fontWeight = "600";
    p.style.lineHeight = "1.125";
    p.style.margin = "0";
    p.style.marginBlockStart = "1em";
    p.style.marginBlockEnd = "1em";
    p.style.padding = "0";
    p.textContent = "時間軸";
    header.appendChild(p);

    const btn = _createTimelineButton();
    btn.addEventListener("click", function () {
        // const str = Array
        //     .from(_getAllTimelineItmes())
        //     .map(x => `${x.getAttribute("data-time")} ${x.getAttribute("data-title")}`)
        //     .join("\r\n");
        const str = _getAllTimelineItmes()
            .map(x => `${x["timestamp"]} ${x["title"]}`)
            .join("\r\n");
        navigator.clipboard.writeText(str);
        alert("Timeline has copied.");
    });
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" height="16" width="16"><path d="m661 920 117-117v99h30V752H658v30h99L640 899l21 21Zm-481 16q-24.75 0-42.375-17.625T120 876V276q0-24.75 17.625-42.375T180 216h600q24.75 0 42.375 17.625T840 276v329q-14-8-29.5-13t-30.5-8V276H180v600h309q4 16 9.023 31.172Q503.045 922.345 510 936H180Zm0-107v47-600 308-4 249Zm100-53h211q4-16 9-31t13-29H280v60Zm0-170h344q14-7 27-11.5t29-8.5v-40H280v60Zm0-170h400v-60H280v60Zm452.5 579q-77.5 0-132.5-55.5T545 828q0-78.435 54.99-133.718Q654.98 639 733 639q77 0 132.5 55.282Q921 749.565 921 828q0 76-55.5 131.5t-133 55.5Z" /></svg>`;
    header.appendChild(btn);

    return header;
}

function _createFloatTimelineFooter() {

    function _appandTimelineItem(time, currentTime, title) {
        const item = _createTimelineItme(time, currentTime, title);
        const parent = document.getElementById("yt-timelines");
        parent.appendChild(item);
    }

    function input() {
        const input = document.createElement("input");
        input.type = "text";
        input.style.borderBottomRightRadius = "0";
        input.style.borderTopRightRadius = "0";
        input.style.maxWidth = "100%";
        input.style.height = "2.5em";
        // input.style.width = "100%";
        input.style.boxShadow = "inset 0 0.0625em 0.125em rgba(10,10,10,.05)";
        input.style.backgroundColor = "white";
        input.style.border = "1px solid #dbdbdb";
        input.style.borderRadius = "4px";
        input.style.color = "#363636";
        input.style.fontSize = "1rem";
        input.style.lineHeight = "1.5";
        input.style.display = "inline-flex";
        input.style.alignItems = "center";
        input.style.justifyContent = "flex-start";

        return input;
    }

    const footer = document.createElement("div");
    footer.id = "yt-timeline-footer";
    footer.style.display = "flex";
    footer.style.alignItems = "center";
    footer.style.marginBottom = "0.5rem";

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "flex-start"

    const c1 = document.createElement("p");
    const tb1 = input();
    tb1.id = "timeline-timestamp";
    tb1.size = "4";
    tb1.style.width = "auto";
    c1.appendChild(tb1);
    footer.appendChild(c1);

    const c2 = document.createElement("p");
    c2.style.flexGrow = "1";
    const tb2 = input();
    tb2.id = "timeline-title";
    tb2.style.width = "97%";
    tb2.addEventListener("keypress", function (e) {
        if (e.key != "Enter") return;
        if (!tb1.value || !tb2.value) return;
        _appandTimelineItem(tb1.value, tb1.getAttribute("data-current-time"), tb2.value);
        tb1.value = "";
        tb2.value = "";
        setTimelineDataToStoarge();
    });
    c2.appendChild(tb2);
    footer.appendChild(c2);

    const btn = _createTimelineButton();
    // btn.style.flexGrow = "1";
    // btn.style.justifyContent = "flex-end";
    btn.addEventListener("click", function () {
        if (!tb1.value || !tb2.value) return;
        _appandTimelineItem(tb1.value, tb1.getAttribute("data-current-time"), tb2.value);
        tb1.value = "";
        tb2.value = "";
        setTimelineDataToStoarge();
    });

    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" height="16" width="16"><path d="M450 856V606H200v-60h250V296h60v250h250v60H510v250h-60Z" /></svg>`;
    footer.appendChild(btn);

    return footer;
}

function createFloatTimelinePanel() {
    const _timelimePanelID = _getTimelimePanelID();
    const panel = document.getElementById(_timelimePanelID);
    if (!panel) {
        // yt-timeline-float-panel
        const panel = document.createElement("div");
        panel.id = _timelimePanelID;
        panel.style.backgroundColor = "white";
        panel.style.borderRadius = "5px";
        panel.style.height = "500px";
        panel.style.width = "300px";
        panel.style.position = "fixed";
        panel.style.overflow = "hidden";
        panel.style.bottom = "2rem";
        panel.style.right = "3rem";
        panel.style.margin = "auto";
        panel.style.padding = "0.5rem 1.5rem";
        panel.style.zIndex = "9999";
        panel.style.display = "none";
        panel.style.flexDirection = "column";

        // header - yt-timeline-buttons
        const header = _createFloatTimelineHeader();
        const footer = _createFloatTimelineFooter();

        // yt-timelines
        const yt_timelines = document.createElement("div");
        yt_timelines.id = "yt-timelines";
        yt_timelines.style.display = "flex";
        yt_timelines.style.flexDirection = "column";
        yt_timelines.style.flexGrow = "1";
        yt_timelines.style.height = "400px";
        yt_timelines.style.overflowY = "auto";

        panel.appendChild(header);
        panel.appendChild(yt_timelines);
        panel.appendChild(footer);

        document.body.appendChild(panel);

        readTimelineDataFromStorage();
    } else {
        readTimelineDataFromStorage();
        toggleTimelineFloatPanel(true);
    }
}

function refershTimelinePanel(data) {
    document.getElementById("timeline-timestamp").value = "";
    document.getElementById("timeline-title").value = "";
    document.getElementById("yt-timelines").innerHTML = "";

    if (!data) return;
    const fragment = document.createDocumentFragment();
    data.forEach(element => {
        const item = _createTimelineItme(element.timestamp, element.current, element.title);
        fragment.appendChild(item);
    });
    const parent = document.getElementById("yt-timelines");
    parent.appendChild(fragment);
}

function toggleTimelineFloatPanel(isForcedClose) {
    const _timelimePanelID = _getTimelimePanelID();
    const panel = document.getElementById(_timelimePanelID);
    if (!panel) return;

    if (isForcedClose || panel.style.display === "flex") {
        panel.style.display = "none";
    }
    else {
        panel.style.display = "flex";
    }
}

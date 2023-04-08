/**
 * Mointer message from extension
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request.command);
    if (request.command === "timeline") {
        const result = ""; // await screenshot();
        sendResponse({ result: result });
        return true;
    }
});



function findYoutubeVideoInfo() {
    // const titleElement = document.querySelector('#title.ytd-watch-metadata');
    const v = document.querySelector(".video-stream.html5-main-video");
    const upload_info = document.querySelector('#top-row > #owner > ytd-video-owner-renderer > #upload-info > #channel-name > #container > #text-container > #text > a');
    return {
        "created": new Date(Date.now()).toISOString(),
        "title": document.querySelector('#title.ytd-watch-metadata > h1').innerText,
        "video": v,
        "details": {
            "url": window.location.href,
            "current": v.currentTime,
        },
        "channel": {
            "name": upload_info.textContent,
            "url": upload_info.getAttribute("href"),
            // "thumbnail": upload_info.children[0].children[0].getAttribute("src")
        },
        "size": {
            "width": v.videoWidth,
            "height": v.videoHeight
        },
    };
}

function timelineEditor() {

}

function timelinePreview() {

}

/**
 * Create button tooltip
 * @param {String} text 
 * @param {Boolean} isDisplay 
 * @returns 
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

function createTimelineAppendButton() {
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
        // document.body.appendChild(div1);
        const btn = document.getElementById(_id);
        btn.addEventListener("click", async (e) => {
            toggleTimelineFloatPanel();
            const info = findYoutubeVideoInfo();
            console.log(info);
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


const _timelimePanelID = "ytb-timeline-float-panel";

function createTimelineFloatPanel() {
    console.log("createTimelineFloatPanel...");
    const panel = document.getElementById(_timelimePanelID);
    if (!panel) {
        const div = document.createElement("div");
        div.id = _timelimePanelID;
        div.style.position = "fixed";
        div.style.bottom = "2rem";
        div.style.right = "3rem";
        div.style.padding = "1.5rem";
        div.style.zIndex = "9999";
        div.style.display = "none";
        div.style.backgroundColor = "white";
        div.style.borderRadius = "5px";

        const p = document.createElement("p");
        // p.textContent = "Screen successed, also copied to clipbaoard.";
        p.textContent = "截圖成功, 並且已複製到剪貼簿";
        p.style.marginTop = "1rem";
        p.style.textAlign = "center";

        div.appendChild(p);
        document.body.appendChild(div);
    }
}

function toggleTimelineFloatPanel() {
    const panel = document.getElementById(_timelimePanelID);
    console.log(panel);
    if (!panel) return;
    console.log(panel.style.display);
    if (panel.style.display === "none") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}



createTimelineFloatPanel();
createTimelineAppendButton();
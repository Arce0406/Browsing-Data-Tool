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
    const _id = "ytb-timeline-append-button";
    if (document.getElementById(_id) === null) {
        const ytbVideoScreenshotButton = document.createElement("button");
        ytbVideoScreenshotButton.className = `${_id} ytp-button ytp-settings-button`;
        ytbVideoScreenshotButton.id = _id;
        ytbVideoScreenshotButton.setAttribute("data-title-no-tooltip", "Take a Screenshot");
        ytbVideoScreenshotButton.setAttribute("aria-label", "時間軸鍵盤快速鍵↑");
        ytbVideoScreenshotButton.setAttribute("aria-keyshortcuts", "↑");
        ytbVideoScreenshotButton.setAttribute("aria-pressed", "false");
        ytbVideoScreenshotButton.innerHTML = `<svg data-name="Layer 1" id="Layer_1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title/><path d="M12,14A6,6,0,1,0,6,8,6,6,0,0,0,12,14ZM12,3.8A4.2,4.2,0,1,1,7.8,8,4.2,4.2,0,0,1,12,3.8Zm2.61,3.4H12.8V5H11.2V8.8h3.41ZM20,20V17H18v3H13V17H11v3H6V17H4v3H1v2H23V20Z"/></svg>`;

        const ytpRightControls = document.querySelector("#movie_player .ytp-right-controls");
        ytpRightControls.insertBefore(ytbVideoScreenshotButton, ytpRightControls.childNodes[1]);

        const tooltip = customButtonToolTip("時間軸 (Ctrl + ↑ )", true);
        // document.body.appendChild(div1);
        const btn = document.getElementById(_id);
        btn.addEventListener("click", async (e) => {
           
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
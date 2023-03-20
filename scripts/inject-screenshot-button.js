function toast() { }

async function screenshot() {
    const video = document.querySelector(".video-stream.html5-main-video");
    if (!video) {
        console.log("找不到 Video.");
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');

    // Download by chrome.downloads
    const response = await chrome.runtime.sendMessage({ message: "file", url: image });

    // Download directly
    // const link = document.createElement("a");
    // link.style.display = "none";
    // link.href = image;
    // const currentdate = new Date(); 
    // link.download = `Screenshot ${currentdate.toISOString()}.png`;
    // document.body.appendChild(link);
    // link.click();
    // setTimeout(() => {
    //     URL.revokeObjectURL(link.href);
    //     link.parentNode.removeChild(link);
    // }, 0);
}


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

function createTakeVideoScreenshotButton() {
    const _id = "ytb-screenshot-button";
    if (document.getElementById(_id) === null) {
        const ytpRightControls = document.querySelector("#movie_player .ytp-right-controls");
        const ytbVideoScreenshotButton = document.createElement("button");
        ytbVideoScreenshotButton.className = `${_id} ytp-button ytp-settings-button`;
        ytbVideoScreenshotButton.id = _id;
        ytbVideoScreenshotButton.setAttribute("data-title-no-tooltip", "Take a Screenshot");
        ytbVideoScreenshotButton.setAttribute("aria-label", "字幕鍵盤快速鍵s");
        ytbVideoScreenshotButton.setAttribute("aria-keyshortcuts", "s");
        ytbVideoScreenshotButton.setAttribute("aria-pressed", "false");
        ytbVideoScreenshotButton.innerHTML = `<svg height="100%" version="1.1" viewBox="-8 -8 40 40" width="100%" fill-opacity="1"><use class="ytp-svg-shadow" xlink:href="#ytp-id-446"></use><path d="M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 19h3v-2H5v-2H3v3a1 1 0 0 0 1 1zM19 4a1 1 0 0 0-1-1h-3v2h2v2h2V4zM5 5h2V3H4a1 1 0 0 0-1 1v3h2V5zM3 9h2v4H3zm14 0h2v3h-2zM9 3h4v2H9zm0 14h3v2H9z" fill="#fff" id="ytp-id-446"/></svg>`;

        ytpRightControls.insertBefore(ytbVideoScreenshotButton, ytpRightControls.childNodes[0]);

        const tooltip = customButtonToolTip("截圖 (s)", true);
        // document.body.appendChild(div1);
        const btn = document.getElementById(_id);
        btn.addEventListener("click", async (e) => {
            // const response = await chrome.runtime.sendMessage({ message: "hello" });
            // if (response) console.log('waiting...');
            screenshot();
        });
        btn.addEventListener("mouseover", function (e) {
            // const tooltip = document.querySelector(".ytp-tooltip.ytp-rounded-tooltip.ytp-bottom");
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left - 5 + 'px';
            tooltip.style.top = rect.top - 40 + 'px';
            document.body.appendChild(tooltip);
        });

        btn.addEventListener("mouseleave", function (e) {
            // const tooltip = document.querySelector(".ytp-tooltip.ytp-rounded-tooltip.ytp-bottom");
            // tooltip.style.display = "none";
            document.body.removeChild(tooltip);
        });
    }
}

createTakeVideoScreenshotButton();
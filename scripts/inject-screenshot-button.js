/**
 * Mointer message from extension
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request.command);
    if (request.command === "screenshot") {
        const result = await screenshot();
        sendResponse({ result: result });
        return true;
    }
});


/**
 * Get video infomation (from DOM)
 * @returns {*} Video info struct
 */
function findYoutubeVideoInfo() {
    // const titleElement = document.querySelector('#title.ytd-watch-metadata');
    const v = document.querySelector(".video-stream.html5-main-video");
    const upload_info = document.querySelector('#top-row > #owner > ytd-video-owner-renderer > #upload-info > #channel-name > #container > #text-container > #text > a');
    return {
        "created": new Date(Date.now()).toISOString(),
        "video": v,
        "title": document.querySelector('#title.ytd-watch-metadata > h1').innerText,
        "channel": {
            "name": upload_info.textContent,
            "url": upload_info.getAttribute("href")
        },
        "size": {
            "width": v.videoWidth,
            "height": v.videoHeight
        },
    };
}

/**
 * Create DOM for toast
 * @param {String} image 
 * @returns {Element} DOM
 */
function toastElement(image) {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.bottom = "2rem";
    div.style.right = "3rem";
    div.style.padding = "1.5rem";
    div.style.zIndex = "9999";
    div.style.opacity = "0";
    div.style.backgroundColor = "white";
    div.style.borderRadius = "5px";

    const p = document.createElement("p");
    // p.textContent = "Screen successed, also copied to clipbaoard.";
    p.textContent = "截圖成功, 並且已複製到剪貼簿";
    p.style.marginTop = "1rem";
    p.style.textAlign = "center";

    const img = document.createElement("img");
    img.src = image;
    img.style.width = "384px";
    img.style.height = "216px";
    // img.style.position = "absolute";

    div.appendChild(img);
    div.appendChild(p);

    return div;
}

/**
 * Show preview screenshot image
 * @param {*} image 
 */
function toastForScreenShot(info) {
    const img = toastElement(info.dataURL);
    document.body.appendChild(img);
    // Animation
    const animate1 = img.animate([{ opacity: 0 }, { opacity: 1 }], { fill: 'forwards', duration: 150 });
    animate1.addEventListener("finish", function () {
        // console.log("animation finish.");
        setTimeout(() => {
            const animate2 = img.animate([{ opacity: 1 }, { opacity: 0 }], { fill: 'forwards', duration: 100 });
            animate2.addEventListener("finish", () => { img.parentNode.removeChild(img); });
        }, 3000);
    });
}

/**
 * Download by invoke DOM
 * @param {String} image 
 */
function downloadFrontend(image) {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = image;
    const currentdate = new Date();
    link.download = `Screenshot ${currentdate.toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 0);
}

/**
 * Download by chrome.downloads
 * @param {String} image 
 * @returns {*} response
 */
async function downloadBackend(file) {
    delete file.video;
    const response = await chrome.runtime.sendMessage({ "message": "download", "payload": file });
    return response;
}

async function saveToStorage(file) {
    // console.log(file);
    if (file["video"]) delete file.video;
    const response = await chrome.runtime.sendMessage({ "message": "save", "payload": file });
    return response;
}

/**
 * Excute screenshot process
 * @returns {String?} Image data url
 */
async function screenshot() {
    const info = findYoutubeVideoInfo();
    if (!info.video) {
        console.log("找不到 Video.");
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = info.size.width;
    canvas.height = info.size.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(info.video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    info.dataURL = dataURL;
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    // info.blob = blob;
    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    // console.log(image);
    // Download 
    // downloadBackend(image);
    // downloadFrontend(image);

    // Toast
    toastForScreenShot(info);

    // Save
    saveToStorage(info);

    return dataURL;
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

/**
 * Create button
 */
function createTakeVideoScreenshotButton() {
    const _id = "ytb-screenshot-button";
    if (document.getElementById(_id) === null) {
        const ytbVideoScreenshotButton = document.createElement("button");
        ytbVideoScreenshotButton.className = `${_id} ytp-button ytp-settings-button`;
        ytbVideoScreenshotButton.id = _id;
        ytbVideoScreenshotButton.setAttribute("data-title-no-tooltip", "Take a Screenshot");
        ytbVideoScreenshotButton.setAttribute("aria-label", "字幕鍵盤快速鍵s");
        ytbVideoScreenshotButton.setAttribute("aria-keyshortcuts", "s");
        ytbVideoScreenshotButton.setAttribute("aria-pressed", "false");
        ytbVideoScreenshotButton.innerHTML = `<svg height="100%" version="1.1" viewBox="-8 -8 40 40" width="100%" fill-opacity="1"><use class="ytp-svg-shadow" xlink:href="#ytp-id-446"></use><path d="M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 19h3v-2H5v-2H3v3a1 1 0 0 0 1 1zM19 4a1 1 0 0 0-1-1h-3v2h2v2h2V4zM5 5h2V3H4a1 1 0 0 0-1 1v3h2V5zM3 9h2v4H3zm14 0h2v3h-2zM9 3h4v2H9zm0 14h3v2H9z" fill="#fff" id="ytp-id-446"/></svg>`;

        const ytpRightControls = document.querySelector("#movie_player .ytp-right-controls");
        ytpRightControls.insertBefore(ytbVideoScreenshotButton, ytpRightControls.childNodes[1]);

        const tooltip = customButtonToolTip("截圖 (Ctrl + ↓ )", true);
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
            tooltip.style.left = rect.left - 25 + 'px';
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
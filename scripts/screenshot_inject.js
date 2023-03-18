(function () {
    function send() {
        chrome.runtime.sendMessage(
            {
                message: "screenShotResult",
                title: "偵測中...",
                header: "-",
                subheader: "yellow",
            },
            function (response) {
                if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
                if (response) console.log('waiting...');
            }
        );
    }

    const video = document.querySelector(".video-stream.html5-main-video");
    if (!video) {
        console.log("找不到 Video.");
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    // console.log(image);

    // Download directly
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
}());
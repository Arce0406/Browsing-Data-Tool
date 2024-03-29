function onended(video) {
    video.addEventListener("ended", async (event) => {
        await chrome.runtime.sendMessage(
            {
                "message": "youtubeEnded",
                "payload": {
                    "current": new Date(),
                    // "tabid": "",
                    "video": {
                        "url": window.location.href,
                        "duration": video.duration
                    }
                }
            });
    });
}
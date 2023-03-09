(function () {


  function g(tabId, stream) {
    const f = {};
    const audioCtx = new window.AudioContext();
    const m = audioCtx.createMediaStreamSource(stream);
    const g = audioCtx.createGain();
    m.connect(g);
    g.connect(audioCtx.destination);
    (f[tabId] = f[tabId] || {}),
      (f[tabId]["audioContext"] = d),
      (f[tabId]["gainNode"] = g);
  }

  function changeVolume(tabId, volumeValue) {
    f[tabId]["gainNode"].gain.value = volumeValue / 100;
  }

  chrome.tabCapture.capture({ audio: true, video: false }, (b) => {
    chrome.runtime.lastError
      ? console.error(chrome.runtime.lastError)
      : (g(a.tabId, b),
        changeVolume(a.tabId, a.volumeValue));
  });
});

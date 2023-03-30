
self.addEventListener('message', async function (e) {
    self.postMessage(e.data);
    let parameters = {}
    location.search.slice(1).split("&").forEach(function (key_value) {
        var kv = key_value.split("=");
        parameters[kv[0]] = kv[1];
    });
    const url = parameters["dataurl"];
    return await (await fetch(url)).blob()
}, false);


        // let w = new Worker(`./url2Blob.js?dataurl=${payload.dataURL}`);
        // worker.onmessage = function (event) {
        //     console.log('Received message ' + event.data);
        // };
let contentScriptPort = chrome.runtime.connect({ name: "connectDevtoolsAndContentScript" });





function injectCode(src) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = function () {
        console.log("script injected!!", chrome.runtime);
    };
    document.head.appendChild(script);
}

injectCode(chrome.runtime.getURL('scripts/inject.js'));

window.addEventListener('connectionBetweenInjectedScriptAndContentScript', (event) => {
    const data = JSON.parse(event.detail.data);
    try {
        contentScriptPort.postMessage({ data, name: "dataFromInjectedScript" });
    } catch (e) {
        console.log("reconnecting");
        contentScriptPort = chrome.runtime.connect({ name: "connectDevtoolsAndContentScript" });
    }

});


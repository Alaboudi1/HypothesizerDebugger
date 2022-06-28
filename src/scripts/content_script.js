
const contentScriptPort = chrome.runtime.connect({ name: "connectDevtoolsAndContentScript" });




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
    contentScriptPort.postMessage({ data, name: "dataFromInjectedScript" });

});


// window.addEventListener('DebuggerIsOnline', () => {
//     console.log("DebuggerIsOnline");
//     contentScriptPort.postMessage({ name: "DebuggerIsOnline" });

// });
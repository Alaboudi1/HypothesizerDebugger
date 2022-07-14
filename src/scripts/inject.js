var connectToReacDevTools = () => {
    console.log("connecting")
    window.postMessage(
        {
            source: "react-devtools-content-script",
            payload: {
                event: "setTraceUpdatesEnabled",
                payload: true
            }
        }
    );
    window.postMessage(
        {
            source: "react-devtools-content-script",
            payload: {
                event: "NativeStyleEditor_measure",
                payload: { id: 3, rendererID: 1 }
            }
        }
    );
    window.postMessage(
        {
            source: "react-devtools-content-script",
            payload: {
                event: "syncSelectionFromNativeElementsPanel"
            }
        }
    );

    window.postMessage(
        {
            source: "react-devtools-bridge",
            payload: {
                event: "selectFiber",
                payload: 3
            }
        }

    );

    if (window.$r == null) {
        setTimeout(() => connectToReacDevTools(), 100);
    }
}

window.addEventListener("message", (e) => {
    if (e.data.payload.event === "inspectedElement" && e.data.payload.payload.type === "full-data") {
        // sendState();
    }
})
document.addEventListener('click', function (event) {
    let __reactFiber = findValueByPrefix(event.target, "__reactFiber")
    if (__reactFiber === null) {
        __reactFiber = findValueByPrefix(event.target, "__reactInternalInstance")
    }
    if (__reactFiber == null) return;
    const location = __reactFiber["_debugSource"] ?? __reactFiber["_debugOwner"]["_debugSource"] ?? null;
    const data = {
        target: event.target.type,
        type: "click",
        location,
        srcElement: {
            value: event.target.value,
            tagName: event.target.tagName,

        },
        timestamp: Date.now()
    }
    sendData(data);

});

var sendState = () => {
    const state = {
        target: "state",
        type: "state",
        timestamp: Date.now(),
        state: window.$r
    }
    sendData(state);
}

// listen to keyborad events
document.addEventListener('keydown', function (event) {
    let __reactFiber = findValueByPrefix(event.target, "__reactFiber")
    if (__reactFiber === null) {
        __reactFiber = findValueByPrefix(event.target, "__reactInternalInstance")
    }
    if (__reactFiber == null) return;
    const location = __reactFiber["_debugSource"] ?? __reactFiber["_debugOwner"]["_debugSource"] ?? null;

    const data = {
        target: event.target.type,
        type: "keydown",
        key: event.key,
        location,
        srcElement: {
            value: event.target.value,
            tagName: event.target.tagName,

        },
        timestamp: Date.now()

    }
    sendData(data);
});




// Options for the observer (which mutations to observe)

// Callback function to execute when mutations are observed
var callback = (mutationsList) => {
    setTimeout(() => {
        const data = [];
        for (const mutation of mutationsList) {
            let __reactFiber = findValueByPrefix(mutation.target, "__reactFiber")
            if (__reactFiber === null) {
                __reactFiber = findValueByPrefix(mutation.target, "__reactInternalInstance")
            }
            const addedNodes = [...mutation.addedNodes].map(node => {
                let __reactFiber = findValueByPrefix(node, "__reactFiber")
                if (__reactFiber === null) {
                    __reactFiber = findValueByPrefix(node, "__reactInternalInstance")
                }
                if (__reactFiber) {
                    return __reactFiber["_debugSource"];
                }
                return null;
            })
            const removedNodes = [...mutation.removedNodes].map(node => {
                let __reactFiber = findValueByPrefix(node, "__reactFiber")
                if (__reactFiber === null) {
                    __reactFiber = findValueByPrefix(node, "__reactInternalInstance")
                } if (__reactFiber) {
                    return __reactFiber["_debugSource"];
                }
                return null;
            })


            if (__reactFiber == null) continue;
            const location = __reactFiber["_debugSource"] ?? __reactFiber["_debugOwner"]["_debugSource"] ?? null;

            data.push({
                type: mutation.type,
                addNode: addedNodes,
                removeNode: removedNodes,
                attributeName: mutation.attributeName,
                value: mutation.target.value,
                tagName: mutation.target.tagName,
                location,
                timestamp: Date.now()
            });

        }
        if (data.length > 0) {
            sendData(data);
        }
    }, 100);
};

new MutationObserver(callback).observe(document, { attributes: true, childList: true, subtree: true });

var sendData = (data) => {
    window.dispatchEvent(new CustomEvent("connectionBetweenInjectedScriptAndContentScript", {
        detail: {
            data: JSON.stringify(data)
        }
    })
    );
}

var findValueByPrefix = (object, prefix) => {
    for (var property in object) {
        if (property.startsWith(prefix)) {
            return object[property];
        }
    }
    return null;
}
// function that iterato on all on... events and return a set of all event that is not null
var findAllEvents = (object) => {
    const events = [];
    for (var property in object) {
        if (property.startsWith("on")) {
            if (object[property] != null) {
                events.push(property);
            }
        }
    }
    return events;
}

setTimeout(() => connectToReacDevTools(), 1000)
setInterval(() => sendData("debuggerOnline"), 2000)
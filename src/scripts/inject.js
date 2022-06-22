const connectToReacDevTools = () => {
    console.log("connecting")
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


}

document.addEventListener('click', function (event) {
    connectToReacDevTools();
    setTimeout(() => {
        let __reactFiber = findValueByPrefix(event.target, "__reactFiber")
        if (__reactFiber === null) {
            __reactFiber = findValueByPrefix(event.target, "__reactInternalInstance")
        }

        const data = {
            target: event.target.type,
            type: "click",
            location: __reactFiber["_debugSource"],
            srcElement: {
                value: event.target.value,
                tagName: event.target.tagName,

            },
            state: event.view.$r,
            timestamp: Date.now()
        }
        sendData(data);
    }, 0);
});

// listen to keyborad events
document.addEventListener('keydown', function (event) {
    connectToReacDevTools();
    setTimeout(() => {
        let __reactFiber = findValueByPrefix(event.target, "__reactFiber")
        if (__reactFiber === null) {
            __reactFiber = findValueByPrefix(event.target, "__reactInternalInstance")
        }
        const data = {
            target: event.target.type,
            type: "keydown",
            key: event.key,
            location: __reactFiber["_debugSource"],
            srcElement: {
                value: event.target.value,
                tagName: event.target.tagName,

            },
            state: event.view.$r,
            timestamp: Date.now()

        }
        sendData(data);
    }, 0);
});



const targetNode = document;

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationsList) => {
    connectToReacDevTools();
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
            data.push({
                type: mutation.type,
                addNode: addedNodes,
                removeNode: removedNodes,
                attributeName: mutation.attributeName,
                value: mutation.target.value,
                tagName: mutation.target.tagName,
                location: __reactFiber["_debugSource"] ?? null,
                state: window.$r,
                timestamp: Date.now()
            });

        }
        if (data.length > 0) {
            sendData(data);
        }
    }, 100);

};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

const sendData = (data) => {
    // console.log(data);
    window.dispatchEvent(new CustomEvent("connectionBetweenInjectedScriptAndContentScript", {
        detail: {
            data: JSON.stringify(data)
        }
    })
    );
}

const findValueByPrefix = (object, prefix, callee) => {
    for (var property in object) {
        if (property.startsWith(prefix)) {
            return object[property];
        }
    }
    return null;
}
// function that iterato on all on... events and return a set of all event that is not null
const findAllEvents = (object) => {
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
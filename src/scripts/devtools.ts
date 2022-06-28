const backgroundPageConnection = chrome.runtime.connect({
  name: 'panel',
})

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
})

backgroundPageConnection.onMessage.addListener((message) => {
  // dispatch document events

  if (message.data === 'debuggerOnline') {
    window.dispatchEvent(
      new CustomEvent('debuggerOnline', {
        detail: undefined,
      }),
    )
  } else {
    window.dispatchEvent(
      new CustomEvent('traceCollected', {
        detail: message,
      }),
    )
  }
})

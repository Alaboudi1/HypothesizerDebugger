let connections: chrome.runtime.Port | undefined

chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = function (message: { name: string }) {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name == 'init') {
      connections = port
      return
    }
    if (message.name == 'dataFromInjectedScript') {
      connections?.postMessage(message)
      return
    }
    // other message handling
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener)

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener)
    connections = undefined
  })
})

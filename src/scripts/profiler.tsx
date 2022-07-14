const { tabId } = chrome.devtools.inspectedWindow
type debuggingState = 'attach' | 'detach'
const trace: any = []
let incremnetalProfiler: any

const getSourceCodeFiles = async (): Promise<any> =>
  new Promise((resolve) =>
    chrome.devtools.inspectedWindow.getResources(async (allFiles) => {
      const files: chrome.devtools.inspectedWindow.Resource[] = allFiles.filter((file) => file.url.includes('localhost'))

      const localFiles: any = files.map(
        async (file) =>
          new Promise((res) =>
            file.getContent((content: string) => {
              res({ url: file.url, content })
            }),
          ),
      )
      const result = await Promise.all(localFiles)
      return resolve(result.filter((file) => file.content))
    }),
  )

/**
 * return an array that contain files of code inside src folder.
 */
const files = new Map()
const fetchBundleAndBundleMap = async (bundleUrl: string, bundleMapUrl: string) => {
  const bundles = await Promise.all([fetch(bundleUrl).then((res) => res.text()), fetch(bundleMapUrl).then((res) => res.json())])
  return bundles
}

const sendDebuggerCommand = async (command: string, param?: Record<string, unknown>): Promise<any> =>
  new Promise((resolve) => chrome.debugger.sendCommand({ tabId }, command, param, (result: any) => resolve(result)))

const debuggingLifeCycles = (command: debuggingState, callback?: any): Promise<void> =>
  new Promise((resolve) =>
    command === 'attach'
      ? chrome.debugger.attach({ tabId }, '1.3', () => {
          chrome.debugger.onDetach.addListener(callback)

          return resolve()
        })
      : chrome.debugger.detach({ tabId }, () => {
          return resolve()
        }),
  )
const collectTrace = async (): Promise<any> => {
  const rowSnapshot = await sendDebuggerCommand('Profiler.takePreciseCoverage')
  const coverageSnapshot = rowSnapshot.result
    .filter((e: { url: string | string[] }) => e.url.includes('localhost'))
    .flatMap((e: any) => e.functions.map((func: any) => ({ ...func, url: e.url, timestamp: Date.now() })))
    .filter((e: any) => e.ranges.some((c: any) => c.count > 0))
    .filter((e: any) => e.isBlockCoverage)

  trace.push(...coverageSnapshot)
}
const startProfiler = async (callback: any): Promise<void> => {
  await debuggingLifeCycles('attach', callback)
  await sendDebuggerCommand('Debugger.enable')
  await sendDebuggerCommand('Profiler.enable')
  await sendDebuggerCommand('Profiler.setSamplingInterval', { interval: 100 })
  await sendDebuggerCommand('Profiler.start')
  await sendDebuggerCommand('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  })
  incremnetalProfiler = setInterval(collectTrace, 50)
}

const endProfiler = async (): Promise<any> => {
  return new Promise((resolve) =>
    setTimeout(async () => {
      clearInterval(incremnetalProfiler), 100
      await sendDebuggerCommand('Profiler.stopPreciseCoverage')
      //@ts-ignore
      let { profile } = await sendDebuggerCommand('Profiler.stop')
      profile = profile.nodes.filter((e: any) => e.callFrame.url.includes('localhost')).map((e: any) => ({ ...e, functionName: e.callFrame.functionName }))
      await sendDebuggerCommand('Profiler.disable')
      await sendDebuggerCommand('Debugger.disable')
      await debuggingLifeCycles('detach')
      const bundles = [...files.values()].map(({ sourceMap, url }) => fetchBundleAndBundleMap(url, sourceMap))

      const bundleAndMap = await Promise.all(bundles)
      const allFiles = await getSourceCodeFiles()
      return resolve({ trace, profile, bundleAndMap, allFiles })
    }, 600),
  )
}

chrome.debugger.onEvent.addListener((event: any, params: any, e: any) => {
  if (params === 'Debugger.scriptParsed' && event.tabId === tabId && e.sourceMapURL.length > 0 && e.url.includes('localhost')) {
    const { url, sourceMapURL }: any = e
    const sourceMap = url.replace(/\/[^/]*$/, '/') + sourceMapURL
    files.set(url, { sourceMap, url })
  }
})
export { startProfiler, endProfiler }

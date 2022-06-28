// import { TimelineItemModel } from "react-chrono/dist/models/TimelineItemModel";
import { Coverage, Event, Filter, HypoTimelineItem, Trace } from './types'

function splitTrace(data: (Event | Coverage)[][]): Trace {
  const trace: Trace = {
    events: [],
    coverage: [],
  }
  if (Array(data).length < 1) return trace
  const eventTypes: string[] = []
  const targetTypes: string[] = []
  data.forEach((arr: any[]) => {
    if (arr[0].type !== undefined) {
      if (trace.events) trace.events.push(arr[0] as Event)
      if (eventTypes.indexOf(arr[0].type) === -1) eventTypes.push(arr[0].type)
      if (arr[0].target !== undefined) if (targetTypes.indexOf(arr[0].target as string) === -1) targetTypes.push(arr[0].target as string)
    } else {
      // arr[0] instanceof Coverage === true
      arr.forEach((item) => {
        trace.coverage.push(item as Coverage)
      })
    }
  })
  console.log('Event Types: ', eventTypes)
  console.log('Target Types: ', targetTypes)
  if (trace.events) console.log('Event Count: ', trace.events.length)
  if (trace.coverage) console.log('Coverage Count: ', trace.coverage.length)
  return trace
}

const transformTrace = (trace: Trace): HypoTimelineItem[] => {
  if ((trace.events === undefined && trace.coverage === undefined) || (trace.events.length === 0 && trace.coverage.length === 0)) return []
  const result: HypoTimelineItem[] = []
  trace.events.forEach((event: Event) => {
    result.push({
      timestamp: `${event.timestamp}`,
      title: `${event.location.fileName.split('/').pop()}`,
      src: `${event.location.fileName.split('/').pop()}`,
      cardSubtitle: `Event: ${event.type}`,
      cardDetailedText: `${event.location.fileName} Ln ${event.location.lineNumber} Col ${event.location.columnNumber} \n Ln ${event.location.lineNumber} Col ${event.location.columnNumber}`,
    })
  })
  trace.coverage.forEach((cov: Coverage) => {
    result.push({
      timestamp: `${cov.timestamp}`,
      title: cov.startPosition.source.split('/').pop(),
      coverage: cov.coverage,
      src: cov.startPosition.source.split('/').pop(),
      cardTitle: `${cov.functionName}`,
      cardDetailedText: `${cov.startPosition.source} Ln ${cov.startPosition.line} - ${cov.endPosition.line}`,
    })
  })
  const sorted = result.sort((a: HypoTimelineItem, b: HypoTimelineItem) => Number(a.timestamp) - Number(b.timestamp))
  // const smallestTime = Number(sorted[0].timestamp);
  return sorted.map((i) => {
    return {
      title: i.title,
      // title: `${Number(i.title) - smallestTime} ms`,
      cardTitle: i.cardTitle,
      cardDetailedText: i.cardDetailedText,
      coverage: i.coverage,
      src: i.src,
      cardSubtitle: i.cardSubtitle,
    } as HypoTimelineItem
  })
}

const getListOfFilesFromTrace = (timelineItems: HypoTimelineItem[]): string[] => {
  const result: string[] = []
  if (timelineItems !== undefined)
    timelineItems.forEach((e: HypoTimelineItem) => {
      if (e.src !== undefined && result.indexOf(e.src) === -1) result.push(e.src)
    })
  return result
}

const getFiltersFromFiles = (fileList: string[]): Filter[] => {
  const result: Filter[] = []
  fileList.forEach((fileName: string) => {
    result.push({
      filterBy: 'filename',
      condition: fileName,
      enabled: true,
    })
  })
  return result
}

const getFiltersFromTrace = (trace: HypoTimelineItem[]): Filter[] => {
  return getFiltersFromFiles(getListOfFilesFromTrace(trace))
}

export { splitTrace, transformTrace, getListOfFilesFromTrace, getFiltersFromFiles, getFiltersFromTrace }

import { TraceMap, originalPositionFor, generatedPositionFor } from '@jridgewell/trace-mapping'

const extractCoverageFromBundle = (rangeStart: number, rangeEnd: number, bundle: string) => {
  // const range = bundle.slice(rangeStart, rangeEnd).split(/\n/).join()
  const lineBundleStart = bundle.substring(0, rangeStart).split(/\n/).length
  const lineBundleEnd = bundle.substring(0, rangeEnd).split(/\n/).length

  return {
    lineBundleStart,
    lineBundleEnd,
    // range,
  }
}

const CodeCoverageMetaData = (coverage: any, bundleMap: any, offSet: number) => {
  const tracer = new TraceMap(bundleMap)
  const startPosition = originalPositionFor(tracer, {
    line: coverage.lineBundleStart + offSet,
    column: 0,
  })
  const endPosition = originalPositionFor(tracer, {
    line: coverage.lineBundleEnd + offSet,
    column: 0,
  })
  let accurateLine = endPosition.line == null ? -1 : endPosition.line
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const generated = generatedPositionFor(tracer, {
      source: endPosition.source == null ? '' : endPosition.source,
      line: accurateLine + 1,
      column: endPosition.column == null ? 0 : endPosition.column,
    })
    if (generated.line != null) break
    accurateLine++
  }
  endPosition.line = accurateLine
  return {
    ...coverage,
    startPosition,
    endPosition,
  }
}

const extractCodeCoverage = (rangeStart: number, range: number, files: any[], fileName: string) => {
  const file = files.find((e: any) => new URL(e.url).pathname === fileName)
  return file?.content.split(/\n/).splice(rangeStart - 1, range + 1)
}

export const getCoverage = (coverageRowData: any) => {
  const trace = coverageRowData.trace.map((e: any) => {
    const fileURL = new URL(e.url).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: any) => bundle[1].file === fileURL)
    const [bundle, bundleMap] = files
    const { startOffset, endOffset } = e.ranges[0]
    const coverage = extractCoverageFromBundle(startOffset, endOffset, bundle)
    const codeCoverageMetaData = CodeCoverageMetaData(coverage, bundleMap, 0)
    codeCoverageMetaData.coverage = extractCodeCoverage(
      codeCoverageMetaData.startPosition.line,
      codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
      coverageRowData.allFiles,
      codeCoverageMetaData.startPosition.source,
    )
    return { ...codeCoverageMetaData, ...e }
  })

  const profile = coverageRowData.profile.map((e: any) => {
    const fileURL = new URL(e.callFrame.url).pathname.substring(1)
    const files = coverageRowData.bundleAndMap.find((bundle: any) => bundle[1].file === fileURL)
    const [bundle, bundleMap] = files
    const lineBundleStart = e.callFrame.lineNumber
    const lineBundleEnd = e.callFrame.lineNumber
    const codeCoverageMetaData = CodeCoverageMetaData({ lineBundleStart, lineBundleEnd }, bundleMap, 1)
    codeCoverageMetaData.coverage = extractCodeCoverage(
      codeCoverageMetaData.startPosition.line,
      codeCoverageMetaData.endPosition.line - codeCoverageMetaData.startPosition.line,
      coverageRowData.allFiles,
      codeCoverageMetaData.startPosition.source,
    )
    return { ...codeCoverageMetaData, ...e }
  })

  return addIdToTraceFromProfile(trace, profile)
}
const addIdToTraceFromProfile = (trace: any, profile: any) => {
  return trace.map((e: any) => {
    const profileElement = profile.find((p: any) => p.startPosition.line === e.startPosition.line && p.startPosition.source === e.startPosition.source)
    if (profileElement) {
      return { ...e, id: profileElement.id }
    } else {
      return e
    }
  })
}

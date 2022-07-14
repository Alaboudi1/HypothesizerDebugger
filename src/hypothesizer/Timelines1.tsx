import React, { ReactElement } from 'react'
import { Chrono } from 'react-chrono'
import { Filter, HypoTimelineItem } from './types'

type TimelineProps = {
  trace: any
  setCoverage: any
  filters: Filter[]
}

const Timeline: React.FC<TimelineProps> = ({ trace, setCoverage, filters }): JSX.Element => {
  console.log('Timeline Rcvd Filters', filters)
  const timeline = createTimeline({ trace, setCoverage, filters })
  return <div style={{ left: '10px', height: '90vh', width: '60vw' }}>{timeline}</div>
}

const applyFilters = (trace: HypoTimelineItem[], filters: Filter[]): HypoTimelineItem[] => {
  const result: HypoTimelineItem[] = []
  // filters.forEach((filter) => {
  const filteredItems = trace.filter((item) => {
    // if (!filter.enabled) return false
    // if (filter.filterBy === 'filename') return item.src === 'App.tsx' // is the item src === condition(file name string ex: "App.tsx")
    // else {
    //   // else if(filter.filterBy === "type") { // filter by type ("event" or "callstack")
    //   if (filter.condition === 'event') return item.coverage === undefined // event object does not have coverage attr
    //   // else if(filter.condition === "coverage")
    //   else return item.coverage !== undefined // call stack item has coverage data
    // }
    return !item.cardDetailedText?.includes('node_modules')
  })
  result.push(...filteredItems)
  // })
  console.log('Filtered result:', result)

  return result
}

const createTimeline = (params: TimelineProps): ReactElement => {
  return (
    <Chrono
      items={applyFilters(params.trace, params.filters)}
      mode="VERTICAL"
      flipLayout={true}
      cardHeight={10}
      hideControls={true}
      onItemSelected={(data: any) => {
        {
          data.coverage !== undefined ? params.setCoverage(data.coverage) : params.setCoverage([])
        }
      }}
      fontSizes={{
        cardSubtitle: '1rem',
        cardText: '0.8rem',
        cardTitle: '1rem',
        title: '12px',
      }}
    />
  )
}

export default Timeline

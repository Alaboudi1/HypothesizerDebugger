import React, {useState} from "react"
import { HypoTimelineItem} from "../types"
import './style.css'

type TimelineProps = {
  trace: HypoTimelineItem[],
  setCoverage: any,
}

const Timeline: React.FC<TimelineProps> = ({trace, setCoverage}): JSX.Element => {
  return (
    <>
        <div className="timeline-drawing">
            <div className="vertical"></div>
        </div>
    </>
  )
}

export default Timeline;
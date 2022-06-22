import * as React from 'react'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'
import KeyboardAltOutlinedIcon from '@mui/icons-material/KeyboardAltOutlined'
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import JavascriptOutlined from '@mui/icons-material/JavascriptOutlined'

import Typography from '@mui/material/Typography'
import './Timelines.css'
const Timelines = ({ trace }: any) => {
  const [isRecording, setRecordingState] = React.useState<boolean>(false)

  const getType = (item: { type: any; coverage: any }) => {
    const { type, coverage } = item
    if (type === 'click') return 'click'
    if (type === 'keydown') return 'keydown'
    if (type === 'childList' || type === 'attributes') return 'render'
    if (coverage) return 'Source code'
  }
  const getIcone = (item: { type: any; coverage: any }) => {
    const type = getType(item)
    switch (type) {
      case 'click':
        return <MouseOutlinedIcon />
      case 'keydown':
        return <KeyboardAltOutlinedIcon />
      case 'render':
        return <ChangeCircleOutlinedIcon />
      case 'Source code':
        return <RateReviewOutlinedIcon />
    }
  }
  const getColor = (item: { type: any; coverage: any }) => {
    const type = getType(item)
    switch (type) {
      case 'click':
        return 'info'
      case 'keydown':
        return 'info'
      case 'render':
        return 'warning'
      case 'Source code':
        return undefined
    }
  }

  const getTimeLineContent = (item: any, i: number) => {
    return (
      <TimelineItem key={i}>
        {/* <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
          9:30 am
        </TimelineOppositeContent> */}
        <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot color={getColor(item)}>{getIcone(item)}</TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '10px', px: 2 }}>
          <Typography variant="h6" component="span">
            {getType(item)}
          </Typography>
          <Typography>{item.location.fileName.split('src/')[1]}</Typography>
          <Typography>Line:({item.location.lineNumber})</Typography>
        </TimelineContent>
      </TimelineItem>
    )
  }
  const getTimeLineContentAPI = (item: any, i) => {
    if (item.startPosition.source?.includes('src'))
      return (
        <TimelineItem key={i}>
          {/* <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
        </TimelineOppositeContent> */}
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot>
              <JavascriptOutlined />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '10px', px: 2 }}>
            <Typography variant="h6" component="span">
              {item.functionName || `Ananymous function`}
            </Typography>
            <Typography>{item.startPosition.source.split('src/')[1]}</Typography>
            <Typography>{item.endPosition.line - item.startPosition.line > 0 ? `Line:(${item.startPosition.line}-${item.endPosition.line})` : `Line:(${item.startPosition.line})`}</Typography>
          </TimelineContent>
        </TimelineItem>
      )
    return (
      <TimelineItem key={i} sx={{ py: '12px', px: 2, minHeight: '40px', paddingTop: '0px', paddingBottom: '0px' }}>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent variant="body2" color="text.secondary">
          {item.functionName}
          <Typography>{item.startPosition.source.split('/').pop()}</Typography>
        </TimelineContent>
      </TimelineItem>
      // <></>
    )
  }

  return (
    <Timeline>
      {trace.map((items: any, index: number) => {
        if (items[0].coverage) return items.map((item: any, i: number) => getTimeLineContentAPI(item, Math.random() * i))
        return getTimeLineContent(items[0], Math.random() * index)
      })}
    </Timeline>
  )
}

export default Timelines

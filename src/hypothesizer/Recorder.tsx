import React from 'react'
import './Recorder.css'
import { Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { VideoCall, Save, Pause } from '@mui/icons-material'
import { endProfiler, startProfiler } from '../scripts/profiler'
import { getCoverage } from '../scripts/coverage'
type MethodCoverage = {
  method: string
  start: number
  end: number
  file: string
  timestamp: number
}
type recordState = 'ideal' | 'record' | 'collect'

type RecorderProps = {
  setMethodCoverage: React.Dispatch<React.SetStateAction<MethodCoverage[]>>
}

const Recorder: React.FC<RecorderProps> = ({ setMethodCoverage }): React.ReactElement => {
  const [recordState, setRecordingState] = React.useState<recordState>('ideal')
  const events = React.useRef<any>([])
  const traceCollector = React.useCallback((incommingTrace: any) => {
    const data = incommingTrace.detail.data.length ? incommingTrace.detail.data : [incommingTrace.detail.data]
    events.current.push(...data)
  }, [])
  const recorder = async (recordState: recordState): Promise<void> => {
    if (recordState == 'record') {
      setRecordingState(recordState)
      window.addEventListener('traceCollected', traceCollector)
      await startProfiler('')
    } else if (recordState == 'collect') {
      window.removeEventListener('traceCollected', traceCollector)
      setRecordingState(recordState)
      const coverage: any = await endProfiler()
      const coverageData = await getCoverage(coverage, events.current)
      setMethodCoverage(coverageData)
      setRecordingState('ideal')
    }
  }

  const getButton = (): JSX.Element => {
    switch (recordState) {
      case 'ideal':
        return (
          <Button variant="contained" color="primary" size="large" onClick={() => recorder('record')} startIcon={<VideoCall />}>
            Record
          </Button>
        )
      case 'record':
        return (
          <Button variant="contained" color="secondary" onClick={() => recorder('collect')} startIcon={<Pause />} size="large" id="recording">
            Recording
          </Button>
        )
      case 'collect':
        return (
          <LoadingButton color="success" loading loadingPosition="start" startIcon={<Save />} variant="contained">
            Collecting
          </LoadingButton>
        )
    }
  }
  return <div className="record">{getButton()}</div>
}

export default Recorder

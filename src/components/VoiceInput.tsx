import React, { useState } from 'react'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'
import { classNames } from '@helpers/index.ts'

type Props = {
  label?: string
  id?: string
  callBack?: (...args: any[]) => void | Promise<any>
  children?: React.ReactNode
  fetching?: boolean
  class?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button(props: Props) {
  const [state, setState] = useState<{
    isRecording?: boolean
    isPaused?: boolean
    recordingTime?: number
    urlList?: string[]
  }>({})
  console.log('state', state)

  const addAudioElement = (blob: Blob | MediaSource) => {
    const url = URL.createObjectURL(blob)
    const audio = document.createElement('audio')
    audio.src = url
    audio.controls = true
    document.body.appendChild(audio)
    setState((prev) => ({ ...prev, urlList: [...(prev.urlList ?? []), url] }))
  }
  const recorderControls = useAudioRecorder()

  return (
    <section className="relative">
      <h1>Voice Input Component</h1>
      <p>Click the buttons below to start and stop voice recording</p>

      <section className="flex flex-row gap-5 mb-10">
        <button
          onClick={() => {
            setState((prev) => ({ ...prev, isRecording: true }))
            recorderControls.startRecording()
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          <span>Start Voice Recording</span>
        </button>

        <button
          onClick={() => {
            setState((prev) => ({ ...prev, isRecording: false }))
            recorderControls.stopRecording()
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          <span>Stop Voice Recording</span>
        </button>
      </section>

      <AudioRecorder
        onRecordingComplete={addAudioElement}
        recorderControls={recorderControls}
        // onRecordingComplete={addAudioElement}
        // audioTrackConstraints={{
        //   noiseSuppression: true,
        //   echoCancellation: true,
        // }}
        // downloadOnSavePress={true}
        // downloadFileExtension="webm"
      />
    </section>
  )
}

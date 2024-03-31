import { classNames } from '@helpers/helpers'
import { message } from 'antd'
import axios from 'axios'
// import { createWaveFile } from 'lib'
import React, { useState } from 'react'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'
import ServiceWorker from './ServiceWorker'

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
    fetching?: boolean
  }>({})
  console.log('🚧 state', state)

  const addAudioElement = (blob: Blob | MediaSource) => {
    try {
      const url = URL.createObjectURL(blob)
      const audio = document.createElement('audio')
      audio.src = url
      audio.controls = true
      // document.body.appendChild(audio)
      setState((prev) => ({ ...prev, urlList: [...(prev.urlList ?? []), url] }))
    } catch (error) {
      console.error('error', error)
    }
  }
  const recorderControls = useAudioRecorder()

  async function submit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault()
      setState((prev) => ({ ...prev, fetching: true }))
      const formData = new FormData(e.target as HTMLFormElement)
      const msg = formData.get('message') as string
      const { data } = await axios.post('/api/v1/hf/xenova-text-to-speech', {
        prompt: msg,
      })
      console.log('🚧 msg', msg)
      const float32 = data?.result?.audio
      const rate = data?.result?.sampling_rate
      // const { wav, url } = createWaveFile(float32, rate)
      console.log('🚧 float32', float32)

      // setState((prev) => ({ ...prev, urlList: [...(prev.urlList ?? []), url] }))

      // const arr = Object.values(audio)?.map((value) => value) as number[]
      // const float32 = new Float32Array(audio)
      // const int16Array = float32ToInt16(Array.from(float32))

      // Create a Blob from Int16Array
      // const blob = new Blob([int16Array.buffer], { type: 'audio/wav' })
      // addAudioElement(blob)

      // get url from blob
      // const url = URL.createObjectURL(blob)

      // Create an AudioContext
      // const audioContext = new window.AudioContext()

      // // Create an AudioBuffer
      // const audioBuffer = audioContext.createBuffer(1, arr.length, rate)
      // const audioBufferData = audioBuffer.getChannelData(0)
      // audioBufferData.set(arr)

      // // Convert AudioBuffer to PCM data
      // audioContext.audioWorklet.addModule(
      //   'data:application/javascript,audioWorkletProcessor=(()=>{return class extends AudioWorkletProcessor{process(inputs,outputs){outputs[0].forEach(channel=>channel.set(inputs[0][0]));return true;}}})();',
      // )
      // const pcmData = audioBuffer.getChannelData(0).buffer

      // // Create a Blob from PCM data
      // const blob = new Blob([pcmData], { type: 'audio/wav' })
      // addAudioElement(blob)

      // console.log('🚧 res', int16Array, int16Array.length)
      // console.log('🚧 buffer ', int16Array.buffer)
      // message.info(msg)
    } catch (error: any) {
      console.error('error', error)
    } finally {
      setState((prev) => ({ ...prev, fetching: false }))
    }
  }

  return (
    <section className="relative">
      <ServiceWorker />
      <h1>Voice Input Component</h1>
      <p>Click the buttons below to start and stop voice recording</p>

      <section className="flex flex-row gap-5 my-5">
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

        {/* pause */}
        <button
          onClick={() => {
            setState((prev) => ({ ...prev, isPaused: !prev?.isPaused }))
            recorderControls.togglePauseResume()
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          <span>Pause Voice Recording</span>
        </button>
      </section>

      {/* add recording indicator with transitions/animations. button round   */}
      <section className="flex flex-row gap-5 py-5">
        <div
          className={`w-5 h-5 rounded-full ${
            state.isRecording ? 'bg-red-500' : 'bg-gray-500'
          }`}
        ></div>
        <div
          className={`w-5 h-5 rounded-full ${
            state.isPaused ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
        ></div>
      </section>

      <section className="my-10">
        <form
          onSubmit={submit}
          className="relative flex flex-col gap-5 text-gray-800"
        >
          <textarea
            placeholder="Type your message here"
            name="message"
            className="w-full h-40 border border-gray-300 rounded-md p-5"
          />

          <button
            type="submit"
            className={classNames(
              'bg-blue-500 text-white px-4 py-2 rounded-md',
              state?.fetching && 'opacity-50 cursor-not-allowed',
            )}
          >
            {state?.fetching ? '...' : 'Submit'}
          </button>
        </form>
      </section>

      <span className="opacity-50 hidden_">
        <AudioRecorder
          onRecordingComplete={addAudioElement}
          recorderControls={recorderControls}
        />
      </span>

      {/* add audio elements */}
      <section className="flex flex-col gap-5">
        {state.urlList?.map((url, index) => (
          <audio key={index} controls src={url} className="mb-5"></audio>
        ))}
      </section>
    </section>
  )
}

const float32ToInt16 = (float32Array: string | any[]) => {
  const int16Array = new Int16Array(float32Array.length)
  for (let i = 0; i < float32Array.length; i++) {
    const val = Math.min(1, Math.max(-1, float32Array[i]))
    int16Array[i] = val < 0 ? val * 0x8000 : val * 0x7fff
  }
  return int16Array
}

import { classNames } from '@helpers/helpers'
import { message } from 'antd'
import axios from 'axios'
import React, { useRef, useState } from 'react'
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
    buffer?: string
    sentiment?: { label: string; score: number }
    answer?: { answer: string; score: number }
  }>({})
  const formRef = useRef<any>()
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
      console.log('🚧 res data', data)
      const bufferArray = Object.values(data?.float32Array).map(
        (value: any) => -value,
      )
      const wavBuffer = encodeWAV(bufferArray, data?.rate)
      const buffer = Buffer.from(wavBuffer).toString('base64')
      const url = `data:audio/wav;base64,${buffer}`

      setState((prev) => ({
        ...prev,
        urlList: [...(prev.urlList ?? []), url],
      }))
    } catch (error: any) {
      console.error('error', error)
    } finally {
      setState((prev) => ({ ...prev, fetching: false }))
    }
  }

  async function sentiment(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault()
      setState((prev) => ({ ...prev, fetching: true }))
      const formData = new FormData(e.target as HTMLFormElement)
      const msg = formData.get('message') as string
      const { data } = await axios.post('/api/v1/hf/sentiment', {
        prompt: msg,
      })
      const sentiment = data?.sentiment?.[0]
      alert(JSON.stringify(sentiment))
      setState((prev) => ({ ...prev, sentiment }))
    } catch (error: any) {
      console.error('error', error)
    } finally {
      setState((prev) => ({ ...prev, fetching: false }))
    }
  }

  async function questionAndAnswer(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    try {
      e.preventDefault()
      setState((prev) => ({ ...prev, fetching: true }))
      const formData = new FormData(e.target as HTMLFormElement)
      const { data } = await axios.post('/api/v1/hf/question-answering', {
        prompt: formData.get('question') as string,
        context: formData.get('context') as string,
      })
      console.log('🚧 res data', data)
      const answer = data?.answer

      alert(JSON.stringify(answer) ?? 'No response')
      setState((prev) => ({ ...prev, answer }))
    } catch (error: any) {
      console.error('error', error)
    } finally {
      setState((prev) => ({ ...prev, fetching: false }))
    }
  }

  async function swHandler(e: any) {
    try {
      e.preventDefault()
      setState((prev) => ({ ...prev, fetching: true }))

      const form = new FormData(formRef.current) // ⚠️ get form data
      const formValues = Object.fromEntries(form.entries())
      const msg = formValues?.message

      const { data } = await axios.post('/api/sw', {
        prompt: msg,
      })
      console.log('🚧 SW res data', data)
      alert(data?.message)
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
        <h1 className="text-center text-white-200 font-bold my-5 text-4xl">
          Question & Answer
        </h1>
        <form
          onSubmit={questionAndAnswer}
          className="relative flex flex-col gap-5 text-gray-800"
        >
          <input
            placeholder="Type your question here"
            name="question"
            className="w-full"
          />
          <textarea
            placeholder="Type your confect here"
            name="context"
            className="w-full h-40 border border-gray-300 rounded-md p-5"
          />
          {state?.answer && (
            <p className="text-primary-200 text-center my-2 text-xl">
              Sentiment: {state?.answer?.answer} - {state?.answer?.score}
            </p>
          )}

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
      <section className="my-10">
        <h1 className="text-center text-white-200 font-bold my-5 text-4xl">
          Sentiments AI
        </h1>
        <form
          onSubmit={sentiment}
          className="relative flex flex-col gap-5 text-gray-800"
        >
          <textarea
            placeholder="Type your message here"
            name="message"
            className="w-full h-40 border border-gray-300 rounded-md p-5"
          />
          {state?.sentiment && (
            <p className="text-primary-200 text-center my-2 text-xl">
              Sentiment: {state?.sentiment?.label} - {state?.sentiment?.score}
            </p>
          )}

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
      <section className="my-10">
        <h1 className="text-center text-white-200 font-bold my-5 text-4xl">
          Service Worker
        </h1>
        <form
          onSubmit={submit}
          className="relative flex flex-col gap-5 text-gray-800"
        >
          <button
            className={classNames(
              'bg-blue-500 text-white px-4 py-2 rounded-md',
              state?.fetching && 'opacity-50 cursor-not-allowed',
            )}
            onClick={swHandler}
          >
            {state?.fetching ? '...' : 'Test Service Worker 🤖'}
          </button>
        </form>
      </section>

      <span className="opacity-50 hidden">
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
        {/* add wav file */}
        {state.buffer && (
          <audio
            controls
            src={`data:audio/wav;base64,${state.buffer}`}
            className="mb-5"
          ></audio>
        )}
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

export function encodeWAV(samples: string | any[], rate?: number) {
  let offset = 44
  const buffer = new ArrayBuffer(offset + samples.length * 4)
  const view = new DataView(buffer)
  const sampleRate = rate ?? 16000

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 4, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw) */
  view.setUint16(20, 3, true)
  /* channel count */
  view.setUint16(22, 1, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true)
  /* bits per sample */
  view.setUint16(34, 32, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, samples.length * 4, true)

  for (let i = 0; i < samples.length; ++i, offset += 4) {
    view.setFloat32(offset, samples[i], true)
  }

  return buffer
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; ++i) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

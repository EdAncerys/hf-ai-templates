import { WaveFile } from 'wavefile'

type Response = {
  wav: WaveFile
  url: string
  blob: Blob
  error?: Error
}
let wav = new WaveFile()

export function createWaveFile(float32: Float32Array, sampling_rate: number) {
  try {
    wav.fromScratch(1, sampling_rate, '32f', float32)

    const blob = new Blob([wav.toBuffer()], { type: 'audio/wav' }) // create blob from wavefile

    const url = URL.createObjectURL(blob) // create url from blob

    return { wav, url, blob } as Response
  } catch (error) {
    console.error('🚧 error', error)

    return { error } as Response
  }
}

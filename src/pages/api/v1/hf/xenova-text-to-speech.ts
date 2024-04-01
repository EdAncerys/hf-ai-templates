import type { APIRoute, APIContext } from 'astro'
import { pipeline } from '@xenova/transformers'
import wavefile from 'wavefile'

type BodyType = {
  prompt?: string
}

// --------------------------------------------------------------------------------
// 📌  Init model pipeline
// --------------------------------------------------------------------------------
const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
  quantized: false,
})
const speaker_embeddings =
  'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()

  // Generate speech
  const audio = await synthesizer(body?.prompt!, {
    speaker_embeddings,
  })
  const float32Array = audio?.audio
  const rate = audio?.sampling_rate

  // Convert audio to wav
  const wav = new wavefile.WaveFile()
  wav.fromScratch(1, rate, '32f', float32Array)

  const response: any = {
    body,
    buffer: wav.toBuffer(),
    float32Array,
    rate,
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'foo', // custom header example
    },
  })
}

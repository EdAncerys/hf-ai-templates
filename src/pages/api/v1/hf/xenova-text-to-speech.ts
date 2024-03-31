import type { APIRoute, APIContext } from 'astro'
import { pipeline } from '@xenova/transformers'

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
  const result = await synthesizer(body?.prompt!, {
    speaker_embeddings,
  })

  const response: any = {
    body,
    result,
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

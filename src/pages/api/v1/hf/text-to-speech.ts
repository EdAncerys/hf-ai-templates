import type { APIRoute, APIContext } from 'astro'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { HfInference } from '@huggingface/inference'

const HF_ACCESS_TOKEN = import.meta.env.HF_ACCESS_TOKEN as string

// --------------------------------------------------------------------------------
// 📌  Create HF instance
// --------------------------------------------------------------------------------
const inference = new HfInference(HF_ACCESS_TOKEN)

type BodyType = {
  prompt?: string
}

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()
  console.log('🚧 BODY ', body)

  const res = await inference.textToSpeech({
    model: 'facebook/mms-tts',
    inputs: 'text to generate speech from',
  })
  console.log('🚧 _res', res)

  const response: any = {
    // params: params,
    body,
    res,
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

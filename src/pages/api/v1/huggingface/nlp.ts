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
  lang?: string
  max_tokens?: number
}

const languageModels = {
  'en-es': 'Helsinki-NLP/opus-mt-en-es',
  'en-de': 'Helsinki-NLP/opus-mt-en-de',
  'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
  // Add more models as needed
}

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()
  const lang = body.lang ?? 'en-es'

  const translationResponse = await inference.translation({
    model: languageModels[lang as keyof typeof languageModels], // Add index signature to allow indexing with a string
    inputs: body.prompt!,
  })

  const response: any = {
    message: 'This is a POST request',
    params: params,
    body,
    translationResponse,
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

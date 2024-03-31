import type { APIRoute, APIContext } from 'astro'
import { pipeline } from '@xenova/transformers'

type BodyType = {
  prompt?: string
}

// --------------------------------------------------------------------------------
// 📌  Init model pipeline
// --------------------------------------------------------------------------------
const pipe = await pipeline('sentiment-analysis')

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()

  // Allocate a pipeline for sentiment-analysis
  let sentiment = await pipe(body.prompt!)

  const response: any = {
    body,
    sentiment,
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

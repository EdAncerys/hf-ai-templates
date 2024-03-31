import type { APIRoute, APIContext } from 'astro'
import { pipeline } from '@xenova/transformers'

type BodyType = {
  prompt?: string
  context?: string
}

// --------------------------------------------------------------------------------
// 📌  Init model pipeline
// --------------------------------------------------------------------------------
const pipe = await pipeline('question-answering')

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()

  const question = 'Where do I live?'
  const context = 'My name is Merve and I live in İstanbul.'

  let res = await pipe(body?.prompt ?? question, body?.context ?? context)

  const response: any = {
    params: params,
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

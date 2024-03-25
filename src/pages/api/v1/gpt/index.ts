import type { APIRoute, APIContext } from 'astro'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { initialProgrammerMessages, type Message } from '../messages'

// --------------------------------------------------------------------------------
// 📌  Create AI instance
// --------------------------------------------------------------------------------
const openai = new OpenAI({
  // apiKey: import.meta.env.OPENAI_API_KEY,
})

type BodyType = {
  prompt: { role: string; content: string }[]
  max_tokens?: number
}

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const body: BodyType = await request.json()

  const completion = await openai.chat.completions.create({
    messages: [...initialProgrammerMessages, ...(body.prompt as Message[])],
    model: 'gpt-4-vision-preview',
    temperature: 0.8,
    max_tokens: body.max_tokens ?? 4096,
    stream: true,
  })

  const stream = OpenAIStream(completion)
  return new StreamingTextResponse(stream)
}

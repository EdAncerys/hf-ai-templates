import type { APIRoute, APIContext } from 'astro'

export const GET: APIRoute = async ({
  params,
  request,
  url,
}: APIContext): Promise<Response> => {
  const response: any = {
    message: 'This is a GET request',
    params: params,
    url,
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

export const POST: APIRoute = async ({
  params,
  request,
}: APIContext): Promise<Response> => {
  const response: any = {
    message: 'This is a POST request',
    params: params,
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

export const PUT: APIRoute = async ({
  params,
  request,
  url,
}: APIContext): Promise<Response> => {
  const { id } = params
  // get searchParams from url and get id
  const searchParams = new URLSearchParams(url.search)
  const searchId = searchParams.get('id')
  console.log('⭐️ ', params, url, searchId)

  if (!searchId) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    })
  }

  // redirect to the home page return
  return new Response(null, {
    status: 302, // Set the redirect status code (302 for temporary redirect)
    headers: {
      Location: 'http://localhost:4321/', // Set the Location header to the redirect URL
    },
  })
}

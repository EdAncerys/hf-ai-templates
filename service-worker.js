// Your service worker code goes here

// --------------------------------------------------------------------------------
// 📌  Add listeners for fetch requests
// --------------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/sw')) {
    console.log('Service Worker API Interception', event.request.url)
    // event.respondWith(handleAPICall(event.request))

    event.respondWith(helloFromSW(event.request))
  }

  if (event.request.url.includes('/api/text-to-speech')) {
    event.respondWith(fetch(event.request)) // Pass request to server
  }
})

// --------------------------------------------------------------------------------
// 📌  Handle API call
// --------------------------------------------------------------------------------
async function handleAPICall(request) {
  const cache = await caches.open('api-data') // Open cache storage
  const cachedResponse = await cache.match(request) // Get response from cache

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(request) // Fetch response from server
  cache.put(request, response.clone()) // Put response into cache

  return response
}

async function helloFromSW(request) {
  const body = await request.text() // Convert request body to text
  const { prompt } = JSON.parse(body) // Parse JSON body
  console.log('Body:', body)
  console.log('Text to Speech Prompt:', prompt)

  // respond with custom response object
  return new Response(
    JSON.stringify({ message: 'Hello from Service Worker', prompt }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

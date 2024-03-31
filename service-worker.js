// --------------------------------------------------------------------------------
// 📌  Add listeners for fetch requests
// --------------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/data')) {
    console.log('Service Worker API Interception', event.request.url)
    // respond with custom response object
    // event.respondWith(handleAPICall(event.request))

    event.respondWith(helloFromSW(event.request))
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
  // respond with custom response object
  return new Response(
    JSON.stringify({ message: 'Hello from Service Worker' }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

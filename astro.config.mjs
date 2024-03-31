import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'
import react from '@astrojs/react'
import serviceWorker from 'astrojs-service-worker'

export default defineConfig({
  // ...
  integrations: [
    tailwind({
      // Example: Allow writing nested CSS declarations
      // alongside Tailwind's syntax
      nesting: true,
    }),
    serviceWorker({
      enableInDevelopment: true, // Enable service worker in development
    }),
    react(), // Enable react
  ],
  // --------------------------------------------------------------------------------
  // 📌  SSR for page generation & vercel host adaptor
  // --------------------------------------------------------------------------------
  output: 'server',
  adapter: vercel(),
})

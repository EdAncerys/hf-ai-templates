import { useEffect } from 'react'

type Props = {
  path?: string
}

const PATH = '../../service-worker.js'

export default function ServiceWorker(props: Props) {
  useEffect(() => {
    // --------------------------------------------------------------------------------
    // 📌  Register Service Worker
    // --------------------------------------------------------------------------------
    console.log('🚧 ServiceWorker', props.path ?? PATH)

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(props.path ?? PATH)
          .then((registration) => {
            console.log('🚧 Registration', registration)
            console.log('🚧 Registration Scope', registration.scope)
          })
          .catch((registrationError) => {
            console.error('🚧 Registration Error', registrationError)
          })
      })
    }
  }, [props.path])

  return null
}

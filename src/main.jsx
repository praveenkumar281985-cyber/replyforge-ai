import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <main style={{ padding: '32px', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </main>
      }
    >
      <App />
    </Sentry.ErrorBoundary>

    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
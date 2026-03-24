import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,24,17,0.95)',
            color: '#e8f0eb',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'Sora, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#4db889', secondary: '#0d1410' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0d1410' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)
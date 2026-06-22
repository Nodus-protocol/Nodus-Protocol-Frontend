'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Page Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-sm text-gray-400 max-w-md">
        {error.message.includes('fetch')
          ? 'Failed to load data. Please check your connection and try again.'
          : 'An unexpected error occurred. Our team has been notified.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        Try again
      </button>
    </div>
  )
}

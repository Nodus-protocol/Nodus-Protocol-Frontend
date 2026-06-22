'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Nodus Protocol</h1>
          <p className="text-gray-400">Something went wrong. Please refresh the page.</p>
          <button onClick={reset} className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}

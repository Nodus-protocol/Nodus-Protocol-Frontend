// Client-side CSRF token management (double-submit cookie pattern).
//
// Fetches a token from the same-origin /api/auth/csrf endpoint and caches it
// in memory so mutating requests can attach it as X-CSRF-Token. The server
// validates the header against the csrf_token cookie it set alongside it.

let csrfToken: string | null = null
let pending: Promise<string> | null = null

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken
  if (pending) return pending

  pending = (async () => {
    const res = await fetch("/api/auth/csrf")
    if (!res.ok) {
      throw new Error("Failed to fetch CSRF token")
    }
    const { csrf_token } = (await res.json()) as { csrf_token: string }
    csrfToken = csrf_token
    return csrf_token
  })()

  try {
    return await pending
  } finally {
    pending = null
  }
}

export function clearCsrfToken(): void {
  csrfToken = null
}

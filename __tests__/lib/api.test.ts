describe("request CSRF protection", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  function mockFetch() {
    const calls: { url: string; init?: RequestInit }[] = []
    global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init })
      if (String(url) === "/api/auth/csrf") {
        return new Response(JSON.stringify({ csrf_token: "test-token" }), {
          status: 200,
        })
      }
      return new Response(JSON.stringify({ success: true, message: "ok", data: null }), {
        status: 200,
      })
    }) as unknown as typeof fetch
    return calls
  }

  it("includes X-CSRF-Token on POST requests", async () => {
    const calls = mockFetch()
    const { pool } = await import("../../lib/api")

    await pool.buildSwap("access-token", { amount: "1" })

    const mainCall = calls.find((c) => c.url.includes("/pool/build/swap"))
    const headers = new Headers(mainCall?.init?.headers)
    expect(headers.get("X-CSRF-Token")).toBe("test-token")
  })

  it("does not include X-CSRF-Token on GET requests", async () => {
    const calls = mockFetch()
    const { pool } = await import("../../lib/api")

    await pool.reserves()

    const csrfFetch = calls.find((c) => c.url === "/api/auth/csrf")
    expect(csrfFetch).toBeUndefined()
    const mainCall = calls.find((c) => c.url.includes("/pool/reserves"))
    const headers = new Headers(mainCall?.init?.headers)
    expect(headers.get("X-CSRF-Token")).toBeNull()
  })

  it("caches the CSRF token across multiple mutating requests", async () => {
    const calls = mockFetch()
    const { pool } = await import("../../lib/api")

    await pool.buildSwap("access-token", { amount: "1" })
    await pool.buildAddLiquidity("access-token", { amount: "1" })

    const csrfFetches = calls.filter((c) => c.url === "/api/auth/csrf")
    expect(csrfFetches).toHaveLength(1)
  })

  it("fetches a fresh token after clearCsrfToken is called", async () => {
    const calls = mockFetch()
    const { pool } = await import("../../lib/api")
    const { clearCsrfToken } = await import("../../lib/csrf")

    await pool.buildSwap("access-token", { amount: "1" })
    clearCsrfToken()
    await pool.buildAddLiquidity("access-token", { amount: "1" })

    const csrfFetches = calls.filter((c) => c.url === "/api/auth/csrf")
    expect(csrfFetches).toHaveLength(2)
  })
})

describe("API_BASE normalization", () => {
  const OLD = process.env

  afterEach(() => {
    process.env = OLD
  })

  it("defaults to http://localhost:8080/api/v1", async () => {
    delete process.env.NEXT_PUBLIC_API_URL
    jest.resetModules()
    const { API_BASE } = await import("../../lib/api-base")
    expect(API_BASE).toBe("http://localhost:8080/api/v1")
  })

  it("normalizes http://localhost:8080", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080"
    jest.resetModules()
    const { API_BASE } = await import("../../lib/api-base")
    expect(API_BASE).toBe("http://localhost:8080/api/v1")
  })

  it("normalizes http://localhost:8080/", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/"
    jest.resetModules()
    const { API_BASE } = await import("../../lib/api-base")
    expect(API_BASE).toBe("http://localhost:8080/api/v1")
  })

  it("normalizes http://localhost:8080/api/v1", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/api/v1"
    jest.resetModules()
    const { API_BASE } = await import("../../lib/api-base")
    expect(API_BASE).toBe("http://localhost:8080/api/v1")
  })

  it("normalizes http://localhost:8080/api/v1/", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/api/v1/"
    jest.resetModules()
    const { API_BASE } = await import("../../lib/api-base")
    expect(API_BASE).toBe("http://localhost:8080/api/v1")
  })
})

describe("pool.reserves() constructs correct URL", () => {
  const OLD = process.env
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD }
  })

  afterEach(() => {
    process.env = OLD
    global.fetch = originalFetch
  })

  it("hits http://localhost:8080/api/v1/pool/reserves", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080"
    const calls: { url: string }[] = []
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      calls.push({ url: String(url) })
      return new Response(JSON.stringify({ success: true, message: "ok", data: null }), { status: 200 })
    }) as typeof fetch

    const { pool } = await import("../../lib/api")
    await pool.reserves()

    const poolCall = calls.find((c) => c.url.includes("/pool/reserves"))
    expect(poolCall?.url).toBe("http://localhost:8080/api/v1/pool/reserves")
  })
})

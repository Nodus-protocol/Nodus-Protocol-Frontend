interface MockWindow {
  window?: {
    freighter: {
      isConnected: jest.Mock
      getPublicKey: jest.Mock
      signTransaction: jest.Mock
    }
  }
}

describe("stellar-auth URL construction", () => {
  const OLD = process.env

  beforeAll(() => {
    ;(globalThis as unknown as MockWindow).window = {
      freighter: {
        isConnected: jest.fn(),
        getPublicKey: jest.fn().mockResolvedValue("GABC12345TESTACCOUNT"),
        signTransaction: jest.fn().mockResolvedValue("signed-xdr-placeholder"),
      },
    }
  })

  afterAll(() => {
    delete (globalThis as unknown as MockWindow).window
  })

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD }
  })

  afterEach(() => {
    process.env = OLD
    jest.restoreAllMocks()
  })

  it("fetchChallenge hits /api/v1/auth/stellar/challenge", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080"

    const calls: { url: string }[] = []
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      calls.push({ url: String(url) })
      if (String(url).includes("/challenge")) {
        return new Response(
          JSON.stringify({ success: true, message: "ok", data: { transaction: "challenge-xdr" } }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({ success: true, message: "ok", data: { tokens: { access_token: "a", refresh_token: "b" } } }),
        { status: 200 }
      )
    }) as typeof fetch

    const { connectWithSep10 } = await import("../../lib/stellar-auth")
    await connectWithSep10()

    const challengeUrl = calls.find((c) => c.url.includes("/challenge"))
    expect(challengeUrl?.url).toMatch(/^http:\/\/localhost:8080\/api\/v1\/auth\/stellar\/challenge\?account=/)
  })

  it("exchangeToken hits /api/v1/auth/stellar/token", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080"

    const calls: { url: string }[] = []
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      calls.push({ url: String(url) })
      if (String(url).includes("/challenge")) {
        return new Response(
          JSON.stringify({ success: true, message: "ok", data: { transaction: "challenge-xdr" } }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({ success: true, message: "ok", data: { tokens: { access_token: "a", refresh_token: "b" } } }),
        { status: 200 }
      )
    }) as typeof fetch

    const { connectWithSep10 } = await import("../../lib/stellar-auth")
    await connectWithSep10()

    const tokenUrl = calls.find((c) => c.url.includes("/token"))
    expect(tokenUrl?.url).toBe("http://localhost:8080/api/v1/auth/stellar/token")
  })
})

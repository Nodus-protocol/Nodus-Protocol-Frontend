import { API_BASE } from "./api-base"

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015"

declare global {
  interface Window {
    freighter?: {
      isConnected(): Promise<boolean>
      getPublicKey(): Promise<string>
      signTransaction(
        xdr: string,
        opts?: { networkPassphrase?: string; accountToSign?: string }
      ): Promise<string>
    }
  }
}

export function isFreighterInstalled(): boolean {
  return typeof window !== "undefined" && !!window.freighter
}

async function fetchChallenge(accountId: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/auth/stellar/challenge?account=${encodeURIComponent(accountId)}`
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? "Failed to fetch SEP-10 challenge")
  }
  const data = await res.json()
  return data.data.transaction as string
}

async function exchangeToken(signedXdr: string): Promise<TokenPair> {
  const res = await fetch(`${API_BASE}/auth/stellar/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: signedXdr }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? "Token exchange failed")
  }
  const data = await res.json()
  return data.data.tokens as TokenPair
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface Sep10Result {
  accountId: string
  tokens: TokenPair
}

/**
 * Full SEP-10 authentication flow:
 *  1. getPublicKey()  — identify the user's Stellar account
 *  2. GET /challenge  — server issues a time-limited challenge XDR
 *  3. signTransaction — Freighter signs the challenge
 *  4. POST /token     — server verifies and returns JWT pair
 */
export async function connectWithSep10(): Promise<Sep10Result> {
  if (!window.freighter) {
    throw new Error(
      "Freighter not detected. Install the Freighter browser extension and try again."
    )
  }

  const accountId = await window.freighter.getPublicKey()
  if (!accountId) throw new Error("No account returned from Freighter")

  const challengeXdr = await fetchChallenge(accountId)

  const signedXdr = await window.freighter.signTransaction(challengeXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    accountToSign: accountId,
  })

  const tokens = await exchangeToken(signedXdr)
  return { accountId, tokens }
}

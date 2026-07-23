import { getCsrfToken } from "./csrf"
import { API_BASE } from "./api-base"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

// ── response envelope ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ── pool types ────────────────────────────────────────────────────────────────

export interface PoolReserves {
  reserve_0: string
  reserve_1: string
  token_0: string
  token_1: string
  lp_total_supply: string
  timestamp_last: number
}

export interface PoolStats {
  reserves: PoolReserves
  price_token0_in_token1: number
  price_token1_in_token0: number
  k_invariant: string
  fee_bps: number
}

export interface PriceQuote {
  amount_in: string
  amount_out: string
  token_in: string
  token_out: string
  fee_bps: number
  price_impact_bps: number
  effective_price: number
}

export interface LpBalance {
  address: string
  lp_balance: string
}

export interface UnsignedTx {
  contract_id: string
  function: string
  args: unknown
  note: string
}

// ── payment types ─────────────────────────────────────────────────────────────

export interface PaymentFees {
  chain: string
  available: boolean
  fees: {
    standard_stroops: number
    fast_stroops: number
    urgent_stroops: number
    standard_seconds: number
    fast_seconds: number
    urgent_seconds: number
  }
}

export interface PaymentRate {
  token: string
  usd_price: number
  available: boolean
}

// ── auth types ────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  email_verified: boolean
  created_at: string
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = (init.method ?? "GET").toUpperCase()
  const csrfHeaders: Record<string, string> = MUTATING_METHODS.has(method)
    ? { "X-CSRF-Token": await getCsrfToken() }
    : {}

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders,
      ...init.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  return res.json() as Promise<ApiResponse<T>>
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── pool ──────────────────────────────────────────────────────────────────────

export const pool = {
  reserves: () =>
    request<PoolReserves>("/pool/reserves"),

  quote: (amountIn: string, tokenIn: string, tokenOut: string) =>
    request<PriceQuote>(
      `/pool/quote?amount_in=${encodeURIComponent(amountIn)}&token_in=${encodeURIComponent(tokenIn)}&token_out=${encodeURIComponent(tokenOut)}`
    ),

  lpBalance: (address: string) =>
    request<LpBalance>(
      `/pool/lp-balance?address=${encodeURIComponent(address)}`
    ),

  stats: () =>
    request<PoolStats>("/pool/stats"),

  snapshots: () =>
    request<unknown[]>("/pool/snapshots"),

  buildSwap: (token: string, payload: Record<string, unknown>) =>
    request<UnsignedTx>("/pool/build/swap", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  buildAddLiquidity: (token: string, payload: Record<string, unknown>) =>
    request<UnsignedTx>("/pool/build/add-liquidity", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  buildRemoveLiquidity: (token: string, payload: Record<string, unknown>) =>
    request<UnsignedTx>("/pool/build/remove-liquidity", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),
}

// ── payments ──────────────────────────────────────────────────────────────────

export const payments = {
  fees: () =>
    request<PaymentFees>("/payments/fees"),

  rates: () =>
    request<PaymentRate[]>("/payments/rates"),

  engineHealth: () =>
    request<unknown>("/payments/engine/health"),

  initiate: (token: string, payload: Record<string, unknown>) =>
    request<unknown>("/payments", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  list: (token: string) =>
    request<unknown[]>("/payments", { headers: authHeaders(token) }),

  get: (token: string, id: string) =>
    request<unknown>(`/payments/${id}`, { headers: authHeaders(token) }),

  getReceipt: (token: string, id: string) =>
    request<unknown>(`/payments/${id}/receipt`, {
      headers: authHeaders(token),
    }),

  simulate: (token: string, payload: Record<string, unknown>) =>
    request<unknown>("/payments/simulate", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  batch: (token: string, items: unknown[]) =>
    request<unknown>("/payments/batch", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ items }),
    }),
}

// ── auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  register: (payload: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; tokens: TokenPair }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<{ tokens: TokenPair }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (token: string) =>
    request<null>("/auth/logout", {
      method: "POST",
      headers: authHeaders(token),
    }),

  verifyEmail: (token: string) =>
    request<null>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email: string) =>
    request<null>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<null>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
}

// ── users ─────────────────────────────────────────────────────────────────────

export const users = {
  me: (token: string) =>
    request<{ user: User }>("/users/me", { headers: authHeaders(token) }),

  updateMe: (token: string, payload: Partial<User>) =>
    request<{ user: User }>("/users/me", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  changePassword: (
    token: string,
    payload: { current_password: string; new_password: string }
  ) =>
    request<null>("/users/me/password", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteMe: (token: string) =>
    request<null>("/users/me", {
      method: "DELETE",
      headers: authHeaders(token),
    }),
}

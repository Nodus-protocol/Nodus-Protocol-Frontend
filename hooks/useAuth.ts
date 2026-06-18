"use client"

import { useState, useEffect, useCallback } from "react"
import { connectWithSep10, isFreighterInstalled, type TokenPair } from "@/lib/stellar-auth"

export type AuthStatus = "idle" | "connecting" | "connected" | "error"

export interface AuthState {
  status: AuthStatus
  accountId: string | null
  accessToken: string | null
  error: string | null
}

const KEYS = {
  access: "nodus_access_token",
  refresh: "nodus_refresh_token",
  account: "nodus_account_id",
} as const

function saveSession(accountId: string, tokens: TokenPair) {
  localStorage.setItem(KEYS.access, tokens.access_token)
  localStorage.setItem(KEYS.refresh, tokens.refresh_token)
  localStorage.setItem(KEYS.account, accountId)
}

function clearSession() {
  localStorage.removeItem(KEYS.access)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.account)
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    status: "idle",
    accountId: null,
    accessToken: null,
    error: null,
  })

  // Restore session from localStorage on mount.
  // Wrapped in an async function so setState is not called synchronously
  // in the effect body, satisfying the React Compiler rule.
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(KEYS.access)
      const accountId = localStorage.getItem(KEYS.account)
      if (token && accountId) {
        setState({ status: "connected", accountId, accessToken: token, error: null })
      }
    }
    restoreSession()
  }, [])

  const connect = useCallback(async () => {
    if (!isFreighterInstalled()) {
      setState((s) => ({
        ...s,
        status: "error",
        error: "Freighter not installed. Visit freighter.app to install it.",
      }))
      return
    }

    setState({ status: "connecting", accountId: null, accessToken: null, error: null })

    try {
      const { accountId, tokens } = await connectWithSep10()
      saveSession(accountId, tokens)
      setState({ status: "connected", accountId, accessToken: tokens.access_token, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      setState({ status: "error", accountId: null, accessToken: null, error: message })
    }
  }, [])

  const disconnect = useCallback(() => {
    clearSession()
    setState({ status: "idle", accountId: null, accessToken: null, error: null })
  }, [])

  const shortAddress = state.accountId
    ? `${state.accountId.slice(0, 4)}…${state.accountId.slice(-4)}`
    : null

  return { state, connect, disconnect, shortAddress }
}

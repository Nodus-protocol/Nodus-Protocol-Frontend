"use client"

import { useEffect, useMemo, useState } from "react"
import { pool, type PriceQuote } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { signAndSubmit, signWithFreighter } from "@/lib/soroban"
import { SwapPreview } from "@/components/SwapPreview"
import { SlippageSelector } from "@/components/SlippageSelector"
import { TokenIcon } from "@/components/TokenIcon"
import {
  stroopsToXlm,
  rawToUsdc,
  xlmToStroops,
  usdcToRaw,
  shortenAddress,
} from "@/lib/format"

type Token = "XLM" | "USDC"

function toRaw(display: string, token: Token): string {
  return token === "XLM" ? xlmToStroops(display) : usdcToRaw(display)
}

function fromRaw(raw: string, token: Token): string {
  return token === "XLM" ? stroopsToXlm(raw) : rawToUsdc(raw)
}

export default function SwapPage() {
  const { state, connect } = useAuth()

  const [tokenIn, setTokenIn] = useState<Token>("XLM")
  const [tokenOut, setTokenOut] = useState<Token>("USDC")
  const [amountIn, setAmountIn] = useState("")

  const [slippage, setSlippage] = useState(0.5)
  const [quote, setQuote] = useState<PriceQuote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const [swapping, setSwapping] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Debounced quote fetch — re-runs whenever the amount or token pair changes.
  // The reset + fetch both happen inside `run`, invoked from setTimeout rather
  // than synchronously in the effect body, so React doesn't see a setState
  // call directly in the effect (see useAuth.ts's restoreSession for the
  // same pattern).
  useEffect(() => {
    let cancelled = false

    async function run() {
      setQuote(null)
      setQuoteError(null)
      setTxHash(null)
      setSwapError(null)

      let raw: string
      try {
        raw = amountIn ? toRaw(amountIn, tokenIn) : ""
      } catch {
        return // invalid partial input while typing — just don't quote yet
      }
      if (!raw || raw === "0") return

      setQuoting(true)
      try {
        const res = await pool.quote(raw, tokenIn, tokenOut)
        if (!cancelled) setQuote(res.data)
      } catch (err) {
        if (!cancelled) {
          setQuoteError(err instanceof Error ? err.message : "Failed to fetch quote")
        }
      } finally {
        if (!cancelled) setQuoting(false)
      }
    }

    const id = setTimeout(run, 400)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [amountIn, tokenIn, tokenOut])

  // Minimum acceptable output given the selected slippage tolerance.
  const minAmountOut = useMemo(() => {
    if (!quote) return undefined
    const out = BigInt(quote.amount_out)
    const bps = BigInt(Math.round(slippage * 100))
    return (out - (out * bps) / BigInt(10_000)).toString()
  }, [quote, slippage])

  function flipTokens() {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn("")
  }

  async function handleSwap() {
    if (!quote || !minAmountOut || !state.accessToken || !state.accountId) return

    setSwapping(true)
    setSwapError(null)
    setTxHash(null)

    try {
      const built = await pool.buildSwap(state.accessToken, {
        token_in: tokenIn,
        token_out: tokenOut,
        amount_in: quote.amount_in,
        min_amount_out: minAmountOut,
      })

      const hash = await signAndSubmit(built.data, state.accountId, signWithFreighter)
      setTxHash(hash)
      setAmountIn("")
      setQuote(null)
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : "Swap failed")
    } finally {
      setSwapping(false)
    }
  }

  const connected = state.status === "connected"
  const canSwap = connected && !!quote && !quoting && !swapping

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-24">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">Swap</h1>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {/* You pay */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 text-xs text-gray-500">You pay</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              disabled={swapping}
              aria-label={`Amount of ${tokenIn} to pay`}
              className="w-full bg-transparent text-2xl font-semibold text-white placeholder-gray-700 outline-none disabled:opacity-50"
            />
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
              <TokenIcon symbol={tokenIn} size="sm" />
              <span className="text-sm font-medium text-white">{tokenIn}</span>
            </div>
          </div>
        </div>

        {/* Flip */}
        <div className="flex justify-center">
          <button
            onClick={flipTokens}
            disabled={swapping}
            aria-label="Flip tokens"
            className="rounded-full border border-white/10 bg-black/50 p-2 text-gray-400 transition-colors hover:border-violet-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* You receive */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 text-xs text-gray-500">You receive</p>
          <div className="flex items-center gap-3">
            <div
              role="status"
              aria-live="polite"
              className="w-full text-2xl font-semibold tabular-nums text-white"
            >
              {quoting ? (
                <span className="text-gray-600">…</span>
              ) : quote ? (
                fromRaw(quote.amount_out, tokenOut)
              ) : (
                <span className="text-gray-700">0.0</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
              <TokenIcon symbol={tokenOut} size="sm" />
              <span className="text-sm font-medium text-white">{tokenOut}</span>
            </div>
          </div>
        </div>

        <SlippageSelector value={slippage} onChange={setSlippage} />

        {quoteError && <p className="text-xs text-red-400">{quoteError}</p>}

        {quote && (
          <SwapPreview
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            amountIn={quote.amount_in}
            amountOut={quote.amount_out}
            priceImpactBps={quote.price_impact_bps}
            feeBps={quote.fee_bps}
            minAmountOut={minAmountOut}
          />
        )}

        {!connected ? (
          <button
            onClick={connect}
            disabled={state.status === "connecting"}
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {state.status === "connecting" ? "Connecting…" : "Connect Wallet"}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {swapping ? "Swapping…" : "Swap"}
          </button>
        )}

        {swapError && <p className="text-center text-xs text-red-400">{swapError}</p>}

        {txHash && (
          <p className="text-center text-xs text-green-400">
            Swap submitted — tx {shortenAddress(txHash)}
          </p>
        )}
      </div>
    </div>
  )
}

"use client"

import { bpsToPercent, stroopsToXlm, rawToUsdc } from "@/lib/format"
import { TokenIcon } from "@/components/TokenIcon"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface SwapPreviewProps {
  tokenIn: "XLM" | "USDC"
  tokenOut: "XLM" | "USDC"
  amountIn: string
  amountOut: string
  priceImpactBps: number
  feeBps: number
  minAmountOut?: string
}

export function SwapPreview({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  priceImpactBps,
  feeBps,
  minAmountOut,
}: SwapPreviewProps) {
  return (
    <ErrorBoundary>
      <SwapPreviewInner
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        amountIn={amountIn}
        amountOut={amountOut}
        priceImpactBps={priceImpactBps}
        feeBps={feeBps}
        minAmountOut={minAmountOut}
      />
    </ErrorBoundary>
  )
}

function SwapPreviewInner({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  priceImpactBps,
  feeBps,
  minAmountOut,
}: SwapPreviewProps) {
  const formatAmount = (raw: string, token: string) =>
    token === "XLM" ? stroopsToXlm(raw) : rawToUsdc(raw)

  const impactColor =
    priceImpactBps < 50   ? "text-green-400"
    : priceImpactBps < 200 ? "text-yellow-400"
    : "text-red-400"

  return (
    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm space-y-2">
      {/* Rate */}
      <div className="flex justify-between text-gray-400">
        <span>Rate</span>
        <span className="text-white">
          1 {tokenIn} = {formatAmount(amountOut, tokenOut)} {tokenOut}
        </span>
      </div>

      {/* Price impact */}
      <div className="flex justify-between text-gray-400">
        <span>Price impact</span>
        <span className={impactColor}>{bpsToPercent(priceImpactBps)}</span>
      </div>

      {/* Fee */}
      <div className="flex justify-between text-gray-400">
        <span>Fee</span>
        <span className="text-white">{bpsToPercent(feeBps)}</span>
      </div>

      {/* Min received */}
      {minAmountOut && (
        <div className="flex justify-between text-gray-400">
          <span>Min received</span>
          <span className="flex items-center gap-1.5 text-white">
            <TokenIcon symbol={tokenOut} size="sm" />
            {formatAmount(minAmountOut, tokenOut)} {tokenOut}
          </span>
        </div>
      )}
    </div>
  )
}

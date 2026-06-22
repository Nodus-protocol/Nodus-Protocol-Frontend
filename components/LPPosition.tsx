"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { TokenIcon } from "@/components/TokenIcon"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { stroopsToXlm, rawToUsdc, bpsToPercent } from "@/lib/format"

interface LPPositionData {
  address: string
  lp_balance: string
  amount_0_redeemed: string
  amount_1_redeemed: string
  token_0: string
  token_1: string
  pool_share_bps: number
}

interface LPPositionProps {
  data: LPPositionData | null
  loading?: boolean
  error?: string | null
}

export function LPPosition({ data, loading, error }: LPPositionProps) {
  return (
    <ErrorBoundary>
      <LPPositionInner data={data} loading={loading} error={error} />
    </ErrorBoundary>
  )
}

function LPPositionInner({ data, loading, error }: LPPositionProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
        {error}
      </div>
    )
  }

  if (!data || data.lp_balance === "0") {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-gray-500">No liquidity position found for this wallet.</p>
      </div>
    )
  }

  const formatRedeemed = (raw: string, token: string) =>
    token === "XLM" ? stroopsToXlm(raw) : rawToUsdc(raw)

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-white/[0.02] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Your LP Position</h3>
        <span className="text-xs text-gray-500">
          Pool share: <span className="text-violet-400">{bpsToPercent(data.pool_share_bps)}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { token: data.token_0, amount: data.amount_0_redeemed },
          { token: data.token_1, amount: data.amount_1_redeemed },
        ].map(({ token, amount }) => (
          <div
            key={token}
            className="rounded-xl border border-white/5 bg-black/30 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TokenIcon symbol={token} size="sm" />
              <span className="text-xs font-medium text-gray-400">{token}</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-white">
              {formatRedeemed(amount, token)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600">
        LP tokens held:{" "}
        <span className="font-mono text-gray-400">{data.lp_balance}</span>
      </p>
    </div>
  )
}


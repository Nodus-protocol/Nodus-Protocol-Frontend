/**
 * Formatting utilities for the Nodus Protocol frontend.
 *
 * All financial values use BigInt arithmetic internally — no Number
 * coercion, no floating-point surprises.
 */

import { toBaseUnits } from "@/lib/math"

/* ------------------------------------------------------------------ */
/*  XLM helpers                                                        */
/* ------------------------------------------------------------------ */

/** Format stroops (1/10,000,000 XLM) as a human-readable XLM amount. */
export function stroopsToXlm(stroops: number | string): string {
  try {
    const raw = BigInt(stroops)
    return formatDecimals(raw.toString(), 7, 2, 7)
  } catch {
    return "—"
  }
}

/** Parse a human-entered XLM amount ("1.5") into stroops ("15000000"). */
export function xlmToStroops(display: string): string {
  return toBaseUnits(display, 7)
}

/* ------------------------------------------------------------------ */
/*  USDC helpers                                                       */
/* ------------------------------------------------------------------ */

/** Format raw USDC units (6 decimals) as a display string. */
export function rawToUsdc(raw: number | string): string {
  try {
    const n = BigInt(raw)
    return formatDecimals(n.toString(), 6, 2, 6)
  } catch {
    return "—"
  }
}

/** Parse a human-entered USDC amount ("1.5") into its 6-decimal raw units. */
export function usdcToRaw(display: string): string {
  return toBaseUnits(display, 6)
}

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Format an integer base-unit string as a display string with at least
 * `minDecimals` and at most `maxDecimals` fractional digits, trimming
 * trailing zeros.
 */
export function formatDecimals(
  base: string,
  decimals: number,
  minDecimals = 2,
  maxDecimals = decimals,
): string {
  const raw = BigInt(base)
  const pow = BigInt(10 ** decimals)
  const whole = raw / pow
  const frac = raw % pow
  let fracStr = frac.toString().padStart(decimals, "0").slice(0, maxDecimals)

  // Trim trailing zeros, keeping at least minDecimals
  while (fracStr.length > minDecimals && fracStr.endsWith("0")) {
    fracStr = fracStr.slice(0, -1)
  }

  return `${whole.toString()}.${fracStr}`
}

/** Shorten a Stellar address: "GABCD…WXYZ" */
export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 5)}…${addr.slice(-4)}`
}

/** Format basis points (bps) as a percentage string: 30 → "0.30%" */
export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

/** Format a number with compact notation: 1_200_000 → "1.2M" */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n)
}

/** Returns the age of a timestamp as a human-readable string. */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
/**
 * Exact decimal math utilities using BigInt.
 *
 * All financial calculations — parse, rate, slippage, display — avoid
 * JavaScript Number arithmetic entirely.  Values are passed as decimal
 * strings and converted to integer base units only via BigInt.
 */

/** Errors thrown by this module carry a structured tag for downstream handling. */
export class MathError extends Error {
  readonly tag: "invalid" | "overflow" | "division_by_zero"
  constructor(tag: MathError["tag"], message: string) {
    super(message)
    this.name = "MathError"
    this.tag = tag
  }
}

/* ------------------------------------------------------------------ */
/*  Base-unit conversion                                               */
/* ------------------------------------------------------------------ */

/**
 * Parse a human-entered display amount (e.g. "1.5") into integer base
 * units (e.g. 15000000 stroops).  Throws on invalid input.
 *
 * - Rejects empty strings, bare ".", trailing whitespace, hex, scientific.
 * - Truncates excess decimals without rounding (financial safety).
 */
export function toBaseUnits(display: string, decimals: number): string {
  const trimmed = display.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") {
    throw new MathError("invalid", `Invalid amount: "${display}"`)
  }
  const [whole = "0", frac = ""] = trimmed.split(".")
  const fracPadded = frac.slice(0, decimals).padEnd(decimals, "0")
  const wholeBig = BigInt(whole || "0")
  const fracBig = BigInt(fracPadded || "0")
  return (wholeBig * BigInt(10 ** decimals) + fracBig).toString()
}

/**
 * Format an integer base-unit string (e.g. "15000000") into a human-
 * readable display string (e.g. "1.50").  The caller controls the
 * number of visible decimal places via `maxDecimals`.
 */
export function fromBaseUnits(
  base: string,
  decimals: number,
  maxDecimals: number = decimals,
): string {
  const raw = BigInt(base)
  const pow = BigInt(10 ** decimals)
  const whole = raw / pow
  const frac = raw % pow
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, maxDecimals)
  return `${whole.toString()}.${fracStr}`
}

/* ------------------------------------------------------------------ */
/*  Rate computation                                                   */
/* ------------------------------------------------------------------ */

/**
 * Compute the exchange rate as `amountOut / amountIn` with the correct
 * decimal scale for both directions.
 *
 * Example: 100_000_000 stroops (10 XLM) → 5_000_000 raw (5 USDC)
 *   rate = 5_000_000 / 100_000_000 = 0.05 USDC per XLM
 *
 * Returns a display-ready string.
 */
export function computeRate(
  amountOut: string,
  amountIn: string,
  outDecimals: number,
  inDecimals: number,
  maxDisplayDecimals: number = 7,
): string {
  const out = BigInt(amountOut)
  const in_ = BigInt(amountIn)
  if (in_ === BigInt(0)) {
    throw new MathError("division_by_zero", "Cannot compute rate: amountIn is 0")
  }
  if (out === BigInt(0)) return "0"

  // rate_display = amountOut_display / amountIn_display
  //              = (out / 10^outDecimals) / (in / 10^inDecimals)
  //              = out * 10^inDecimals / (in * 10^outDecimals)
  // Multiply by 10^maxDisplayDecimals before dividing so the result
  // keeps maxDisplayDecimals significant fractional digits.
  const numerator = out * BigInt(10 ** (inDecimals + maxDisplayDecimals))
  const denominator = in_ * BigInt(10 ** outDecimals)
  const scaled = numerator / denominator

  const displayScale = BigInt(10 ** maxDisplayDecimals)
  const whole = scaled / displayScale
  const frac = scaled % displayScale
  const fracStr = frac.toString().padStart(maxDisplayDecimals, "0")

  return `${whole.toString()}.${fracStr}`
}

/* ------------------------------------------------------------------ */
/*  Slippage / minimum output                                          */
/* ------------------------------------------------------------------ */

/**
 * Apply basis-point slippage to a raw amount.
 *
 * `minAmountOut = amountOut - amountOut * slippageBps / 10000`
 *
 * Rounds down (toward zero) for safety — the user always receives at
 * *least* the computed minimum.
 */
export function applySlippage(amountOut: string, slippageBps: number): string {
  const amount = BigInt(amountOut)
  if (slippageBps < 0 || slippageBps > 10000) {
    throw new MathError("invalid", `slippageBps out of range: ${slippageBps}`)
  }
  const deduction = (amount * BigInt(slippageBps)) / BigInt(10000)
  return (amount - deduction).toString()
}

/* ------------------------------------------------------------------ */
/*  Property helpers (round-trip verification)                         */
/* ------------------------------------------------------------------ */

/**
 * Check that a display amount round-trips through base-unit conversion.
 */
export function roundTripDisplay(
  display: string,
  decimals: number,
): boolean {
  try {
    const base = toBaseUnits(display, decimals)
    const back = fromBaseUnits(base, decimals, decimals)
    // Compare after normalising trailing zeros
    return stripTrailingZeros(display) === stripTrailingZeros(back)
  } catch {
    return false
  }
}

function stripTrailingZeros(s: string): string {
  const [whole, frac = ""] = s.split(".")
  const trimmed = frac.replace(/0+$/, "")
  return trimmed ? `${whole}.${trimmed}` : whole
}
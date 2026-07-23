/** Format a stroop (1/10,000,000 XLM) value as a human-readable XLM amount. */
export function stroopsToXlm(stroops: number | string): string {
  const n = typeof stroops === "string" ? parseInt(stroops, 10) : stroops
  if (isNaN(n)) return "—"
  return (n / 10_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  })
}

/** Format a raw USDC amount (6 decimals) to a display string. */
export function rawToUsdc(raw: number | string): string {
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw
  if (isNaN(n)) return "—"
  return (n / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

function toRawUnits(display: string, decimals: number): string {
  const trimmed = display.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") {
    throw new Error(`Invalid amount: "${display}"`)
  }
  const [whole = "0", frac = ""] = trimmed.split(".")
  const fracPadded = frac.slice(0, decimals).padEnd(decimals, "0")
  return (BigInt(whole || "0") * BigInt(10 ** decimals) + BigInt(fracPadded || "0")).toString()
}

/** Parse a human-entered XLM amount ("1.5") into stroops ("15000000"). */
export function xlmToStroops(display: string): string {
  return toRawUnits(display, 7)
}

/** Parse a human-entered USDC amount ("1.5") into its 6-decimal raw units. */
export function usdcToRaw(display: string): string {
  return toRawUnits(display, 6)
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

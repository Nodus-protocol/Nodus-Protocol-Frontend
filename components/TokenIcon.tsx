type TokenSymbol = "XLM" | "USDC" | string

const tokenColors: Record<string, { bg: string; text: string }> = {
  XLM:  { bg: "bg-violet-500/20", text: "text-violet-300" },
  USDC: { bg: "bg-cyan-500/20",   text: "text-cyan-300"   },
}

interface TokenIconProps {
  symbol: TokenSymbol
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
}

export function TokenIcon({ symbol, size = "md", className = "" }: TokenIconProps) {
  const colors = tokenColors[symbol] ?? { bg: "bg-white/10", text: "text-white" }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizes[size]} ${colors.bg} ${colors.text} ${className}`.trim()}
      title={symbol}
    >
      {symbol.slice(0, 2)}
    </span>
  )
}

interface TokenPairProps {
  token0: TokenSymbol
  token1: TokenSymbol
  size?: "sm" | "md" | "lg"
}

export function TokenPair({ token0, token1, size = "md" }: TokenPairProps) {
  return (
    <div className="flex items-center">
      <TokenIcon symbol={token0} size={size} />
      <TokenIcon symbol={token1} size={size} className="-ml-2" />
    </div>
  )
}

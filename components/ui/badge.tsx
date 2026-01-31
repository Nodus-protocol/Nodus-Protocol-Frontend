type BadgeVariant = "default" | "success" | "warning" | "danger" | "violet" | "cyan"

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-gray-400 border-white/10",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  danger:  "bg-red-500/10 text-red-400 border-red-500/20",
  violet:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  cyan:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function TokenBadge({ symbol }: { symbol: string }) {
  const variant = symbol === "XLM" ? "violet" : symbol === "USDC" ? "cyan" : "default"
  return <Badge variant={variant}>{symbol}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "confirmed" ? "success"
    : status === "pending"  ? "warning"
    : status === "failed"   ? "danger"
    : "default"
  return <Badge variant={variant}>{status}</Badge>
}

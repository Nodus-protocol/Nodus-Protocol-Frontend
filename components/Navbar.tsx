"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

const navLinks = [
  { label: "Swap", href: "/swap" },
  { label: "Protocol", href: "/protocol" },
  { label: "Docs", href: "/docs" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/blog" },
]

// Defined at module scope — not inside Navbar — so React treats it as a stable
// component identity across renders (fixes react-compiler/react-compiler error).
function WalletButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { state, connect, disconnect, shortAddress } = useAuth()

  const base = fullWidth
    ? "flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all"
    : "hidden items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all md:inline-flex"

  if (state.status === "connecting") {
    return (
      <button disabled className={`${base} border border-violet-500/30 bg-violet-600/10 text-violet-400 opacity-60`}>
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        Connecting…
      </button>
    )
  }

  if (state.status === "connected" && shortAddress) {
    return (
      <button
        onClick={disconnect}
        className={`${base} border border-cyan-500/30 bg-cyan-600/10 text-cyan-300 hover:border-red-400/40 hover:bg-red-600/10 hover:text-red-300`}
        title="Click to disconnect"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {shortAddress}
      </button>
    )
  }

  if (state.status === "error") {
    return (
      <button
        onClick={connect}
        className={`${base} border border-red-500/30 bg-red-600/10 text-red-400 hover:bg-red-600/20`}
        title={state.error ?? undefined}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Retry
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      className={`${base} border border-violet-500/30 bg-violet-600/10 text-violet-300 hover:border-violet-400/50 hover:bg-violet-600/20 hover:text-white`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
      Connect Wallet
    </button>
  )
}

export default function Navbar() {
  const { state } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/90 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3L3 8.5v7L12 21l9-5.5v-7L12 3z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white transition-opacity group-hover:opacity-80">
              Nodus<span className="text-violet-400">Protocol</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: wallet button + hamburger */}
          <div className="flex items-center gap-3">
            <WalletButton />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/10 bg-black/95 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <WalletButton fullWidth />
          </div>
          {state.status === "error" && state.error && (
            <p className="px-3 pt-1 text-xs text-red-400">{state.error}</p>
          )}
        </div>
      </div>
    </nav>
  )
}

"use client"

import { useState, useEffect } from "react"

interface FreighterApi {
  isConnected: () => Promise<boolean>
  getPublicKey: () => Promise<string>
  getNetwork: () => Promise<string>
}

declare global {
  interface Window {
    freighter?: FreighterApi
  }
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 5)}…${addr.slice(-4)}`
}

export default function ConnectWallet() {
  const [address, setAddress]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [available, setAvailable] = useState(false)
  // Prevent SSR/client hydration mismatch — render nothing until mounted.
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    async function init() {
      setMounted(true)
    }
    init()

    // Freighter injects asynchronously after page load — poll until present.
    const timer = setInterval(() => {
      if (window.freighter) {
        setAvailable(true)
        clearInterval(timer)
        window.freighter
          .isConnected()
          .then((connected) => {
            if (connected) window.freighter!.getPublicKey().then(setAddress)
          })
          .catch(() => {})
      }
    }, 200)

    return () => clearInterval(timer)
  }, [])

  async function connect() {
    if (!window.freighter) {
      window.open("https://freighter.app", "_blank", "noopener,noreferrer")
      return
    }
    setLoading(true)
    try {
      const key = await window.freighter.getPublicKey()
      setAddress(key)
    } catch {
      // user cancelled — no-op
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    setAddress(null)
  }

  if (!mounted) return null

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="hidden items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-5 py-2 text-sm font-medium text-violet-300 transition-all hover:border-red-400/50 hover:bg-red-600/10 hover:text-red-300 md:inline-flex"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {shortenAddress(address)}
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="hidden items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-5 py-2 text-sm font-medium text-violet-300 transition-all hover:border-violet-400/50 hover:bg-violet-600/20 hover:text-white disabled:opacity-50 md:inline-flex"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
      {loading ? "Connecting…" : available ? "Connect Wallet" : "Install Freighter"}
    </button>
  )
}

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[800px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Mainnet live — explore the protocol
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          The{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            decentralized
          </span>{" "}
          infrastructure layer
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
          Nodus Protocol enables permissionless, composable financial
          primitives — built for builders, governed by the community.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Launch App
          </button>
          <button className="rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white">
            Read Docs
          </button>
        </div>
      </div>
    </div>
  )
}

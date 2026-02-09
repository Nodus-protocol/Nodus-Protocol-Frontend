import Link from "next/link"

const links = {
  Protocol: [
    { label: "Overview",   href: "/protocol" },
    { label: "Docs",       href: "/docs" },
    { label: "Community",  href: "/community" },
  ],
  Developers: [
    { label: "GitHub",     href: "https://github.com/Nodus-protocol" },
    { label: "Smart Contract", href: "https://github.com/Nodus-protocol/Nodus-Protocol-Smart-Contract" },
  ],
  Legal: [
    { label: "License",    href: "https://github.com/Nodus-protocol/Nodus-Protocol-Frontend/blob/main/LICENSE" },
    { label: "Security",   href: "https://github.com/Nodus-protocol/Nodus-Protocol-Frontend/blob/main/SECURITY.md" },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent">
              Nodus
            </span>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              Permissionless AMM liquidity on Stellar Soroban. Non-custodial,
              open-source, community-governed.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                {group}
              </p>
              <ul className="mt-4 space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/5 pt-8 text-center text-xs text-gray-700">
          © {new Date().getFullYear()} Nodus Protocol. Open-source under the MIT License.
        </div>
      </div>
    </footer>
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Nodus Protocol — AMM DEX on Stellar Soroban'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #0a001a 0%, #000000 50%, #001a1a 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          }}
        />
        <h1
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Nodus Protocol
        </h1>
      </div>
      <p
        style={{
          color: '#a1a1aa',
          fontSize: 32,
          marginTop: 0,
        }}
      >
        AMM DEX on Stellar Soroban
      </p>
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          display: 'flex',
          gap: 48,
          color: '#71717a',
          fontSize: 22,
        }}
      >
        <span>Swap</span>
        <span>•</span>
        <span>Provide Liquidity</span>
        <span>•</span>
        <span>Earn Fees</span>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
